/**
 * Workflow Engine
 *
 * Executes playbook-driven workflows for claim processing.
 * Coordinates task execution, state transitions, and decision routing.
 *
 * Key Features:
 * - Playbook execution with step-by-step tracking
 * - Task dependency management
 * - Conditional branching based on decision rules
 * - State machine for workflow transitions
 * - Error handling and rollback
 * - Parallel task execution where applicable
 *
 * Integration:
 * - FSO Service: Task creation and updates
 * - Event Bus: Workflow state change events
 * - Decision Tables: Conditional routing (Phase 3)
 */

import fsoService from '../api/fsoService.js';
import eventBus, { EventTypes } from '../sync/eventBus.js';
import { TaskStatus, TaskType, PlaybookType } from '../../types/workflow.types.js';

/**
 * Workflow State Machine
 *
 * Valid state transitions:
 * initiated → in_progress → completed
 * initiated → in_progress → suspended → in_progress
 * initiated → in_progress → failed → retrying → in_progress
 * any → cancelled
 */
const WorkflowState = {
  INITIATED: 'initiated',
  IN_PROGRESS: 'in_progress',
  SUSPENDED: 'suspended',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETRYING: 'retrying'
};

/**
 * Playbook Step Result
 * Tracks execution of individual playbook steps
 */
class StepResult {
  constructor(stepName) {
    this.stepName = stepName;
    this.status = 'pending'; // pending, in_progress, completed, failed, skipped
    this.startTime = null;
    this.endTime = null;
    this.duration = null;
    this.output = null;
    this.error = null;
    this.taskId = null;
  }

  start() {
    this.status = 'in_progress';
    this.startTime = new Date().toISOString();
  }

  complete(output) {
    this.status = 'completed';
    this.endTime = new Date().toISOString();
    this.duration = new Date(this.endTime) - new Date(this.startTime);
    this.output = output;
  }

  fail(error) {
    this.status = 'failed';
    this.endTime = new Date().toISOString();
    this.duration = new Date(this.endTime) - new Date(this.startTime);
    this.error = error.message || error;
  }

  skip(reason) {
    this.status = 'skipped';
    this.output = { reason };
  }
}

/**
 * Workflow Execution Result
 * Comprehensive result of playbook execution
 */
class WorkflowExecutionResult {
  constructor(playbookName) {
    this.playbookName = playbookName;
    this.success = false;
    this.state = WorkflowState.INITIATED;
    this.steps = [];
    this.errors = [];
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.duration = null;
    this.metadata = {};
  }

  addStep(stepResult) {
    this.steps.push(stepResult);
  }

  complete() {
    this.success = true;
    this.state = WorkflowState.COMPLETED;
    this.endTime = new Date().toISOString();
    this.duration = new Date(this.endTime) - new Date(this.startTime);
  }

  fail(error) {
    this.success = false;
    this.state = WorkflowState.FAILED;
    this.endTime = new Date().toISOString();
    this.duration = new Date(this.endTime) - new Date(this.startTime);
    this.errors.push(error);
  }

  suspend(reason) {
    this.state = WorkflowState.SUSPENDED;
    this.metadata.suspensionReason = reason;
  }
}

/**
 * Playbook Definitions
 *
 * Each playbook defines a sequence of steps with conditions and dependencies.
 */
