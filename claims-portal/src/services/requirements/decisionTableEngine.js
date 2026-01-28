/**
 * Decision Table Engine
 *
 * Evaluates business rules to determine claim requirements.
 * Uses a decision table approach with conditions, actions, and priority.
 *
 * Key Features:
 * - Rule-based requirement determination
 * - Condition evaluation with operators (AND, OR, NOT)
 * - Priority-based rule execution
 * - Dynamic requirement generation
 * - Audit trail of decisions
 *
 * Integration:
 * - Claim Orchestrator: Requirement generation (step 8)
 * - Requirement Processor: Rule-based processing
 * - Event Bus: Decision events
 */

import eventBus, { EventTypes } from '../sync/eventBus.js';
import {
  RequirementType,
  RequirementLevel,
  RequirementStatus,
  DecisionOperator,
  DecisionActionType
} from '../../types/requirement.types.js';

/**
 * Decision Rule
 * Represents a single rule in the decision table
 */
class DecisionRule {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.priority = config.priority || 100; // Lower = higher priority
    this.enabled = config.enabled !== false;
    this.conditions = config.conditions || [];
    this.actions = config.actions || [];
    this.metadata = config.metadata || {};
  }

  /**
   * Evaluate if this rule's conditions are met
   * @param {Object} context - Claim context (claim, policy, etc.)
   * @returns {boolean}
   */
  evaluate(context) {
    if (!this.enabled) return false;
    if (this.conditions.length === 0) return false;

    return this.evaluateConditions(this.conditions, context);
  }

  /**
   * Recursively evaluate condition groups
   */
  evaluateConditions(conditions, context, operator = DecisionOperator.AND) {
    const results = conditions.map(condition => {
      // Handle nested condition groups
      if (condition.conditions) {
        return this.evaluateConditions(
          condition.conditions,
          context,
          condition.operator || DecisionOperator.AND
        );
      }

      // Evaluate single condition
      return this.evaluateCondition(condition, context);
    });

    // Apply operator
    switch (operator) {
      case DecisionOperator.AND:
        return results.every(r => r === true);
      case DecisionOperator.OR:
        return results.some(r => r === true);
      case DecisionOperator.NOT:
        return !results[0];
      default:
        return false;
    }
  }

  /**
   * Evaluate a single condition
   */
  evaluateCondition(condition, context) {
    const { field, operator, value } = condition;
    const actualValue = this.getFieldValue(field, context);

    switch (operator) {
      case 'equals':
        return actualValue === value;
      case 'notEquals':
        return actualValue !== value;
      case 'greaterThan':
        return actualValue > value;
      case 'greaterThanOrEqual':
        return actualValue >= value;
      case 'lessThan':
        return actualValue < value;
      case 'lessThanOrEqual':
        return actualValue <= value;
      case 'contains':
        return String(actualValue).includes(value);
      case 'notContains':
        return !String(actualValue).includes(value);
      case 'in':
        return Array.isArray(value) && value.includes(actualValue);
      case 'notIn':
        return Array.isArray(value) && !value.includes(actualValue);
      case 'exists':
        return actualValue !== null && actualValue !== undefined;
      case 'notExists':
        return actualValue === null || actualValue === undefined;
      case 'isEmpty':
        return !actualValue || actualValue.length === 0;
      case 'isNotEmpty':
        return actualValue && actualValue.length > 0;
      default:
        return false;
    }
  }

  /**
   * Get nested field value from context using dot notation
   * e.g., "policy.status" → context.policy.status
   */
  getFieldValue(field, context) {
    const parts = field.split('.');
    let value = context;

    for (const part of parts) {
      if (value === null || value === undefined) return null;
      value = value[part];
    }

    return value;
  }

  /**
   * Get actions to execute when rule matches
   */
  getActions() {
    return this.actions;
  }
}

/**
 * Decision Result
 * Result of evaluating decision table
 */
