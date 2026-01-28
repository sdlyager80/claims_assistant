/**
 * Claim Orchestrator
 * Coordinates claim lifecycle across all systems (cmA, Policy Admin, FSO, DMS, AI)
 *
 * Orchestration Flow:
 * FNOL → Policy Lookup → Death Verification → Claim Creation → Requirements → Routing → Assignment
 */

import cmaService from '../api/cmaService';
import policyService from '../api/policyService';
import fsoService from '../api/fsoService';
import dmsService from '../api/dmsService';
import requirementProcessor from '../requirements/requirementProcessor';
import { evaluateFastTrackEligibility } from './routingEngine';
import eventBus, { EventTypes } from '../sync/eventBus';
import { handleAPIError, handleBusinessError } from '../utils/errorHandler';
import { ClaimStatus, RoutingType } from '../../types/claim.types';

/**
 * Orchestration Steps Enum
 */
export const OrchestrationStep = {
  FNOL_RECEIVED: 'fnol_received',
  POLICY_LOOKUP: 'policy_lookup',
  DEATH_VERIFICATION: 'death_verification',
  POLICY_SUSPENSION: 'policy_suspension',
  DEATH_BENEFIT_CALC: 'death_benefit_calculation',
  FSO_CASE_CREATION: 'fso_case_creation',
  CMA_CLAIM_CREATION: 'cma_claim_creation',
  REQUIREMENTS_GENERATION: 'requirements_generation',
  ROUTING_EVALUATION: 'routing_evaluation',
  ASSIGNMENT: 'assignment',
  COMPLETE: 'complete'
};

/**
 * Orchestration Result
 */
class OrchestrationResult {
  constructor() {
    this.success = false;
    this.claim = null;
    this.fsoCase = null;
    this.policy = null;
    this.steps = [];
    this.errors = [];
    this.warnings = [];
    this.metadata = {};
  }

  addStep(step, status, data = {}) {
    this.steps.push({
      step,
      status,
      timestamp: new Date().toISOString(),
      data
    });
  }

