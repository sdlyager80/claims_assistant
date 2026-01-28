/**
 * Policy Admin Service
 * Policy System of Record Integration (Read-Only)
 *
 * Policy Admin is authoritative for:
 * - Policy records
 * - Beneficiary designations
 * - Coverage information
 * - Policy values and status
 * - Premium information
 *
 * NOTE: This is READ-ONLY access. Policy Admin is the authoritative source.
 */

import apiClient from './apiClient';
import cacheManager from '../utils/cacheManager';
import { handleAPIError } from '../utils/errorHandler';
import eventBus, { EventTypes } from '../sync/eventBus';
import demoData from '../../data/demoData';

const POLICY_BASE_PATH = '/policy-admin';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (policies change infrequently)
const USE_DEMO_DATA = true; // Toggle for demo mode

/**
 * Policy Lookup
 */

/**
 * Lookup policy by policy number
 * @param {string} policyNumber - Policy number
 * @param {boolean} bypassCache - Bypass cache
 * @returns {Promise<Object>} Policy data
 */
export const lookupPolicy = async (policyNumber, bypassCache = false) => {
  try {
    // DEMO MODE: Return demo data
    if (USE_DEMO_DATA) {
      console.log(`[Policy Admin] Looking up demo policy: ${policyNumber}`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const policy = demoData.policies.find(p => p.policyNumber === policyNumber);

      if (!policy) {
        throw new Error(`Policy not found: ${policyNumber}`);
      }

      // Publish event
      eventBus.publish(EventTypes.POLICY_RETRIEVED, { policy });

      return policy;
    }

    const cacheKey = cacheManager.generateKey('policy:lookup', { policyNumber });

    if (!bypassCache) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    console.log(`[Policy Admin] Looking up policy: ${policyNumber}`);

    const policy = await apiClient.get(`${POLICY_BASE_PATH}/policies/${policyNumber}`);

    cacheManager.set(cacheKey, policy, CACHE_TTL);

    // Publish event
    eventBus.publish(EventTypes.POLICY_RETRIEVED, { policy });

    return policy;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.lookupPolicy');
  }
};

/**
 * Search for policy by insured SSN
 * @param {string} ssn - Social Security Number
 * @returns {Promise<Array>} Matching policies
 */
export const searchPolicyBySSN = async (ssn) => {
  try {
    const cacheKey = cacheManager.generateKey('policy:search:ssn', { ssn });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[Policy Admin] Searching policies by SSN`);

    const policies = await apiClient.get(`${POLICY_BASE_PATH}/policies/search`, {
      params: { ssn }
    });

    cacheManager.set(cacheKey, policies, CACHE_TTL);

    return policies;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.searchPolicyBySSN');
  }
};

/**
 * Get policy details
 * @param {string} policyNumber - Policy number
 * @returns {Promise<Object>} Detailed policy information
 */
export const getPolicyDetails = async (policyNumber) => {
  try {
    const cacheKey = cacheManager.generateKey('policy:details', { policyNumber });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[Policy Admin] Getting policy details: ${policyNumber}`);

    const details = await apiClient.get(`${POLICY_BASE_PATH}/policies/${policyNumber}/details`);

    cacheManager.set(cacheKey, details, CACHE_TTL);

    return details;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.getPolicyDetails');
  }
};

/**
 * Beneficiary Information
 */

/**
 * Get beneficiaries for policy
 * @param {string} policyNumber - Policy number
 * @param {boolean} bypassCache - Bypass cache
 * @returns {Promise<Array>} List of beneficiaries
 */
export const getBeneficiaries = async (policyNumber, bypassCache = false) => {
  try {
    const cacheKey = cacheManager.generateKey('policy:beneficiaries', { policyNumber });

    if (!bypassCache) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    console.log(`[Policy Admin] Getting beneficiaries for policy: ${policyNumber}`);

    const beneficiaries = await apiClient.get(`${POLICY_BASE_PATH}/policies/${policyNumber}/beneficiaries`);

    cacheManager.set(cacheKey, beneficiaries, CACHE_TTL);

    return beneficiaries;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.getBeneficiaries');
  }
};

/**
 * Policy Actions
 */

/**
 * Suspend policy (on date of death)
 * @param {string} policyNumber - Policy number
 * @param {string} suspensionDate - Suspension date (ISO format)
 * @param {string} reason - Suspension reason
 * @returns {Promise<Object>} Suspension result
 */
export const suspendPolicy = async (policyNumber, suspensionDate, reason) => {
  try {
    console.log(`[Policy Admin] Suspending policy: ${policyNumber} on ${suspensionDate}`);

    const result = await apiClient.post(`${POLICY_BASE_PATH}/policies/${policyNumber}/suspend`, {
      suspensionDate,
      reason
    });

    // Invalidate cache
    invalidatePolicyCache(policyNumber);

    // Publish event
    eventBus.publish(EventTypes.POLICY_SUSPENDED, { policyNumber, suspensionDate, reason });

    return result;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.suspendPolicy');
  }
};

/**
 * Calculate death benefit
 * @param {string} policyNumber - Policy number
 * @param {string} dateOfDeath - Date of death (ISO format)
 * @returns {Promise<Object>} Death benefit calculation
 */
