import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcAlert,
  DxcChip,
  DxcButton,
  DxcInset,
  DxcDivider
} from '@dxc-technology/halstack-react';
import './AIInsightsPanel.css';

/**
 * SA-012: AI Insights Panel
 *
 * Displays AI-powered insights including:
 * - Anomaly alerts
 * - Verification confidence scores
 * - Risk indicators
 * - Fraud detection alerts
 * - Pattern matching results
 *
 * New functionality not present in cmA
 */
const AIInsightsPanel = ({ claimData, insights = [], onViewDetail, onDismiss }) => {
  const getSeverityType = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'info';
    }
  };

  const getSeverityColor = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'var(--color-status-error-darker)';
      case 'MEDIUM':
        return 'var(--color-status-warning-darker)';
      case 'LOW':
        return 'var(--color-status-info-darker)';
      default:
        return 'var(--color-fg-neutral-strong)';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 75) return 'var(--color-status-error-darker)';
    if (score >= 50) return 'var(--color-status-warning-darker)';
    return 'var(--color-status-success-darker)';
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    return 'Low Risk';
  };

  const getConfidencePillStyle = (confidence) => {
    if (confidence >= 90) return { bg: 'var(--color-bg-success-lightest)', color: 'var(--color-fg-success-darker)', border: '1px solid var(--color-border-success-medium)' };
    if (confidence >= 70) return { bg: 'var(--color-bg-warning-lightest)', color: 'var(--color-fg-warning-darker)', border: '1px solid var(--color-border-warning-medium)' };
    return { bg: 'var(--color-bg-error-lightest)', color: 'var(--color-fg-error-darker)', border: '1px solid var(--color-border-error-medium)' };
  };

  const pillStyle = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    backgroundColor: bg, color, border,
    borderRadius: '12px', padding: '2px 10px',
    fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0
  });

  const highAlerts = insights.filter(i => ['HIGH', 'CRITICAL'].includes((i.severity || '').toUpperCase()));
  const mediumAlerts = insights.filter(i => (i.severity || '').toUpperCase() === 'MEDIUM');
  const lowAlerts = insights.filter(i => (i.severity || '').toUpperCase() === 'LOW');

  const overallRiskScore = claimData?.riskScore || 0;

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '20px' }}>
              psychology
            </span>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              AI Insights
            </DxcTypography>
          </DxcFlex>
          <DxcChip
            label={`${insights.length} ${insights.length === 1 ? 'Alert' : 'Alerts'}`}
            icon="notification_important"
            size="small"
          />
        </DxcFlex>

        {/* Overall Risk Score */}
        {overallRiskScore > 0 && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{
              backgroundColor: overallRiskScore >= 75 ? 'var(--color-bg-error-lightest)' : overallRiskScore >= 50 ? 'var(--color-bg-warning-lightest)' : 'var(--color-bg-success-lightest)'
            }}
          >
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Overall Risk Assessment
                </DxcTypography>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  {getRiskLevel(overallRiskScore)}
                </DxcTypography>
              </DxcFlex>
              <DxcFlex direction="column" alignItems="flex-end" gap="var(--spacing-gap-xs)">
                <DxcTypography
                  fontSize="font-scale-05"
                  fontWeight="font-weight-semibold"
                  style={{ color: getRiskScoreColor(overallRiskScore) }}
                >
                  {overallRiskScore}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Risk Score
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Alert Summary — only show when there are high or medium priority alerts */}
        {(highAlerts.length > 0 || mediumAlerts.length > 0) && (
          <DxcFlex gap="var(--spacing-gap-m)">
            <DxcContainer
              padding="var(--spacing-padding-s)"
              style={{ backgroundColor: 'var(--color-bg-error-lightest)', flex: 1 }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                  {highAlerts.length}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  High Priority
                </DxcTypography>
              </DxcFlex>
            </DxcContainer>
            <DxcContainer
              padding="var(--spacing-padding-s)"
              style={{ backgroundColor: 'var(--color-bg-warning-lightest)', flex: 1 }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                  {mediumAlerts.length}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Medium
                </DxcTypography>
              </DxcFlex>
            </DxcContainer>
            <DxcContainer
              padding="var(--spacing-padding-s)"
              style={{ backgroundColor: 'var(--color-bg-info-lightest)', flex: 1 }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-info-medium)">
                  {lowAlerts.length}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Low
                </DxcTypography>
              </DxcFlex>
            </DxcContainer>
          </DxcFlex>
        )}

        {/* Insights List */}
        {insights.length > 0 ? (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            {insights.map((insight, index) => {
              const isLow = (insight.severity || '').toUpperCase() === 'LOW';
              const severityColor = getSeverityColor(insight.severity);

              if (isLow) {
                // Compact card for LOW/informational insights
                return (
                  <div
                    key={insight.id || index}
                    style={{
                      borderLeft: `3px solid ${severityColor}`,
                      backgroundColor: 'var(--color-bg-neutral-lighter)',
                      padding: 'var(--spacing-padding-s)',
                      borderRadius: '0 4px 4px 0'
                    }}
                  >
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                      {/* Title + confidence */}
                      <DxcFlex justifyContent="space-between" alignItems="flex-start" gap="var(--spacing-gap-s)">
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <span className="material-icons" style={{ fontSize: '16px', color: severityColor, flexShrink: 0 }}>
                            check_circle
                          </span>
                          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                            {insight.title || insight.message}
                          </DxcTypography>
                        </DxcFlex>
                        {(() => {
                          const cp = getConfidencePillStyle(insight.confidence || 0);
                          return (
                            <span style={pillStyle(cp.bg, cp.color, cp.border)}>
                              {insight.confidence || 0}% confidence
                            </span>
                          );
                        })()}
                      </DxcFlex>
                      {/* Category + description */}
                      <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start" wrap="wrap">
                        <span style={pillStyle('var(--color-bg-info-lightest)', 'var(--color-fg-info-darker)', '1px solid var(--color-border-info-medium)')}>
                          <span className="material-icons" style={{ fontSize: '11px' }}>category</span>
                          {insight.category || 'General'}
                        </span>
                        {insight.description && (
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)" style={{ flex: 1 }}>
                            {insight.description}
                          </DxcTypography>
                        )}
                      </DxcFlex>
                      {/* Recommendation inline */}
                      {insight.recommendation && (
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="flex-start">
                          <span className="material-icons" style={{ fontSize: '14px', color: 'var(--color-fg-info-medium)', flexShrink: 0, marginTop: '2px' }}>
                            lightbulb
                          </span>
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            {insight.recommendation}
                          </DxcTypography>
                        </DxcFlex>
                      )}
                    </DxcFlex>
                  </div>
                );
              }

              // Full prominent treatment for HIGH / MEDIUM alerts
              return (
                <div key={insight.id || index}>
                  {index > 0 && <DxcDivider />}
                  <DxcAlert
                    type={getSeverityType(insight.severity)}
                    inlineText={insight.title || insight.message}
                    onClose={onDismiss ? () => onDismiss(insight) : undefined}
                  />
                  <DxcInset>
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                        <DxcChip
                          label={insight.category || 'General'}
                          icon="category"
                          size="small"
                        />
                        <DxcChip
                          label={`Confidence: ${insight.confidence || 0}%`}
                          size="small"
                        />
                        {insight.timestamp && (
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Detected: {new Date(insight.timestamp).toLocaleString()}
                          </DxcTypography>
                        )}
                      </DxcFlex>
                      {insight.description && (
                        <DxcTypography fontSize="font-scale-01">
                          {insight.description}
                        </DxcTypography>
                      )}
                      {insight.recommendation && (
                        <DxcContainer
                          padding="var(--spacing-padding-s)"
                          style={{ backgroundColor: 'var(--color-bg-info-lighter)' }}
                        >
                          <DxcFlex gap="var(--spacing-gap-xs)">
                            <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-info-medium)' }}>
                              lightbulb
                            </span>
                            <DxcTypography fontSize="font-scale-01">
                              <strong>Recommendation:</strong> {insight.recommendation}
                            </DxcTypography>
                          </DxcFlex>
                        </DxcContainer>
                      )}
                      {onViewDetail && (
                        <DxcFlex>
                          <DxcButton
                            label="View Details"
                            mode="tertiary"
                            size="small"
                            icon="visibility"
                            onClick={() => onViewDetail(insight)}
                          />
                        </DxcFlex>
                      )}
                    </DxcFlex>
                  </DxcInset>
                </div>
              );
            })}
          </DxcFlex>
        ) : (
          <DxcContainer
            padding="var(--spacing-padding-l)"
            style={{ backgroundColor: 'var(--color-bg-success-lightest)', textAlign: 'center' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-success-medium)' }}>
                check_circle
              </span>
              <DxcTypography color="var(--color-fg-success-medium)" fontWeight="font-weight-semibold">
                No anomalies detected
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                All AI verification checks passed successfully
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default AIInsightsPanel;
