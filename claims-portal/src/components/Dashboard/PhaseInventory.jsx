/**
 * Phase Inventory Component
 * Displays inventory broken out by phase with open case counts
 */

import { DxcFlex, DxcContainer, DxcTypography, DxcBadge } from '@dxc-technology/halstack-react';
import { ClaimStatus } from '../../types/claim.types';

const PhaseInventory = ({ claims, user, onPhaseClick, selectedPhase }) => {
  // Calculate phase counts
  const phases = [
    {
      key: 'new_fnol',
      label: 'New FNOL',
      description: 'Newly assigned claims not yet touched or triaged',
      statuses: [ClaimStatus.NEW, ClaimStatus.SUBMITTED],
      icon: 'fiber_new',
      color: '#1b75bb'
    },
    {
      key: 'waiting_requirements',
      label: 'Waiting on Requirements',
      description: 'Claims pending claimant/beneficiary documentation',
      statuses: [ClaimStatus.PENDING_REQUIREMENTS],
      icon: 'description',
      color: '#ffa500'
    },
    {
      key: 'manual_followup',
      label: 'Manual Follow-Up Required',
      description: 'Claims requiring outbound follow-up activity',
      statuses: [ClaimStatus.UNDER_REVIEW],
      icon: 'contact_mail',
      color: '#d02e2e'
    },
    {
      key: 'mail_received',
      label: 'Mail Received – Needs Review',
      description: 'Mail indexed/received but not yet reviewed',
      statuses: [ClaimStatus.REQUIREMENTS_COMPLETE],
      icon: 'mark_email_unread',
      color: '#7b2cbf'
    },
    {
      key: 'waiting_other',
      label: 'Waiting on Other',
      description: 'Claims pending internal/external dependency',
      statuses: [ClaimStatus.SUSPENDED],
      icon: 'hourglass_empty',
      color: '#6c757d'
    },
    {
      key: 'quality_review',
      label: 'Quality Review',
      description: 'Claims in quality audit or post-processing validation',
      statuses: [ClaimStatus.IN_REVIEW],
      icon: 'fact_check',
      color: '#37a526'
    },
    {
      key: 'manager_review',
      label: 'Manager Review',
      description: 'Claims pending approval, escalation, or manager decision',
      statuses: [ClaimStatus.IN_APPROVAL],
      icon: 'supervisor_account',
      color: '#00adee'
    }
  ];

  // Calculate counts for each phase
  const phaseCounts = phases.map(phase => {
    const count = claims?.filter(c => {
      const isInPhase = phase.statuses.includes(c.status);
      const isOpen = c.status !== ClaimStatus.CLOSED && c.status !== ClaimStatus.DENIED;

      // If user context exists, filter by assignment
      if (user) {
        const isAssignedToUser = !c.assignedTo || c.assignedTo === user.name || c.assignedTo === user.id;
        return isInPhase && isOpen && isAssignedToUser;
      }

      return isInPhase && isOpen;
    }).length || 0;

    return {
      ...phase,
      count
    };
  });

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{
        backgroundColor: 'var(--color-bg-neutral-lightest)',
        borderRadius: 'var(--border-radius-m)',
        boxShadow: 'var(--shadow-mid-04)'
      }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Section Title */}
        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
          Inventory by Phase
        </DxcTypography>

        {/* Compact Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000000', textAlign: 'left' }}>
                <th style={{
                  padding: '8px 12px',
                  color: 'var(--color-fg-neutral-stronger)',
                  fontWeight: 600,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Phase
                </th>
                <th style={{
                  padding: '8px 12px',
                  color: 'var(--color-fg-neutral-stronger)',
                  fontWeight: 600,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Description
                </th>
                <th style={{
                  padding: '8px 12px',
                  color: 'var(--color-fg-neutral-stronger)',
                  fontWeight: 600,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  width: '100px'
                }}>
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {phaseCounts.map((phase, index) => (
                <tr
                  key={phase.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${phase.count} claims in ${phase.label} phase`}
                  onClick={() => onPhaseClick && onPhaseClick(phase)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPhaseClick && onPhaseClick(phase);
                    }
                  }}
                  style={{
                    borderBottom: '1px solid var(--border-color-neutral-lighter)',
                    backgroundColor: selectedPhase?.key === phase.key
                      ? 'var(--color-bg-info-lighter)'
                      : index % 2 === 0
                      ? 'var(--color-bg-neutral-lightest)'
                      : 'var(--color-bg-neutral-lighter)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPhase?.key !== phase.key) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-neutral-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPhase?.key !== phase.key) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0
                        ? 'var(--color-bg-neutral-lightest)'
                        : 'var(--color-bg-neutral-lighter)';
                    }
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: '18px', color: phase.color }}>
                        {phase.icon}
                      </span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                        {phase.label}
                      </DxcTypography>
                    </DxcFlex>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                      {phase.description}
                    </DxcTypography>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <DxcBadge
                      label={phase.count.toString()}
                      mode="notification"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DxcFlex>
    </DxcContainer>
  );
};

export default PhaseInventory;