const PLAYBOOKS = {
  [PlaybookType.DEATH_CLAIM_STANDARD]: {
    name: 'Death Claim - Standard Processing',
    description: 'Standard workflow for death claim processing',
    steps: [
      {
        id: 'verify_death',
        name: 'Verify Death',
        taskType: TaskType.VERIFICATION,
        condition: null, // Always execute
        dependencies: [],
        parallel: false,
        critical: true
      },
      {
        id: 'validate_policy',
        name: 'Validate Policy',
        taskType: TaskType.VERIFICATION,
        condition: null,
        dependencies: ['verify_death'],
        parallel: false,
        critical: true
      },
      {
        id: 'verify_beneficiary',
        name: 'Verify Beneficiary',
        taskType: TaskType.VERIFICATION,
        condition: null,
        dependencies: ['validate_policy'],
        parallel: false,
        critical: true
      },
      {
        id: 'review_documents',
        name: 'Review Documents',
        taskType: TaskType.DOCUMENT_REVIEW,
        condition: null,
        dependencies: ['verify_beneficiary'],
        parallel: false,
        critical: true
      },
      {
        id: 'calculate_benefit',
        name: 'Calculate Death Benefit',
        taskType: TaskType.CALCULATION,
        condition: (context) => context.allRequirementsSatisfied,
        dependencies: ['review_documents'],
        parallel: false,
        critical: true
      },
      {
        id: 'senior_review',
        name: 'Senior Examiner Review',
        taskType: TaskType.REVIEW,
        condition: (context) => context.claimAmount > 100000,
        dependencies: ['calculate_benefit'],
        parallel: false,
        critical: false
      },
      {
        id: 'approve_payment',
        name: 'Approve Payment',
        taskType: TaskType.APPROVAL,
        condition: null,
        dependencies: ['calculate_benefit'],
        parallel: false,
        critical: true
      },
      {
        id: 'process_payment',
        name: 'Process Payment',
        taskType: TaskType.PAYMENT,
        condition: null,
        dependencies: ['approve_payment'],
        parallel: false,
        critical: true
      }
    ]
  },

  [PlaybookType.DEATH_CLAIM_FASTTRACK]: {
    name: 'Death Claim - FastTrack',
    description: 'Accelerated workflow for FastTrack-eligible claims',
    steps: [
      {
        id: 'auto_verify_death',
        name: 'Auto-Verify Death',
        taskType: TaskType.VERIFICATION,
        condition: null,
        dependencies: [],
        parallel: false,
        critical: true
      },
      {
        id: 'auto_validate_policy',
        name: 'Auto-Validate Policy',
        taskType: TaskType.VERIFICATION,
        condition: null,
        dependencies: [],
        parallel: true, // Parallel with auto_verify_death
        critical: true
      },
      {
        id: 'auto_verify_beneficiary',
        name: 'Auto-Verify Beneficiary',
        taskType: TaskType.VERIFICATION,
        condition: null,
        dependencies: ['auto_verify_death', 'auto_validate_policy'],
        parallel: false,
        critical: true
      },
      {
        id: 'auto_calculate_benefit',
        name: 'Auto-Calculate Benefit',
        taskType: TaskType.CALCULATION,
        condition: null,
        dependencies: ['auto_verify_beneficiary'],
        parallel: false,
        critical: true
      },
      {
        id: 'auto_approve_payment',
        name: 'Auto-Approve Payment',
        taskType: TaskType.APPROVAL,
        condition: (context) => context.claimAmount <= 500000,
        dependencies: ['auto_calculate_benefit'],
        parallel: false,
        critical: true
      },
      {
        id: 'process_payment',
        name: 'Process Payment',
        taskType: TaskType.PAYMENT,
        condition: null,
        dependencies: ['auto_approve_payment'],
        parallel: false,
        critical: true
      }
    ]
  },

  [PlaybookType.CONTESTABILITY_REVIEW]: {
    name: 'Contestability Review',
    description: 'Enhanced review for claims within contestability period',
    steps: [
      {
        id: 'full_underwriting_review',
        name: 'Full Underwriting Review',
        taskType: TaskType.REVIEW,
        condition: null,
        dependencies: [],
        parallel: false,
        critical: true
      },
      {
        id: 'medical_records_request',
        name: 'Medical Records Request',
        taskType: TaskType.DOCUMENT_REVIEW,
        condition: null,
        dependencies: ['full_underwriting_review'],
        parallel: false,
        critical: true
      },
      {
        id: 'fraud_screening',
        name: 'Fraud Screening',
        taskType: TaskType.VERIFICATION,
        condition: null,
        dependencies: ['full_underwriting_review'],
        parallel: true,
        critical: true
      },
      {
        id: 'management_review',
        name: 'Management Review',
        taskType: TaskType.REVIEW,
        condition: null,
        dependencies: ['medical_records_request', 'fraud_screening'],
        parallel: false,
        critical: true
      },
      {
        id: 'decision',
        name: 'Contestability Decision',
        taskType: TaskType.APPROVAL,
        condition: null,
        dependencies: ['management_review'],
        parallel: false,
        critical: true
      }
    ]
  },

  [PlaybookType.SIU_INVESTIGATION]: {
    name: 'SIU Investigation',
    description: 'Special Investigation Unit workflow for suspected fraud',
    steps: [
      {
        id: 'siu_assignment',
        name: 'Assign to SIU Investigator',
        taskType: TaskType.INVESTIGATION,
        condition: null,
        dependencies: [],
        parallel: false,
        critical: true
      },
      {
        id: 'evidence_collection',
        name: 'Evidence Collection',
        taskType: TaskType.INVESTIGATION,
        condition: null,
        dependencies: ['siu_assignment'],
        parallel: false,
        critical: true
      },
      {
        id: 'witness_interviews',
        name: 'Witness Interviews',
        taskType: TaskType.INVESTIGATION,
        condition: null,
        dependencies: ['evidence_collection'],
        parallel: false,
        critical: false
      },
      {
        id: 'database_searches',
        name: 'Database Searches',
        taskType: TaskType.INVESTIGATION,
        condition: null,
        dependencies: ['evidence_collection'],
        parallel: true,
        critical: false
      },
      {
        id: 'siu_report',
        name: 'SIU Investigation Report',
        taskType: TaskType.INVESTIGATION,
        condition: null,
        dependencies: ['witness_interviews', 'database_searches'],
        parallel: false,
        critical: true
      },
      {
        id: 'legal_review',
        name: 'Legal Review',
        taskType: TaskType.REVIEW,
        condition: (context) => context.fraudIndicators === 'high',
        dependencies: ['siu_report'],
        parallel: false,
        critical: false
      },
      {
        id: 'final_decision',
        name: 'Final Decision',
        taskType: TaskType.APPROVAL,
        condition: null,
        dependencies: ['siu_report'],
        parallel: false,
        critical: true
      }
    ]
  }
};

