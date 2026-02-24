/**
 * Claim Detail - Unified 360° View
 *
 * Comprehensive claim view that integrates all Phase 1-3 components:
 * - Claim header with STP badge and SLA indicator
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
  DxcChip,
  DxcAlert,
  DxcTabs,
  DxcInset,
  DxcSpinner,
  DxcProgressBar,
  DxcCheckbox,
  DxcSelect,
  DxcTextInput,
  DxcDialog,
  DxcDivider
} from '@dxc-technology/halstack-react';
import { useClaims } from '../../contexts/ClaimsContext';
import { usePolicy } from '../../contexts/PolicyContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useDocument } from '../../contexts/DocumentContext';
import STPBadge from '../shared/STPBadge';
import SLAIndicator from '../shared/SLAIndicator';
import RequirementsTracker from '../shared/RequirementsTracker';
import DocumentUpload from '../shared/DocumentUpload';
import BeneficiaryAnalysisPanel from './BeneficiaryAnalysisPanel';
import RelatedPoliciesPanel from '../RelatedPoliciesPanel/RelatedPoliciesPanel';
import PMICalculator from '../PMICalculator/PMICalculator';
import TaxWithholdingCalculator from '../TaxWithholdingCalculator/TaxWithholdingCalculator';
import { ClaimStatus, RoutingType, RequirementStatus } from '../../types/claim.types';

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

  const isSTP = claim.routing?.type === RoutingType.STP;

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
            {isSTP && (
              <STPBadge
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
            slaDays={isSTP ? 10 : 30}
            routing={claim.routing?.type}
            claimStatus={claim.status}
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
 * Beneficiaries Tab
 * Horizontal table layout: left column = policy info, right column = beneficiaries.
 * Primary policy beneficiaries come from claim.parties[]; confirmed associated policies
 * use the beneficiaries[] array carried on the policy object from the related-policies search.
 */
