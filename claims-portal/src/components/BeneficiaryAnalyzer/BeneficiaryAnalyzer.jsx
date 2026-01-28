import { useState } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcTable,
  DxcBadge,
  DxcAlert,
  DxcInset,
  DxcChip,
  DxcDivider,
  DxcSpinner
} from '@dxc-technology/halstack-react';
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
const BeneficiaryAnalyzer = ({ claimId, onApproveBeneficiaries, onCancel }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [lexisNexisResults, setLexisNexisResults] = useState({});
  const [processingLexisNexis, setProcessingLexisNexis] = useState({});

  // Mock data - replace with actual API call to Beneficiary Analyzer Agent
  const mockAnalysisData = {
    extractedBeneficiaries: [
      {
        id: 'bene-1',
        fullName: 'Sarah Johnson',
        relationship: 'Spouse',
        percentage: 50,
        ssn: '***-**-1234',
        dateOfBirth: '1985-03-15',
        address: {
          street: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: '(555) 123-4567',
        email: 'sarah.johnson@email.com',
        confidenceScores: {
          overall: 0.95,
          name: 0.98,
          relationship: 0.92,
          percentage: 0.99,
          ssn: 0.85,
          dateOfBirth: 0.96,
          address: 0.88
        },
        sourceDocument: {
          id: 'doc-123',
          name: 'Beneficiary_Designation_Form_2023.pdf',
          pageNumber: 1,
          extractionTimestamp: '2024-01-15T10:30:00Z'
        },
        extractionReasoning: 'Beneficiary identified from primary beneficiary section on page 1. Name extracted with high confidence from typed field. SSN partially masked for security. Relationship indicated as "Spouse" in relationship dropdown. Address extracted from mailing address section.'
      },
      {
        id: 'bene-2',
        fullName: 'Michael Johnson',
        relationship: 'Child',
        percentage: 25,
        ssn: '***-**-5678',
        dateOfBirth: '2010-07-22',
        address: {
          street: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: null,
        email: null,
        confidenceScores: {
          overall: 0.91,
          name: 0.95,
          relationship: 0.93,
          percentage: 0.99,
          ssn: 0.82,
          dateOfBirth: 0.94,
          address: 0.88
        },
        sourceDocument: {
          id: 'doc-123',
          name: 'Beneficiary_Designation_Form_2023.pdf',
          pageNumber: 1,
          extractionTimestamp: '2024-01-15T10:30:00Z'
        },
        extractionReasoning: 'Secondary beneficiary identified from contingent beneficiary section. Relationship marked as "Child". Same address as primary beneficiary suggests dependent child. No direct contact information provided for minor.'
      },
      {
        id: 'bene-3',
        fullName: 'Emily Johnson',
        relationship: 'Child',
        percentage: 25,
        ssn: '***-**-9012',
        dateOfBirth: '2012-11-08',
        address: {
          street: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: null,
        email: null,
        confidenceScores: {
          overall: 0.89,
          name: 0.94,
          relationship: 0.90,
          percentage: 0.99,
          ssn: 0.78,
          dateOfBirth: 0.92,
          address: 0.88
        },
        sourceDocument: {
          id: 'doc-123',
          name: 'Beneficiary_Designation_Form_2023.pdf',
          pageNumber: 2,
          extractionTimestamp: '2024-01-15T10:30:00Z'
        },
        extractionReasoning: 'Secondary beneficiary identified from contingent beneficiary section on page 2. SSN confidence lower due to handwritten entry with slight ambiguity in digits.'
      }
    ],
    administrativeBeneficiaries: [
      {
        id: 'admin-1',
        fullName: 'Sarah M. Johnson',
        relationship: 'Spouse',
        percentage: 50,
        ssn: '***-**-1234',
        dateOfBirth: '1985-03-15',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: '(555) 123-4567',
        email: 'sarah.johnson@email.com',
        lastUpdated: '2023-06-15',
        source: 'Policy Administration System'
      },
      {
        id: 'admin-2',
        fullName: 'Michael A. Johnson',
        relationship: 'Child',
        percentage: 25,
        ssn: '***-**-5678',
        dateOfBirth: '2010-07-22',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: null,
        email: null,
        lastUpdated: '2023-06-15',
        source: 'Policy Administration System'
      },
      {
        id: 'admin-3',
        fullName: 'Emily R. Johnson',
        relationship: 'Child',
        percentage: 25,
        ssn: '***-**-9012',
        dateOfBirth: '2012-11-08',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: null,
        email: null,
        lastUpdated: '2023-06-15',
        source: 'Policy Administration System'
      }
    ],
    overallAnalysis: {
      matchStatus: 'MATCH',
      discrepancies: [
        {
          field: 'name',
          beneficiaryId: 'bene-1',
          extracted: 'Sarah Johnson',
          administrative: 'Sarah M. Johnson',
          severity: 'LOW',
          recommendation: 'Minor variation in middle initial. Likely same person.'
        }
      ],
      confidence: 0.92,
      recommendation: 'Extracted beneficiaries match administrative records with high confidence. Minor name variations detected but do not indicate significant discrepancies.'
    }
  };

  // Simulate loading analysis data on mount
  useState(() => {
    const timer = setTimeout(() => {
      setAnalysisData(mockAnalysisData);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getConfidenceColor = (score) => {
    if (score >= 0.9) return 'var(--color-status-success-darker)';
    if (score >= 0.75) return 'var(--color-status-warning-darker)';
    return 'var(--color-status-error-darker)';
  };

  const getConfidenceBadgeType = (score) => {
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
    // Open document viewer
    console.log('Opening document:', documentId);
    // This would typically open a modal or side panel with the document viewer
  };

  const handleApproveBeneficiaries = () => {
    if (onApproveBeneficiaries) {
      onApproveBeneficiaries(analysisData.extractedBeneficiaries);
    }
  };

  if (!analysisData) {
    return (
      <DxcFlex justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
          <DxcSpinner mode="large" label="Analyzing beneficiary information..." />
        </DxcFlex>
      </DxcFlex>
    );
  }

  return (
    <DxcContainer style={{ backgroundColor: 'var(--color-bg-secondary-lightest)' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Header */}
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcHeading level={2} text="Beneficiary Analyzer" />
            <DxcFlex gap="var(--spacing-gap-s)">
              <DxcButton
                label="Cancel"
                mode="tertiary"
                onClick={onCancel}
              />
              <DxcButton
                label="Approve & Append to Case"
                mode="primary"
                onClick={handleApproveBeneficiaries}
                icon="check_circle"
              />
            </DxcFlex>
          </DxcFlex>
          <DxcTypography color="var(--color-fg-neutral-strong)">
            AI-powered beneficiary extraction and verification for Claim #{claimId}
          </DxcTypography>
        </DxcFlex>

        {/* Overall Analysis Summary */}
        <DxcContainer padding="var(--spacing-padding-l)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcHeading level={4} text="Analysis Summary" />
              <DxcChip
                label={`Overall Confidence: ${(analysisData.overallAnalysis.confidence * 100).toFixed(0)}%`}
                icon="psychology"
              />
            </DxcFlex>

            <DxcAlert
              type={analysisData.overallAnalysis.matchStatus === 'MATCH' ? 'success' : 'warning'}
              inlineText={analysisData.overallAnalysis.recommendation}
            />

            {analysisData.overallAnalysis.discrepancies.length > 0 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcTypography fontWeight="font-weight-semibold">
                  Discrepancies Detected ({analysisData.overallAnalysis.discrepancies.length})
                </DxcTypography>
                {analysisData.overallAnalysis.discrepancies.map((disc, idx) => (
                  <DxcAlert
                    key={idx}
                    type={disc.severity === 'LOW' ? 'info' : 'warning'}
                    inlineText={`${disc.field.toUpperCase()}: "${disc.extracted}" vs "${disc.administrative}" - ${disc.recommendation}`}
                  />
                ))}
              </DxcFlex>
            )}
          </DxcFlex>
        </DxcContainer>

        {/* Main Content Grid */}
        <div className="beneficiary-analyzer-grid">
          {/* Left Column: AI-Extracted Beneficiaries */}
          <DxcContainer padding="var(--spacing-padding-l)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcHeading level={4} text="AI-Extracted Beneficiaries" />
                <DxcChip
                  label={`${analysisData.extractedBeneficiaries.length} Found`}
                  icon="auto_awesome"
                />
              </DxcFlex>

              {analysisData.extractedBeneficiaries.map((beneficiary, index) => (
                <div key={beneficiary.id}>
                  {index > 0 && <DxcDivider />}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {/* Beneficiary Header */}
                    <DxcFlex justifyContent="space-between" alignItems="flex-start">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                          {beneficiary.fullName}
                        </DxcTypography>
                        <DxcFlex gap="var(--spacing-gap-xs)">
                          <DxcChip label={beneficiary.relationship} size="small" />
                          <DxcChip label={`${beneficiary.percentage}%`} size="small" />
                        </DxcFlex>
                      </DxcFlex>
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="flex-end">
                        <div style={{
                          padding: '4px 8px',
                          backgroundColor: getConfidenceColor(beneficiary.confidenceScores.overall),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {getConfidenceLabel(beneficiary.confidenceScores.overall)} ({(beneficiary.confidenceScores.overall * 100).toFixed(0)}%)
                        </div>
                      </DxcFlex>
                    </DxcFlex>

                    {/* Beneficiary Details with Confidence Scores */}
                    <div className="beneficiary-details-grid">
                      <DetailWithConfidence
                        label="SSN"
                        value={beneficiary.ssn}
                        confidence={beneficiary.confidenceScores.ssn}
                      />
                      <DetailWithConfidence
                        label="Date of Birth"
                        value={beneficiary.dateOfBirth}
                        confidence={beneficiary.confidenceScores.dateOfBirth}
                      />
                      <DetailWithConfidence
                        label="Address"
                        value={`${beneficiary.address.street}, ${beneficiary.address.city}, ${beneficiary.address.state} ${beneficiary.address.zip}`}
                        confidence={beneficiary.confidenceScores.address}
                      />
                      {beneficiary.phone && (
                        <DetailWithConfidence
                          label="Phone"
                          value={beneficiary.phone}
                          confidence={0.9}
                        />
                      )}
                      {beneficiary.email && (
                        <DetailWithConfidence
                          label="Email"
                          value={beneficiary.email}
                          confidence={0.95}
                        />
                      )}
                    </div>

                    {/* LexisNexis Actions */}
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <DxcButton
                        label={processingLexisNexis[`${beneficiary.id}-address`] ? "Verifying..." : "Verify Address"}
                        mode="secondary"
                        size="small"
                        icon={processingLexisNexis[`${beneficiary.id}-address`] ? undefined : "location_on"}
                        onClick={() => handleLexisNexisLookup(beneficiary.id, 'address')}
                        disabled={processingLexisNexis[`${beneficiary.id}-address`]}
                      />
                      <DxcButton
                        label={processingLexisNexis[`${beneficiary.id}-deceased`] ? "Checking..." : "Check Deceased Status"}
                        mode="secondary"
                        size="small"
                        icon={processingLexisNexis[`${beneficiary.id}-deceased`] ? undefined : "person_search"}
                        onClick={() => handleLexisNexisLookup(beneficiary.id, 'deceased')}
                        disabled={processingLexisNexis[`${beneficiary.id}-deceased`]}
                      />
                      <DxcButton
                        label="View Source Document"
                        mode="tertiary"
                        size="small"
                        icon="description"
                        onClick={() => handleViewDocument(beneficiary.sourceDocument.id)}
                      />
                    </DxcFlex>

                    {/* LexisNexis Results */}
                    {lexisNexisResults[beneficiary.id] && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        {lexisNexisResults[beneficiary.id].address && (
                          <DxcAlert
                            type="info"
                            inlineText={`LexisNexis Current Address: ${lexisNexisResults[beneficiary.id].address.street}, ${lexisNexisResults[beneficiary.id].address.city}, ${lexisNexisResults[beneficiary.id].address.state} ${lexisNexisResults[beneficiary.id].address.zip} (Verified: ${lexisNexisResults[beneficiary.id].address.lastVerified})`}
                          />
                        )}
                        {lexisNexisResults[beneficiary.id].deceased && (
                          <DxcAlert
                            type={lexisNexisResults[beneficiary.id].deceased.status === 'ALIVE' ? 'success' : 'error'}
                            inlineText={`LexisNexis Death Verification: ${lexisNexisResults[beneficiary.id].deceased.status} (Confidence: ${(lexisNexisResults[beneficiary.id].deceased.confidence * 100).toFixed(0)}%)`}
                          />
                        )}
                      </DxcFlex>
                    )}

                    {/* AI Reasoning */}
                    <DxcInset>
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-primary-stronger)' }}>
                            psychology
                          </span>
                          <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                            AI Extraction Reasoning
                          </DxcTypography>
                        </DxcFlex>
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                          {beneficiary.extractionReasoning}
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Source: {beneficiary.sourceDocument.name} (Page {beneficiary.sourceDocument.pageNumber})
                        </DxcTypography>
                      </DxcFlex>
                    </DxcInset>
                  </DxcFlex>
                </div>
              ))}
            </DxcFlex>
          </DxcContainer>

          {/* Right Column: Administrative Records Comparison */}
          <DxcContainer padding="var(--spacing-padding-l)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcHeading level={4} text="Administrative Records" />
                <DxcChip
                  label={`${analysisData.administrativeBeneficiaries.length} on File`}
                  icon="folder"
                />
              </DxcFlex>

              {analysisData.administrativeBeneficiaries.map((beneficiary, index) => (
                <div key={beneficiary.id}>
                  {index > 0 && <DxcDivider />}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {/* Beneficiary Header */}
                    <DxcFlex justifyContent="space-between" alignItems="flex-start">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                          {beneficiary.fullName}
                        </DxcTypography>
                        <DxcFlex gap="var(--spacing-gap-xs)">
                          <DxcChip label={beneficiary.relationship} size="small" />
                          <DxcChip label={`${beneficiary.percentage}%`} size="small" />
                        </DxcFlex>
                      </DxcFlex>
                    </DxcFlex>

                    {/* Administrative Details */}
                    <div className="beneficiary-details-grid">
                      <SimpleDetail label="SSN" value={beneficiary.ssn} />
                      <SimpleDetail label="Date of Birth" value={beneficiary.dateOfBirth} />
                      <SimpleDetail
                        label="Address"
                        value={`${beneficiary.address.street}, ${beneficiary.address.city}, ${beneficiary.address.state} ${beneficiary.address.zip}`}
                      />
                      {beneficiary.phone && (
                        <SimpleDetail label="Phone" value={beneficiary.phone} />
                      )}
                      {beneficiary.email && (
                        <SimpleDetail label="Email" value={beneficiary.email} />
                      )}
                    </div>

                    {/* Admin Record Metadata */}
                    <DxcInset>
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Source: {beneficiary.source}
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Last Updated: {beneficiary.lastUpdated}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcInset>
                  </DxcFlex>
                </div>
              ))}
            </DxcFlex>
          </DxcContainer>
        </div>
      </DxcFlex>
    </DxcContainer>
  );
};

// Helper component for displaying details with confidence scores
const DetailWithConfidence = ({ label, value, confidence }) => {
  const getConfidenceColor = (score) => {
    if (score >= 0.9) return 'var(--color-status-success-darker)';
    if (score >= 0.75) return 'var(--color-status-warning-darker)';
    return 'var(--color-status-error-darker)';
  };

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
      <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
        {label}
      </DxcTypography>
      <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
        <DxcTypography fontSize="font-scale-01">
          {value}
        </DxcTypography>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: getConfidenceColor(confidence)
        }} />
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
          {(confidence * 100).toFixed(0)}%
        </DxcTypography>
      </DxcFlex>
    </DxcFlex>
  );
};

// Helper component for simple admin record details
const SimpleDetail = ({ label, value }) => {
  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
      <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
        {label}
      </DxcTypography>
      <DxcTypography fontSize="font-scale-01">
        {value}
      </DxcTypography>
    </DxcFlex>
  );
};

export default BeneficiaryAnalyzer;