/**
 * Workflow Engine Class
 *
 * Orchestrates playbook execution with state management
 */
class WorkflowEngine {
  constructor() {
    this.activeWorkflows = new Map(); // claimId → WorkflowExecutionResult
  }

  /**
   * Execute Playbook
   *
   * @param {string} caseId - FSO case ID
   * @param {string} playbookType - Playbook type from PlaybookType enum
   * @param {Object} context - Execution context (claim data, policy, etc.)
   * @returns {Promise<WorkflowExecutionResult>}
   */
  async executePlaybook(caseId, playbookType, context = {}) {
    console.log(`[WorkflowEngine] Executing playbook: ${playbookType} for case: ${caseId}`);

    // Get playbook definition
    const playbook = PLAYBOOKS[playbookType];
    if (!playbook) {
      throw new Error(`Playbook not found: ${playbookType}`);
    }

    // Create execution result
    const result = new WorkflowExecutionResult(playbook.name);
    result.metadata.caseId = caseId;
    result.metadata.playbookType = playbookType;

    // Store active workflow
    this.activeWorkflows.set(caseId, result);

    // Publish workflow started event
    eventBus.publish(EventTypes.WORKFLOW_STARTED, {
      caseId,
      playbookType,
      timestamp: new Date().toISOString()
    });

    try {
      result.state = WorkflowState.IN_PROGRESS;

      // Execute steps in order
      const completedSteps = new Set();
      const stepOutputs = {};

      for (const step of playbook.steps) {
        // Check dependencies
        const dependenciesMet = step.dependencies.every(dep => completedSteps.has(dep));
        if (!dependenciesMet) {
          // Wait for dependencies (this is simplified - in production use a proper DAG executor)
          console.warn(`[WorkflowEngine] Dependencies not met for step: ${step.id}`);
          continue;
        }

        // Evaluate condition
        const shouldExecute = !step.condition || step.condition(context);
        if (!shouldExecute) {
          const stepResult = new StepResult(step.name);
          stepResult.skip('Condition not met');
          result.addStep(stepResult);
          completedSteps.add(step.id);
          continue;
        }

        // Execute step
        const stepResult = new StepResult(step.name);
        stepResult.start();

        try {
          // Create FSO task for this step
          const task = await fsoService.createTask({
            caseId,
            name: step.name,
            type: step.taskType,
            priority: step.critical ? 'high' : 'normal',
            status: TaskStatus.OPEN,
            metadata: {
              playbookType,
              stepId: step.id
            }
          });

          stepResult.taskId = task.id;

          // Simulate step execution (in production, this would wait for task completion)
          // For now, we'll auto-complete the task
          const output = await this.executeStep(step, task, context);

          stepResult.complete(output);
          stepOutputs[step.id] = output;
          completedSteps.add(step.id);

          // Update context with step output
          context[step.id] = output;

        } catch (error) {
          stepResult.fail(error);

          // If step is critical, fail the workflow
          if (step.critical) {
            result.addStep(stepResult);
            throw error;
          } else {
            // Non-critical step failure - log warning and continue
            console.warn(`[WorkflowEngine] Non-critical step failed: ${step.name}`, error);
          }
        }

        result.addStep(stepResult);
      }

      // Workflow completed successfully
      result.complete();

      // Publish workflow completed event
      eventBus.publish(EventTypes.WORKFLOW_COMPLETED, {
        caseId,
        playbookType,
        duration: result.duration,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[WorkflowEngine] Playbook execution failed:', error);
      result.fail(error.message || 'Playbook execution failed');

      // Publish workflow failed event
      eventBus.publish(EventTypes.WORKFLOW_FAILED, {
        caseId,
        playbookType,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      // Remove from active workflows
      this.activeWorkflows.delete(caseId);
    }

    return result;
  }

  /**
   * Execute Individual Step
   *
   * In production, this would delegate to specific handlers based on task type.
   * For now, this is a mock implementation.
   *
   * @param {Object} step - Step definition
   * @param {Object} task - FSO task
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Step output
   */
  async executeStep(step, task, context) {
    console.log(`[WorkflowEngine] Executing step: ${step.name} (${step.taskType})`);

    // Simulate step execution based on task type
    switch (step.taskType) {
      case TaskType.VERIFICATION:
        return {
          verified: true,
          confidence: 95,
          timestamp: new Date().toISOString()
        };

      case TaskType.DOCUMENT_REVIEW:
        return {
          reviewed: true,
          documentsValid: true,
          timestamp: new Date().toISOString()
        };

      case TaskType.CALCULATION:
        return {
          calculatedAmount: context.claimAmount || 100000,
          method: 'death_benefit',
          timestamp: new Date().toISOString()
        };

      case TaskType.APPROVAL:
        return {
          approved: true,
          approver: 'system',
          timestamp: new Date().toISOString()
        };

      case TaskType.PAYMENT:
        return {
          paymentId: `PAY-${Date.now()}`,
          amount: context.calculatedAmount || 100000,
          status: 'scheduled',
          timestamp: new Date().toISOString()
        };

      case TaskType.REVIEW:
        return {
          reviewed: true,
          decision: 'approved',
          notes: 'Review completed',
          timestamp: new Date().toISOString()
        };

      case TaskType.INVESTIGATION:
        return {
          investigated: true,
          findings: 'No fraud indicators',
          timestamp: new Date().toISOString()
        };

      default:
        return {
          completed: true,
          timestamp: new Date().toISOString()
        };
    }
  }

  /**
   * Get Active Workflow
   *
   * @param {string} caseId - FSO case ID
   * @returns {WorkflowExecutionResult|null}
   */
  getActiveWorkflow(caseId) {
    return this.activeWorkflows.get(caseId) || null;
  }

  /**
   * Suspend Workflow
   *
   * @param {string} caseId - FSO case ID
   * @param {string} reason - Suspension reason
   */
  suspendWorkflow(caseId, reason) {
    const workflow = this.activeWorkflows.get(caseId);
    if (workflow) {
      workflow.suspend(reason);
      console.log(`[WorkflowEngine] Workflow suspended for case: ${caseId}`, reason);
    }
  }

  /**
   * Resume Workflow
   *
   * @param {string} caseId - FSO case ID
   */
  resumeWorkflow(caseId) {
    const workflow = this.activeWorkflows.get(caseId);
    if (workflow && workflow.state === WorkflowState.SUSPENDED) {
      workflow.state = WorkflowState.IN_PROGRESS;
      console.log(`[WorkflowEngine] Workflow resumed for case: ${caseId}`);
    }
  }

  /**
   * Cancel Workflow
   *
   * @param {string} caseId - FSO case ID
   */
  cancelWorkflow(caseId) {
    const workflow = this.activeWorkflows.get(caseId);
    if (workflow) {
      workflow.state = WorkflowState.CANCELLED;
      this.activeWorkflows.delete(caseId);
      console.log(`[WorkflowEngine] Workflow cancelled for case: ${caseId}`);
    }
  }

  /**
   * Get Available Playbooks
   *
   * @returns {Array<Object>} - List of playbook definitions
   */
  getAvailablePlaybooks() {
    return Object.entries(PLAYBOOKS).map(([type, playbook]) => ({
      type,
      name: playbook.name,
      description: playbook.description,
      stepCount: playbook.steps.length
    }));
  }

  /**
   * Get Playbook Details
   *
   * @param {string} playbookType - Playbook type
   * @returns {Object|null} - Playbook definition
   */
  getPlaybookDetails(playbookType) {
    return PLAYBOOKS[playbookType] || null;
  }
}

// Create singleton instance
const workflowEngine = new WorkflowEngine();

export default workflowEngine;
export { WorkflowEngine, WorkflowState, StepResult, WorkflowExecutionResult };