const BeneficiariesTab = ({ claim, confirmedPolicies }) => {
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount);
  };

  const getVerificationColor = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s === 'verified') return 'success';
    if (s === 'pending') return 'warning';
    return 'neutral';
  };

  // Build primary/contingent lists from claim.parties[] for the primary policy
  const getPrimaryPolicyBennies = () => {
    const parties = claim.parties || [];
    const primaryParties = parties.filter(p => p.role === 'Primary Beneficiary');
    const contingentParties = parties.filter(p => p.role === 'Contingent Beneficiary');
    const toRow = (p, group) => ({
      name: p.name,
      relationship: p.relationship || null,
      percentage: p.percentage != null
        ? p.percentage
        : group === 'primary'
          ? Math.round(100 / (primaryParties.length || 1))
          : Math.round(100 / (contingentParties.length || 1)),
      verificationStatus: p.verificationStatus,
      verificationScore: p.verificationScore
    });
    return {
      primary: primaryParties.map(p => toRow(p, 'primary')),
      contingent: contingentParties.map(p => toRow(p, 'contingent'))
    };
  };

  const primaryPolicy = claim.policy || (claim.policies && claim.policies[0]) || {};

  const rows = [
    {
      policy: {
        policyNumber: primaryPolicy.policyNumber,
        policyType: primaryPolicy.type || primaryPolicy.policyType,
        faceAmount: primaryPolicy.faceAmount || primaryPolicy.coverage?.faceAmount,
        issueDate: primaryPolicy.issueDate,
        badge: 'PRIMARY'
      },
      bennies: getPrimaryPolicyBennies()
    },
    ...confirmedPolicies.map(p => {
      const rawBennies = p.beneficiaries || [];
      return {
        policy: {
          policyNumber: p.policyNumber,
          policyType: p.policyType || p.type,
          faceAmount: p.faceAmount,
          issueDate: p.issueDate,
          badge: 'ASSOCIATED'
        },
        bennies: {
          primary: rawBennies.filter(b => (b.type || '').toLowerCase() === 'primary'),
          contingent: rawBennies.filter(b => (b.type || '').toLowerCase() !== 'primary' && b.type)
        }
      };
    })
  ];

  const renderBeneficiaryRow = (b, i) => (
    <div
      key={i}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'var(--color-bg-neutral-lightest)',
        borderRadius: '4px'
      }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">{b.name}</DxcTypography>
        {b.relationship && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">{b.relationship}</DxcTypography>
        )}
      </DxcFlex>
      <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
        {b.percentage != null && (
          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-bold" color="var(--color-fg-primary-stronger)">
            {b.percentage}%
          </DxcTypography>
        )}
        {b.verificationStatus && (
          <DxcBadge label={b.verificationStatus} mode="contextual" color={getVerificationColor(b.verificationStatus)} />
        )}
      </DxcFlex>
    </div>
  );

  const renderBeneficiaryGroup = (bennies, groupLabel) => {
    if (!bennies || bennies.length === 0) return null;
    return (
      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
        <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
          {groupLabel}
        </DxcTypography>
        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
          {bennies.map((b, i) => renderBeneficiaryRow(b, i))}
        </DxcFlex>
      </DxcFlex>
    );
  };

  return (
    <DxcContainer padding="var(--spacing-padding-m)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">

        {/* Header */}
        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
          <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '18px' }}>people</span>
          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
            Beneficiaries by Policy
          </DxcTypography>
          <DxcChip label={`${rows.length} ${rows.length === 1 ? 'Policy' : 'Policies'}`} size="small" />
        </DxcFlex>

        {confirmedPolicies.length === 0 && (
          <DxcAlert type="info" size="fitContent">
            <DxcTypography fontSize="font-scale-01">
              Only the primary policy is shown. Confirm additional policies in the Related Policies tab to see their beneficiaries here.
            </DxcTypography>
          </DxcAlert>
        )}

        {/* Table */}
        <DxcContainer
          style={{
            backgroundColor: 'var(--color-bg-neutral-white)',
            border: '1px solid var(--color-border-neutral-medium)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {/* Column Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            borderBottom: '2px solid var(--color-border-neutral-medium)',
            backgroundColor: 'var(--color-bg-neutral-lighter)'
          }}>
            <div style={{ padding: '10px 16px', borderRight: '1px solid var(--color-border-neutral-medium)' }}>
              <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                POLICY
              </DxcTypography>
            </div>
            <div style={{ padding: '10px 16px' }}>
              <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                BENEFICIARIES
              </DxcTypography>
            </div>
          </div>

          {/* Data Rows */}
          {rows.map((row, index) => (
            <div
              key={row.policy.policyNumber || index}
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                borderBottom: index < rows.length - 1 ? '1px solid var(--color-border-neutral-medium)' : 'none'
              }}
            >
              {/* Policy Cell */}
              <div style={{
                padding: '16px',
                borderRight: '1px solid var(--color-border-neutral-medium)',
                backgroundColor: row.policy.badge === 'PRIMARY'
                  ? 'var(--color-bg-neutral-lightest)'
                  : 'var(--color-bg-neutral-white)'
              }}>
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    {row.policy.policyNumber || 'N/A'}
                  </DxcTypography>
                  <DxcBadge
                    label={row.policy.badge}
                    mode="contextual"
                    color={row.policy.badge === 'PRIMARY' ? 'info' : 'success'}
                  />
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                    {row.policy.policyType || 'N/A'}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    {formatCurrency(row.policy.faceAmount)}
                  </DxcTypography>
                  {row.policy.issueDate && (
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                      Issued {row.policy.issueDate}
                    </DxcTypography>
                  )}
                </DxcFlex>
              </div>

              {/* Beneficiaries Cell */}
              <div style={{ padding: '16px' }}>
                {row.bennies.primary.length === 0 && row.bennies.contingent.length === 0 ? (
                  <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                    No beneficiary data available for this policy.
                  </DxcTypography>
                ) : (
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {renderBeneficiaryGroup(row.bennies.primary, 'PRIMARY')}
                    {renderBeneficiaryGroup(row.bennies.contingent, 'CONTINGENT')}
                  </DxcFlex>
                )}
              </div>
            </div>
          ))}
        </DxcContainer>

      </DxcFlex>
    </DxcContainer>
  );
};

/**
 * Policy Association Tab
 * Displays the primary policy tagged at claim submission and confirmed associated child policies.
 */
