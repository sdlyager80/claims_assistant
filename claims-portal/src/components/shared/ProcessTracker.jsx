/**
 * Process Tracker Component - Pizza Tracker Style
 * Shows claim lifecycle stages with visual progress
 */

import { DxcFlex, DxcTypography } from '@dxc-technology/halstack-react';
import { ClaimStatus } from '../../types/claim.types';

const ProcessTracker = ({ claim }) => {
  // Define claim lifecycle stages
  const stages = [
    { key: 'submitted', label: 'Submitted', icon: '📋', statuses: [ClaimStatus.NEW, ClaimStatus.SUBMITTED] },
    { key: 'review', label: 'Review', icon: '🔍', statuses: [ClaimStatus.IN_REVIEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.PENDING_REQUIREMENTS] },
    { key: 'verification', label: 'Verification', icon: '✓', statuses: [ClaimStatus.REQUIREMENTS_COMPLETE] },
    { key: 'approved', label: 'Approved', icon: '✅', statuses: [ClaimStatus.APPROVED, ClaimStatus.IN_APPROVAL] },
    { key: 'payment', label: 'Payment', icon: '💰', statuses: [ClaimStatus.PAYMENT_SCHEDULED] },
    { key: 'completed', label: 'Completed', icon: '🎉', statuses: [ClaimStatus.CLOSED] }
  ];

  // Determine current stage
  const currentStageIndex = stages.findIndex(stage =>
    stage.statuses.includes(claim.status)
  );

  const isStageComplete = (index) => index < currentStageIndex;
  const isCurrentStage = (index) => index === currentStageIndex;
  const isFutureStage = (index) => index > currentStageIndex;

  // Special handling for denied/suspended claims
  const isDenied = claim.status === ClaimStatus.DENIED || claim.status === ClaimStatus.SUSPENDED;

  return (
    <div style={{ padding: 'var(--spacing-padding-l)', backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: 'var(--border-radius-l)' }}>
      {/* Header */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center" style={{ marginBottom: 'var(--spacing-margin-l)' }}>
        <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
          Claim Lifecycle Progress
        </DxcTypography>
        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-strong)">
          Track your claim from submission to completion
        </DxcTypography>
      </DxcFlex>

      {/* Progress Bar */}
      <div style={{ position: 'relative', padding: '40px 0' }}>
        {/* Connecting Line */}
        <div style={{
          position: 'absolute',
          top: '65px',
          left: '5%',
          right: '5%',
          height: '4px',
          backgroundColor: 'var(--color-bg-neutral-light)',
          zIndex: 0
        }}>
          {/* Progress Line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: isDenied ? '50%' : `${(currentStageIndex / (stages.length - 1)) * 100}%`,
            backgroundColor: isDenied ? '#d02e2e' : '#1b75bb',
            transition: 'width 0.5s ease',
            zIndex: 1
          }} />
        </div>

        {/* Stage Nodes */}
        <DxcFlex justifyContent="space-between" style={{ position: 'relative', zIndex: 2 }}>
          {stages.map((stage, index) => {
            const isComplete = isStageComplete(index);
            const isCurrent = isCurrentStage(index);
            const isFuture = isFutureStage(index);

            return (
              <DxcFlex
                key={stage.key}
                direction="column"
                alignItems="center"
                gap="var(--spacing-gap-xs)"
                style={{ flex: 1, maxWidth: '150px' }}
              >
                {/* Node Circle */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: isComplete ? '#37a526' : isCurrent ? '#1b75bb' : 'var(--color-bg-neutral-lighter)',
                  border: isCurrent ? '4px solid #1b75bb' : '2px solid var(--color-border-neutral-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? '0 4px 12px rgba(27, 117, 187, 0.3)' : 'none',
                  animation: isCurrent ? 'pulse 2s infinite' : 'none',
                  position: 'relative'
                }}>
                  {isComplete && (
                    <span style={{ color: 'white', fontSize: '28px' }}>✓</span>
                  )}
                  {isCurrent && (
                    <span style={{ fontSize: '24px' }}>{stage.icon}</span>
                  )}
                  {isFuture && (
                    <span style={{ fontSize: '24px', opacity: 0.4 }}>{stage.icon}</span>
                  )}

                  {/* Pulse animation ring for current stage */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '3px solid #1b75bb',
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }} />
                  )}
                </div>

                {/* Stage Label */}
                <DxcTypography
                  fontSize="font-scale-01"
                  fontWeight={isCurrent ? 'font-weight-semibold' : 'font-weight-regular'}
                  color={isComplete || isCurrent ? 'var(--color-fg-neutral-stronger)' : 'var(--color-fg-neutral-medium)'}
                  textAlign="center"
                >
                  {stage.label}
                </DxcTypography>

                {/* Estimated time or status */}
                {isCurrent && (
                  <div style={{
                    padding: '4px 12px',
                    backgroundColor: '#1b75bb',
                    borderRadius: 'var(--border-radius-m)',
                    marginTop: '4px'
                  }}>
                    <DxcTypography fontSize="10px" fontWeight="font-weight-semibold" color="white">
                      IN PROGRESS
                    </DxcTypography>
                  </div>
                )}

                {isComplete && (
                  <DxcTypography fontSize="10px" color="#37a526" fontWeight="font-weight-medium">
                    COMPLETED
                  </DxcTypography>
                )}
              </DxcFlex>
            );
          })}
        </DxcFlex>
      </div>

      {/* Current Status Message */}
      <div style={{
        marginTop: 'var(--spacing-margin-l)',
        padding: 'var(--spacing-padding-m)',
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius-m)',
        border: '1px solid var(--color-border-neutral-lighter)'
      }}>
        <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            ℹ️
          </div>
          <div style={{ flex: 1 }}>
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
              Current Status
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
              {getStatusMessage(claim)}
            </DxcTypography>
          </div>
        </DxcFlex>
      </div>

      {/* Keyframes for animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          @keyframes ping {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            75%, 100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

// Helper function to get status message
const getStatusMessage = (claim) => {
  switch (claim.status) {
    case ClaimStatus.NEW:
    case ClaimStatus.SUBMITTED:
      return 'Your claim has been received and is being processed. Initial verification is underway.';
    case ClaimStatus.IN_REVIEW:
    case ClaimStatus.UNDER_REVIEW:
      return 'Our team is currently reviewing your claim and verifying all submitted documentation.';
    case ClaimStatus.PENDING_REQUIREMENTS:
      return 'Additional documentation is needed. Please review the requirements section for details.';
    case ClaimStatus.REQUIREMENTS_COMPLETE:
      return 'All requirements have been satisfied. Final verification is in progress.';
    case ClaimStatus.APPROVED:
    case ClaimStatus.IN_APPROVAL:
      return 'Your claim has been approved! Payment processing will begin shortly.';
    case ClaimStatus.PAYMENT_SCHEDULED:
      return 'Payment has been scheduled and will be processed according to your selected payment method.';
    case ClaimStatus.CLOSED:
      return 'Your claim has been completed and payment has been issued.';
    case ClaimStatus.DENIED:
      return 'This claim has been denied. Please review the decision letter for details.';
    case ClaimStatus.SUSPENDED:
      return 'This claim has been temporarily suspended. Please contact your claims examiner for details.';
    default:
      return 'Your claim is being processed.';
  }
};

export default ProcessTracker;
