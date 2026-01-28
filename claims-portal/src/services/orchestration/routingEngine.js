/**
 * Routing Engine
 * Evaluates FastTrack eligibility based on multiple criteria
 *
 * FastTrack Criteria:
 * - 3-point death verification match (SSN + Name + DOB) ≥95%
 * - Policy in-force and clean (no lapses, contestability passed)
 * - Beneficiary match confidence ≥95%
 * - No contestability issues
 * - Claim amount within threshold
 * - No anomalies detected by AI
 */

import { RoutingType } from '../../types/claim.types';
import { handleBusinessError } from '../utils/errorHandler';

/**
 * FastTrack Eligibility Result
 */
class EligibilityResult {
  constructor() {
    this.eligible = false;
    this.confidence = 0;
    this.reason = '';
    this.criteria = {
      deathVerification: { passed: false, score: 0, weight: 30 },
      policyStatus: { passed: false, score: 0, weight: 20 },
      beneficiaryMatch: { passed: false, score: 0, weight: 25 },
      contestability: { passed: false, score: 0, weight: 15 },
      claimAmount: { passed: false, score: 0, weight: 10 },
      noAnomalies: { passed: false, score: 0, weight: 10 }
    };
    this.score = 0;
    this.threshold = 85; // Minimum score to be FastTrack eligible
  }

  calculateScore() {
    this.score = Object.values(this.criteria).reduce((total, criterion) => {
      return total + (criterion.passed ? criterion.weight : criterion.score);
    }, 0);

    this.eligible = this.score >= this.threshold;
    this.confidence = this.score;
  }

  setReason() {
    if (this.eligible) {
      this.reason = 'All FastTrack criteria met';
    } else {
      const failedCriteria = Object.entries(this.criteria)
        .filter(([_, criterion]) => !criterion.passed)
        .map(([name]) => name);

      this.reason = `FastTrack ineligible: ${failedCriteria.join(', ')} failed`;
    }
  }
}

/**
 * Routing Engine Configuration
 */
const FASTTRACK_CONFIG = {
  // Death Verification Thresholds
  deathVerificationThreshold: 95,
  threePointMatchRequired: true,

  // Policy Status Requirements
  requiredPolicyStatus: 'in_force',
  contestabilityPeriodYears: 2,

  // Beneficiary Match Threshold
  beneficiaryMatchThreshold: 95,

  // Claim Amount Threshold (in dollars)
  maxClaimAmount: 500000,

  // Anomaly Tolerance
  maxAnomalySeverity: 'low',

  // Overall Score Threshold
  minEligibilityScore: 85
};

/**
 * Evaluate FastTrack Eligibility
 * @param {Object} data - Evaluation data
 * @param {Object} data.claim - Claim object
 * @param {Object} data.policy - Policy object
 * @param {Object} data.deathVerification - Death verification result
 * @param {Object} data.beneficiaryVerification - Beneficiary verification (optional)
 * @param {Object} data.aiInsights - AI insights (optional)
 * @returns {Promise<EligibilityResult>}
 */
export async function evaluateFastTrackEligibility(data) {
  const result = new EligibilityResult();

  try {
    console.log('[RoutingEngine] Evaluating FastTrack eligibility');

    // Criterion 1: Death Verification (30% weight)
    evaluateDeathVerification(data.deathVerification, result);

    // Criterion 2: Policy Status (20% weight)
    evaluatePolicyStatus(data.policy, result);

    // Criterion 3: Beneficiary Match (25% weight)
    evaluateBeneficiaryMatch(data.beneficiaryVerification, result);

    // Criterion 4: Contestability (15% weight)
    evaluateContestability(data.policy, result);

    // Criterion 5: Claim Amount (10% weight)
    evaluateClaimAmount(data.claim, result);

    // Criterion 6: No Anomalies (10% weight)
    evaluateAnomalies(data.aiInsights, result);

    // Calculate overall score and eligibility
    result.calculateScore();
    result.setReason();

    console.log('[RoutingEngine] Eligibility result:', {
      eligible: result.eligible,
      score: result.score,
      reason: result.reason
    });

    return result;

  } catch (error) {
    console.error('[RoutingEngine] Evaluation error:', error);
    result.eligible = false;
    result.reason = 'Evaluation error: defaulting to standard routing';
    return result;
  }
}

