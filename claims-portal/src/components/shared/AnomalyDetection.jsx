import { useState } from 'react';
import {
  DxcContainer,
  DxcFlex,
  DxcHeading,
  DxcTypography,
  DxcAlert,
  DxcInset,
  DxcButton
} from '@dxc-technology/halstack-react';

/**
 * AnomalyDetection Component
 * Displays payment anomaly detection results from ServiceNow API
 * Shows analysis findings, risk assessment, and recommended actions with collapsible sections
 */
const AnomalyDetection = ({ anomalyData, onClose }) => {
  const [expandedFindings, setExpandedFindings] = useState({});
  const [expandedActions, setExpandedActions] = useState({});

  console.log('[AnomalyDetection] Component mounted with data:', anomalyData);
  console.log('[AnomalyDetection] Has AgenticSummary:', !!anomalyData?.AgenticSummary);

  if (!anomalyData || !anomalyData.AgenticSummary) {
    console.log('[AnomalyDetection] No valid anomaly data - showing alert');
    console.log('[AnomalyDetection] anomalyData:', anomalyData);
    return (
      <DxcContainer padding="var(--spacing-padding-m)">
        <DxcAlert type="info" inlineText="No anomaly data available." />
        <DxcTypography fontSize="font-scale-02" style={{ marginTop: '12px' }}>
          Check console for data structure details.
        </DxcTypography>
      </DxcContainer>
    );
  }

  const summary = anomalyData.AgenticSummary;
  const overallStatus = summary.Overall_Status;
  const findings = summary.Analysis_Findings || [];
  const actionsRequired = summary.Actions_Required || [];
  const riskAssessment = summary.Risk_Assessment || [];

  console.log('[AnomalyDetection] Parsed data:', {
    overallStatus,
    findingsCount: findings.length,
    actionsCount: actionsRequired.length,
    riskCount: riskAssessment.length
  });

  // Toggle expand/collapse state for finding details (Evidence and Recommendations)
  const toggleFinding = (id) => {
    setExpandedFindings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle expand/collapse state for action items
  const toggleAction = (index) => {
    setExpandedActions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Count findings by severity
  const criticalCount = findings.filter(f => f.Severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.Severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.Severity === 'MEDIUM').length;
  const totalAlerts = findings.filter(f => f.Status === 'FAIL').length;

  // Get severity color - returns appropriate color based on severity level (CRITICAL/HIGH=red, MEDIUM=orange, LOW=blue)
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'var(--color-fg-error-medium)';
      case 'HIGH':
        return 'var(--color-fg-error-medium)';
      case 'MEDIUM':
        return 'var(--color-fg-warning-medium)';
      case 'LOW':
        return 'var(--color-fg-info-medium)';
      default:
        return 'var(--color-fg-neutral-dark)';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'var(--color-fg-error-medium)';
      case 'CRITICAL':
        return 'var(--color-fg-error-medium)';
      case 'HIGH':
        return 'var(--color-fg-error-medium)';
      case 'MEDIUM':
        return 'var(--color-fg-warning-medium)';
      case 'LOW':
        return 'var(--color-fg-info-medium)';
      default:
        return 'var(--color-fg-info-medium)';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'FAIL':
        return 'var(--color-fg-error-medium)';
      case 'PASS':
        return 'var(--color-fg-success-medium)';
      default:
        return 'var(--color-fg-neutral-dark)';
    }
  };

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      {/* Header with Status */}
      <DxcContainer
        padding="var(--spacing-padding-s)"
        style={{
          backgroundColor: overallStatus === 'PASS'
            ? 'var(--color-bg-success-lighter)'
            : 'var(--color-bg-error-lighter)'
        }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
              <DxcHeading level={3} text="Payment Anomaly Detection" />
              <DxcTypography
                fontSize="font-scale-03"
                fontWeight="font-weight-semibold"
                color="var(--color-fg-error-medium)"
              >
                {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
              </DxcTypography>
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-s)">
              {overallStatus === 'PASS' ? (
                <span style={{ fontSize: '32px', color: 'var(--color-fg-success-medium)' }}>✓</span>
              ) : (
                <span style={{ fontSize: '32px', color: 'var(--color-fg-error-medium)' }}>⚠</span>
              )}
            </DxcFlex>
          </DxcFlex>

          <DxcTypography
            fontSize="font-scale-03"
            fontWeight="font-weight-semibold"
            color={overallStatus === 'PASS' ? 'var(--color-fg-success-medium)' : 'var(--color-fg-error-medium)'}
          >
            {overallStatus === 'PASS'
              ? 'No anomalies detected'
              : `${totalAlerts} anomal${totalAlerts !== 1 ? 'ies' : 'y'} detected`}
          </DxcTypography>

          {overallStatus === 'PASS' ? (
            <DxcTypography fontSize="font-scale-02">
              All AI verification checks passed successfully.
            </DxcTypography>
          ) : (
            <DxcTypography fontSize="font-scale-02">
              {summary.Processing_Recommendation}
            </DxcTypography>
          )}
        </DxcFlex>
      </DxcContainer>

      {/* Policy and Claim Info */}
      {summary.General_Information && (
        <DxcContainer
          padding="var(--spacing-padding-s)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
        >
          <DxcFlex gap="var(--spacing-gap-xl)">
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                POLICY NUMBER
              </DxcTypography>
              <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">
                {summary.General_Information.Policy_Number}
              </DxcTypography>
            </DxcFlex>
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                CLAIM NUMBER
              </DxcTypography>
              <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">
                {summary.General_Information.Claim_Number}
              </DxcTypography>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>
      )}

      {/* Analysis Findings */}
      {findings.length > 0 && (
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcHeading level={4} text="Analysis Findings" />
          {findings.map((finding, index) => {
            const isExpanded = expandedFindings[finding.Finding_ID];
            return (
              <DxcContainer
                key={index}
                padding="var(--spacing-padding-s)"
                style={{
                  backgroundColor: finding.Status === 'FAIL'
                    ? 'var(--color-bg-error-lightest)'
                    : 'var(--color-bg-success-lightest)',
                  borderRadius: '8px'
                }}
                border={{
                  color: finding.Status === 'FAIL'
                    ? 'var(--border-color-error-lighter)'
                    : 'var(--border-color-success-lighter)',
                  style: 'solid',
                  width: '1px'
                }}
              >
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcFlex justifyContent="space-between" alignItems="flex-start">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" style={{ flex: 1 }}>
                      <DxcFlex gap="var(--spacing-gap-s)" alignItems="center" wrap="wrap">
                        <DxcFlex gap="4px" alignItems="center">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                            Business Rule ID:
                          </DxcTypography>
                          <DxcTypography
                            fontSize="font-scale-03"
                            fontWeight="font-weight-semibold"
                            color={getSeverityColor(finding.Severity)}
                          >
                            {finding.Finding_ID}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex gap="4px" alignItems="center">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                            Severity:
                          </DxcTypography>
                          <DxcTypography
                            fontSize="font-scale-03"
                            fontWeight="font-weight-semibold"
                            color={getSeverityColor(finding.Severity)}
                          >
                            {finding.Severity}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex gap="4px" alignItems="center">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                            Risk Type:
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                            {finding.Risk_Type}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex gap="4px" alignItems="center">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                            Status:
                          </DxcTypography>
                          <DxcTypography
                            fontSize="font-scale-03"
                            fontWeight="font-weight-semibold"
                            color={getStatusColor(finding.Status)}
                          >
                            {finding.Status}
                          </DxcTypography>
                        </DxcFlex>
                      </DxcFlex>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                        {finding.Title}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcButton
                      label={isExpanded ? "Show Less" : "View More"}
                      mode="text"
                      size="small"
                      icon={isExpanded ? "expand_less" : "expand_more"}
                      onClick={() => toggleFinding(finding.Finding_ID)}
                    />
                  </DxcFlex>

                  {isExpanded && (
                    <>
                      {finding.Evidence && finding.Evidence.length > 0 && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color-neutral-light)' }}>
                          <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                            Evidence:
                          </DxcTypography>
                          {finding.Evidence.map((evidence, evidenceIndex) => (
                            <DxcTypography key={evidenceIndex} fontSize="font-scale-02" style={{ paddingLeft: '16px' }}>
                              • {evidence}
                            </DxcTypography>
                          ))}
                        </DxcFlex>
                      )}

                      {finding.Recommendation && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color-neutral-light)' }}>
                          <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                            Recommendation:
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-02" style={{ paddingLeft: '16px' }}>
                            {finding.Recommendation}
                          </DxcTypography>
                        </DxcFlex>
                      )}
                    </>
                  )}
                </DxcFlex>
              </DxcContainer>
            );
          })}
        </DxcFlex>
      )}

      {/* Actions Required */}
      {actionsRequired.length > 0 && (
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcHeading level={4} text="Actions Required" />
          {actionsRequired.map((action, index) => (
            <DxcContainer
              key={index}
              padding="var(--spacing-padding-s)"
              style={{ backgroundColor: 'var(--color-bg-warning-lightest)' }}
              border={{
                color: 'var(--border-color-warning-lighter)',
                style: 'solid',
                width: '1px'
              }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ flex: 1 }}>
                    {action.Finding_ID && (
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Related to: {action.Finding_ID}
                      </DxcTypography>
                    )}
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                      {action.Action}
                    </DxcTypography>
                  </DxcFlex>
                  <DxcFlex gap="4px" alignItems="center">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                      Priority:
                    </DxcTypography>
                    <DxcTypography
                      fontSize="font-scale-03"
                      fontWeight="font-weight-semibold"
                      color={getPriorityColor(action.Priority)}
                    >
                      {action.Priority}
                    </DxcTypography>
                  </DxcFlex>
                </DxcFlex>
                {action.Reason && (
                  <DxcTypography fontSize="font-scale-02">
                    {action.Reason}
                  </DxcTypography>
                )}
              </DxcFlex>
            </DxcContainer>
          ))}
        </DxcFlex>
      )}

      {/* Risk Assessment */}
      {riskAssessment.length > 0 && (
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcHeading level={4} text="Risk Assessment" />
          <DxcContainer
            padding="var(--spacing-padding-s)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              {riskAssessment.map((risk, index) => (
                <DxcFlex key={index} gap="var(--spacing-gap-m)" alignItems="center" justifyContent="space-between">
                  <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" style={{ minWidth: '120px' }}>
                      {risk.Risk_Category || risk.Category}:
                    </DxcTypography>
                    <DxcTypography
                      fontSize="font-scale-03"
                      fontWeight="font-weight-semibold"
                      color={getSeverityColor(risk.Severity_Level || risk.Level)}
                    >
                      {risk.Severity_Level || risk.Level}
                    </DxcTypography>
                  </DxcFlex>
                  {risk.Count !== undefined && (
                    <DxcTypography
                      fontSize="font-scale-03"
                      fontWeight="font-weight-semibold"
                      color={getSeverityColor(risk.Severity_Level || risk.Level)}
                    >
                      ({risk.Count} issue{risk.Count !== 1 ? 's' : ''})
                    </DxcTypography>
                  )}
                </DxcFlex>
              ))}
            </DxcFlex>
          </DxcContainer>
        </DxcFlex>
      )}

      {/* Summary Recommendation */}
      {summary.Summary_Recommendation && (
        <DxcContainer
          padding="var(--spacing-padding-s)"
          style={{
            backgroundColor: summary.Summary_Recommendation.Decision === 'STOP_AND_REVIEW'
              ? 'var(--color-bg-error-lightest)'
              : 'var(--color-bg-success-lightest)'
          }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                Decision:
              </DxcTypography>
              <DxcTypography
                fontSize="font-scale-03"
                fontWeight="font-weight-semibold"
                color={summary.Summary_Recommendation.Decision === 'STOP_AND_REVIEW'
                  ? 'var(--color-fg-error-medium)'
                  : 'var(--color-fg-success-medium)'}
              >
                {summary.Summary_Recommendation.Decision.replace(/_/g, ' ')}
              </DxcTypography>
            </DxcFlex>
            {summary.Summary_Recommendation.Rationale && (
              <DxcTypography fontSize="font-scale-02">
                {summary.Summary_Recommendation.Rationale}
              </DxcTypography>
            )}
          </DxcFlex>
        </DxcContainer>
      )}
    </DxcFlex>
  );
};

export default AnomalyDetection;