class DecisionResult {
  constructor() {
    this.requirements = [];
    this.rulesMatched = [];
    this.rulesEvaluated = 0;
    this.timestamp = new Date().toISOString();
    this.metadata = {};
  }

  addRequirement(requirement) {
    this.requirements.push(requirement);
  }

  addMatchedRule(rule) {
    this.rulesMatched.push({
      id: rule.id,
      name: rule.name,
      priority: rule.priority,
      actions: rule.actions.length
    });
  }
}

/**
 * Decision Table Engine
 */
class DecisionTableEngine {
  constructor() {
    this.rules = [];
    this.loadDefaultRules();
  }

  /**
   * Load default decision rules
   */
  loadDefaultRules() {
    // Rule 1: Death Certificate - Always required for death claims
    this.addRule({
      id: 'REQ_DEATH_CERT',
      name: 'Death Certificate Required',
      description: 'Death certificate is mandatory for all death claims',
      priority: 1,
      conditions: [
        { field: 'claim.type', operator: 'equals', value: 'death' }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.DEATH_CERTIFICATE,
          level: RequirementLevel.MANDATORY,
          description: 'Official death certificate from vital records',
          dueInDays: 30
        }
      ]
    });

    // Rule 2: Claimant Statement - Required for all claims
    this.addRule({
      id: 'REQ_CLAIMANT_STMT',
      name: 'Claimant Statement Required',
      description: 'Claimant statement required for all claims',
      priority: 2,
      conditions: [
        { field: 'claim.type', operator: 'exists' }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.CLAIMANT_STATEMENT,
          level: RequirementLevel.MANDATORY,
          description: 'Completed and signed claimant statement form',
          dueInDays: 30
        }
      ]
    });

    // Rule 3: Proof of Identity - Required for all claims
    this.addRule({
      id: 'REQ_PROOF_ID',
      name: 'Proof of Identity Required',
      description: 'Valid photo ID required for beneficiary verification',
      priority: 3,
      conditions: [
        { field: 'claim.type', operator: 'exists' }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.PROOF_OF_IDENTITY,
          level: RequirementLevel.MANDATORY,
          description: 'Valid government-issued photo ID',
          dueInDays: 30
        }
      ]
    });

    // Rule 4: Policy Documents - Required if policy not found
    this.addRule({
      id: 'REQ_POLICY_DOCS',
      name: 'Policy Documents Required',
      description: 'Original policy documents needed when policy lookup fails',
      priority: 10,
      conditions: [
        { field: 'policy.found', operator: 'equals', value: false }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.POLICY_DOCUMENTS,
          level: RequirementLevel.MANDATORY,
          description: 'Original policy documents or certified copy',
          dueInDays: 45
        }
      ]
    });

    // Rule 5: Medical Records - Required for contestability
    this.addRule({
      id: 'REQ_MEDICAL_RECORDS',
      name: 'Medical Records Required',
      description: 'Medical records required within contestability period',
      priority: 15,
      conditions: [
        {
          operator: DecisionOperator.AND,
          conditions: [
            { field: 'claim.type', operator: 'equals', value: 'death' },
            { field: 'policy.contestable', operator: 'equals', value: true }
          ]
        }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.MEDICAL_RECORDS,
          level: RequirementLevel.MANDATORY,
          description: 'Complete medical records from treating physician',
          dueInDays: 60
        }
      ]
    });

    // Rule 6: Attending Physician Statement - High claim amounts
    this.addRule({
      id: 'REQ_APS',
      name: 'Attending Physician Statement',
      description: 'APS required for high-value claims',
      priority: 20,
      conditions: [
        {
          operator: DecisionOperator.AND,
          conditions: [
            { field: 'claim.type', operator: 'equals', value: 'death' },
            { field: 'claim.amount', operator: 'greaterThan', value: 500000 }
          ]
        }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.ATTENDING_PHYSICIAN_STATEMENT,
          level: RequirementLevel.MANDATORY,
          description: 'Attending Physician Statement (APS)',
          dueInDays: 45
        }
      ]
    });

    // Rule 7: Autopsy Report - Suspicious circumstances
    this.addRule({
      id: 'REQ_AUTOPSY',
      name: 'Autopsy Report Required',
      description: 'Autopsy report required for suspicious deaths',
      priority: 25,
      conditions: [
        {
          operator: DecisionOperator.OR,
          conditions: [
            { field: 'deathVerification.causeOfDeath', operator: 'contains', value: 'homicide' },
            { field: 'deathVerification.causeOfDeath', operator: 'contains', value: 'suicide' },
            { field: 'deathVerification.causeOfDeath', operator: 'contains', value: 'accident' },
            { field: 'anomalies', operator: 'isNotEmpty' }
          ]
        }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.AUTOPSY_REPORT,
          level: RequirementLevel.MANDATORY,
          description: 'Official autopsy report from medical examiner',
          dueInDays: 90
        }
      ]
    });

    // Rule 8: Beneficiary Designation Form - Beneficiary disputes
    this.addRule({
      id: 'REQ_BENE_FORM',
      name: 'Beneficiary Designation Form',
      description: 'Beneficiary form required when verification fails',
      priority: 30,
      conditions: [
        {
          operator: DecisionOperator.OR,
          conditions: [
            { field: 'beneficiaryVerification.verified', operator: 'equals', value: false },
            { field: 'beneficiaryVerification.confidence', operator: 'lessThan', value: 80 }
          ]
        }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.BENEFICIARY_DESIGNATION,
          level: RequirementLevel.MANDATORY,
          description: 'Most recent beneficiary designation form on file',
          dueInDays: 30
        }
      ]
    });

    // Rule 9: Tax Forms - Large claim amounts
    this.addRule({
      id: 'REQ_TAX_FORMS',
      name: 'Tax Forms Required',
      description: 'W-9 required for tax reporting',
      priority: 50,
      conditions: [
        { field: 'claim.amount', operator: 'greaterThanOrEqual', value: 600 }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.TAX_FORMS,
          level: RequirementLevel.MANDATORY,
          description: 'Completed IRS Form W-9',
          dueInDays: 30
        }
      ]
    });

    // Rule 10: Bank Information - Direct deposit
    this.addRule({
      id: 'REQ_BANK_INFO',
      name: 'Banking Information',
      description: 'Banking information for electronic payment',
      priority: 60,
      conditions: [
        { field: 'claim.type', operator: 'exists' }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.BANKING_INFORMATION,
          level: RequirementLevel.OPTIONAL,
          description: 'Banking information for direct deposit (optional)',
          dueInDays: 30
        }
      ]
    });

    // Rule 11: Power of Attorney - Third-party claimant
    this.addRule({
      id: 'REQ_POA',
      name: 'Power of Attorney',
      description: 'POA required when claimant is not beneficiary',
      priority: 35,
      conditions: [
        { field: 'claimant.isBeneficiary', operator: 'equals', value: false }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.POWER_OF_ATTORNEY,
          level: RequirementLevel.MANDATORY,
          description: 'Valid Power of Attorney document',
          dueInDays: 30
        }
      ]
    });

    // Rule 12: Court Documents - Estate claims
    this.addRule({
      id: 'REQ_COURT_DOCS',
      name: 'Court Documents Required',
      description: 'Court documents required for estate claims',
      priority: 40,
      conditions: [
        { field: 'claimant.type', operator: 'equals', value: 'estate' }
      ],
      actions: [
        {
          type: DecisionActionType.ADD_REQUIREMENT,
          requirementType: RequirementType.COURT_DOCUMENTS,
          level: RequirementLevel.MANDATORY,
          description: 'Letters of administration or testamentary',
          dueInDays: 60
        }
      ]
    });

    console.log(`[DecisionTableEngine] Loaded ${this.rules.length} default rules`);
  }

  /**
   * Add a rule to the decision table
   */
  addRule(config) {
    const rule = new DecisionRule(config);
    this.rules.push(rule);
    return rule;
  }

  /**
   * Get all rules
   */
  getRules() {
    return [...this.rules];
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId) {
    return this.rules.find(r => r.id === ruleId);
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId, enabled) {
    const rule = this.getRule(ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Evaluate decision table and generate requirements
   *
   * @param {Object} context - Decision context
   * @returns {DecisionResult}
   */
  evaluate(context) {
    console.log('[DecisionTableEngine] Evaluating decision table');

    const result = new DecisionResult();

    // Sort rules by priority (lower = higher priority)
    const sortedRules = [...this.rules]
      .filter(r => r.enabled)
      .sort((a, b) => a.priority - b.priority);

    // Evaluate each rule
    for (const rule of sortedRules) {
      result.rulesEvaluated++;

      try {
        const matches = rule.evaluate(context);

        if (matches) {
          console.log(`[DecisionTableEngine] Rule matched: ${rule.name}`);
          result.addMatchedRule(rule);

          // Execute actions
          for (const action of rule.getActions()) {
            this.executeAction(action, context, result);
          }
        }
      } catch (error) {
        console.error(`[DecisionTableEngine] Error evaluating rule ${rule.id}:`, error);
      }
    }

    // Publish decision event
    eventBus.publish(EventTypes.DECISION_EVALUATED, {
      claimId: context.claim?.id,
      requirementsGenerated: result.requirements.length,
      rulesMatched: result.rulesMatched.length,
      timestamp: result.timestamp
    });

    console.log(`[DecisionTableEngine] Generated ${result.requirements.length} requirements from ${result.rulesMatched.length} matched rules`);

    return result;
  }

  /**
   * Execute a rule action
   */
  executeAction(action, context, result) {
    switch (action.type) {
      case DecisionActionType.ADD_REQUIREMENT:
        this.addRequirementAction(action, context, result);
        break;

      case DecisionActionType.REMOVE_REQUIREMENT:
        this.removeRequirementAction(action, context, result);
        break;

      case DecisionActionType.ESCALATE:
        this.escalateAction(action, context, result);
        break;

      case DecisionActionType.AUTO_APPROVE:
        this.autoApproveAction(action, context, result);
        break;

      default:
        console.warn(`[DecisionTableEngine] Unknown action type: ${action.type}`);
    }
  }

  /**
   * Add requirement action
   */
  addRequirementAction(action, context, result) {
    // Check if requirement already exists
    const exists = result.requirements.some(
      r => r.type === action.requirementType
    );

    if (!exists) {
      const requirement = {
        type: action.requirementType,
        level: action.level || RequirementLevel.MANDATORY,
        status: RequirementStatus.PENDING,
        description: action.description || '',
        dueDate: this.calculateDueDate(action.dueInDays || 30),
        createdAt: new Date().toISOString(),
        metadata: action.metadata || {}
      };

      result.addRequirement(requirement);
    }
  }

  /**
   * Remove requirement action
   */
  removeRequirementAction(action, context, result) {
    result.requirements = result.requirements.filter(
      r => r.type !== action.requirementType
    );
  }

  /**
   * Escalate action
   */
  escalateAction(action, context, result) {
    result.metadata.escalated = true;
    result.metadata.escalationReason = action.reason || 'Rule-based escalation';
  }

  /**
   * Auto-approve action
   */
  autoApproveAction(action, context, result) {
    result.metadata.autoApprove = true;
    result.metadata.autoApproveReason = action.reason || 'Rule-based auto-approval';
  }

  /**
   * Calculate due date from days
   */
  calculateDueDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  }

  /**
   * Clear all rules
   */
  clearRules() {
    this.rules = [];
  }

  /**
   * Reload default rules
   */
  reloadDefaultRules() {
    this.clearRules();
    this.loadDefaultRules();
  }
}

// Create singleton instance
const decisionTableEngine = new DecisionTableEngine();

export default decisionTableEngine;
export { DecisionTableEngine, DecisionRule, DecisionResult };
