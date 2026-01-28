/**
 * Requirement Processor
 *
 * Manages requirement lifecycle for claims processing.
 * Coordinates requirement generation, tracking, satisfaction, and completion.
 *
 * Key Features:
 * - Requirement generation via decision table
 * - Document linking and satisfaction
 * - IDP-based auto-satisfaction
 * - Requirement status tracking
 * - Waiver and override management
 * - Completion validation
 *
 * Integration:
 * - Decision Table Engine: Rule-based generation
 * - DMS Service: Document linking and IDP
 * - FSO Service: Task creation for requirements
 * - Event Bus: Requirement state changes
 */

import decisionTableEngine from './decisionTableEngine.js';
import dmsService from '../api/dmsService.js';
import fsoService from '../api/fsoService.js';
import eventBus, { EventTypes } from '../sync/eventBus.js';
import {
  RequirementType,
  RequirementLevel,
  RequirementStatus
} from '../../types/requirement.types.js';
import { TaskType, TaskStatus } from '../../types/workflow.types.js';

/**
 * Requirement
 * Enhanced requirement with processing state
 */
class Requirement {
  constructor(data) {
    this.id = data.id || `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = data.type;
    this.level = data.level;
    this.status = data.status || RequirementStatus.PENDING;
    this.description = data.description || '';
    this.dueDate = data.dueDate;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.satisfiedAt = data.satisfiedAt || null;
    this.documents = data.documents || []; // Linked document IDs
    this.fsoTaskId = data.fsoTaskId || null;
    this.waived = data.waived || false;
    this.waivedBy = data.waivedBy || null;
    this.waivedReason = data.waivedReason || null;
    this.waivedAt = data.waivedAt || null;
    this.overridden = data.overridden || false;
    this.overriddenBy = data.overriddenBy || null;
    this.overriddenReason = data.overriddenReason || null;
    this.overriddenAt = data.overriddenAt || null;
    this.metadata = data.metadata || {};
  }

  /**
   * Update requirement status
   */
  updateStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();

    if (newStatus === RequirementStatus.SATISFIED) {
      this.satisfiedAt = new Date().toISOString();
    }
  }

  /**
   * Link document to requirement
   */
  linkDocument(documentId) {
    if (!this.documents.includes(documentId)) {
      this.documents.push(documentId);
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Check if requirement is satisfied
   */
  isSatisfied() {
    return this.status === RequirementStatus.SATISFIED ||
           this.waived ||
           this.overridden;
  }

  /**
   * Check if requirement is mandatory
   */
  isMandatory() {
    return this.level === RequirementLevel.MANDATORY;
  }

  /**
   * Check if requirement is overdue
   */
  isOverdue() {
    if (!this.dueDate) return false;
    if (this.isSatisfied()) return false;
    return new Date(this.dueDate) < new Date();
  }
}

/**
 * Requirement Processing Result
 */
class ProcessingResult {
  constructor() {
    this.success = false;
    this.requirements = [];
    this.errors = [];
    this.warnings = [];
    this.metadata = {};
  }
}

/**
 * Requirement Processor
 */
class RequirementProcessor {
  constructor() {
    this.requirementsByClaimId = new Map(); // claimId → Requirement[]
  }

  /**
   * Generate Requirements for Claim
   *
   * Uses decision table engine to determine requirements based on claim context.
   *
   * @param {string} claimId - Claim ID
   * @param {Object} context - Decision context (claim, policy, verification, etc.)
   * @returns {Promise<ProcessingResult>}
   */
  async generateRequirements(claimId, context) {
    console.log(`[RequirementProcessor] Generating requirements for claim: ${claimId}`);

    const result = new ProcessingResult();

    try {
      // Evaluate decision table
      const decisionResult = decisionTableEngine.evaluate(context);

      // Create Requirement objects
      const requirements = decisionResult.requirements.map(req =>
        new Requirement({
          ...req,
          metadata: {
            ...req.metadata,
            claimId,
            generatedBy: 'decision_table',
            rulesMatched: decisionResult.rulesMatched.map(r => r.id)
          }
        })
      );

      // Store requirements
      this.requirementsByClaimId.set(claimId, requirements);

      // Create FSO tasks for mandatory requirements
      for (const requirement of requirements) {
        if (requirement.isMandatory()) {
          try {
            const task = await this.createRequirementTask(claimId, requirement, context);
            requirement.fsoTaskId = task.id;
          } catch (error) {
            console.warn(`[RequirementProcessor] Failed to create FSO task for requirement ${requirement.id}:`, error);
            result.warnings.push(`Failed to create task for ${requirement.type}`);
          }
        }
      }

      result.success = true;
      result.requirements = requirements;
      result.metadata = {
        rulesMatched: decisionResult.rulesMatched.length,
        totalRequirements: requirements.length,
        mandatoryRequirements: requirements.filter(r => r.isMandatory()).length,
        optionalRequirements: requirements.filter(r => !r.isMandatory()).length
      };

      // Publish event
      eventBus.publish(EventTypes.REQUIREMENT_GENERATED, {
        claimId,
        requirementCount: requirements.length,
        requirements: requirements.map(r => ({ id: r.id, type: r.type, level: r.level })),
        timestamp: new Date().toISOString()
      });

      console.log(`[RequirementProcessor] Generated ${requirements.length} requirements for claim ${claimId}`);

    } catch (error) {
      console.error('[RequirementProcessor] Error generating requirements:', error);
      result.success = false;
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Create FSO Task for Requirement
   */
  async createRequirementTask(claimId, requirement, context) {
    const caseId = context.fsoCase?.id || context.workflow?.fsoCase;

    if (!caseId) {
      throw new Error('FSO case ID not found in context');
    }

    const task = await fsoService.createTask({
      caseId,
      name: `Requirement: ${requirement.type}`,
      description: requirement.description,
      type: TaskType.DOCUMENT_REVIEW,
      status: TaskStatus.OPEN,
      priority: requirement.isMandatory() ? 'high' : 'normal',
      dueDate: requirement.dueDate,
      metadata: {
        requirementId: requirement.id,
        requirementType: requirement.type,
        requirementLevel: requirement.level,
        claimId
      }
    });

    return task;
  }

  /**
   * Link Document to Requirement
   *
   * @param {string} claimId - Claim ID
   * @param {string} requirementId - Requirement ID
   * @param {string} documentId - Document ID
   * @param {boolean} autoEvaluate - Automatically evaluate if requirement is satisfied
   * @returns {Promise<Object>}
   */
  async linkDocument(claimId, requirementId, documentId, autoEvaluate = true) {
    console.log(`[RequirementProcessor] Linking document ${documentId} to requirement ${requirementId}`);

    const requirement = this.getRequirement(claimId, requirementId);
    if (!requirement) {
      throw new Error(`Requirement not found: ${requirementId}`);
    }

    // Link document
    requirement.linkDocument(documentId);

    // Link in DMS
    try {
      await dmsService.linkDocumentToRequirement(documentId, requirementId);
    } catch (error) {
      console.warn('[RequirementProcessor] Failed to link in DMS:', error);
    }

    // Auto-evaluate if enabled
    if (autoEvaluate) {
      await this.evaluateRequirementSatisfaction(claimId, requirementId);
    }

    // Publish event
    eventBus.publish(EventTypes.DOCUMENT_LINKED, {
      claimId,
      requirementId,
      documentId,
      timestamp: new Date().toISOString()
    });

    return { requirement, documentId };
  }

  /**
   * Evaluate Requirement Satisfaction
   *
   * Uses IDP extraction results to determine if requirement is satisfied.
   *
   * @param {string} claimId - Claim ID
   * @param {string} requirementId - Requirement ID
   * @returns {Promise<boolean>}
   */
  async evaluateRequirementSatisfaction(claimId, requirementId) {
    console.log(`[RequirementProcessor] Evaluating satisfaction for requirement ${requirementId}`);

    const requirement = this.getRequirement(claimId, requirementId);
    if (!requirement) {
      throw new Error(`Requirement not found: ${requirementId}`);
    }

    // Already satisfied
    if (requirement.isSatisfied()) {
      return true;
    }

    // No documents linked
    if (requirement.documents.length === 0) {
      return false;
    }

    // Check each linked document
    let satisfied = false;

    for (const documentId of requirement.documents) {
      try {
        // Get document classification
        const classification = await dmsService.classifyDocument(documentId);

        // Get IDP extraction results
        const extraction = await dmsService.getExtractionResults(documentId);

        // Check if document matches requirement type
        const matches = this.documentMatchesRequirement(
          requirement,
          classification,
          extraction
        );

        if (matches) {
          satisfied = true;
          break;
        }
      } catch (error) {
        console.warn(`[RequirementProcessor] Error evaluating document ${documentId}:`, error);
      }
    }

    if (satisfied) {
      await this.satisfyRequirement(claimId, requirementId, {
        method: 'automatic',
        reason: 'Document verified via IDP'
      });
    }

    return satisfied;
  }

  /**
   * Check if Document Matches Requirement
   */
  documentMatchesRequirement(requirement, classification, extraction) {
    // Map requirement types to document types
    const typeMapping = {
      [RequirementType.DEATH_CERTIFICATE]: ['death_certificate'],
      [RequirementType.CLAIMANT_STATEMENT]: ['claimant_statement', 'claim_form'],
      [RequirementType.PROOF_OF_IDENTITY]: ['drivers_license', 'passport', 'government_id'],
      [RequirementType.POLICY_DOCUMENTS]: ['policy', 'policy_document'],
      [RequirementType.MEDICAL_RECORDS]: ['medical_record', 'medical_report'],
      [RequirementType.ATTENDING_PHYSICIAN_STATEMENT]: ['aps', 'physician_statement'],
      [RequirementType.AUTOPSY_REPORT]: ['autopsy', 'autopsy_report'],
      [RequirementType.BENEFICIARY_DESIGNATION]: ['beneficiary_form', 'beneficiary_designation'],
      [RequirementType.TAX_FORMS]: ['w9', 'tax_form'],
      [RequirementType.BANKING_INFORMATION]: ['direct_deposit_form', 'bank_form'],
      [RequirementType.POWER_OF_ATTORNEY]: ['poa', 'power_of_attorney'],
      [RequirementType.COURT_DOCUMENTS]: ['court_order', 'letters_testamentary', 'letters_administration']
    };

    const expectedTypes = typeMapping[requirement.type] || [];

    // Check if classification matches
    if (classification && classification.documentType) {
      const matchesType = expectedTypes.some(expectedType =>
        classification.documentType.toLowerCase().includes(expectedType.toLowerCase())
      );

      // Check confidence
      const meetsConfidence = classification.confidence >= 0.85;

      return matchesType && meetsConfidence;
    }

    return false;
  }

  /**
   * Satisfy Requirement
   *
   * @param {string} claimId - Claim ID
   * @param {string} requirementId - Requirement ID
   * @param {Object} options - Satisfaction options
   * @returns {Promise<Object>}
   */
  async satisfyRequirement(claimId, requirementId, options = {}) {
    console.log(`[RequirementProcessor] Satisfying requirement ${requirementId}`);

    const requirement = this.getRequirement(claimId, requirementId);
    if (!requirement) {
      throw new Error(`Requirement not found: ${requirementId}`);
    }

    requirement.updateStatus(RequirementStatus.SATISFIED);
    requirement.metadata.satisfiedBy = options.satisfiedBy || 'system';
    requirement.metadata.satisfactionMethod = options.method || 'manual';
    requirement.metadata.satisfactionReason = options.reason || '';

    // Complete FSO task
    if (requirement.fsoTaskId) {
      try {
        await fsoService.completeTask(requirement.fsoTaskId, {
          notes: `Requirement satisfied: ${options.reason || 'Document verified'}`
        });
      } catch (error) {
        console.warn('[RequirementProcessor] Failed to complete FSO task:', error);
      }
    }

    // Publish event
    eventBus.publish(EventTypes.REQUIREMENT_SATISFIED, {
      claimId,
      requirementId,
      requirementType: requirement.type,
      timestamp: new Date().toISOString()
    });

    return { requirement };
  }

  /**
   * Waive Requirement
   *
   * @param {string} claimId - Claim ID
   * @param {string} requirementId - Requirement ID
   * @param {string} userId - User performing waiver
   * @param {string} reason - Waiver reason
   * @returns {Promise<Object>}
   */
  async waiveRequirement(claimId, requirementId, userId, reason) {
    console.log(`[RequirementProcessor] Waiving requirement ${requirementId}`);

    const requirement = this.getRequirement(claimId, requirementId);
    if (!requirement) {
      throw new Error(`Requirement not found: ${requirementId}`);
    }

    requirement.waived = true;
    requirement.waivedBy = userId;
    requirement.waivedReason = reason;
    requirement.waivedAt = new Date().toISOString();
    requirement.updateStatus(RequirementStatus.WAIVED);

    // Complete FSO task
    if (requirement.fsoTaskId) {
      try {
        await fsoService.completeTask(requirement.fsoTaskId, {
          notes: `Requirement waived: ${reason}`
        });
      } catch (error) {
        console.warn('[RequirementProcessor] Failed to complete FSO task:', error);
      }
    }

    // Publish event
    eventBus.publish(EventTypes.REQUIREMENT_WAIVED, {
      claimId,
      requirementId,
      requirementType: requirement.type,
      waivedBy: userId,
      reason,
      timestamp: new Date().toISOString()
    });

    return { requirement };
  }

  /**
   * Override Requirement
   *
   * @param {string} claimId - Claim ID
   * @param {string} requirementId - Requirement ID
   * @param {string} userId - User performing override
   * @param {string} reason - Override reason
   * @returns {Promise<Object>}
   */
  async overrideRequirement(claimId, requirementId, userId, reason) {
    console.log(`[RequirementProcessor] Overriding requirement ${requirementId}`);

    const requirement = this.getRequirement(claimId, requirementId);
    if (!requirement) {
      throw new Error(`Requirement not found: ${requirementId}`);
    }

    requirement.overridden = true;
    requirement.overriddenBy = userId;
    requirement.overriddenReason = reason;
    requirement.overriddenAt = new Date().toISOString();
    requirement.updateStatus(RequirementStatus.OVERRIDDEN);

    // Publish event
    eventBus.publish(EventTypes.REQUIREMENT_OVERRIDDEN, {
      claimId,
      requirementId,
      requirementType: requirement.type,
      overriddenBy: userId,
      reason,
      timestamp: new Date().toISOString()
    });

    return { requirement };
  }

  /**
   * Get Requirements for Claim
   *
   * @param {string} claimId - Claim ID
   * @returns {Requirement[]}
   */
  getRequirements(claimId) {
    return this.requirementsByClaimId.get(claimId) || [];
  }

  /**
   * Get Requirement by ID
   *
   * @param {string} claimId - Claim ID
   * @param {string} requirementId - Requirement ID
   * @returns {Requirement|null}
   */
  getRequirement(claimId, requirementId) {
    const requirements = this.getRequirements(claimId);
    return requirements.find(r => r.id === requirementId) || null;
  }

  /**
   * Check if All Mandatory Requirements Satisfied
   *
   * @param {string} claimId - Claim ID
   * @returns {boolean}
   */
  allMandatoryRequirementsSatisfied(claimId) {
    const requirements = this.getRequirements(claimId);
    const mandatoryRequirements = requirements.filter(r => r.isMandatory());

    if (mandatoryRequirements.length === 0) return false;

    return mandatoryRequirements.every(r => r.isSatisfied());
  }

  /**
   * Get Requirement Statistics
   *
   * @param {string} claimId - Claim ID
   * @returns {Object}
   */
  getRequirementStats(claimId) {
    const requirements = this.getRequirements(claimId);

    return {
      total: requirements.length,
      mandatory: requirements.filter(r => r.isMandatory()).length,
      optional: requirements.filter(r => !r.isMandatory()).length,
      satisfied: requirements.filter(r => r.status === RequirementStatus.SATISFIED).length,
      pending: requirements.filter(r => r.status === RequirementStatus.PENDING).length,
      inReview: requirements.filter(r => r.status === RequirementStatus.IN_REVIEW).length,
      rejected: requirements.filter(r => r.status === RequirementStatus.REJECTED).length,
      waived: requirements.filter(r => r.waived).length,
      overridden: requirements.filter(r => r.overridden).length,
      overdue: requirements.filter(r => r.isOverdue()).length,
      completionPercentage: requirements.length > 0
        ? Math.round((requirements.filter(r => r.isSatisfied()).length / requirements.length) * 100)
        : 0
    };
  }

  /**
   * Clear Requirements for Claim
   *
   * @param {string} claimId - Claim ID
   */
  clearRequirements(claimId) {
    this.requirementsByClaimId.delete(claimId);
  }
}

// Create singleton instance
const requirementProcessor = new RequirementProcessor();

export default requirementProcessor;
export { RequirementProcessor, Requirement, ProcessingResult };
