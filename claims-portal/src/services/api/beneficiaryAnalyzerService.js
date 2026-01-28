/**
 * Beneficiary Analyzer Service
 *
 * Handles communication with the Beneficiary Analyzer Agent API
 * Provides methods for:
 * - Triggering beneficiary analysis
 * - Retrieving analysis results
 * - LexisNexis integrations (address lookup, deceased verification)
 * - Approving and appending beneficiaries to claims
 */

import apiClient from './apiClient';

class BeneficiaryAnalyzerService {
  constructor() {
    this.baseEndpoint = '/beneficiary-analyzer';
  }

  /**
   * Trigger beneficiary analysis for a claim
   * This invokes the Beneficiary Analyzer Agent to extract beneficiary information
   * from uploaded documents
   *
   * @param {string} claimId - The claim ID to analyze
   * @returns {Promise<Object>} Analysis job details
   */
  async triggerAnalysis(claimId) {
    try {
      console.log('[BeneficiaryAnalyzerService] Triggering analysis for claim:', claimId);

      const response = await apiClient.post(`${this.baseEndpoint}/analyze`, {
        claimId,
        options: {
          extractFromDocuments: true,
          compareWithAdmin: true,
          confidenceThreshold: 0.7
        }
      });

      console.log('[BeneficiaryAnalyzerService] Analysis triggered:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BeneficiaryAnalyzerService] Error triggering analysis:', error);
      throw new Error(error.response?.data?.message || 'Failed to trigger beneficiary analysis');
    }
  }

  /**
   * Get beneficiary analysis results
   *
   * @param {string} claimId - The claim ID
   * @returns {Promise<Object>} Analysis results with extracted and administrative beneficiaries
   */
  async getAnalysisResults(claimId) {
    try {
      console.log('[BeneficiaryAnalyzerService] Fetching analysis results for claim:', claimId);

      const response = await apiClient.get(`${this.baseEndpoint}/results/${claimId}`);

      console.log('[BeneficiaryAnalyzerService] Analysis results retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BeneficiaryAnalyzerService] Error fetching analysis results:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve beneficiary analysis results');
    }
  }

  /**
   * Verify beneficiary address using LexisNexis
   *
   * @param {string} claimId - The claim ID
   * @param {string} beneficiaryId - The beneficiary ID
   * @param {Object} beneficiaryData - Beneficiary information for verification
   * @returns {Promise<Object>} Address verification results
   */
  async verifyAddressLexisNexis(claimId, beneficiaryId, beneficiaryData) {
    try {
      console.log('[BeneficiaryAnalyzerService] Verifying address via LexisNexis:', {
        claimId,
        beneficiaryId,
        name: beneficiaryData.fullName
      });

      const response = await apiClient.post(`${this.baseEndpoint}/lexisnexis/address`, {
        claimId,
        beneficiaryId,
        name: beneficiaryData.fullName,
        dateOfBirth: beneficiaryData.dateOfBirth,
        ssn: beneficiaryData.ssn,
        currentAddress: beneficiaryData.address
      });

      console.log('[BeneficiaryAnalyzerService] Address verification complete:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BeneficiaryAnalyzerService] Error verifying address:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify address via LexisNexis');
    }
  }

  /**
   * Check deceased status using LexisNexis
   *
   * @param {string} claimId - The claim ID
   * @param {string} beneficiaryId - The beneficiary ID
   * @param {Object} beneficiaryData - Beneficiary information for verification
   * @returns {Promise<Object>} Deceased status verification results
   */
  async checkDeceasedStatusLexisNexis(claimId, beneficiaryId, beneficiaryData) {
    try {
      console.log('[BeneficiaryAnalyzerService] Checking deceased status via LexisNexis:', {
        claimId,
        beneficiaryId,
        name: beneficiaryData.fullName
      });

      const response = await apiClient.post(`${this.baseEndpoint}/lexisnexis/deceased`, {
        claimId,
        beneficiaryId,
        name: beneficiaryData.fullName,
        dateOfBirth: beneficiaryData.dateOfBirth,
        ssn: beneficiaryData.ssn
      });

      console.log('[BeneficiaryAnalyzerService] Deceased status check complete:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BeneficiaryAnalyzerService] Error checking deceased status:', error);
      throw new Error(error.response?.data?.message || 'Failed to check deceased status via LexisNexis');
    }
  }

  /**
   * Approve and append beneficiaries to claim
   * This updates the claim record with the approved beneficiary information
   *
   * @param {string} claimId - The claim ID
   * @param {Array<Object>} beneficiaries - Array of approved beneficiaries
   * @returns {Promise<Object>} Updated claim data
   */
  async approveBeneficiaries(claimId, beneficiaries) {
    try {
      console.log('[BeneficiaryAnalyzerService] Approving beneficiaries for claim:', claimId);
      console.log('[BeneficiaryAnalyzerService] Beneficiaries to approve:', beneficiaries);

      const response = await apiClient.post(`${this.baseEndpoint}/approve`, {
        claimId,
        beneficiaries: beneficiaries.map(b => ({
          id: b.id,
          fullName: b.fullName,
          relationship: b.relationship,
          percentage: b.percentage,
          ssn: b.ssn,
          dateOfBirth: b.dateOfBirth,
          address: b.address,
          phone: b.phone,
          email: b.email,
          confidenceScores: b.confidenceScores,
          sourceDocument: b.sourceDocument
        })),
        approvedAt: new Date().toISOString(),
        approvedBy: 'current-user' // This should come from auth context
      });

      console.log('[BeneficiaryAnalyzerService] Beneficiaries approved:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BeneficiaryAnalyzerService] Error approving beneficiaries:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve beneficiaries');
    }
  }

  /**
   * Get analysis status
   * Check if analysis is in progress, completed, or failed
   *
   * @param {string} claimId - The claim ID
   * @returns {Promise<Object>} Analysis status
   */
  async getAnalysisStatus(claimId) {
    try {
      console.log('[BeneficiaryAnalyzerService] Checking analysis status for claim:', claimId);

      const response = await apiClient.get(`${this.baseEndpoint}/status/${claimId}`);

      console.log('[BeneficiaryAnalyzerService] Analysis status:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BeneficiaryAnalyzerService] Error checking analysis status:', error);
      throw new Error(error.response?.data?.message || 'Failed to check analysis status');
    }
  }

  /**
   * Retry failed analysis
   *
   * @param {string} claimId - The claim ID
   * @returns {Promise<Object>} New analysis job details
   */
  async retryAnalysis(claimId) {
    try {
      console.log('[BeneficiaryAnalyzerService] Retrying analysis for claim:', claimId);

      const response = await apiClient.post(`${this.baseEndpoint}/retry`, {
        claimId
      });

      console.log('[BeneficiaryAnalyzerService] Analysis retry triggered:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BeneficiaryAnalyzerService] Error retrying analysis:', error);
      throw new Error(error.response?.data?.message || 'Failed to retry analysis');
    }
  }

  /**
   * Get document used for beneficiary extraction
   *
   * @param {string} documentId - The document ID
   * @returns {Promise<Object>} Document details and content
   */
  async getSourceDocument(documentId) {
    try {
      console.log('[BeneficiaryAnalyzerService] Fetching source document:', documentId);

      const response = await apiClient.get(`${this.baseEndpoint}/documents/${documentId}`);

      console.log('[BeneficiaryAnalyzerService] Document retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('[BeneficiaryAnalyzerService] Error fetching document:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve source document');
    }
  }
}

// Create singleton instance
const beneficiaryAnalyzerService = new BeneficiaryAnalyzerService();

export default beneficiaryAnalyzerService;
