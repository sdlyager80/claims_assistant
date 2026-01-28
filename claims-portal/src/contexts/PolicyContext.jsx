/**
 * Policy Context
 * Policy Admin integration state management
 * - Policy lookup and details
 * - Beneficiary information
 * - Policy history
 * - Death benefit calculations
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import policyService from '../services/api/policyService';
import { handleAPIError } from '../services/utils/errorHandler';
import eventBus, { EventTypes } from '../services/sync/eventBus';

const PolicyContext = createContext(null);

export const PolicyProvider = ({ children }) => {
  // Current Policy State
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState(null);

  // Beneficiaries State
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);

  // Policy History State
  const [policyHistory, setPolicyHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Death Benefit Calculation State
  const [deathBenefit, setDeathBenefit] = useState(null);
  const [deathBenefitLoading, setDeathBenefitLoading] = useState(false);

  /**
   * Lookup Policy
   */
  const lookupPolicy = useCallback(async (policyNumber, bypassCache = false) => {
    try {
      setPolicyLoading(true);
      setPolicyError(null);

      const policy = await policyService.lookupPolicy(policyNumber, bypassCache);

      setCurrentPolicy(policy);

      return policy;

    } catch (error) {
      const apiError = handleAPIError(error, 'PolicyContext.lookupPolicy');
      setPolicyError(apiError);
      throw error;
    } finally {
      setPolicyLoading(false);
    }
  }, []);

  /**
   * Search Policy by SSN
   */
  const searchPolicyBySSN = useCallback(async (ssn) => {
    try {
      setPolicyLoading(true);
      setPolicyError(null);

      const policies = await policyService.searchPolicyBySSN(ssn);

      return policies;

    } catch (error) {
      const apiError = handleAPIError(error, 'PolicyContext.searchPolicyBySSN');
      setPolicyError(apiError);
      throw error;
    } finally {
      setPolicyLoading(false);
    }
  }, []);

  /**
   * Get Policy Details
   */
  const getPolicyDetails = useCallback(async (policyNumber) => {
    try {
      setPolicyLoading(true);
      setPolicyError(null);

      const details = await policyService.getPolicyDetails(policyNumber);

      setCurrentPolicy(details);

      return details;

    } catch (error) {
      const apiError = handleAPIError(error, 'PolicyContext.getPolicyDetails');
      setPolicyError(apiError);
      throw error;
    } finally {
      setPolicyLoading(false);
    }
  }, []);

  /**
   * Get Beneficiaries
   */
  const fetchBeneficiaries = useCallback(async (policyNumber, bypassCache = false) => {
    try {
      setBeneficiariesLoading(true);

      const beneficiariesList = await policyService.getBeneficiaries(policyNumber, bypassCache);

      setBeneficiaries(beneficiariesList);

      return beneficiariesList;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.fetchBeneficiaries');
      throw error;
    } finally {
      setBeneficiariesLoading(false);
    }
  }, []);

  /**
   * Suspend Policy
   */
  const suspendPolicy = useCallback(async (policyNumber, suspensionDate, reason) => {
    try {
      setPolicyLoading(true);

      const result = await policyService.suspendPolicy(policyNumber, suspensionDate, reason);

      // Update current policy status
      if (currentPolicy?.policyNumber === policyNumber) {
        setCurrentPolicy(prev => ({ ...prev, status: 'suspended' }));
      }

      return result;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.suspendPolicy');
      throw error;
    } finally {
      setPolicyLoading(false);
    }
  }, [currentPolicy]);

  /**
   * Calculate Death Benefit
   */
  const calculateDeathBenefit = useCallback(async (policyNumber, dateOfDeath) => {
    try {
      setDeathBenefitLoading(true);

      const calculation = await policyService.calculateDeathBenefit(policyNumber, dateOfDeath);

      setDeathBenefit(calculation);

      return calculation;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.calculateDeathBenefit');
      throw error;
    } finally {
      setDeathBenefitLoading(false);
    }
  }, []);

  /**
   * Validate Coverage
   */
  const validateCoverage = useCallback(async (policyNumber, date) => {
    try {
      const validation = await policyService.validateCoverage(policyNumber, date);

      return validation;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.validateCoverage');
      throw error;
    }
  }, []);

  /**
   * Get Policy History
   */
  const fetchPolicyHistory = useCallback(async (policyNumber) => {
    try {
      setHistoryLoading(true);

      const history = await policyService.getPolicyHistory(policyNumber);

      setPolicyHistory(history);

      return history;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.fetchPolicyHistory');
      throw error;
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /**
   * Get Beneficiary History
   */
  const fetchBeneficiaryHistory = useCallback(async (policyNumber) => {
    try {
      const history = await policyService.getBeneficiaryHistory(policyNumber);

      return history;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.fetchBeneficiaryHistory');
      throw error;
    }
  }, []);

  /**
   * Get Policy Cash Value
   */
  const getPolicyCashValue = useCallback(async (policyNumber, asOfDate = null) => {
    try {
      const cashValue = await policyService.getPolicyCashValue(policyNumber, asOfDate);

      return cashValue;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.getPolicyCashValue');
      throw error;
    }
  }, []);

  /**
   * Get Policy Loans
   */
  const getPolicyLoans = useCallback(async (policyNumber) => {
    try {
      const loans = await policyService.getPolicyLoans(policyNumber);

      return loans;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.getPolicyLoans');
      throw error;
    }
  }, []);

  /**
   * Get Premium Info
   */
  const getPremiumInfo = useCallback(async (policyNumber) => {
    try {
      const premiumInfo = await policyService.getPremiumInfo(policyNumber);

      return premiumInfo;

    } catch (error) {
      handleAPIError(error, 'PolicyContext.getPremiumInfo');
      throw error;
    }
  }, []);

  /**
   * Clear Policy State
   */
  const clearPolicyState = useCallback(() => {
    setCurrentPolicy(null);
    setBeneficiaries([]);
    setPolicyHistory([]);
    setDeathBenefit(null);
    setPolicyError(null);
  }, []);

  /**
   * Refresh Policy Data
   */
  const refreshPolicy = useCallback(async (policyNumber) => {
    return lookupPolicy(policyNumber, true);
  }, [lookupPolicy]);

  /**
   * Subscribe to Policy Events
   */
  useEffect(() => {
    // Subscribe to policy retrieved events
    const unsubscribeRetrieved = eventBus.subscribe(EventTypes.POLICY_RETRIEVED, (event) => {
      console.log('[PolicyContext] Policy retrieved event:', event);
    });

    // Subscribe to policy suspended events
    const unsubscribeSuspended = eventBus.subscribe(EventTypes.POLICY_SUSPENDED, (event) => {
      console.log('[PolicyContext] Policy suspended event:', event);

      const { policyNumber } = event.data;

      // Update current policy if it's the same
      if (currentPolicy?.policyNumber === policyNumber) {
        setCurrentPolicy(prev => ({ ...prev, status: 'suspended' }));
      }
    });

    // Subscribe to policy updated events
    const unsubscribeUpdated = eventBus.subscribe(EventTypes.POLICY_UPDATED, (event) => {
      console.log('[PolicyContext] Policy updated event:', event);
    });

    return () => {
      unsubscribeRetrieved();
      unsubscribeSuspended();
      unsubscribeUpdated();
    };
  }, [currentPolicy]);

  /**
   * Context Value
   */
  const value = {
    // Current Policy
    currentPolicy,
    policyLoading,
    policyError,

    // Beneficiaries
    beneficiaries,
    beneficiariesLoading,

    // Policy History
    policyHistory,
    historyLoading,

    // Death Benefit
    deathBenefit,
    deathBenefitLoading,

    // Policy Actions
    lookupPolicy,
    searchPolicyBySSN,
    getPolicyDetails,
    suspendPolicy,
    validateCoverage,
    refreshPolicy,

    // Beneficiary Actions
    fetchBeneficiaries,
    fetchBeneficiaryHistory,

    // Policy Information
    fetchPolicyHistory,
    getPolicyCashValue,
    getPolicyLoans,
    getPremiumInfo,

    // Death Benefit
    calculateDeathBenefit,

    // Utility
    clearPolicyState
  };

  return <PolicyContext.Provider value={value}>{children}</PolicyContext.Provider>;
};

/**
 * Hook to use Policy Context
 */
export const usePolicy = () => {
  const context = useContext(PolicyContext);
  if (!context) {
    throw new Error('usePolicy must be used within PolicyProvider');
  }
  return context;
};

export default PolicyContext;