  addError(step, error) {
    this.errors.push({
      step,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  addWarning(step, warning) {
    this.warnings.push({
      step,
      warning,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Claim Orchestrator Class
 */
class ClaimOrchestrator {
  /**
   * Initiate Claim (Complete FNOL Orchestration)
   * @param {Object} fnolData - First Notice of Loss data
   * @returns {Promise<OrchestrationResult>}
   */
  async initiateClaim(fnolData) {
    const result = new OrchestrationResult();

    try {
      console.log('[Orchestrator] Starting claim initiation:', fnolData);
      result.addStep(OrchestrationStep.FNOL_RECEIVED, 'success', { fnolData });

      // Step 1: Lookup Policy (Policy Admin)
      const policy = await this.lookupPolicy(fnolData.policyNumber, result);
      if (!policy) {
        result.success = false;
        return result;
      }
      result.policy = policy;

      // Step 2: Verify Death (External Service)
      const deathVerification = await this.verifyDeath(
        fnolData.insured,
        result
      );
      result.metadata.deathVerification = deathVerification;

      // Step 3: Suspend Policy (Policy Admin)
      await this.suspendPolicy(
        fnolData.policyNumber,
        fnolData.dateOfDeath,
        'Death claim filed',
        result
      );

      // Step 4: Calculate Death Benefit (Policy Admin)
      const deathBenefit = await this.calculateDeathBenefit(
        fnolData.policyNumber,
        fnolData.dateOfDeath,
        result
      );
      result.metadata.deathBenefit = deathBenefit;

      // Step 5: Create FSO Case (ServiceNow)
      const fsoCase = await this.createFSOCase(fnolData, policy, result);
      result.fsoCase = fsoCase;

      // Step 6: Create Claim in cmA (Claims SOR)
      const claim = await this.createClaimInCMA(
        fnolData,
        policy,
        fsoCase,
        deathBenefit,
        result
      );
      result.claim = claim;

      // Step 7: Generate Requirements (Decision Tables)
      await this.generateRequirements(claim, policy, deathVerification, null, [], result);

      // Step 8: Evaluate Routing (FastTrack vs Standard)
      const routing = await this.evaluateRouting(claim, policy, deathVerification, result);
      result.metadata.routing = routing;

      // Step 9: Assign to Queue/Examiner
      await this.assignClaim(claim, routing, result);

      result.addStep(OrchestrationStep.COMPLETE, 'success');
      result.success = true;

      console.log('[Orchestrator] Claim initiation complete:', result);

      // Emit completion event
      eventBus.publish('orchestration.claim.initiated', {
        claimId: claim.id,
        fsoCase,
        routing
      });

      return result;

    } catch (error) {
      console.error('[Orchestrator] Claim initiation failed:', error);
      result.addError('initiation', error);
      result.success = false;
      return result;
    }
  }

  /**
   * Lookup Policy from Policy Admin
   */
  async lookupPolicy(policyNumber, result) {
    try {
      console.log('[Orchestrator] Looking up policy:', policyNumber);

      const policy = await policyService.lookupPolicy(policyNumber);

      result.addStep(OrchestrationStep.POLICY_LOOKUP, 'success', {
        policyNumber,
        policyType: policy.policyType,
        status: policy.status
      });

      // Validate policy is in-force
      if (policy.status !== 'in_force') {
        result.addWarning(
          OrchestrationStep.POLICY_LOOKUP,
          `Policy status is ${policy.status}, not in-force`
        );
      }

      return policy;

    } catch (error) {
      console.error('[Orchestrator] Policy lookup failed:', error);
      result.addStep(OrchestrationStep.POLICY_LOOKUP, 'failed');
      result.addError(OrchestrationStep.POLICY_LOOKUP, error);
      throw error;
    }
  }

  /**
   * Verify Death (External Verification Service)
   */
  async verifyDeath(insured, result) {
    try {
      console.log('[Orchestrator] Verifying death:', insured.name);

      // TODO: Integrate with LexisNexis or other verification service
      // For now, mock the verification
      const verification = {
        verified: true,
        confidence: 95,
        dateOfDeath: insured.dateOfDeath,
        source: 'SSA Death Master File',
        threePointMatch: {
          ssn: true,
          name: true,
          dob: true,
          confidence: 95
        }
      };

      result.addStep(OrchestrationStep.DEATH_VERIFICATION, 'success', {
        verified: verification.verified,
        confidence: verification.confidence,
        threePointMatch: verification.threePointMatch.confidence
      });

      if (verification.confidence < 95) {
        result.addWarning(
          OrchestrationStep.DEATH_VERIFICATION,
          `Death verification confidence is ${verification.confidence}%, below 95% threshold`
        );
      }

      return verification;

    } catch (error) {
      console.error('[Orchestrator] Death verification failed:', error);
      result.addStep(OrchestrationStep.DEATH_VERIFICATION, 'failed');
      result.addError(OrchestrationStep.DEATH_VERIFICATION, error);

      // Non-critical: Continue with manual verification
      result.addWarning(
        OrchestrationStep.DEATH_VERIFICATION,
        'Automatic verification failed, manual verification required'
      );

      return { verified: false, confidence: 0, manualReviewRequired: true };
    }
  }

  /**
   * Suspend Policy on Date of Death
   */
  async suspendPolicy(policyNumber, dateOfDeath, reason, result) {
    try {
      console.log('[Orchestrator] Suspending policy:', policyNumber);

      await policyService.suspendPolicy(policyNumber, dateOfDeath, reason);

      result.addStep(OrchestrationStep.POLICY_SUSPENSION, 'success', {
        policyNumber,
        suspensionDate: dateOfDeath
      });

    } catch (error) {
      console.error('[Orchestrator] Policy suspension failed:', error);
      result.addStep(OrchestrationStep.POLICY_SUSPENSION, 'failed');
      result.addError(OrchestrationStep.POLICY_SUSPENSION, error);

      // Non-critical: Can be done manually later
      result.addWarning(
        OrchestrationStep.POLICY_SUSPENSION,
        'Policy suspension failed, manual suspension required'
      );
    }
  }

  /**
   * Calculate Death Benefit
   */
  async calculateDeathBenefit(policyNumber, dateOfDeath, result) {
    try {
      console.log('[Orchestrator] Calculating death benefit:', policyNumber);

      const calculation = await policyService.calculateDeathBenefit(
        policyNumber,
        dateOfDeath
      );

      result.addStep(OrchestrationStep.DEATH_BENEFIT_CALC, 'success', {
        deathBenefit: calculation.deathBenefit,
        interest: calculation.interest,
        totalAmount: calculation.totalAmount
      });

      return calculation;

    } catch (error) {
      console.error('[Orchestrator] Death benefit calculation failed:', error);
      result.addStep(OrchestrationStep.DEATH_BENEFIT_CALC, 'failed');
      result.addError(OrchestrationStep.DEATH_BENEFIT_CALC, error);
      throw error;
    }
  }

  /**
   * Create FSO Case in ServiceNow
   */
  async createFSOCase(fnolData, policy, result) {
    try {
      console.log('[Orchestrator] Creating FSO case');

      const caseData = {
        title: `Death Claim - ${policy.policyNumber}`,
        description: `Death claim for insured: ${fnolData.insured.name}`,
        priority: 'medium',
        claimType: fnolData.claimType,
        policyNumber: policy.policyNumber,
        insuredName: fnolData.insured.name,
        dateOfDeath: fnolData.dateOfDeath,
        submittedBy: fnolData.submittedBy
      };

      const fsoCase = await fsoService.createCase(caseData);

      result.addStep(OrchestrationStep.FSO_CASE_CREATION, 'success', {
        caseId: fsoCase.id,
        caseNumber: fsoCase.caseNumber
      });

      return fsoCase;

    } catch (error) {
      console.error('[Orchestrator] FSO case creation failed:', error);
      result.addStep(OrchestrationStep.FSO_CASE_CREATION, 'failed');
      result.addError(OrchestrationStep.FSO_CASE_CREATION, error);

      // Critical: Workflow tracking required
      throw error;
    }
  }

  /**
   * Create Claim in cmA (Claims System of Record)
   */
  async createClaimInCMA(fnolData, policy, fsoCase, deathBenefit, result) {
    try {
      console.log('[Orchestrator] Creating claim in cmA');

      const claimData = {
        claimNumber: `CLM-${Date.now()}`,
        claimType: fnolData.claimType,
        status: ClaimStatus.SUBMITTED,
        policyNumber: policy.policyNumber,
        insured: fnolData.insured,
        policy: {
          policyNumber: policy.policyNumber,
          policyType: policy.policyType,
          coverage: policy.coverage
        },
        financial: {
          claimAmount: deathBenefit.totalAmount,
          deathBenefit: deathBenefit.deathBenefit,
          interestAmount: deathBenefit.interest
        },
        workflow: {
          fsoCase: fsoCase.id,
          caseNumber: fsoCase.caseNumber,
          routing: null, // Set later during routing evaluation
          daysOpen: 0
        },
        submittedBy: fnolData.submittedBy,
        submittedAt: new Date().toISOString()
      };

      const claim = await cmaService.createClaim(claimData);

      result.addStep(OrchestrationStep.CMA_CLAIM_CREATION, 'success', {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimAmount: claim.financial.claimAmount
      });

      return claim;

    } catch (error) {
      console.error('[Orchestrator] Claim creation in cmA failed:', error);
      result.addStep(OrchestrationStep.CMA_CLAIM_CREATION, 'failed');
      result.addError(OrchestrationStep.CMA_CLAIM_CREATION, error);

      // Critical: Claims SOR required
      throw error;
    }
  }

  /**
   * Generate Requirements (Decision Tables)
   */
  async generateRequirements(claim, policy, deathVerification, beneficiaryVerification, anomalies, result) {
    try {
      console.log('[Orchestrator] Generating requirements for claim:', claim.id);

      // Build context for decision table evaluation
      const context = {
        claim: {
          id: claim.id,
          type: claim.type,
          amount: claim.financial?.claimAmount || 0,
          status: claim.status
        },
        policy: {
          policyNumber: policy.policyNumber,
          status: policy.status,
          issueDate: policy.issueDate,
          contestable: policy.contestable,
          found: true
        },
        deathVerification: deathVerification || {
          verified: false,
          confidence: 0
        },
        beneficiaryVerification: beneficiaryVerification || {
          verified: false,
          confidence: 0
        },
        anomalies: anomalies || [],
        claimant: {
          isBeneficiary: true, // Default assumption
          type: 'individual'
        },
        fsoCase: {
          id: claim.workflow?.fsoCase
        },
        workflow: {
          fsoCase: claim.workflow?.fsoCase
        }
      };

      // Generate requirements using decision table engine
      const processingResult = await requirementProcessor.generateRequirements(claim.id, context);

      if (processingResult.success) {
        result.addStep(OrchestrationStep.REQUIREMENTS_GENERATION, 'success', {
          requirementsCount: processingResult.requirements.length,
          mandatoryCount: processingResult.metadata.mandatoryRequirements,
          optionalCount: processingResult.metadata.optionalRequirements,
          rulesMatched: processingResult.metadata.rulesMatched
        });

        result.metadata.requirements = processingResult.requirements.map(r => ({
          id: r.id,
          type: r.type,
          level: r.level,
          status: r.status,
          dueDate: r.dueDate
        }));

        return processingResult.requirements;
      } else {
        throw new Error('Requirement generation failed: ' + processingResult.errors.join(', '));
      }

    } catch (error) {
      console.error('[Orchestrator] Requirements generation failed:', error);
      result.addStep(OrchestrationStep.REQUIREMENTS_GENERATION, 'failed');
      result.addError(OrchestrationStep.REQUIREMENTS_GENERATION, error);

      // Non-critical: Can be added manually
      result.addWarning(
        OrchestrationStep.REQUIREMENTS_GENERATION,
        'Requirements generation failed, manual entry required'
      );
    }
  }

  /**
   * Evaluate Routing (FastTrack vs Standard)
   */
  async evaluateRouting(claim, policy, deathVerification, result) {
    try {
      console.log('[Orchestrator] Evaluating routing for claim:', claim.id);

      // Import routing engine
      const { evaluateFastTrackEligibility } = await import('./routingEngine.js');

      const eligibility = await evaluateFastTrackEligibility({
        claim,
        policy,
        deathVerification
      });

      const routing = eligibility.eligible ? RoutingType.FASTTRACK : RoutingType.STANDARD;

      // Update claim routing in cmA
      await cmaService.updateClaim(claim.id, {
        'workflow.routing': routing
      });

      result.addStep(OrchestrationStep.ROUTING_EVALUATION, 'success', {
        routing,
        eligible: eligibility.eligible,
        confidence: eligibility.confidence,
        reason: eligibility.reason
      });

      return { routing, eligibility };

    } catch (error) {
      console.error('[Orchestrator] Routing evaluation failed:', error);
      result.addStep(OrchestrationStep.ROUTING_EVALUATION, 'failed');
      result.addError(OrchestrationStep.ROUTING_EVALUATION, error);

      // Default to standard routing
      result.addWarning(
        OrchestrationStep.ROUTING_EVALUATION,
        'Routing evaluation failed, defaulting to standard routing'
      );

      return { routing: RoutingType.STANDARD, eligibility: { eligible: false } };
    }
  }

  /**
   * Assign Claim to Queue/Examiner
   */
  async assignClaim(claim, routing, result) {
    try {
      console.log('[Orchestrator] Assigning claim:', claim.id);

      // Determine queue based on routing
      const queueName = routing.routing === RoutingType.FASTTRACK
        ? 'FastTrack Queue'
        : 'Standard Queue';

      // TODO: Implement intelligent assignment algorithm
      // For now, assign to queue without specific examiner
      await cmaService.updateClaim(claim.id, {
        assignedTo: queueName
      });

      result.addStep(OrchestrationStep.ASSIGNMENT, 'success', {
        assignedTo: queueName,
        routing: routing.routing
      });

    } catch (error) {
      console.error('[Orchestrator] Claim assignment failed:', error);
      result.addStep(OrchestrationStep.ASSIGNMENT, 'failed');
      result.addError(OrchestrationStep.ASSIGNMENT, error);

      // Non-critical: Can be assigned manually
      result.addWarning(
        OrchestrationStep.ASSIGNMENT,
        'Claim assignment failed, manual assignment required'
      );
    }
  }

  /**
   * Process Requirement (IGO/NIGO Workflow)
   */
  async processRequirement(claimId, requirementId, documentId) {
    try {
      console.log('[Orchestrator] Processing requirement:', requirementId);

      // Link document to requirement
      await requirementProcessor.linkDocument(claimId, requirementId, documentId, true);

      // Get document and classification
      const document = await dmsService.getDocument(documentId);
      const extraction = await dmsService.getExtractionResults(documentId);

      // Determine IGO/NIGO based on confidence
      const status = extraction.confidence >= 0.9 ? 'igo' :
                     extraction.confidence >= 0.7 ? 'review' : 'nigo';

      // Check if all mandatory requirements are satisfied
      const allSatisfied = requirementProcessor.allMandatoryRequirementsSatisfied(claimId);

      if (allSatisfied) {
        console.log('[Orchestrator] All mandatory requirements satisfied for claim:', claimId);

        // Re-evaluate FastTrack eligibility
        const claim = await cmaService.getClaim(claimId);
        // Note: Routing re-evaluation could trigger workflow state change
      }

      return { status, extraction, allRequirementsSatisfied: allSatisfied };

    } catch (error) {
      handleAPIError(error, 'ClaimOrchestrator.processRequirement');
      throw error;
    }
  }

  /**
   * Calculate Settlement
   */
  async calculateSettlement(claimId) {
    try {
      console.log('[Orchestrator] Calculating settlement for claim:', claimId);

      const claim = await cmaService.getClaim(claimId);

      // Calculate tax withholding
      const taxCalc = await cmaService.calculateTaxWithholding({
        amount: claim.financial.claimAmount,
        state: claim.insured.state
      });

      // Create settlement calculation
      const settlement = {
        grossAmount: claim.financial.claimAmount,
        taxWithholding: taxCalc.withholdingAmount,
        netAmount: claim.financial.claimAmount - taxCalc.withholdingAmount,
        calculatedAt: new Date().toISOString()
      };

      return settlement;

    } catch (error) {
      handleAPIError(error, 'ClaimOrchestrator.calculateSettlement');
      throw error;
    }
  }

  /**
   * Execute Payment
   */
  async executePayment(claimId, paymentRequest) {
    try {
      console.log('[Orchestrator] Executing payment for claim:', claimId);

      // Create payment in cmA
      const payment = await cmaService.createPayment({
        claimId,
        ...paymentRequest
      });

      // Execute payment
      const result = await cmaService.executePayment(payment.id);

      // Post to GL
      await cmaService.postToGL({
        claimId,
        paymentId: payment.id,
        amount: payment.amount,
        transactionType: 'payment'
      });

      // Generate 1099 if applicable
      if (payment.amount >= 600) {
        await cmaService.generate1099(claimId);
      }

      return result;

    } catch (error) {
      handleAPIError(error, 'ClaimOrchestrator.executePayment');
      throw error;
    }
  }
}

// Create singleton instance
const claimOrchestrator = new ClaimOrchestrator();

export default claimOrchestrator;
export { ClaimOrchestrator, OrchestrationResult, OrchestrationStep };
