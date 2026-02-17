/**
 * Claim Detail - Unified 360° View
 *
 * Comprehensive claim view that integrates all Phase 1-3 components:
 * - Claim header with FastTrack badge and SLA indicator
 * - Policy information
 * - Requirements tracker
 * - Document list
 * - Activity timeline
 * - Action buttons
 *
 * This is the main view for claim examiners to process claims.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcTabs,
  DxcInset,
  DxcSpinner,
  DxcProgressBar
} from '@dxc-technology/halstack-react';
import { useClaims } from '../../contexts/ClaimsContext';
import { usePolicy } from '../../contexts/PolicyContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useDocument } from '../../contexts/DocumentContext';
import FastTrackBadge from '../shared/FastTrackBadge';
import SLAIndicator from '../shared/SLAIndicator';
import RequirementsTracker from '../shared/RequirementsTracker';
import BeneficiaryAnalysisPanel from './BeneficiaryAnalysisPanel';
import { ClaimStatus, RoutingType } from '../../types/claim.types';

/**
 * Claim Header Section
 */
const ClaimHeader = ({ claim }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case ClaimStatus.NEW:
        return 'info';
      case ClaimStatus.UNDER_REVIEW:
        return 'warning';
      case ClaimStatus.APPROVED:
        return 'success';
      case ClaimStatus.DENIED:
        return 'error';
      case ClaimStatus.CLOSED:
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const isFastTrack = claim.routing?.type === RoutingType.FASTTRACK;

  return (
    <DxcContainer
      style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
      padding="var(--spacing-padding-l)"
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Claim Number and Status */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
            <DxcHeading level={2} text={`Claim ${claim.claimNumber || claim.id}`} />
            {isFastTrack && (
              <FastTrackBadge
                eligible={true}
                showLabel={true}
                size="medium"
              />
            )}
          </DxcFlex>
          <DxcBadge
            label={claim.status}
            mode="contextual"
            color={getStatusColor(claim.status)}
          />
        </DxcFlex>

        {/* Key Information Grid */}
        <DxcFlex gap="var(--spacing-gap-xl)" wrap="wrap">
          {/* Claimant */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              CLAIMANT
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {claim.claimant?.name || 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Policy Number */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              POLICY NUMBER
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {claim.policy?.policyNumber || claim.policyNumber || 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Claim Amount */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              CLAIM AMOUNT
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              ${(claim.financial?.claimAmount || 0).toLocaleString()}
            </DxcTypography>
          </DxcFlex>

          {/* Submitted Date */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              SUBMITTED
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Days Open */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              DAYS OPEN
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {claim.workflow?.daysOpen || 0}
            </DxcTypography>
          </DxcFlex>
        </DxcFlex>

        {/* SLA Indicator */}
        {claim.workflow?.sla?.dueDate && (
          <SLAIndicator
            slaDate={claim.workflow.sla.dueDate}
            daysOpen={claim.workflow.daysOpen || 0}
            slaDays={isFastTrack ? 10 : 30}
            routing={claim.routing?.type}
          />
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

/**
 * Policy Information Section
 */
const PolicyInformation = ({ claim, policy }) => {
  if (!policy && !claim.policy) {
    return (
      <DxcContainer
        style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
        padding="var(--spacing-padding-m)"
      >
        <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
          Policy information not available
        </DxcTypography>
      </DxcContainer>
    );
  }

  const policyData = policy || claim.policy;

  return (
    <DxcContainer
      style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
      padding="var(--spacing-padding-m)"
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        <DxcHeading level={4} text="Policy Information" />

        <DxcFlex gap="var(--spacing-gap-xl)" wrap="wrap">
          {/* Policy Number */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              POLICY NUMBER
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {policyData.policyNumber || 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Policy Type */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              POLICY TYPE
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {policyData.policyType || 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Status */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              STATUS
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {policyData.status || 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Issue Date */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              ISSUE DATE
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {policyData.issueDate ? new Date(policyData.issueDate).toLocaleDateString() : 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Coverage Amount */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              COVERAGE AMOUNT
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              ${(policyData.coverage?.faceAmount || 0).toLocaleString()}
            </DxcTypography>
          </DxcFlex>
        </DxcFlex>
      </DxcFlex>
    </DxcContainer>
  );
};

/**
 * Quick Actions Section
 */
const QuickActions = ({ claim, onAction }) => {
  const canApprove = claim.status === ClaimStatus.UNDER_REVIEW;
  const canDeny = claim.status === ClaimStatus.UNDER_REVIEW;
  const canReopen = claim.status === ClaimStatus.CLOSED || claim.status === ClaimStatus.DENIED;

  return (
    <DxcContainer
      style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
      padding="var(--spacing-padding-m)"
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        <DxcHeading level={4} text="Quick Actions" />

        <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
          {canApprove && (
            <DxcButton
              label="Approve Claim"
              mode="primary"
              icon="check_circle"
              onClick={() => onAction('approve')}
            />
          )}

          {canDeny && (
            <DxcButton
              label="Deny Claim"
              mode="primary"
              icon="cancel"
              onClick={() => onAction('deny')}
            />
          )}

          <DxcButton
            label="Request Information"
            mode="secondary"
            icon="email"
            onClick={() => onAction('request_info')}
          />

          <DxcButton
            label="Assign Examiner"
            mode="secondary"
            icon="person_add"
            onClick={() => onAction('assign')}
          />

          <DxcButton
            label="Add Note"
            mode="tertiary"
            icon="note_add"
            onClick={() => onAction('add_note')}
          />

          {canReopen && (
            <DxcButton
              label="Reopen Claim"
              mode="tertiary"
              icon="replay"
              onClick={() => onAction('reopen')}
            />
          )}
        </DxcFlex>
      </DxcFlex>
    </DxcContainer>
  );
};

/**
 * Main Claim Detail Component
 */
const ClaimDetail = ({ claimId, onClose }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Get claim data from context
  const { claims, claimsLoading, fetchClaims } = useClaims();
  const { currentPolicy, fetchPolicy } = usePolicy();
  const { currentCase, fetchCase } = useWorkflow();

  // Find the current claim
  const claim = useMemo(() => {
    return claims?.find(c => c.id === claimId || c.claimNumber === claimId);
  }, [claims, claimId]);

  // Fetch data on mount
  useEffect(() => {
    if (!claims || claims.length === 0) {
      fetchClaims();
    }
  }, []);

  // Fetch policy when claim loads
  useEffect(() => {
    if (claim && claim.policyNumber) {
      fetchPolicy(claim.policyNumber);
    }
    if (claim && claim.workflow?.fsoCase) {
      fetchCase(claim.workflow.fsoCase);
    }
  }, [claim]);

  // Mock requirements data (in production, this would come from requirementProcessor)
  const requirements = useMemo(() => {
    if (!claim) return [];

    // This would be replaced with actual requirement data from the processor
    return [
      {
        id: 'req-1',
        type: 'DEATH_CERTIFICATE',
        level: 'MANDATORY',
        status: 'SATISFIED',
        description: 'Official death certificate from vital records',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        documents: ['doc-1'],
        isSatisfied: () => true,
        isMandatory: () => true,
        isOverdue: () => false
      },
      {
        id: 'req-2',
        type: 'CLAIMANT_STATEMENT',
        level: 'MANDATORY',
        status: 'PENDING',
        description: 'Completed and signed claimant statement form',
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        isSatisfied: () => false,
        isMandatory: () => true,
        isOverdue: () => false
      },
      {
        id: 'req-3',
        type: 'PROOF_OF_IDENTITY',
        level: 'MANDATORY',
        status: 'IN_REVIEW',
        description: 'Valid government-issued photo ID',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        documents: ['doc-2'],
        isSatisfied: () => false,
        isMandatory: () => true,
        isOverdue: () => false
      }
    ];
  }, [claim]);

  const handleAction = (action) => {
    console.log('Action:', action);
    // TODO: Implement action handlers
  };

  const handleUpload = (requirement) => {
    console.log('Upload for requirement:', requirement);
    // TODO: Implement document upload
  };

  const handleWaive = (requirement) => {
    console.log('Waive requirement:', requirement);
    // TODO: Implement waiver
  };

  const handleOverride = (requirement) => {
    console.log('Override requirement:', requirement);
    // TODO: Implement override
  };

  // Loading state
  if (claimsLoading && !claim) {
    return (
      <DxcContainer
        padding="var(--spacing-padding-l)"
        style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center" justifyContent="center" style={{ minHeight: "400px" }}>
          <DxcSpinner label="Loading claim details..." />
        </DxcFlex>
      </DxcContainer>
    );
  }

  // Claim not found
  if (!claim) {
    return (
      <DxcContainer
        padding="var(--spacing-padding-l)"
        style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center" justifyContent="center" style={{ minHeight: "400px" }}>
          <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
            Claim not found
          </DxcTypography>
          {onClose && (
            <DxcButton
              label="Back to Dashboard"
              mode="primary"
              onClick={onClose}
            />
          )}
        </DxcFlex>
      </DxcContainer>
    );
  }

  return (
    <DxcContainer
      padding="var(--spacing-padding-l)"
      style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Back Button */}
        {onClose && (
          <DxcButton
            label="Back to Dashboard"
            mode="tertiary"
            icon="arrow_back"
            onClick={onClose}
          />
        )}

        {/* Claim Header */}
        <ClaimHeader claim={claim} />

        {/* Two Column Layout */}
        <DxcFlex gap="var(--spacing-gap-m)" style={{ alignItems: 'flex-start' }}>
          {/* Left Column - Main Content */}
          <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: 2 }}>
            {/* Tabs for different sections */}
            <DxcContainer
              style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
              padding="var(--spacing-padding-m)"
            >
              <DxcTabs iconPosition="left">
                <DxcTabs.Tab
                  label="Requirements"
                  icon="check_circle"
                  active={activeTabIndex === 0}
                  onClick={() => setActiveTabIndex(0)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <RequirementsTracker
                      requirements={requirements}
                      onUpload={handleUpload}
                      onWaive={handleWaive}
                      onOverride={handleOverride}
                      showProgress={true}
                    />
                  </div>
                </DxcTabs.Tab>

                <DxcTabs.Tab
                  label="Documents"
                  icon="folder"
                  active={activeTabIndex === 1}
                  onClick={() => setActiveTabIndex(1)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <DxcTypography fontSize="font-scale-03">
                      Documents section (coming in Phase 5)
                    </DxcTypography>
                  </div>
                </DxcTabs.Tab>

                <DxcTabs.Tab
                  label="Activity"
                  icon="timeline"
                  active={activeTabIndex === 2}
                  onClick={() => setActiveTabIndex(2)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <DxcTypography fontSize="font-scale-03">
                      Activity timeline (coming in Phase 5)
                    </DxcTypography>
                  </div>
                </DxcTabs.Tab>

                <DxcTabs.Tab
                  label="Notes"
                  icon="note"
                  active={activeTabIndex === 3}
                  onClick={() => setActiveTabIndex(3)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <DxcTypography fontSize="font-scale-03">
                      Notes section (coming in Phase 5)
                    </DxcTypography>
                  </div>
                </DxcTabs.Tab>
              </DxcTabs>
            </DxcContainer>
          </DxcFlex>

          {/* Right Column - Sidebar */}
          <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: 1, minWidth: '320px' }}>
            {/* Quick Actions */}
            <QuickActions claim={claim} onAction={handleAction} />

            {/* Beneficiary Analysis - Auto-triggers when FNOL loads */}
            {claim?.sysId && claim?.source === 'servicenow' && (
              <BeneficiaryAnalysisPanel
                fnolSysId={claim.sysId}
                claimNumber={claim.claimNumber || claim.fnolNumber || claim.id}
              />
            )}

            {/* Policy Information */}
            <PolicyInformation claim={claim} policy={currentPolicy} />
          </DxcFlex>
        </DxcFlex>
      </DxcFlex>
    </DxcContainer>
  );
};

export default ClaimDetail;
export { ClaimHeader, PolicyInformation, QuickActions };
