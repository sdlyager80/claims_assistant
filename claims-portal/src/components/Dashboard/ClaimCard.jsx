/**
 * Claim Card Component
 * Displays individual claim information in card or grid layout
 */

import {
  DxcFlex,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcInset
} from '@dxc-technology/halstack-react';
import FastTrackBadge from '../shared/FastTrackBadge';
import SLAIndicator from '../shared/SLAIndicator';
import { RoutingType } from '../../types/claim.types';

const ClaimCard = ({ submission, isGridView, onSelect }) => {
  // Determine if this is a real claim or mock data
  const isClaim = submission.claimNumber !== undefined;
  const isServiceNow = submission.source === 'servicenow';
  const displayId = isClaim ? (submission.fnolNumber || submission.claimNumber) : submission.id;

  // Helper to get claimant/insured name (handles different data structures)
  const getClaimantName = (claim) => {
    if (claim.claimant?.name) return claim.claimant.name;
    if (claim.insured?.name) return claim.insured.name;
    if (claim.claimant?.firstName || claim.claimant?.lastName) {
      const first = claim.claimant?.firstName || '';
      const last = claim.claimant?.lastName || '';
      return `${first} ${last}`.trim();
    }
    if (claim.claimant?.businessName) return claim.claimant.businessName;
    return 'N/A';
  };

  // Helper to get claim type display label
  const getClaimTypeLabel = (type) => {
    const typeLabels = {
      // L&A Types
      'death': 'LOB: Life',
      'maturity': 'LOB: Annuity',
      'surrender': 'LOB: Annuity',
      'withdrawal': 'LOB: Annuity',
      'disability': 'LOB: Disability',
      // P&C Types
      'property_damage': 'LOB: Property',
      'commercial_property': 'LOB: Commercial Property',
      'homeowners': 'LOB: Homeowners',
      'auto_collision': 'LOB: Auto',
      'auto_comprehensive': 'LOB: Auto',
      'liability': 'LOB: Liability',
      'general_liability': 'LOB: General Liability',
      'workers_comp': 'LOB: Workers Comp'
    };
    return typeLabels[type] || `LOB: ${type}`;
  };

  // Helper to get status badge color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'approved' || statusLower === 'approved_payment') return 'success';
    if (statusLower === 'denied' || statusLower === 'declined') return 'error';
    if (statusLower === 'investigation' || statusLower === 'fraud_investigation') return 'error';
    if (statusLower === 'under_review' || statusLower === 'pending') return 'warning';
    if (statusLower === 'new' || statusLower === 'submitted') return 'info';
    if (statusLower === 'closed') return 'neutral';
    return 'neutral';
  };

  const displayName = isClaim ? getClaimantName(submission) : submission.name;
  const displayStatus = isClaim ? submission.status : submission.status;
  const displayType = isClaim ? getClaimTypeLabel(submission.type) : submission.type;
  const displaySubmitted = isClaim
    ? new Date(submission.createdAt).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      })
    : submission.submitted;
  const hasFastTrack = isClaim && submission.routing?.type === RoutingType.FASTTRACK;
  const isClosed = isClaim && (submission.status === 'closed' || submission.status === 'denied' || submission.status === 'approved');
  const hasSLA = isClaim && submission.workflow?.sla?.dueDate;

  return (
    <div
      role="article"
      tabIndex={0}
      aria-label={`Claim ${displayId} for ${displayName}, Status ${displayStatus}, Type ${displayType}, Submitted ${displaySubmitted}`}
      style={
        isGridView
          ? {
              backgroundColor: 'var(--color-bg-neutral-lighter)',
              flex: '1 1 calc(50% - var(--spacing-gap-m) / 2)',
              minWidth: '400px',
              cursor: 'pointer',
              borderRadius: 'var(--border-radius-m)',
              border: '1px solid var(--border-color-neutral-lighter)',
              padding: 'var(--spacing-padding-m)'
            }
          : {
              backgroundColor: 'var(--color-bg-neutral-lighter)',
              cursor: 'pointer',
              borderRadius: 'var(--border-radius-m)',
              border: '1px solid var(--border-color-neutral-lighter)',
              padding: 'var(--spacing-padding-m)'
            }
      }
      onClick={() => onSelect(submission)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(submission);
        }
      }}
    >
      <DxcInset space="var(--spacing-padding-m)">
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          {/* Header Row */}
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
              <DxcTypography
                fontSize="font-scale-03"
                fontWeight="font-weight-semibold"
                color="#000000"
              >
                {displayId}
              </DxcTypography>
              <DxcTypography fontSize="font-scale-03">{displayName}</DxcTypography>
              {hasFastTrack && <FastTrackBadge eligible={true} showLabel={true} size="small" />}
              {isServiceNow && <DxcBadge label="ServiceNow" mode="contextual" color="info" />}
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
              <DxcButton
                icon="check"
                mode="tertiary"
                title={`Approve claim ${displayId}`}
                aria-label={`Approve claim ${displayId} for ${displayName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  alert(
                    `Approve claim ${displayId}\n\nThis feature will trigger the approval workflow and route the claim for payment processing.`
                  );
                }}
              />
              <DxcButton
                icon="close"
                mode="tertiary"
                title={`Decline claim ${displayId}`}
                aria-label={`Decline claim ${displayId} for ${displayName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      `Decline claim ${displayId}?\n\nThis will trigger the denial workflow and notify the claimant. This action can be reversed by a supervisor.`
                    )
                  ) {
                    alert('Denial workflow would be initiated here.');
                  }
                }}
              />
            </DxcFlex>
          </DxcFlex>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--spacing-gap-s)',
              marginTop: 'var(--spacing-margin-xs)'
            }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="10px" color="var(--color-fg-neutral-stronger)">
                STATUS
              </DxcTypography>
              <DxcBadge label={displayStatus} mode="contextual" color={getStatusColor(displayStatus)} />
            </DxcFlex>
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="10px" color="var(--color-fg-neutral-stronger)">
                TYPE
              </DxcTypography>
              <DxcTypography fontSize="12px" fontWeight="font-weight-medium">
                {displayType}
              </DxcTypography>
            </DxcFlex>
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="10px" color="var(--color-fg-neutral-stronger)">
                SUBMITTED
              </DxcTypography>
              <DxcTypography fontSize="12px" fontWeight="font-weight-medium">
                {displaySubmitted}
              </DxcTypography>
            </DxcFlex>
            {hasSLA && !isClosed && (
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="10px" color="var(--color-fg-neutral-stronger)">
                  SLA
                </DxcTypography>
                <SLAIndicator sla={submission.workflow.sla} size="small" />
              </DxcFlex>
            )}
          </div>
        </DxcFlex>
      </DxcInset>
    </div>
  );
};

export default ClaimCard;
