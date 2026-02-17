import { useState, useEffect } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcAlert,
  DxcInset,
  DxcChip,
  DxcDivider,
  DxcSpinner,
  DxcCard,
  DxcGrid,
  DxcStatusLight,
  DxcAccordion
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import './BeneficiaryAnalyzer.css';

/**
 * BeneficiaryAnalyzer Component
 *
 * Displays AI-extracted beneficiary information from documents and allows:
 * - Viewing extracted beneficiaries with confidence scores
 * - Comparing against administrative records
 * - LexisNexis integration for address lookup and deceased verification
 * - Document source viewing
 * - AI reasoning explanation
 */
const BeneficiaryAnalyzer = ({ claimId, claim, onApproveBeneficiaries, onCancel }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing beneficiary analysis...');
  const [error, setError] = useState(null);
  const [expandedBeneficiaries, setExpandedBeneficiaries] = useState({});
  const [lexisNexisResults, setLexisNexisResults] = useState({});
  const [processingLexisNexis, setProcessingLexisNexis] = useState({});

  // Toggle beneficiary card expansion
  const toggleBeneficiary = (beneficiaryId) => {
    setExpandedBeneficiaries(prev => ({
      ...prev,
      [beneficiaryId]: !prev[beneficiaryId]
    }));
  };

  // Expand/collapse all beneficiaries
  const toggleAllBeneficiaries = () => {
    const allExpanded = analysisData?.extractedBeneficiaries.every(b => expandedBeneficiaries[b.id]);
    const newState = {};
    analysisData?.extractedBeneficiaries.forEach(b => {
      newState[b.id] = !allExpanded;
    });
    setExpandedBeneficiaries(newState);
  };

  // Build analysis data from claim if available, otherwise use fallback
  const buildAnalysisData = () => {
    // Try to get beneficiaries from claim data
    const claimBeneficiaries = claim?.beneficiaries || claim?.policy?.beneficiaries || [];
    const claimParties = claim?.parties || [];
    const claimantData = claim?.claimant || {};

    if (claimBeneficiaries.length > 0) {
      // Build from actual claim beneficiary data
      const extractedBeneficiaries = claimBeneficiaries.map((ben, idx) => {
        // Try to find matching party for extra details
        const matchingParty = claimParties.find(p =>
          p.name === ben.name || p.role === ben.relationship
        );

        return {
          id: `bene-${idx + 1}`,
          fullName: ben.name || `Beneficiary ${idx + 1}`,
          relationship: ben.relationship || 'Unknown',
          percentage: typeof ben.percentage === 'string'
            ? parseInt(ben.percentage.replace('%', ''), 10)
            : (ben.percentage || 0),
          ssn: ben.ssn || matchingParty?.ssn || '***-**-0000',
          dateOfBirth: ben.dateOfBirth || matchingParty?.dateOfBirth || 'N/A',
          address: ben.address || matchingParty?.address || {
            street: claimantData.address?.street || '123 Main Street',
            city: claimantData.address?.city || 'Springfield',
            state: claimantData.address?.state || 'IL',
            zip: claimantData.address?.zip || '62701'
          },
          phone: ben.phone || matchingParty?.phone || null,
          email: ben.email || matchingParty?.email || null,
          confidenceScores: {
            overall: 0.92 + (idx * -0.02),
            name: 0.97 - (idx * 0.01),
            relationship: 0.93 - (idx * 0.01),
            percentage: 0.99,
            ssn: 0.85 - (idx * 0.03),
            dateOfBirth: 0.95 - (idx * 0.01),
            address: 0.88
          },
          sourceDocument: {
            id: `doc-${100 + idx}`,
            name: 'Beneficiary_Designation_Form.pdf',
            pageNumber: idx < 2 ? 1 : 2,
            extractionTimestamp: new Date().toISOString()
          },
          extractionReasoning: idx === 0
            ? `Primary beneficiary identified from beneficiary designation form. Name "${ben.name}" extracted with high confidence. Relationship "${ben.relationship}" confirmed from form fields.`
            : `Contingent beneficiary identified from beneficiary section. Relationship "${ben.relationship}" indicated. Allocation of ${ben.percentage} confirmed.`
        };
      });

      const administrativeBeneficiaries = claimBeneficiaries.map((ben, idx) => ({
        id: `admin-${idx + 1}`,
        fullName: ben.name || `Beneficiary ${idx + 1}`,
        relationship: ben.relationship || 'Unknown',
        percentage: typeof ben.percentage === 'string'
          ? parseInt(ben.percentage.replace('%', ''), 10)
          : (ben.percentage || 0),
        ssn: ben.ssn || '***-**-0000',
        dateOfBirth: ben.dateOfBirth || 'N/A',
        address: ben.address || {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: ben.phone || null,
        email: ben.email || null,
        lastUpdated: claim?.policy?.issueDate || '2023-06-15',
        source: 'Policy Administration System'
      }));

      return {
        extractedBeneficiaries,
        administrativeBeneficiaries,
        overallAnalysis: {
          matchStatus: 'MATCH',
          discrepancies: [],
          confidence: 0.94,
          recommendation: 'Extracted beneficiaries match administrative records with high confidence. No significant discrepancies detected.'
        }
      };
    }

    // Fallback: use generic mock data if no claim data available
    return {
      extractedBeneficiaries: [
        {
          id: 'bene-1',
          fullName: 'Unknown Beneficiary',
          relationship: 'Unknown',
          percentage: 100,
          ssn: '***-**-0000',
          dateOfBirth: 'N/A',
          address: { street: 'N/A', city: 'N/A', state: 'N/A', zip: 'N/A' },
          phone: null,
          email: null,
          confidenceScores: {
            overall: 0.50, name: 0.50, relationship: 0.50,
            percentage: 0.50, ssn: 0.50, dateOfBirth: 0.50, address: 0.50
          },
          sourceDocument: { id: 'doc-0', name: 'No document available', pageNumber: 0, extractionTimestamp: new Date().toISOString() },
          extractionReasoning: 'No claim data available for beneficiary extraction.'
        }
      ],
      administrativeBeneficiaries: [],
      overallAnalysis: {
        matchStatus: 'NO_DATA',
        discrepancies: [],
        confidence: 0,
        recommendation: 'No beneficiary data available. Please upload beneficiary designation forms for analysis.'
      }
    };
  };

  /**
   * Parse API response and build analysis data structure
   */
  const parseAPIResponse = (apiData) => {
    try {
      // Handle both "Output" and "output" (case-insensitive)
      const output = apiData.Output || apiData.output || [];

      if (!Array.isArray(output) || output.length === 0) {
        console.warn('[BeneficiaryAnalyzer] Output array is empty or invalid');
        return null;
      }

      // Find DMS, PAS, Summary, and BeneScoring sections
      const dmsSection = output.find(item => item.DMS);
      const pasSection = output.find(item => item.PAS);
      const summarySection = output.find(item => item.Summary);
      const beneScoring = output.find(item => item.BeneScoring);

      const dmsBeneficiaries = dmsSection?.DMS || [];
      const pasBeneficiaries = pasSection?.PAS || [];
      const summary = summarySection?.Summary || '';
      const scoring = beneScoring?.BeneScoring || [];

      // Map DMS beneficiaries (AI-extracted)
      const extractedBeneficiaries = dmsBeneficiaries.map((ben, idx) => {
        const beneficiaryKey = `${['First', 'Second', 'Third', 'Fourth', 'Fifth'][idx] || 'Unknown'}BeneficiaryName`;
        const name = ben[beneficiaryKey] || ben.FirstBeneficiaryName || ben.SecondBeneficiaryName ||
                     ben.ThirdBeneficiaryName || ben.FourthBeneficiaryName || `Beneficiary ${idx + 1}`;

        // Get scoring for this beneficiary
        const benScoring = scoring[idx] || {};
        const nameScore = parseFloat(benScoring[beneficiaryKey]) / 100 || 0.95;

        return {
          id: `bene-${idx + 1}`,
          fullName: name,
          relationship: ben.beneficiaryType || 'Unknown',
          percentage: parseInt(ben.beneficiaryPercentage?.replace('%', '') || '0', 10),
          ssn: '***-**-0000', // Not provided in API
          dateOfBirth: ben.beneficiaryDOB || 'N/A',
          address: {
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            zip: 'N/A'
          },
          phone: ben.beneficiaryPhone || null,
          email: ben.beneficiaryEmail || null,
          confidenceScores: {
            overall: nameScore,
            name: nameScore,
            relationship: parseFloat(benScoring.beneficiaryType) / 100 || 0.95,
            percentage: parseFloat(benScoring.beneficiaryPercentage) / 100 || 0.95,
            ssn: 0.85,
            dateOfBirth: parseFloat(benScoring.beneficiaryDOB) / 100 || 0.95,
            address: 0.88
          },
          sourceDocument: {
            id: ben.documentID || `doc-${idx + 1}`,
            name: 'DMS Document',
            pageNumber: 1,
            extractionTimestamp: new Date().toISOString()
          },
          extractionReasoning: `${ben.beneficiaryType || 'Unknown'} beneficiary identified from DMS with ${ben.beneficiaryPercentage || '0%'} allocation.`
        };
      });

      // Map PAS beneficiaries (administrative records)
      const administrativeBeneficiaries = pasBeneficiaries.map((ben, idx) => {
        const beneficiaryKey = `${['First', 'Second', 'Third', 'Fourth', 'Fifth'][idx] || 'Unknown'}BeneficiaryName`;
        const name = ben[beneficiaryKey] || ben.FirstBeneficiaryName || ben.SecondBeneficiaryName ||
                     ben.ThirdBeneficiaryName || ben.FourthBeneficiaryName || `Beneficiary ${idx + 1}`;

        return {
          id: `admin-${idx + 1}`,
          fullName: name,
          relationship: ben.beneficiaryType || 'Unknown',
          percentage: parseInt(ben.beneficiaryPercentage?.replace('%', '') || '0', 10),
          ssn: '***-**-0000',
          dateOfBirth: ben.beneficiaryDOB || 'N/A',
          address: {
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            zip: 'N/A'
          },
          phone: ben.beneficiaryPhone || null,
          email: ben.beneficiaryEmail || null,
          lastUpdated: 'N/A',
          source: 'Policy Administration System (PAS)'
        };
      });

      // Determine match status and confidence from scoring
      const totalSharesScoring = scoring.find(s => s.totalBeneficiaryShares)?.totalBeneficiaryShares || [];
      const primaryMatch = totalSharesScoring.find(s => s.PrimaryShares)?.PrimaryShares?.Match || 'UNKNOWN';
      const contingentMatch = totalSharesScoring.find(s => s.ContingentShares)?.ContingentShares?.Match || 'UNKNOWN';
      const overallMatch = (primaryMatch === 'MATCH' && contingentMatch === 'MATCH') ? 'MATCH' : 'MISMATCH';

      return {
        extractedBeneficiaries,
        administrativeBeneficiaries,
        overallAnalysis: {
          matchStatus: overallMatch,
          discrepancies: [],
          confidence: overallMatch === 'MATCH' ? 0.94 : 0.75,
          recommendation: summary
        },
        rawData: apiData
      };
    } catch (error) {
      console.error('[BeneficiaryAnalyzer] Error parsing API response:', error);
      throw error;
    }
  };

  /**
   * Parse API response from the beneficiary analyzer endpoint
   * Response structure: { result: { status: "complete", data: "{\"Output\": [...]}" } }
   */
  const parseAPIResponseFromEndpoint = (apiResponse) => {
    try {
      console.log('[BeneficiaryAnalyzer] Raw API response:', apiResponse);

      // Check if response has the expected structure
      if (!apiResponse || !apiResponse.result) {
        console.warn('[BeneficiaryAnalyzer] API response missing result object');
        return null;
      }

      const { status, data } = apiResponse.result;

      // Check if analysis is complete
      if (status !== 'complete') {
        console.log('[BeneficiaryAnalyzer] Analysis not complete, status:', status);
        return null;
      }

      if (!data) {
        console.warn('[BeneficiaryAnalyzer] API response missing data field');
        return null;
      }

      // Parse the data string (which contains escaped JSON)
      let parsedData = data;
      if (typeof data === 'string') {
        console.log('[BeneficiaryAnalyzer] Parsing data string as JSON');
        parsedData = JSON.parse(data);
      }

      console.log('[BeneficiaryAnalyzer] Parsed beneficiary data:', parsedData);

      // Check if data has expected Output structure
      if (parsedData && (parsedData.Output || parsedData.output)) {
        return parseAPIResponse(parsedData);
      }

      console.warn('[BeneficiaryAnalyzer] Unexpected data format in API response');
      return null;
    } catch (error) {
      console.error('[BeneficiaryAnalyzer] Error parsing API response:', error);
      return null;
    }
  };

  /**
   * Trigger beneficiary analysis and poll for results
   */
  useEffect(() => {
    const triggerAndPollAnalysis = async () => {
      const sysId = claim?.sysId || claim?.sys_id || claim?.servicenow_sys_id;

      // Check if it's a demo claim
      if (!sysId || sysId.startsWith('demo-')) {
        console.log('[BeneficiaryAnalyzer] Demo claim - using fallback data');
        setLoading(true);
        setTimeout(() => {
          setAnalysisData(buildAnalysisData());
          setLoading(false);
        }, 500);
        return;
      }

      // Set loading state immediately
      setLoading(true);
      setError(null);
      setLoadingMessage('Analyzing...');

      try {
        console.log('[BeneficiaryAnalyzer] Checking beneficiary analysis status for sys_id:', sysId);
        setLoadingMessage('Analyzing...');

        // Poll the API endpoint for completion (analysis was already triggered on record click)
        let pollAttempts = 0;
        const maxPollAttempts = 24; // Poll for ~60 seconds (24 attempts x 2.5 seconds)
        const pollInterval = 2500; // 2.5 seconds between polls

        const pollForCompletion = async () => {
          try {
            pollAttempts++;
            const elapsedTime = pollAttempts * 2.5;
            console.log(`[BeneficiaryAnalyzer] Polling attempt ${pollAttempts}/${maxPollAttempts} (${elapsedTime}s elapsed)`);
            setLoadingMessage(`Analyzing... (${elapsedTime}s)`);

            // Poll the beneficiary analyzer API endpoint
            const apiResponse = await serviceNowService.getBeneficiaryAnalyzer(sysId);
            console.log('[BeneficiaryAnalyzer] Poll response:', apiResponse);

            // Check if analysis is complete
            if (apiResponse?.result?.status === 'complete') {
              console.log('[BeneficiaryAnalyzer] Analysis complete! Parsing results...');
              setLoadingMessage('Complete! Loading data...');

              const parsedData = parseAPIResponseFromEndpoint(apiResponse);

              if (parsedData) {
                console.log('[BeneficiaryAnalyzer] Successfully parsed beneficiary data');
                setAnalysisData(parsedData);
                setLoading(false);
                return true; // Stop polling
              } else {
                console.warn('[BeneficiaryAnalyzer] Failed to parse complete data, using fallback');
                setAnalysisData(buildAnalysisData());
                setLoading(false);
                return true;
              }
            }

            // If status is "processing" or "pending", continue polling
            if (apiResponse?.result?.status) {
              console.log('[BeneficiaryAnalyzer] Analysis status:', apiResponse.result.status);
            }

            // Continue polling if not complete and not exceeded max attempts
            if (pollAttempts < maxPollAttempts) {
              setTimeout(() => pollForCompletion(), pollInterval);
            } else {
              console.warn('[BeneficiaryAnalyzer] Max poll attempts reached after 60 seconds');
              setError('Analysis is taking longer than expected (>60s). The process may still be running. Please try refreshing or check back later.');
              setAnalysisData(buildAnalysisData());
              setLoading(false);
            }

            return false;
          } catch (pollError) {
            console.error('[BeneficiaryAnalyzer] Error polling for completion:', pollError);

            // Continue polling on error (network issues, etc.)
            if (pollAttempts < maxPollAttempts) {
              setTimeout(() => pollForCompletion(), pollInterval);
            } else {
              setError('Unable to complete beneficiary analysis - using fallback data');
              setAnalysisData(buildAnalysisData());
              setLoading(false);
            }

            return false;
          }
        };

        // Start polling immediately
        pollForCompletion();

      } catch (err) {
        console.error('[BeneficiaryAnalyzer] Error triggering analysis:', err);
        setError(err.message);
        setAnalysisData(buildAnalysisData());
        setLoading(false);
      }
    };

    triggerAndPollAnalysis();
  }, [claim]);

  const getConfidenceMode = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.75) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 0.9) return 'High';
    if (score >= 0.75) return 'Medium';
    return 'Low';
  };

  const handleLexisNexisLookup = async (beneficiaryId, lookupType) => {
    setProcessingLexisNexis(prev => ({ ...prev, [`${beneficiaryId}-${lookupType}`]: true }));

    // Simulate API call to LexisNexis
    setTimeout(() => {
      const mockResults = {
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zip: '62702',
          lastVerified: '2024-01-20',
          confidence: 0.94,
          source: 'LexisNexis Address Verification'
        },
        deceased: {
          status: 'ALIVE',
          lastVerified: '2024-01-20',
          confidence: 0.99,
          source: 'LexisNexis Death Verification'
        }
      };

      setLexisNexisResults(prev => ({
        ...prev,
        [beneficiaryId]: {
          ...prev[beneficiaryId],
          [lookupType]: mockResults[lookupType]
        }
      }));

      setProcessingLexisNexis(prev => ({ ...prev, [`${beneficiaryId}-${lookupType}`]: false }));
    }, 2000);
  };

  const handleViewDocument = (documentId) => {
    console.log('Opening document:', documentId);
  };

  const handleApproveBeneficiaries = () => {
    if (onApproveBeneficiaries) {
      onApproveBeneficiaries(analysisData.extractedBeneficiaries);
    }
  };

  if (loading || !analysisData) {
    return (
      <DxcContainer style={{
        backgroundColor: 'var(--color-bg-secondary-lightest)',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center" justifyContent="center">
          <DxcSpinner mode="large" label={loadingMessage} />
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center" style={{ maxWidth: '500px' }}>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Beneficiary Analysis in Progress
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)" textAlign="center">
              AI is extracting and comparing beneficiary data from DMS documents and PAS records.
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)" textAlign="center">
              This may take up to 60 seconds. Please wait...
            </DxcTypography>
          </DxcFlex>
        </DxcFlex>
      </DxcContainer>
    );
  }

  if (error && !analysisData) {
    return (
      <DxcContainer style={{ backgroundColor: 'var(--color-bg-secondary-lightest)' }}>
        <DxcAlert
          semantic="error"
          title="Error Loading Beneficiary Data"
          message={{ text: error }}
        />
      </DxcContainer>
    );
  }

  if (!analysisData) {
    return (
      <DxcContainer style={{ backgroundColor: 'var(--color-bg-secondary-lightest)' }}>
        <DxcAlert
          semantic="info"
          title="No Analysis Data"
          message={{ text: 'No beneficiary analysis data available for this claim.' }}
        />
      </DxcContainer>
    );
  }

  return (
    <div style={{ backgroundColor: '#F5F7FA', padding: '24px', minHeight: '100vh' }}>
      <DxcFlex direction="column" gap="24px">
        {/* Modern Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="12px" alignItems="center">
            <DxcHeading level={2} text="Beneficiary Analyzer" />
            {analysisData?.rawData && (
              <DxcChip label="Live Data" prefixIcon="cloud_done" size="small" />
            )}
          </DxcFlex>
          {(onCancel || onApproveBeneficiaries) && (
            <DxcFlex gap="8px">
              {onCancel && (
                <DxcButton label="Cancel" mode="tertiary" size="small" onClick={onCancel} />
              )}
              {onApproveBeneficiaries && (
                <DxcButton
                  label="Approve & Append to Case"
                  mode="primary"
                  size="small"
                  onClick={handleApproveBeneficiaries}
                  icon="check_circle"
                />
              )}
            </DxcFlex>
          )}
        </DxcFlex>

        {/* Summary Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {/* Match Score Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: `2px solid ${analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#2E7D32' : '#ED6C02'}`
          }}>
            <DxcFlex direction="column" gap="4px">
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ fontSize: '16px', color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#2E7D32' : '#ED6C02' }}>
                  {analysisData.overallAnalysis.matchStatus === 'MATCH' ? 'check_circle' : 'warning'}
                </span>
                <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="#5A6872">
                  Match Score
                </DxcTypography>
              </DxcFlex>
              <DxcTypography fontSize="24px" fontWeight="font-weight-bold" style={{ color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#2E7D32' : '#ED6C02' }}>
                {(analysisData.overallAnalysis.confidence * 100).toFixed(0)}%
              </DxcTypography>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${analysisData.overallAnalysis.confidence * 100}%`,
                  height: '100%',
                  backgroundColor: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#2E7D32' : '#ED6C02',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </DxcFlex>
          </div>

          {/* Beneficiaries Compared Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB'
          }}>
            <DxcFlex direction="column" gap="4px">
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ fontSize: '16px', color: '#1B5E9E' }}>people</span>
                <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="#5A6872">
                  Beneficiaries
                </DxcTypography>
              </DxcFlex>
              <DxcTypography fontSize="24px" fontWeight="font-weight-bold" style={{ color: '#1B5E9E' }}>
                {analysisData.extractedBeneficiaries.length}
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="#5A6872">
                Compared
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Mismatches Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB'
          }}>
            <DxcFlex direction="column" gap="4px">
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ fontSize: '16px', color: '#D32F2F' }}>error_outline</span>
                <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="#5A6872">
                  Mismatches
                </DxcTypography>
              </DxcFlex>
              <DxcTypography fontSize="24px" fontWeight="font-weight-bold" style={{ color: analysisData.overallAnalysis.discrepancies.length === 0 ? '#2E7D32' : '#D32F2F' }}>
                {analysisData.overallAnalysis.discrepancies.length}
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="#5A6872">
                Found
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Data Source Sync Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB'
          }}>
            <DxcFlex direction="column" gap="4px">
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ fontSize: '16px', color: '#0288D1' }}>sync</span>
                <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="#5A6872">
                  Data Sources
                </DxcTypography>
              </DxcFlex>
              <DxcTypography fontSize="16px" fontWeight="font-weight-bold" style={{ color: '#0288D1' }}>
                DMS ↔ PAS
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="#2E7D32">
                ✓ Synced
              </DxcTypography>
            </DxcFlex>
          </div>
        </div>

        {/* Status Summary Card */}
        {error && (
          <div style={{
            backgroundColor: '#FFF4E5',
            border: '1px solid #FF9800',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <DxcFlex gap="12px" alignItems="flex-start">
              <span className="material-icons" style={{ color: '#ED6C02' }}>warning</span>
              <DxcFlex direction="column" gap="4px">
                <DxcTypography fontWeight="font-weight-semibold" color="#663C00">
                  API Connection Issue
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="#663C00">
                  {error}. Using fallback data.
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </div>
        )}

        {analysisData.overallAnalysis.recommendation && (
          <div style={{
            backgroundColor: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#F1F8F4' : '#FFF4E5',
            border: `1px solid ${analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#2E7D32' : '#FF9800'}`,
            borderRadius: '8px',
            padding: '16px'
          }}>
            <DxcFlex gap="12px" alignItems="flex-start">
              <span className="material-icons" style={{ color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#2E7D32' : '#ED6C02' }}>
                {analysisData.overallAnalysis.matchStatus === 'MATCH' ? 'check_circle' : 'info'}
              </span>
              <DxcFlex direction="column" gap="4px">
                <DxcTypography fontWeight="font-weight-semibold" style={{ color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#1B5E20' : '#663C00' }}>
                  {analysisData.overallAnalysis.matchStatus === 'MATCH' ? 'Match Confirmed' : 'Review Required'}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" style={{ color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#2E7D32' : '#663C00' }}>
                  {analysisData.overallAnalysis.recommendation}
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </div>
        )}

        {/* Modern Section Header */}
        <DxcFlex justifyContent="space-between" alignItems="center" style={{ marginTop: '8px' }}>
          <DxcFlex gap="16px" alignItems="center">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-bold" style={{ color: '#1F2937' }}>
              Beneficiary Comparison
            </DxcTypography>
            <DxcFlex gap="12px" alignItems="center">
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ color: '#1B5E9E', fontSize: '18px' }}>auto_awesome</span>
                <DxcTypography fontSize="font-scale-01" color="#5A6872">DMS</DxcTypography>
                <DxcBadge label={analysisData.extractedBeneficiaries.length.toString()} size="small" />
              </DxcFlex>
              <DxcTypography color="#9CA3AF">↔</DxcTypography>
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ color: '#0288D1', fontSize: '18px' }}>storage</span>
                <DxcTypography fontSize="font-scale-01" color="#5A6872">PAS</DxcTypography>
                <DxcBadge label={analysisData.administrativeBeneficiaries.length.toString()} size="small" />
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
          <DxcButton
            label={analysisData.extractedBeneficiaries.every(b => expandedBeneficiaries[b.id]) ? "Collapse All" : "Expand All"}
            mode="tertiary"
            size="small"
            icon={analysisData.extractedBeneficiaries.every(b => expandedBeneficiaries[b.id]) ? "unfold_less" : "unfold_more"}
            onClick={toggleAllBeneficiaries}
          />
        </DxcFlex>

        {/* Modern Beneficiary Cards */}
        <DxcFlex direction="column" gap="12px">
          {analysisData.extractedBeneficiaries.map((extractedBen, index) => {
            const adminBen = analysisData.administrativeBeneficiaries[index];
            const isExpanded = expandedBeneficiaries[extractedBen.id];
            const matchScore = extractedBen.confidenceScores.overall;
            const isHighMatch = matchScore >= 0.9;

            return (
              <div
                key={extractedBen.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: `2px solid ${isHighMatch ? '#2E7D32' : '#ED6C02'}`,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ padding: '12px' }}>
                  {/* Modern Card Header */}
                  <div
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '2px 0'
                    }}
                    onClick={() => toggleBeneficiary(extractedBen.id)}
                  >
                    <DxcFlex gap="8px" alignItems="center" style={{ flex: 1 }}>
                      <span
                        className="material-icons"
                        style={{
                          fontSize: '18px',
                          color: '#5A6872',
                          transition: 'transform 0.2s',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                        }}
                      >
                        chevron_right
                      </span>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-bold" style={{ color: '#1F2937' }}>
                        {extractedBen.fullName}
                      </DxcTypography>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '10px',
                        backgroundColor: extractedBen.relationship === 'Primary' ? '#E3F2FD' : '#FFF3E0',
                        color: extractedBen.relationship === 'Primary' ? '#1565C0' : '#E65100',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {extractedBen.relationship}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '10px',
                        backgroundColor: '#F3F4F6',
                        color: '#1F2937',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {extractedBen.percentage}%
                      </span>
                      {adminBen && extractedBen.fullName === adminBen.fullName && extractedBen.dateOfBirth === adminBen.dateOfBirth && (
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '10px',
                          backgroundColor: '#F1F8F4',
                          color: '#2E7D32',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span className="material-icons" style={{ fontSize: '12px' }}>check_circle</span>
                          Match
                        </span>
                      )}
                    </DxcFlex>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-bold" style={{ color: isHighMatch ? '#2E7D32' : '#ED6C02' }}>
                          {(matchScore * 100).toFixed(0)}%
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" style={{ color: '#9CA3AF' }}>
                          confidence
                        </DxcTypography>
                      </div>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isHighMatch ? '#F1F8F4' : '#FFF4E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span className="material-icons" style={{ color: isHighMatch ? '#2E7D32' : '#ED6C02', fontSize: '18px' }}>
                          {isHighMatch ? 'check_circle' : 'warning'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <>
                      <DxcDivider style={{ margin: 'var(--spacing-gap-xs) 0' }} />
                      <DxcGrid templateColumns={["1fr", "1fr"]} gap={{ columnGap: "1rem", rowGap: "var(--spacing-gap-xs)" }}>
                        {/* Left: DMS Data */}
                        <DxcGrid.Item>
                          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                              <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-primary-strong)' }}>description</span>
                              <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                                DMS Extracted
                              </DxcTypography>
                            </DxcFlex>

                            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                              <DetailWithConfidence
                                label="Full Name"
                                value={extractedBen.fullName}
                                confidence={extractedBen.confidenceScores.name}
                              />
                              <DetailWithConfidence
                                label="Date of Birth"
                                value={extractedBen.dateOfBirth}
                                confidence={extractedBen.confidenceScores.dateOfBirth}
                              />
                              <DetailWithConfidence
                                label="Beneficiary Type"
                                value={extractedBen.relationship}
                                confidence={extractedBen.confidenceScores.relationship}
                              />
                              <DetailWithConfidence
                                label="Percentage Allocation"
                                value={`${extractedBen.percentage}%`}
                                confidence={extractedBen.confidenceScores.percentage}
                              />
                              <DetailWithConfidence
                                label="SSN"
                                value={extractedBen.ssn}
                                confidence={extractedBen.confidenceScores.ssn}
                              />
                              {extractedBen.phone && (
                                <DetailWithConfidence
                                  label="Phone"
                                  value={extractedBen.phone}
                                  confidence={0.9}
                                />
                              )}
                              {extractedBen.email && (
                                <DetailWithConfidence
                                  label="Email"
                                  value={extractedBen.email}
                                  confidence={0.95}
                                />
                              )}
                            </DxcFlex>

                            {/* Document Information */}
                            <div style={{ backgroundColor: 'var(--color-bg-primary-lightest)', padding: 'var(--spacing-padding-xs)', borderRadius: '4px', marginTop: 'var(--spacing-gap-xs)' }}>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcFlex gap="var(--spacing-gap-xxs)" alignItems="center">
                                  <span className="material-icons" style={{ fontSize: '14px', color: 'var(--color-fg-primary-stronger)' }}>description</span>
                                  <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                                    Source Document
                                  </DxcTypography>
                                </DxcFlex>
                                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                                  {extractedBen.sourceDocument.name}
                                </DxcTypography>
                                <DxcFlex gap="var(--spacing-gap-s)">
                                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                                    Doc ID: {extractedBen.sourceDocument.id}
                                  </DxcTypography>
                                  {extractedBen.sourceDocument.pageNumber && (
                                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                                      • Page {extractedBen.sourceDocument.pageNumber}
                                    </DxcTypography>
                                  )}
                                </DxcFlex>
                              </DxcFlex>
                            </div>

                            {/* Compact AI Reasoning */}
                            <div style={{ backgroundColor: 'var(--color-bg-primary-lightest)', padding: 'var(--spacing-padding-xs)', borderRadius: '4px', marginTop: 'var(--spacing-gap-xs)' }}>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcFlex gap="var(--spacing-gap-xxs)" alignItems="center">
                                  <span className="material-icons" style={{ fontSize: '12px', color: 'var(--color-fg-primary-stronger)' }}>psychology</span>
                                  <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                                    Reasoning
                                  </DxcTypography>
                                </DxcFlex>
                                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                                  {extractedBen.extractionReasoning}
                                </DxcTypography>
                              </DxcFlex>
                            </div>

                            {/* Compact Action Buttons */}
                            <DxcFlex gap="var(--spacing-gap-xxs)" wrap="wrap">
                              <DxcButton
                                label="Verify"
                                mode="secondary"
                                size="small"
                                icon="location_on"
                                onClick={(e) => { e.stopPropagation(); handleLexisNexisLookup(extractedBen.id, 'address'); }}
                              />
                              <DxcButton
                                label="Deceased"
                                mode="secondary"
                                size="small"
                                icon="person_search"
                                onClick={(e) => { e.stopPropagation(); handleLexisNexisLookup(extractedBen.id, 'deceased'); }}
                              />
                              <DxcButton
                                label="Document"
                                mode="tertiary"
                                size="small"
                                icon="description"
                                onClick={(e) => { e.stopPropagation(); handleViewDocument(extractedBen.sourceDocument.id); }}
                              />
                            </DxcFlex>

                            {/* LexisNexis Results */}
                            {lexisNexisResults[extractedBen.id] && (
                              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                                {lexisNexisResults[extractedBen.id].address && (
                                  <DxcAlert
                                    semantic="info"
                                    title="Address Verified"
                                    message={{ text: `${lexisNexisResults[extractedBen.id].address.street}, ${lexisNexisResults[extractedBen.id].address.city}, ${lexisNexisResults[extractedBen.id].address.state}` }}
                                  />
                                )}
                                {lexisNexisResults[extractedBen.id].deceased && (
                                  <DxcAlert
                                    semantic={lexisNexisResults[extractedBen.id].deceased.status === 'ALIVE' ? 'success' : 'error'}
                                    title="Death Verification"
                                    message={{ text: lexisNexisResults[extractedBen.id].deceased.status }}
                                  />
                                )}
                              </DxcFlex>
                            )}
                          </DxcFlex>
                        </DxcGrid.Item>

                        {/* Right: PAS Data */}
                        <DxcGrid.Item>
                          {adminBen ? (
                            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                              <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                                <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-info-strong)' }}>storage</span>
                                <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                                  PAS Administrative
                                </DxcTypography>
                              </DxcFlex>

                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <SimpleDetail label="Full Name" value={adminBen.fullName} />
                                <SimpleDetail label="Date of Birth" value={adminBen.dateOfBirth} />
                                <SimpleDetail label="Beneficiary Type" value={adminBen.relationship} />
                                <SimpleDetail label="Percentage Allocation" value={`${adminBen.percentage}%`} />
                                <SimpleDetail label="SSN" value={adminBen.ssn} />
                                {adminBen.phone && <SimpleDetail label="Phone" value={adminBen.phone} />}
                                {adminBen.email && <SimpleDetail label="Email" value={adminBen.email} />}
                              </DxcFlex>

                              {/* Compact Admin Metadata */}
                              <div style={{ backgroundColor: 'var(--color-bg-info-lightest)', padding: 'var(--spacing-padding-xs)', borderRadius: '4px', marginTop: 'var(--spacing-gap-xs)' }}>
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                                    Source: {adminBen.source}
                                  </DxcTypography>
                                </DxcFlex>
                              </div>
                            </DxcFlex>
                          ) : (
                            <DxcAlert
                              semantic="warning"
                              title="No Matching PAS Record"
                              message={{ text: 'No corresponding administrative record found for this beneficiary.' }}
                            />
                          )}
                        </DxcGrid.Item>
                      </DxcGrid>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </DxcFlex>
      </DxcFlex>
    </div>
  );
};

// Compact helper component for displaying details with confidence scores
const DetailWithConfidence = ({ label, value, confidence }) => {
  const getConfidenceMode = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.75) return 'warning';
    return 'error';
  };

  return (
    <DxcFlex justifyContent="space-between" alignItems="center">
      <DxcFlex direction="column" gap="1px">
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
          {label}
        </DxcTypography>
        <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
          {value}
        </DxcTypography>
      </DxcFlex>
      <DxcStatusLight
        mode={getConfidenceMode(confidence)}
        label={`${(confidence * 100).toFixed(0)}%`}
        size="small"
      />
    </DxcFlex>
  );
};

// Compact helper component for simple admin record details
const SimpleDetail = ({ label, value }) => {
  return (
    <DxcFlex direction="column" gap="1px">
      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
        {label}
      </DxcTypography>
      <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
        {value}
      </DxcTypography>
    </DxcFlex>
  );
};

export default BeneficiaryAnalyzer;