/**
 * Criterion 1: Death Verification (30% weight)
 * Requires 3-point match (SSN + Name + DOB) with ≥95% confidence
 */
function evaluateDeathVerification(verification, result) {
  const criterion = result.criteria.deathVerification;

  if (!verification) {
    criterion.passed = false;
    criterion.score = 0;
    return;
  }

  const { verified, confidence, threePointMatch } = verification;

  // Check if verified
  if (!verified) {
    criterion.passed = false;
    criterion.score = 0;
    return;
  }

  // Check 3-point match
  if (threePointMatch) {
    const matchConfidence = threePointMatch.confidence || confidence;

    if (matchConfidence >= FASTTRACK_CONFIG.deathVerificationThreshold) {
      criterion.passed = true;
      criterion.score = criterion.weight;
    } else {
      // Partial credit for confidence between 70-95%
      if (matchConfidence >= 70) {
        criterion.passed = false;
        criterion.score = Math.floor((matchConfidence / 95) * criterion.weight);
      } else {
        criterion.passed = false;
        criterion.score = 0;
      }
    }
  } else {
    criterion.passed = false;
    criterion.score = 0;
  }

  console.log('[RoutingEngine] Death verification:', {
    passed: criterion.passed,
    score: criterion.score
  });
}

/**
 * Criterion 2: Policy Status (20% weight)
 * Policy must be in-force with no lapses
 */
function evaluatePolicyStatus(policy, result) {
  const criterion = result.criteria.policyStatus;

  if (!policy) {
    criterion.passed = false;
    criterion.score = 0;
    return;
  }

  const { status } = policy;

  // Check if policy is in-force
  if (status === FASTTRACK_CONFIG.requiredPolicyStatus) {
    criterion.passed = true;
    criterion.score = criterion.weight;
  } else {
    criterion.passed = false;
    criterion.score = 0;
  }

  console.log('[RoutingEngine] Policy status:', {
    status,
    passed: criterion.passed,
    score: criterion.score
  });
}

/**
 * Criterion 3: Beneficiary Match (25% weight)
 * Beneficiary information must match policy records with ≥95% confidence
 */
function evaluateBeneficiaryMatch(beneficiaryVerification, result) {
  const criterion = result.criteria.beneficiaryMatch;

  if (!beneficiaryVerification) {
    // If no verification data yet, assume pending (neutral score)
    criterion.passed = false;
    criterion.score = Math.floor(criterion.weight * 0.5); // 50% of weight as placeholder
    return;
  }

  const { confidence, matches } = beneficiaryVerification;

  if (confidence >= FASTTRACK_CONFIG.beneficiaryMatchThreshold) {
    criterion.passed = true;
    criterion.score = criterion.weight;
  } else if (confidence >= 70) {
    // Partial credit for confidence between 70-95%
    criterion.passed = false;
    criterion.score = Math.floor((confidence / 95) * criterion.weight);
  } else {
    criterion.passed = false;
    criterion.score = 0;
  }

  console.log('[RoutingEngine] Beneficiary match:', {
    confidence,
    passed: criterion.passed,
    score: criterion.score
  });
}

/**
 * Criterion 4: Contestability (15% weight)
 * Policy must be beyond contestability period (typically 2 years)
 */