export const calculateDeathBenefit = async (policyNumber, dateOfDeath) => {
  try {
    const cacheKey = cacheManager.generateKey('policy:death-benefit', { policyNumber, dateOfDeath });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[Policy Admin] Calculating death benefit for policy: ${policyNumber}`);

    const calculation = await apiClient.post(`${POLICY_BASE_PATH}/policies/${policyNumber}/death-benefit`, {
      dateOfDeath
    });

    // Cache calculation (short TTL since it's tied to specific DOD)
    cacheManager.set(cacheKey, calculation, 30 * 60 * 1000); // 30 minutes

    return calculation;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.calculateDeathBenefit');
  }
};

/**
 * Validate policy coverage
 * @param {string} policyNumber - Policy number
 * @param {string} date - Date to validate (ISO format)
 * @returns {Promise<Object>} Coverage validation result
 */
export const validateCoverage = async (policyNumber, date) => {
  try {
    console.log(`[Policy Admin] Validating coverage for policy: ${policyNumber} on ${date}`);

    const validation = await apiClient.post(`${POLICY_BASE_PATH}/policies/${policyNumber}/validate-coverage`, {
      date
    });

    return validation;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.validateCoverage');
  }
};

/**
 * Policy History
 */

/**
 * Get policy change history
 * @param {string} policyNumber - Policy number
 * @returns {Promise<Array>} Policy change history
 */
export const getPolicyHistory = async (policyNumber) => {
  try {
    const cacheKey = cacheManager.generateKey('policy:history', { policyNumber });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[Policy Admin] Getting policy history: ${policyNumber}`);

    const history = await apiClient.get(`${POLICY_BASE_PATH}/policies/${policyNumber}/history`);

    cacheManager.set(cacheKey, history, CACHE_TTL);

    return history;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.getPolicyHistory');
  }
};

/**
 * Get beneficiary change history
 * @param {string} policyNumber - Policy number
 * @returns {Promise<Array>} Beneficiary change history
 */
export const getBeneficiaryHistory = async (policyNumber) => {
  try {
    const cacheKey = cacheManager.generateKey('policy:beneficiary-history', { policyNumber });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[Policy Admin] Getting beneficiary history: ${policyNumber}`);

    const history = await apiClient.get(`${POLICY_BASE_PATH}/policies/${policyNumber}/beneficiaries/history`);

    cacheManager.set(cacheKey, history, CACHE_TTL);

    return history;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.getBeneficiaryHistory');
  }
};

/**
 * Policy Values
 */

/**
 * Get policy cash value
 * @param {string} policyNumber - Policy number
 * @param {string} asOfDate - As of date (ISO format)
 * @returns {Promise<Object>} Cash value information
 */
export const getPolicyCashValue = async (policyNumber, asOfDate = null) => {
  try {
    const date = asOfDate || new Date().toISOString().split('T')[0];
    const cacheKey = cacheManager.generateKey('policy:cash-value', { policyNumber, date });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[Policy Admin] Getting cash value for policy: ${policyNumber}`);

    const cashValue = await apiClient.get(`${POLICY_BASE_PATH}/policies/${policyNumber}/cash-value`, {
      params: { asOfDate: date }
    });

    cacheManager.set(cacheKey, cashValue, CACHE_TTL);

    return cashValue;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.getPolicyCashValue');
  }
};

/**
 * Get policy loan information
 * @param {string} policyNumber - Policy number
 * @returns {Promise<Object>} Loan information
 */
export const getPolicyLoans = async (policyNumber) => {
  try {
    const cacheKey = cacheManager.generateKey('policy:loans', { policyNumber });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[Policy Admin] Getting loans for policy: ${policyNumber}`);

    const loans = await apiClient.get(`${POLICY_BASE_PATH}/policies/${policyNumber}/loans`);

    cacheManager.set(cacheKey, loans, CACHE_TTL);

    return loans;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.getPolicyLoans');
  }
};

/**
 * Premium Information
 */

/**
 * Get premium information
 * @param {string} policyNumber - Policy number
 * @returns {Promise<Object>} Premium information
 */
export const getPremiumInfo = async (policyNumber) => {
  try {
    const cacheKey = cacheManager.generateKey('policy:premium', { policyNumber });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[Policy Admin] Getting premium info for policy: ${policyNumber}`);

    const premiumInfo = await apiClient.get(`${POLICY_BASE_PATH}/policies/${policyNumber}/premium`);

    cacheManager.set(cacheKey, premiumInfo, CACHE_TTL);

    return premiumInfo;
  } catch (error) {
    throw handleAPIError(error, 'PolicyAdmin.getPremiumInfo');
  }
};

/**
 * Cache Invalidation
 */

/**
 * Invalidate all policy-related cache
 * @param {string} policyNumber - Policy number
 */
export const invalidatePolicyCache = (policyNumber) => {
  cacheManager.clearByPrefix(`policy:*:policyNumber:${policyNumber}`);
  console.log(`[Policy Admin] Cache invalidated for policy: ${policyNumber}`);
};

export default {
  // Policy Lookup
  lookupPolicy,
  searchPolicyBySSN,
  getPolicyDetails,

  // Beneficiary Information
  getBeneficiaries,

  // Policy Actions
  suspendPolicy,
  calculateDeathBenefit,
  validateCoverage,

  // Policy History
  getPolicyHistory,
  getBeneficiaryHistory,

  // Policy Values
  getPolicyCashValue,
  getPolicyLoans,

  // Premium Information
  getPremiumInfo,

  // Cache
  invalidatePolicyCache
};