const PolicyAssociationTab = ({ claim, confirmedPolicies }) => {
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const primaryPolicy = claim.policy;
  const submissionChannel =
    claim.source === 'servicenow' ? 'ServiceNow' :
    claim.source === 'portal' ? 'Customer Portal' :
    claim.source === 'call_center' ? 'Call Center' :
    claim.source || 'Portal / Call Center';

  return (
    <DxcContainer padding="var(--spacing-padding-m)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">

        {/* Primary Policy */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '18px' }}>verified</span>
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
              PRIMARY POLICY
            </DxcTypography>
            <DxcChip label="Submitted with Claim" size="small" />
          </DxcFlex>

          {primaryPolicy ? (
            <DxcContainer
              padding="var(--spacing-padding-m)"
              style={{
                backgroundColor: 'var(--color-bg-neutral-white)',
                border: '2px solid var(--color-border-primary-strong)',
                borderRadius: '8px'
              }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcFlex justifyContent="space-between" alignItems="flex-start">
                  <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                      {primaryPolicy.policyNumber}
                    </DxcTypography>
                    <DxcBadge label="PRIMARY" mode="contextual" color="info" />
                    {(primaryPolicy.policyStatus || primaryPolicy.status) && (
                      <DxcBadge label={primaryPolicy.policyStatus || primaryPolicy.status} />
                    )}
                  </DxcFlex>
                  <DxcFlex direction="column" alignItems="flex-end" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold">
                      {formatCurrency(primaryPolicy.faceAmount || primaryPolicy.coverage?.faceAmount)}
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                      Face Amount
                    </DxcTypography>
                  </DxcFlex>
                </DxcFlex>

                <DxcFlex gap="var(--spacing-gap-xl)" wrap="wrap">
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Policy Type</DxcTypography>
                    <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                      {primaryPolicy.policyType || primaryPolicy.type || 'N/A'}
                    </DxcTypography>
                  </DxcFlex>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Issue Date</DxcTypography>
                    <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                      {primaryPolicy.issueDate || 'N/A'}
                    </DxcTypography>
                  </DxcFlex>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Submission Channel</DxcTypography>
                    <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                      {submissionChannel}
                    </DxcTypography>
                  </DxcFlex>
                  {primaryPolicy.region && (
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Region</DxcTypography>
                      <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">{primaryPolicy.region}</DxcTypography>
                    </DxcFlex>
                  )}
                  {(primaryPolicy.companyCode || primaryPolicy.coNumber) && (
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Co #</DxcTypography>
                      <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                        {primaryPolicy.companyCode || primaryPolicy.coNumber}
                      </DxcTypography>
                    </DxcFlex>
                  )}
                </DxcFlex>
              </DxcFlex>
            </DxcContainer>
          ) : (
            <DxcContainer
              padding="var(--spacing-padding-m)"
              style={{ backgroundColor: 'var(--color-bg-neutral-lighter)', borderRadius: '8px' }}
            >
              <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                No primary policy data available for this claim.
              </DxcTypography>
            </DxcContainer>
          )}
        </DxcFlex>

        {/* Associated Child Policies */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-success-darker)', fontSize: '18px' }}>account_tree</span>
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
              ASSOCIATED POLICIES
            </DxcTypography>
            <DxcChip label="Child Records" size="small" />
            {confirmedPolicies.length > 0 && (
              <DxcBadge label={`${confirmedPolicies.length}`} mode="contextual" color="success" />
            )}
          </DxcFlex>

          <div style={{ paddingLeft: '24px', borderLeft: '3px solid var(--color-border-neutral-medium)' }}>
            {confirmedPolicies.length > 0 ? (
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                {confirmedPolicies.map((policy, index) => (
                  <DxcContainer
                    key={policy.policyNumber || index}
                    padding="var(--spacing-padding-m)"
                    style={{
                      backgroundColor: 'var(--color-bg-neutral-white)',
                      border: '2px solid var(--color-border-success-strong)',
                      borderRadius: '8px'
                    }}
                  >
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                      <DxcFlex justifyContent="space-between" alignItems="flex-start">
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                          <span className="material-icons" style={{ color: 'var(--color-fg-success-darker)', fontSize: '16px' }}>
                            subdirectory_arrow_right
                          </span>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                            {policy.policyNumber}
                          </DxcTypography>
                          <DxcBadge label="ASSOCIATED" mode="contextual" color="success" />
                          {(policy.policyStatus || policy.status) && (
                            <DxcBadge label={policy.policyStatus || policy.status} />
                          )}
                        </DxcFlex>
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-bold">
                          {formatCurrency(policy.faceAmount)}
                        </DxcTypography>
                      </DxcFlex>
                      <DxcFlex gap="var(--spacing-gap-xl)" wrap="wrap">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Policy Type</DxcTypography>
                          <DxcTypography fontSize="font-scale-01">{policy.policyType || policy.type || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Issue Date</DxcTypography>
                          <DxcTypography fontSize="font-scale-01">{policy.issueDate || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Associated By</DxcTypography>
                          <DxcTypography fontSize="font-scale-01">{policy.associatedBy || 'Claims Handler'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">Associated On</DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {policy.associatedAt ? new Date(policy.associatedAt).toLocaleDateString() : 'N/A'}
                          </DxcTypography>
                        </DxcFlex>
                      </DxcFlex>
                    </DxcFlex>
                  </DxcContainer>
                ))}
              </DxcFlex>
            ) : (
              <DxcContainer
                padding="var(--spacing-padding-m)"
                style={{ backgroundColor: 'var(--color-bg-neutral-lighter)', borderRadius: '8px', textAlign: 'center' }}
              >
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                  <span className="material-icons" style={{ fontSize: '32px', color: 'var(--color-fg-neutral-stronger)' }}>
                    account_tree
                  </span>
                  <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                    No additional policies confirmed yet
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                    Review the Related Policies tab to confirm or deny additional policy associations.
                  </DxcTypography>
                </DxcFlex>
              </DxcContainer>
            )}
          </div>
        </DxcFlex>

      </DxcFlex>
    </DxcContainer>
  );
};

/**
 * Adjudicate Tab
 * Examiners make approval/denial decisions and enter proceed amounts.
 */
const AdjudicateTab = ({ claim, confirmedPolicies, adjDecision, setAdjDecision, onOpenPMI }) => {
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0);

  const formatCurrency = (amount) => {
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(amount);
  };

  const policies = claim.policies || (claim.policy ? [claim.policy] : []);
  const selectedPolicy = policies[selectedPolicyIndex] || {};
  const primaryBeneficiary = (claim.parties || []).find(p => p.role === 'Primary Beneficiary');
  const claimAmount = claim.financial?.claimAmount || 0;
  const netAmount = claim.financial?.netBenefitProceeds || claimAmount;

  return (
    <DxcContainer padding="var(--spacing-padding-m)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">

        {/* Section A: Adjudication Details Tree */}
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
            ADJUDICATION DETAILS
          </DxcTypography>

          {/* Tree Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 150px 150px',
            borderBottom: '2px solid var(--color-border-neutral-medium)',
            padding: '6px 8px',
            backgroundColor: 'var(--color-bg-neutral-lighter)'
          }}>
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">CLAIM / POLICY</DxcTypography>
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">GROSS BENEFIT</DxcTypography>
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">NET BENEFIT</DxcTypography>
          </div>

          {/* Claim Row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 150px 150px',
            padding: '6px 8px',
            backgroundColor: 'var(--color-bg-neutral-white)',
            borderRadius: '4px'
          }}>
            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '14px', color: 'var(--color-fg-primary-stronger)' }}>chevron_right</span>
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">{claim.claimNumber || claim.id}</DxcTypography>
            </DxcFlex>
            <DxcTypography fontSize="font-scale-02">{formatCurrency(claimAmount)}</DxcTypography>
            <DxcTypography fontSize="font-scale-02">{formatCurrency(netAmount)}</DxcTypography>
          </div>

          {/* Policy Rows */}
          {policies.map((policy, idx) => (
            <div key={policy.policyNumber || idx}>
              {/* Policy Row — clickable */}
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 150px 150px',
                  padding: '6px 8px', paddingLeft: '24px',
                  backgroundColor: idx === selectedPolicyIndex
                    ? 'var(--color-bg-primary-lightest)'
                    : 'var(--color-bg-neutral-white)',
                  borderRadius: '4px', cursor: 'pointer',
                  border: idx === selectedPolicyIndex
                    ? '1px solid var(--color-border-primary-strong)'
                    : '1px solid transparent'
                }}
                onClick={() => setSelectedPolicyIndex(idx)}
              >
                <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                  <span className="material-icons" style={{ fontSize: '14px', color: 'var(--color-fg-success-darker)' }}>subdirectory_arrow_right</span>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">{policy.policyNumber}</DxcTypography>
                  <DxcBadge label={policy.policyType || 'Term Life'} mode="contextual" color="info" />
                  <DxcBadge label={policy.policyStatus || 'In Force'} mode="contextual" color="success" />
                </DxcFlex>
                <DxcTypography fontSize="font-scale-02">{formatCurrency(policy.faceAmount)}</DxcTypography>
                <DxcTypography fontSize="font-scale-02">{formatCurrency(policy.faceAmount)}</DxcTypography>
              </div>

              {/* Coverage Row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 150px 150px',
                padding: '4px 8px', paddingLeft: '48px'
              }}>
                <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                  <span className="material-icons" style={{ fontSize: '12px', color: 'var(--color-fg-neutral-strong)' }}>subdirectory_arrow_right</span>
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    {policy.planCode || policy.policyNumber}
                  </DxcTypography>
                </DxcFlex>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">{formatCurrency(policy.faceAmount)}</DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">{formatCurrency(policy.faceAmount)}</DxcTypography>
              </div>

              {/* Beneficiary Row */}
              {primaryBeneficiary && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 150px 150px',
                  padding: '4px 8px', paddingLeft: '64px'
                }}>
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                    {primaryBeneficiary.name} (Primary 100%)
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">{formatCurrency(policy.faceAmount)}</DxcTypography>
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">{formatCurrency(policy.faceAmount)}</DxcTypography>
                </div>
              )}
            </div>
          ))}
        </DxcFlex>

        {/* Section B: Claim Details */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
            CLAIM DETAILS
          </DxcTypography>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'Proof of Loss Date', value: claim.proofOfLossDate || 'N/A' },
              { label: 'Proof of Death Date', value: claim.deathEvent?.proofOfDeathDate || 'N/A' },
              { label: 'Proof of Death Source', value: claim.deathEvent?.proofOfDeathSourceType || 'N/A' },
              { label: 'Certified DOB', value: claim.deathEvent?.certifiedDOB || 'N/A' },
            ].map((f, i) => (
              <DxcFlex key={i} direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">{f.label.toUpperCase()}</DxcTypography>
                <DxcTypography fontSize="font-scale-02">{f.value}</DxcTypography>
              </DxcFlex>
            ))}
          </div>
        </DxcFlex>

        {/* Section C: Policy Details for selected policy */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
            POLICY DETAILS — {selectedPolicy.policyNumber || 'N/A'}
          </DxcTypography>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'Claim Policy Status', value: selectedPolicy.policyStatus || 'N/A' },
              { label: 'Issue Date', value: selectedPolicy.issueDate || 'N/A' },
              { label: 'Issue State', value: selectedPolicy.issueState || 'N/A' },
              { label: 'Par Type', value: selectedPolicy.parType || 'Non-Par' },
              { label: 'Paid to Date', value: selectedPolicy.paidToDate || 'N/A' },
              { label: 'Plan Code', value: selectedPolicy.planCode || 'N/A' },
              { label: 'Reporting Product Type', value: selectedPolicy.reportingProductType || selectedPolicy.policyType || 'N/A' },
              { label: 'Insured Indicator', value: 'Base' },
              { label: 'Acknowledgment Date', value: 'N/A' },
              { label: 'Policy Closed Date', value: claim.closedAt ? new Date(claim.closedAt).toLocaleDateString() : 'N/A' },
            ].map((f, i) => (
              <DxcFlex key={i} direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">{f.label.toUpperCase()}</DxcTypography>
                <DxcTypography fontSize="font-scale-02">{f.value}</DxcTypography>
              </DxcFlex>
            ))}
          </div>
        </DxcFlex>

        {/* Section D: Adjudication Decision */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
            ADJUDICATION DECISION
          </DxcTypography>
          <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap" alignItems="flex-end">
            <DxcSelect
              label="Adjudication Decision"
              options={[
                { label: '— Select —', value: '' },
                { label: 'Approved', value: 'approved' },
                { label: 'Denied', value: 'denied' },
              ]}
              value={adjDecision.decision}
              onChange={v => setAdjDecision(d => ({ ...d, decision: v }))}
            />
            <div style={{ flex: 1, minWidth: '240px' }}>
              <DxcTextInput
                label="Decision Reason"
                value={adjDecision.reason}
                onChange={({ value }) => setAdjDecision(d => ({ ...d, reason: value }))}
              />
            </div>
          </DxcFlex>
        </DxcFlex>

        {/* Section E: Proceed Details */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
            PROCEED DETAILS
          </DxcTypography>
          <div style={{
            border: '1px solid var(--color-border-neutral-medium)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 150px 150px 140px',
              backgroundColor: 'var(--color-bg-neutral-lighter)',
              borderBottom: '1px solid var(--color-border-neutral-medium)',
              padding: '8px 12px'
            }}>
              {['Claim Amount Item Type', 'Credit', 'Debit', 'Account #'].map((h, i) => (
                <DxcTypography key={i} fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">{h}</DxcTypography>
              ))}
            </div>
            {/* Table Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 150px 150px 140px',
              padding: '8px 12px',
              backgroundColor: 'var(--color-bg-neutral-white)'
            }}>
              <DxcTypography fontSize="font-scale-02">Face Amount</DxcTypography>
              <DxcTypography fontSize="font-scale-02">{formatCurrency(selectedPolicy.faceAmount || claimAmount)}</DxcTypography>
              <DxcTypography fontSize="font-scale-02">$0.00</DxcTypography>
              <DxcTypography fontSize="font-scale-02">2412800</DxcTypography>
            </div>
          </div>
          <DxcFlex gap="var(--spacing-gap-s)">
            <DxcButton
              label="Benefit Quote"
              mode="secondary"
              icon="calculate"
              onClick={onOpenPMI}
            />
            <DxcButton
              label="Update"
              mode="primary"
              onClick={() => console.log('Update adjudication', adjDecision)}
            />
          </DxcFlex>
        </DxcFlex>

      </DxcFlex>
    </DxcContainer>
  );
};

/**
 * Payments & Interest Tab
 * Shows payment summary per beneficiary and detailed payment history.
 */
const PaymentsTab = ({ claim, onOpenPMI, onOpenTax }) => {
  const formatCurrency = (amount) => {
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(amount);
  };

  const beneficiaries = (claim.parties || []).filter(
    p => p.role === 'Primary Beneficiary' || p.role === 'Contingent Beneficiary'
  );
  const primaryBeneficiary = beneficiaries[0] || null;
  const payments = claim.financial?.payments || [];
  const policy = (claim.policies || [])[0] || claim.policy || {};

  return (
    <DxcContainer padding="var(--spacing-padding-m)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">

        {/* Payment Summary Table */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
            PAYMENT SUMMARY
          </DxcTypography>
          <div style={{
            border: '1px solid var(--color-border-neutral-medium)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 1fr 140px 110px 100px 140px',
              backgroundColor: 'var(--color-bg-neutral-lighter)',
              borderBottom: '1px solid var(--color-border-neutral-medium)',
              padding: '8px 12px'
            }}>
              {['Designee', '%', 'Policy / Coverage', 'Net Benefit Proceeds', 'PMI Interest', 'Tax Withheld', 'Net Benefit Paid'].map((h, i) => (
                <DxcTypography key={i} fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">{h}</DxcTypography>
              ))}
            </div>

            {beneficiaries.length === 0 ? (
              <div style={{ padding: '12px' }}>
                <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">No beneficiaries on file.</DxcTypography>
              </div>
            ) : (
              beneficiaries.map((bene, idx) => (
                <div
                  key={bene.id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 60px 1fr 140px 110px 100px 140px',
                    padding: '8px 12px',
                    backgroundColor: idx % 2 === 0 ? 'var(--color-bg-neutral-white)' : 'var(--color-bg-neutral-lightest)',
                    borderBottom: idx < beneficiaries.length - 1 ? '1px solid var(--color-border-neutral-medium)' : 'none'
                  }}
                >
                  <DxcTypography fontSize="font-scale-02">Estate of {bene.name}</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">100%</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {policy.policyNumber || 'N/A'} / {policy.planCode || 'N/A'}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">{formatCurrency(claim.financial?.netBenefitProceeds)}</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">{formatCurrency(claim.financial?.netBenefitPMI)}</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">{formatCurrency(claim.financial?.taxWithheld)}</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">{formatCurrency(claim.financial?.netBenefitProceeds)}</DxcTypography>
                </div>
              ))
            )}
          </div>

          <DxcFlex gap="var(--spacing-gap-s)">
            <DxcButton
              label="View/Calculate (PMI)"
              mode="secondary"
              icon="calculate"
              onClick={onOpenPMI}
            />
            <DxcButton
              label="(T)ax Withholding"
              mode="secondary"
              icon="receipt_long"
              onClick={() => onOpenTax(primaryBeneficiary)}
            />
          </DxcFlex>
        </DxcFlex>

        {/* Payment Details */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
            PAYMENT DETAILS
          </DxcTypography>

          {payments.length === 0 ? (
            <DxcAlert type="info" size="fitContent">
              <DxcTypography fontSize="font-scale-01">No payments recorded yet.</DxcTypography>
            </DxcAlert>
          ) : (
            <div style={{
              border: '1px solid var(--color-border-neutral-medium)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 110px 100px 110px 120px 130px',
                backgroundColor: 'var(--color-bg-neutral-lighter)',
                borderBottom: '1px solid var(--color-border-neutral-medium)',
                padding: '8px 12px'
              }}>
                {['Payee', 'Net Benefit Paid', 'Payment Type', 'Status', 'Date Paid', 'Check / Account', 'Payment Closed Date'].map((h, i) => (
                  <DxcTypography key={i} fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">{h}</DxcTypography>
                ))}
              </div>

              {payments.map((pmt, idx) => (
                <div
                  key={pmt.id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 130px 110px 100px 110px 120px 130px',
                    padding: '8px 12px',
                    backgroundColor: idx % 2 === 0 ? 'var(--color-bg-neutral-white)' : 'var(--color-bg-neutral-lightest)',
                    borderBottom: idx < payments.length - 1 ? '1px solid var(--color-border-neutral-medium)' : 'none',
                    alignItems: 'center'
                  }}
                >
                  <DxcTypography fontSize="font-scale-02">{pmt.payeeName}</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">{formatCurrency(pmt.netPayment || pmt.netBenefitProceeds)}</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">{pmt.paymentMethod || 'ACH'}</DxcTypography>
                  <DxcBadge
                    label={pmt.status || 'Pending'}
                    mode="contextual"
                    color={pmt.status === 'Completed' ? 'success' : 'warning'}
                  />
                  <DxcTypography fontSize="font-scale-02">{pmt.paymentDate || pmt.scheduledDate || 'N/A'}</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">{pmt.bankInfo?.accountNumberLast4 || pmt.checkNumber || 'N/A'}</DxcTypography>
                  <DxcTypography fontSize="font-scale-02">{pmt.paymentDate || 'N/A'}</DxcTypography>
                </div>
              ))}
            </div>
          )}
        </DxcFlex>

      </DxcFlex>
    </DxcContainer>
  );
};

/**
 * Additional Claim Information Section (right sidebar)
 */
const AdditionalClaimInfo = ({ claim }) => {
  const primaryBeneficiary = (claim.parties || []).find(p => p.role === 'Primary Beneficiary');

  const leftFields = [
    { label: 'Notification Method', value: claim.notificationMethod || 'Phone' },
    { label: "Spouse's Name", value: claim.insured?.spouseName || '' },
    { label: "Deceased's Marital Status", value: claim.insured?.maritalStatus || 'Unknown' },
    { label: 'Estate Probated?', value: claim.estateInfo?.probated || 'Unknown' },
    { label: "Deceased's Children", value: claim.insured?.hasChildren ? 'Yes' : 'Unknown' },
    { label: 'Notification Comments', value: claim.notificationComments || '' },
  ];

  const rightFields = [
    { label: 'Bene Name', value: primaryBeneficiary?.name || 'N/A' },
    { label: "Spouse's DOD", value: claim.insured?.spouseDateOfDeath || '' },
    { label: 'Funeral Home/Funding?', value: claim.funeralHome?.funded || 'Unknown' },
    { label: 'Spouse Living?', value: claim.insured?.spouseLiving || 'Unknown' },
  ];

  const renderField = (f, i) => (
    <DxcFlex key={i} direction="column" gap="var(--spacing-gap-xxs)" style={{ marginBottom: '8px' }}>
      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
        {f.label.toUpperCase()}
      </DxcTypography>
      <DxcTypography fontSize="font-scale-02">
        {f.value || '\u2014'}
      </DxcTypography>
    </DxcFlex>
  );

  return (
    <DxcContainer
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
      padding="var(--spacing-padding-m)"
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        <DxcHeading level={4} text="Additional Claim Information" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <div>{leftFields.map(renderField)}</div>
          <div>{rightFields.map(renderField)}</div>
        </div>
      </DxcFlex>
    </DxcContainer>
  );
};

/**
 * Main Claim Detail Component
 */
const ClaimDetail = ({ claimId, onClose }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [confirmedPolicies, setConfirmedPolicies] = useState([]);
  const [deniedPolicies, setDeniedPolicies] = useState([]);
  const [claimFlags, setClaimFlags] = useState({
    reviewForClient: false,
    highPriority: false,
    secureClaim: 'Not a Secure Claim'
  });
  const [adjDecision, setAdjDecision] = useState({ decision: '', reason: '' });
  const [showPMICalculator, setShowPMICalculator] = useState(false);
  const [showTaxWithholding, setShowTaxWithholding] = useState(false);
  const [selectedPaymentForTax, setSelectedPaymentForTax] = useState(null);

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

  // Requirements from claim data — normalized to match RequirementsTracker interface
  const requirements = useMemo(() => {
    if (!claim?.requirements?.length) return [];
    const now = new Date();
    return claim.requirements.map(req => ({
      ...req,
      level: req.isMandatory ? 'MANDATORY' : 'OPTIONAL',
      isSatisfied: () => req.status === RequirementStatus.SATISFIED,
      isMandatory: () => req.isMandatory === true,
      isOverdue: () =>
        !!req.dueDate &&
        new Date(req.dueDate) < now &&
        req.status !== RequirementStatus.SATISFIED,
    }));
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

  const handleViewPolicy = (policy) => {
    console.log('Viewing policy details:', policy.policyNumber);
    // TODO: Navigate to policy detail view
    // Example: navigate(`/policies/${policy.policyNumber}`);
    alert(`Viewing policy ${policy.policyNumber}\n\nThis would navigate to the Policy Detail View.`);
  };

  const handleConfirmPolicy = (policy) => {
    setConfirmedPolicies(prev => [
      ...prev.filter(p => p.policyNumber !== policy.policyNumber),
      { ...policy, associatedAt: new Date().toISOString(), associatedBy: 'Claims Handler' }
    ]);
    setDeniedPolicies(prev => prev.filter(p => p.policyNumber !== policy.policyNumber));
    // For ServiceNow: PATCH FNOL with associated_policies field or create child policy_association record
  };

  const handleDenyPolicy = (policy) => {
    setDeniedPolicies(prev => [
      ...prev.filter(p => p.policyNumber !== policy.policyNumber),
      { ...policy, deniedAt: new Date().toISOString() }
    ]);
    setConfirmedPolicies(prev => prev.filter(p => p.policyNumber !== policy.policyNumber));
  };

  const handleOpenTax = (paymentOrBeneficiary) => {
    setSelectedPaymentForTax(paymentOrBeneficiary);
    setShowTaxWithholding(true);
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

        {/* Claim Flags Bar */}
        <DxcContainer
          style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
          padding="var(--spacing-padding-m)"
        >
          <DxcFlex gap="var(--spacing-gap-xl)" alignItems="center" wrap="wrap">
            <DxcCheckbox
              label="Review for Client"
              checked={claimFlags.reviewForClient}
              onChange={v => setClaimFlags(f => ({ ...f, reviewForClient: v }))}
            />
            <DxcCheckbox
              label="High Priority Claim"
              checked={claimFlags.highPriority}
              onChange={v => setClaimFlags(f => ({ ...f, highPriority: v }))}
            />
            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
              <DxcTypography fontSize="font-scale-01">Secure Claim:</DxcTypography>
              <DxcSelect
                options={[
                  { label: 'Not a Secure Claim', value: 'Not a Secure Claim' },
                  { label: 'Secure', value: 'Secure' },
                ]}
                value={claimFlags.secureClaim}
                onChange={v => setClaimFlags(f => ({ ...f, secureClaim: v }))}
              />
            </DxcFlex>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
              # Policies Associated: {1 + confirmedPolicies.length}
            </DxcTypography>
          </DxcFlex>
        </DxcContainer>

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
                {/* Tab 0: Requirements */}
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

                {/* Tab 1: Documents */}
                <DxcTabs.Tab
                  label="Documents"
                  icon="folder"
                  active={activeTabIndex === 1}
                  onClick={() => {
                    setActiveTabIndex(1);
                    console.log('[ClaimDetail] Documents tab clicked, claim object:', claim);
                    console.log('[ClaimDetail] claim.sysId:', claim.sysId);
                    console.log('[ClaimDetail] claim.id:', claim.id);
                    console.log('[ClaimDetail] claim.source:', claim.source);
                  }}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    {(() => {
                      console.log('[ClaimDetail] Rendering DocumentUpload with claimId:', claimId);
                      console.log('[ClaimDetail] claim.claimNumber:', claim?.claimNumber);
                      console.log('[ClaimDetail] claim.fnolNumber:', claim?.fnolNumber);
                      return null;
                    })()}
                    {claim && claim.source === 'servicenow' ? (
                      <DocumentUpload
                        claimId={claimId}
                        tableName="x_dxcis_claims_a_0_claims_fnol"
                        tableSysId={claimId}
                        onUploadComplete={(result) => {
                          console.log('Upload complete:', result);
                        }}
                      />
                    ) : (
                      <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                        Document upload is only available for ServiceNow FNOL claims.
                      </DxcTypography>
                    )}
                  </div>
                </DxcTabs.Tab>

                {/* Tab 2: Policy Association */}
                <DxcTabs.Tab
                  label="Policy Association"
                  icon="account_tree"
                  active={activeTabIndex === 2}
                  onClick={() => setActiveTabIndex(2)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <PolicyAssociationTab
                      claim={claim}
                      confirmedPolicies={confirmedPolicies}
                    />
                  </div>
                </DxcTabs.Tab>

                {/* Tab 3: Beneficiaries */}
                <DxcTabs.Tab
                  label="Beneficiaries"
                  icon="people"
                  active={activeTabIndex === 3}
                  onClick={() => setActiveTabIndex(3)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <BeneficiariesTab
                      claim={claim}
                      confirmedPolicies={confirmedPolicies}
                    />
                  </div>
                </DxcTabs.Tab>

                {/* Tab 4: Adjudicate (NEW) */}
                <DxcTabs.Tab
                  label="Adjudicate"
                  icon="gavel"
                  active={activeTabIndex === 4}
                  onClick={() => setActiveTabIndex(4)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <AdjudicateTab
                      claim={claim}
                      confirmedPolicies={confirmedPolicies}
                      adjDecision={adjDecision}
                      setAdjDecision={setAdjDecision}
                      onOpenPMI={() => setShowPMICalculator(true)}
                    />
                  </div>
                </DxcTabs.Tab>

                {/* Tab 5: Payments & Interest (NEW) */}
                <DxcTabs.Tab
                  label="Payments & Interest"
                  icon="payments"
                  active={activeTabIndex === 5}
                  onClick={() => setActiveTabIndex(5)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <PaymentsTab
                      claim={claim}
                      onOpenPMI={() => setShowPMICalculator(true)}
                      onOpenTax={handleOpenTax}
                    />
                  </div>
                </DxcTabs.Tab>

                {/* Tab 6: Related Policies (shifted from 4) */}
                <DxcTabs.Tab
                  label="Related Policies"
                  icon="policy"
                  active={activeTabIndex === 6}
                  onClick={() => setActiveTabIndex(6)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <RelatedPoliciesPanel
                      claimData={claim}
                      onConfirmPolicy={handleConfirmPolicy}
                      onDenyPolicy={handleDenyPolicy}
                      onViewPolicy={handleViewPolicy}
                      confirmedPolicies={confirmedPolicies}
                      deniedPolicies={deniedPolicies}
                    />
                  </div>
                </DxcTabs.Tab>

                {/* Tab 7: Activity (shifted from 5) */}
                <DxcTabs.Tab
                  label="Activity"
                  icon="timeline"
                  active={activeTabIndex === 7}
                  onClick={() => setActiveTabIndex(7)}
                >
                  <div style={{ paddingTop: 'var(--spacing-padding-m)' }}>
                    <DxcTypography fontSize="font-scale-03">
                      Activity timeline (coming in Phase 5)
                    </DxcTypography>
                  </div>
                </DxcTabs.Tab>

                {/* Tab 8: Notes (shifted from 6) */}
                <DxcTabs.Tab
                  label="Notes"
                  icon="note"
                  active={activeTabIndex === 8}
                  onClick={() => setActiveTabIndex(8)}
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

            {/* Additional Claim Information */}
            <AdditionalClaimInfo claim={claim} />
          </DxcFlex>
        </DxcFlex>
      </DxcFlex>

      {/* PMI Calculator Dialog */}
      {showPMICalculator && (
        <DxcDialog isCloseVisible onCloseClick={() => setShowPMICalculator(false)}>
          <PMICalculator
            claimData={claim}
            onCalculate={(r) => console.log('PMI result:', r)}
            onApply={() => setShowPMICalculator(false)}
            onClose={() => setShowPMICalculator(false)}
          />
        </DxcDialog>
      )}

      {/* Tax Withholding Calculator Dialog */}
      {showTaxWithholding && (
        <DxcDialog isCloseVisible onCloseClick={() => setShowTaxWithholding(false)}>
          <TaxWithholdingCalculator
            claimData={claim}
            paymentData={selectedPaymentForTax}
            onApply={() => setShowTaxWithholding(false)}
            onClose={() => setShowTaxWithholding(false)}
          />
        </DxcDialog>
      )}
    </DxcContainer>
  );
};

export default ClaimDetail;
export { ClaimHeader, PolicyInformation, QuickActions };