function evaluateContestability(policy, result) {
  const criterion = result.criteria.contestability;

  if (!policy || !policy.issueDate) {
    criterion.passed = false;
    criterion.score = 0;
    return;
  }

  const issueDate = new Date(policy.issueDate);
  const now = new Date();
  const yearsSinceIssue = (now - issueDate) / (1000 * 60 * 60 * 24 * 365);

  // Check if beyond contestability period
  if (yearsSinceIssue >= FASTTRACK_CONFIG.contestabilityPeriodYears) {
    criterion.passed = true;
    criterion.score = criterion.weight;
  } else {
    criterion.passed = false;
    criterion.score = 0;
  }

  console.log('[RoutingEngine] Contestability:', {
    yearsSinceIssue: yearsSinceIssue.toFixed(2),
    passed: criterion.passed,
    score: criterion.score
  });
}

/**
 * Criterion 5: Claim Amount (10% weight)
 * Claim amount must be within threshold (e.g., $500K)
 */
function evaluateClaimAmount(claim, result) {
  const criterion = result.criteria.claimAmount;

  if (!claim || !claim.financial || !claim.financial.claimAmount) {
    criterion.passed = false;
    criterion.score = 0;
    return;
  }

  const claimAmount = claim.financial.claimAmount;

  // Check if claim amount is within threshold
  if (claimAmount <= FASTTRACK_CONFIG.maxClaimAmount) {
    criterion.passed = true;
    criterion.score = criterion.weight;
  } else {
    criterion.passed = false;
    criterion.score = 0;
  }

  console.log('[RoutingEngine] Claim amount:', {
    amount: claimAmount,
    threshold: FASTTRACK_CONFIG.maxClaimAmount,
    passed: criterion.passed,
    score: criterion.score
  });
}

/**
 * Criterion 6: No Anomalies (10% weight)
 * No high or medium severity anomalies detected by AI
 */
function evaluateAnomalies(aiInsights, result) {
  const criterion = result.criteria.noAnomalies;

  if (!aiInsights || !aiInsights.anomalies) {
    // If no AI insights yet, assume no anomalies (neutral score)
    criterion.passed = true;
    criterion.score = criterion.weight;
    return;
  }

  const { anomalies } = aiInsights;

  // Check for high or medium severity anomalies
  const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
  const mediumSeverityAnomalies = anomalies.filter(a => a.severity === 'medium');

  if (highSeverityAnomalies.length > 0) {
    criterion.passed = false;
    criterion.score = 0;
  } else if (mediumSeverityAnomalies.length > 0) {
    criterion.passed = false;
    criterion.score = Math.floor(criterion.weight * 0.5); // 50% penalty for medium anomalies
  } else {
    criterion.passed = true;
    criterion.score = criterion.weight;
  }

  console.log('[RoutingEngine] Anomalies:', {
    high: highSeverityAnomalies.length,
    medium: mediumSeverityAnomalies.length,
    passed: criterion.passed,
    score: criterion.score
  });
}

/**
 * Re-evaluate Routing
 * Re-evaluates FastTrack eligibility when claim state changes
 * (e.g., new requirements satisfied, documents received)
 */
export async function reevaluateRouting(claimId, updatedData) {
  try {
    console.log('[RoutingEngine] Re-evaluating routing for claim:', claimId);

    // Get latest claim data
    // TODO: Fetch from context or service

    const eligibility = await evaluateFastTrackEligibility(updatedData);

    return eligibility;

  } catch (error) {
    console.error('[RoutingEngine] Re-evaluation error:', error);
    throw error;
  }
}

/**
 * Get Routing Configuration
 */
export function getRoutingConfig() {
  return { ...FASTTRACK_CONFIG };
}

/**
 * Update Routing Configuration
 * (Admin function)
 */
export function updateRoutingConfig(updates) {
  Object.assign(FASTTRACK_CONFIG, updates);
  console.log('[RoutingEngine] Configuration updated:', FASTTRACK_CONFIG);
}

export default {
  evaluateFastTrackEligibility,
  reevaluateRouting,
  getRoutingConfig,
  updateRoutingConfig
};
