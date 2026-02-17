/**
 * Custom Hook: useBeneficiaryAnalysis
 *
 * Automatically triggers beneficiary analysis when FNOL is loaded
 * Provides state management and methods for beneficiary analysis workflow
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import beneficiaryAnalyzerService from '../services/api/beneficiaryAnalyzerService';
import serviceNowService from '../services/api/serviceNowService';

export const useBeneficiaryAnalysis = (fnolSysId, options = {}) => {
  const {
    autoTrigger = true,           // Automatically trigger analysis on mount
    autoTriggerDelay = 1000,      // Delay before auto-triggering (ms)
    onSuccess = null,             // Callback on successful analysis
    onError = null                // Callback on analysis error
  } = options;

  const [analysisData, setAnalysisData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [triggered, setTriggered] = useState(false);

  // Ref to track if analysis has been attempted
  const hasAttemptedAnalysis = useRef(false);

  /**
   * Trigger the complete beneficiary analysis workflow
   */
  const triggerAnalysis = useCallback(async () => {
    if (!fnolSysId) {
      const errorMsg = 'FNOL sys_id is required to trigger beneficiary analysis';
      console.error('[useBeneficiaryAnalysis]', errorMsg);
      setError(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);
    setTriggered(true);
    hasAttemptedAnalysis.current = true;

    try {
      console.log('[useBeneficiaryAnalysis] Triggering analysis for FNOL:', fnolSysId);

      // Trigger the complete ServiceNow analysis workflow
      const result = await beneficiaryAnalyzerService.triggerServiceNowAnalysis(fnolSysId);

      setAnalysisResult(result);
      setAnalysisData(result.beneficiaryData);

      console.log('[useBeneficiaryAnalysis] Analysis completed successfully:', result);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      console.error('[useBeneficiaryAnalysis] Analysis failed:', err);
      const errorMsg = err.message || 'Failed to complete beneficiary analysis';
      setError(errorMsg);

      // Call error callback if provided
      if (onError) {
        onError(err);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [fnolSysId, onSuccess, onError]);

  /**
   * Fetch beneficiary data from worknotes only (without triggering subflow)
   */
  const fetchBeneficiaryData = useCallback(async () => {
    if (!fnolSysId) {
      const errorMsg = 'FNOL sys_id is required to fetch beneficiary data';
      console.error('[useBeneficiaryAnalysis]', errorMsg);
      setError(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useBeneficiaryAnalysis] Fetching beneficiary data from worknotes:', fnolSysId);

      const data = await beneficiaryAnalyzerService.getBeneficiaryDataFromServiceNow(fnolSysId);

      setAnalysisData(data);
      console.log('[useBeneficiaryAnalysis] Beneficiary data retrieved:', data);

      return data;
    } catch (err) {
      console.error('[useBeneficiaryAnalysis] Failed to fetch beneficiary data:', err);
      const errorMsg = err.message || 'Failed to fetch beneficiary data';
      setError(errorMsg);

      return null;
    } finally {
      setLoading(false);
    }
  }, [fnolSysId]);

  /**
   * Reset the analysis state
   */
  const reset = useCallback(() => {
    setAnalysisData(null);
    setAnalysisResult(null);
    setLoading(false);
    setError(null);
    setTriggered(false);
    hasAttemptedAnalysis.current = false;
  }, []);

  /**
   * Auto-trigger analysis on mount if enabled
   */
  useEffect(() => {
    if (autoTrigger && fnolSysId && !hasAttemptedAnalysis.current) {
      console.log('[useBeneficiaryAnalysis] Auto-triggering analysis with delay:', autoTriggerDelay, 'ms');

      const timer = setTimeout(() => {
        triggerAnalysis();
      }, autoTriggerDelay);

      return () => clearTimeout(timer);
    }
  }, [fnolSysId, autoTrigger, autoTriggerDelay, triggerAnalysis]);

  /**
   * Reset state when fnolSysId changes
   */
  useEffect(() => {
    hasAttemptedAnalysis.current = false;
    reset();
  }, [fnolSysId, reset]);

  return {
    // State
    analysisData,           // Beneficiary data from worknotes
    analysisResult,         // Complete analysis result including subflow response
    loading,                // Loading state
    error,                  // Error message if any
    triggered,              // Whether analysis has been triggered

    // Methods
    triggerAnalysis,        // Manually trigger complete analysis
    fetchBeneficiaryData,   // Fetch data from worknotes only
    reset,                  // Reset all state

    // Computed
    hasData: !!analysisData,
    hasResult: !!analysisResult,
    isSuccess: !!analysisResult && !error
  };
};

export default useBeneficiaryAnalysis;
