/**
 * ClaimPlaybook — Intelligent guided workflow for claim examiners
 *
 * Shows exactly what phase the claim is in, what has been completed,
 * what is outstanding, and action buttons that navigate directly to
 * the right tab.
 *
 * Supports two paths:
 *   - Standard: 6 phases (FNOL → Verify → Requirements → Assessment → Decision → Payment)
 *   - STP/Straight-Through: 5 phases (FNOL → STP Eval → Auto-Approval → Payment → Closed)
 */

import { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcChip,
  DxcDivider,
} from '@dxc-technology/halstack-react';
import { RoutingType, RequirementStatus } from '../../types/claim.types';

// ---------------------------------------------------------------------------
// Color constants (BLOOM design tokens)
// ---------------------------------------------------------------------------
const PHASE_COLOR = {
  completed: '#37A526',
  current:   '#0095FF',
  upcoming:  '#D1D3D4',
  denied:    '#D02E2E',
};

const CARD_BG = {
  completed: '#F4FAF1',
  current:   '#F0F7FF',
  upcoming:  'var(--color-bg-neutral-lightest)',
};

// ---------------------------------------------------------------------------
// Phase definitions
// ---------------------------------------------------------------------------
const PHASES_STANDARD = [
  { id: 'fnol',         label: 'FNOL & Intake',                  icon: 'assignment'      },
  { id: 'verify',       label: 'Death & Policy Verification',     icon: 'verified_user'   },
  { id: 'requirements', label: 'Requirements Collection',         icon: 'checklist'       },
  { id: 'assessment',   label: 'Assessment & Beneficiary Review', icon: 'manage_accounts' },
  { id: 'decision',     label: 'Decision',                        icon: 'gavel'           },
  { id: 'payment',      label: 'Payment & Close',                 icon: 'payments'        },
];

const PHASES_STP = [
  { id: 'fnol',     label: 'FNOL & Intake',          icon: 'assignment'  },
  { id: 'stp_eval', label: 'STP Eligibility Review', icon: 'flash_on'    },
  { id: 'approved', label: 'Auto-Approval',           icon: 'check_circle'},
  { id: 'payment',  label: 'Payment Processing',      icon: 'payments'    },
  { id: 'closed',   label: 'Closed',                  icon: 'lock'        },
];

// ---------------------------------------------------------------------------
// Status → phase index maps
// ---------------------------------------------------------------------------
const STATUS_TO_PHASE_STANDARD = {
  new:                   0,
  submitted:             0,
  under_review:          1,
  in_review:             1,
  pending_requirements:  2,
  suspended:             2,
  requirements_complete: 3,
  in_approval:           4,
  denied:                4,
  approved:              5,
  payment_scheduled:     5,
  payment_complete:      5,
  closed:                5,
};

const STATUS_TO_PHASE_STP = {
  new:              0,
  submitted:        0,
  under_review:     1,
  in_review:        1,
  denied:           1,
  approved:         2,
  payment_scheduled:3,
  payment_complete: 3,
  closed:           4,
};

// ---------------------------------------------------------------------------
// Core logic helpers
// ---------------------------------------------------------------------------
const getCurrentPhaseIndex = (claim) => {
  const isSTP = claim?.routing?.type === RoutingType.STP;
  const map = isSTP ? STATUS_TO_PHASE_STP : STATUS_TO_PHASE_STANDARD;
  return map[claim?.status] ?? 0;
};

const buildChecklistForPhase = (phaseIndex, claim, isSTP) => {
  const status = claim?.status ?? '';

  // ── Phase 0: FNOL & Intake (both paths) ────────────────────────────────
  if (phaseIndex === 0) {
    return [
      { label: 'Claim number assigned',  done: !!claim.claimNumber },
      { label: 'Insured identified',      done: !!claim.insured?.name },
      { label: 'Policy captured',         done: (claim.policies || []).length > 0 || !!claim.policy },
      { label: 'Death event recorded',    done: !!claim.deathEvent?.dateOfDeath },
      { label: 'Notifier captured',       done: (claim.parties || []).some(p => p.role?.toUpperCase() === 'NOTIFIER') },
    ];
  }

  // ── Phase 1 (Standard): Death & Policy Verification ────────────────────
  if (!isSTP && phaseIndex === 1) {
    const verScore = claim.routing?.verificationScore ?? 0;
    const policies = claim.policies || [];

    const hasDC = !!claim.deathEvent?.proofOfDeathDate || verScore > 0;
    const policyInForce = policies.some(p => {
      const s = (p.policyStatus || '').toLowerCase().replace(/_/g, ' ');
      return s === 'in force';
    });

    const items = [
      {
        label:   'Death certificate received',
        done:    hasDC,
        detail:  verScore > 0 ? `Score: ${verScore}%` : null,
        warning: verScore > 0 && verScore < 70 ? 'Confidence below 70% — manual review required' : null,
      },
      { label: 'Date of death verified', done: !!claim.deathEvent?.dateOfDeath },
      { label: 'Policy in-force at date of death', done: policyInForce },
    ];

    // Contestability — only include if both dates are available
    if (policies.length > 0 && policies[0].issueDate && claim.deathEvent?.dateOfDeath) {
      const issueDate = new Date(policies[0].issueDate);
      const dod = new Date(claim.deathEvent.dateOfDeath);
      const contestEnd = new Date(issueDate);
      contestEnd.setFullYear(contestEnd.getFullYear() + 2);
      items.push({ label: 'Contestability period cleared', done: dod > contestEnd });
    }

    return items;
  }

  // ── Phase 1 (STP): STP Eligibility Review ──────────────────────────────
  if (isSTP && phaseIndex === 1) {
    const criteria = claim.routing?.criteria || {};
    return [
      { label: 'Death verification confirmed',  done: !!criteria.deathVerification    },
      { label: 'Policy in-force confirmed',      done: !!criteria.policyInForce        },
      { label: 'Beneficiary match confirmed',    done: !!criteria.beneficiaryMatch     },
      { label: 'No contestability issues',       done: !!criteria.noContestability     },
      { label: 'Claim amount within threshold',  done: !!criteria.claimAmountThreshold },
      { label: 'No anomalies detected',          done: !!criteria.noAnomalies          },
    ];
  }

  // ── Phase 2 (Standard): Requirements Collection ────────────────────────
  if (!isSTP && phaseIndex === 2) {
    const mandatory = (claim.requirements || []).filter(r => r.isMandatory);
    if (mandatory.length === 0) {
      return [{ label: 'No mandatory requirements defined', done: true }];
    }
    const now = new Date();
    return mandatory.map(req => {
      const done = ['igo', 'satisfied', 'waived'].includes(req.status) ||
                   req.status === RequirementStatus.SATISFIED ||
                   req.status === RequirementStatus.WAIVED;
      const dueDate = req.dueDate ? new Date(req.dueDate) : null;
      const isOverdue = dueDate && dueDate < now && !done;
      return {
        label:   req.type || req.name || req.description || 'Requirement',
        done,
        detail:  dueDate ? `Due: ${dueDate.toLocaleDateString()}` : null,
        warning: isOverdue ? 'Overdue' : null,
      };
    });
  }

  // ── Phase 2 (STP): Auto-Approval ───────────────────────────────────────
  if (isSTP && phaseIndex === 2) {
    const autoApproved = ['approved', 'payment_scheduled', 'payment_complete', 'closed'].includes(status);
    return [
      { label: 'All STP criteria satisfied',  done: autoApproved },
      { label: 'Auto-approval processed',      done: autoApproved },
    ];
  }

  // ── Phase 3 (Standard): Assessment & Beneficiary Review ────────────────
  if (!isSTP && phaseIndex === 3) {
    const primaryBennies = (claim.beneficiaries || []).filter(b =>
      (b.type || b.relationship || b.beneficiaryType || '').toLowerCase().includes('primary')
    );
    const primaryVerified = primaryBennies.length > 0
      ? primaryBennies.every(b => b.verificationStatus === 'Verified')
      : false;
    const policiesConfirmed = (claim.policies || []).length > 0;
    const analysisComplete  = ['requirements_complete', 'in_approval'].includes(status);

    return [
      { label: 'Primary beneficiaries verified',  done: primaryVerified    },
      { label: 'Policy associations confirmed',    done: policiesConfirmed  },
      { label: 'Beneficiary analysis complete',    done: analysisComplete   },
    ];
  }

  // ── Phase 3 (STP): Payment Processing ──────────────────────────────────
  if (isSTP && phaseIndex === 3) {
    const payments = claim.financial?.payments || [];
    return [
      { label: 'Payment method confirmed',  done: payments.length > 0 },
      { label: 'Payment scheduled',         done: payments.some(p => ['scheduled', 'pending', 'completed'].includes(p.status)) },
      { label: 'Tax withholding calculated', done: claim.financial?.taxWithheld != null },
    ];
  }

  // ── Phase 4 (Standard): Decision ───────────────────────────────────────
  if (!isSTP && phaseIndex === 4) {
    const decisionStatuses = ['approved', 'denied', 'payment_scheduled', 'payment_complete', 'closed'];
    const decided = decisionStatuses.includes(status);
    return [
      { label: 'Decision entered',            done: decided },
      { label: 'Decision reason documented',  done: decided },
    ];
  }

  // ── Phase 4 (STP): Closed ──────────────────────────────────────────────
  if (isSTP && phaseIndex === 4) {
    return [
      { label: 'Claim closed', done: status === 'closed' },
    ];
  }

  // ── Phase 5 (Standard): Payment & Close ────────────────────────────────
  if (!isSTP && phaseIndex === 5) {
    const payments = claim.financial?.payments || [];
    return [
      { label: 'Payment method confirmed',   done: payments.length > 0 },
      { label: 'Payment scheduled',          done: payments.some(p => ['scheduled', 'pending', 'completed'].includes(p.status)) },
      { label: 'Tax withholding calculated', done: claim.financial?.taxWithheld != null },
    ];
  }

  return [];
};

// ---------------------------------------------------------------------------
// Action button definitions per phase
// ---------------------------------------------------------------------------
const getActionButtons = (phaseIndex, isSTP, onNavigateToTab, onAction) => {
  if (isSTP) {
    if (phaseIndex === 3) {
      return [
        { label: 'Manage Payments', onClick: () => onNavigateToTab(6), mode: 'primary' },
      ];
    }
    return [];
  }

  // Standard path
  switch (phaseIndex) {
    case 0: // FNOL — intake already complete for existing claims
      return [];
    case 1: // Verify
      return [
        { label: 'Review Related Policies', onClick: () => onNavigateToTab(7), mode: 'secondary' },
        { label: 'Check Requirements',      onClick: () => onNavigateToTab(1), mode: 'secondary' },
      ];
    case 2: // Requirements
      return [
        { label: 'Manage Requirements', onClick: () => onNavigateToTab(1), mode: 'primary'   },
        { label: 'Upload Documents',    onClick: () => onNavigateToTab(2), mode: 'secondary' },
      ];
    case 3: // Assessment
      return [
        { label: 'Review Beneficiaries', onClick: () => onNavigateToTab(4), mode: 'primary'   },
        { label: 'Confirm Policies',     onClick: () => onNavigateToTab(3), mode: 'secondary' },
        { label: 'Open Adjudication',    onClick: () => onNavigateToTab(5), mode: 'secondary' },
      ];
    case 4: // Decision
      return [
        { label: 'Approve Claim',     onClick: () => onAction('approve'), mode: 'primary'   },
        { label: 'Deny Claim',        onClick: () => onAction('deny'),    mode: 'secondary' },
        { label: 'Open Adjudication', onClick: () => onNavigateToTab(5), mode: 'secondary' },
      ];
    case 5: // Payment
      return [
        { label: 'Manage Payments', onClick: () => onNavigateToTab(6), mode: 'primary' },
      ];
    default:
      return [];
  }
};

// ---------------------------------------------------------------------------
// PlaybookStepper — horizontal stepper (larger version of ClaimLifecycleTracker)
// ---------------------------------------------------------------------------
const PlaybookStepper = ({ phases, currentIndex, isDenied }) => {
  const CIRCLE_SIZE = 28;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {phases.map((phase, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent   = i === currentIndex;
        const isUpcoming  = i > currentIndex;
        const isError     = isDenied && isCurrent;

        const circleColor = isError     ? PHASE_COLOR.denied
                          : isCompleted ? PHASE_COLOR.completed
                          : isCurrent   ? PHASE_COLOR.current
                          : 'transparent';

        const borderColor = isError     ? PHASE_COLOR.denied
                          : isCompleted ? PHASE_COLOR.completed
                          : isCurrent   ? PHASE_COLOR.current
                          : PHASE_COLOR.upcoming;

        const lineColor = i < currentIndex ? PHASE_COLOR.completed : PHASE_COLOR.upcoming;

        const labelColor = isCurrent   ? 'var(--color-fg-neutral-stronger)'
                         : isCompleted ? 'var(--color-fg-neutral-dark)'
                         : 'var(--color-fg-neutral-medium)';

        return (
          <div
            key={phase.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              flex: i < phases.length - 1 ? '1' : '0',
            }}
          >
            {/* Circle + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width:           CIRCLE_SIZE,
                height:          CIRCLE_SIZE,
                borderRadius:    '50%',
                backgroundColor: circleColor,
                border:          `2px solid ${borderColor}`,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                flexShrink:      0,
              }}>
                {isCompleted && (
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>✓</span>
                )}
                {isCurrent && (
                  <span className="material-icons" style={{ color: 'white', fontSize: '14px' }}>
                    {phase.icon}
                  </span>
                )}
                {isUpcoming && (
                  <span style={{ color: PHASE_COLOR.upcoming, fontSize: '11px', fontWeight: 600 }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <div style={{
                fontSize:    '10px',
                color:       labelColor,
                marginTop:   4,
                whiteSpace:  'nowrap',
                fontWeight:  isCurrent ? 700 : 400,
                letterSpacing: '0.2px',
                textAlign:   'center',
                maxWidth:    80,
                overflowWrap: 'break-word',
                whiteSpace:  'normal',
                lineHeight:  1.2,
              }}>
                {phase.label}
              </div>
            </div>

            {/* Connecting line (not after last step) */}
            {i < phases.length - 1 && (
              <div style={{
                flex:            1,
                height:          2,
                minWidth:        24,
                backgroundColor: lineColor,
                marginTop:       CIRCLE_SIZE / 2 - 1,
                alignSelf:       'flex-start',
                marginLeft:      4,
                marginRight:     4,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ChecklistItem — single checklist row
// ---------------------------------------------------------------------------
const ChecklistItem = ({ label, done, detail, warning }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 6 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Status circle */}
      <div style={{
        width:           18,
        height:          18,
        borderRadius:    '50%',
        backgroundColor: done ? PHASE_COLOR.completed : 'transparent',
        border:          `2px solid ${done ? PHASE_COLOR.completed : PHASE_COLOR.upcoming}`,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        flexShrink:      0,
      }}>
        {done && (
          <span style={{ color: 'white', fontSize: '10px', fontWeight: 700, lineHeight: 1 }}>✓</span>
        )}
      </div>

      {/* Label */}
      <span style={{
        fontSize:   '13px',
        fontWeight: done ? 400 : 600,
        color:      done ? 'var(--color-fg-neutral-medium)' : 'var(--color-fg-neutral-stronger)',
        flex:       1,
      }}>
        {label}
      </span>

      {/* Detail subtext inline */}
      {detail && (
        <span style={{ fontSize: '11px', color: 'var(--color-fg-neutral-medium)', whiteSpace: 'nowrap' }}>
          {detail}
        </span>
      )}
    </div>

    {/* Warning row */}
    {warning && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 26 }}>
        <span className="material-icons" style={{ fontSize: '13px', color: PHASE_COLOR.denied }}>warning</span>
        <span style={{ fontSize: '11px', color: PHASE_COLOR.denied }}>{warning}</span>
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// PhaseCard — expandable card for a single phase
// ---------------------------------------------------------------------------
const PhaseCard = ({
  phase,
  phaseIndex,
  state,        // 'completed' | 'current' | 'upcoming'
  checklist,
  actions,
  isDenied,
  isExpanded,
  onToggleExpand,
}) => {
  const doneCount  = checklist.filter(i => i.done).length;
  const totalCount = checklist.length;
  const allDone    = totalCount > 0 && doneCount === totalCount;

  const phaseColor = isDenied && state === 'current' ? PHASE_COLOR.denied
                   : state === 'completed'            ? PHASE_COLOR.completed
                   : state === 'current'              ? PHASE_COLOR.current
                   : PHASE_COLOR.upcoming;

  const bgColor    = state === 'completed' ? CARD_BG.completed
                   : state === 'current'   ? CARD_BG.current
                   : CARD_BG.upcoming;

  const showBody   = state === 'current' || (state === 'completed' && isExpanded);
  const canToggle  = state === 'completed';
  const opacity    = state === 'upcoming' ? 0.72 : 1;

  return (
    <div style={{
      border:       `2px solid #D1D3D4`,
      borderLeft:   `4px solid ${phaseColor}`,
      borderRadius: 8,
      boxShadow:    '0 2px 6px rgba(0,0,0,0.1)',
      backgroundColor: bgColor,
      opacity,
      overflow:     'hidden',
    }}>
      {/* Header */}
      <div
        onClick={canToggle ? onToggleExpand : undefined}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        10,
          padding:    '10px 14px',
          cursor:     canToggle ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Phase indicator circle */}
        <div style={{
          width:           24,
          height:          24,
          borderRadius:    '50%',
          backgroundColor: phaseColor,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,
        }}>
          {state === 'completed' && (
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>✓</span>
          )}
          {state === 'current' && (
            <span className="material-icons" style={{ color: 'white', fontSize: '12px' }}>{phase.icon}</span>
          )}
          {state === 'upcoming' && (
            <span style={{ color: 'white', fontSize: '10px', fontWeight: 600 }}>{phaseIndex + 1}</span>
          )}
        </div>

        {/* Phase label + subtitle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize:   '13px',
            fontWeight: 700,
            color:      state === 'upcoming' ? 'var(--color-fg-neutral-medium)' : 'var(--color-fg-neutral-stronger)',
            whiteSpace: 'nowrap',
            overflow:   'hidden',
            textOverflow: 'ellipsis',
          }}>
            {phase.label}
          </div>

          {state === 'current' && !isDenied && (
            <div style={{ fontSize: '11px', color: PHASE_COLOR.current, fontWeight: 500, marginTop: 1 }}>
              In Progress
            </div>
          )}
        </div>

        {/* Progress chip */}
        {state !== 'upcoming' && (
          <span style={{
            backgroundColor: allDone ? '#e6f7e6' : '#EEF2F7',
            color:           allDone ? PHASE_COLOR.completed : 'var(--color-fg-neutral-medium)',
            fontSize:        '11px',
            fontWeight:      600,
            borderRadius:    10,
            padding:         '2px 8px',
            whiteSpace:      'nowrap',
            border:          `1px solid ${allDone ? '#c3e8c0' : '#D1D3D4'}`,
          }}>
            {doneCount}/{totalCount}
          </span>
        )}

        {/* State badges */}
        {state === 'current' && allDone && !isDenied && (
          <span style={{
            backgroundColor: '#e6f7e6',
            color:           PHASE_COLOR.completed,
            fontSize:        '10px',
            fontWeight:      600,
            borderRadius:    10,
            padding:         '2px 8px',
            border:          `1px solid ${PHASE_COLOR.completed}`,
            whiteSpace:      'nowrap',
          }}>
            Ready to Advance
          </span>
        )}
        {state === 'current' && isDenied && (
          <span style={{
            backgroundColor: '#fdecea',
            color:           PHASE_COLOR.denied,
            fontSize:        '10px',
            fontWeight:      600,
            borderRadius:    10,
            padding:         '2px 8px',
            border:          `1px solid ${PHASE_COLOR.denied}`,
            whiteSpace:      'nowrap',
          }}>
            Denied
          </span>
        )}

        {/* Expand/collapse chevron for completed */}
        {canToggle && (
          <span className="material-icons" style={{
            fontSize: '16px',
            color:    'var(--color-fg-neutral-medium)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}>
            expand_more
          </span>
        )}
      </div>

      {/* Body — checklist + actions */}
      {showBody && (
        <div style={{ padding: '0 14px 12px 14px' }}>
          <div style={{
            height:          1,
            backgroundColor: '#D1D3D4',
            margin:          '0 0 10px 0',
            opacity:         0.5,
          }} />

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {checklist.map((item, idx) => (
              <ChecklistItem key={idx} {...item} />
            ))}
          </div>

          {/* Action buttons */}
          {actions.length > 0 && (
            <>
              <div style={{
                height:          1,
                backgroundColor: '#D1D3D4',
                margin:          '10px 0 10px 0',
                opacity:         0.5,
              }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {actions.map((action, idx) => (
                  <DxcButton
                    key={idx}
                    label={action.label}
                    mode={action.mode || 'secondary'}
                    size="small"
                    onClick={action.onClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ClaimPlaybook — main export
// ---------------------------------------------------------------------------
const ClaimPlaybook = ({ claim, onNavigateToTab, onAction }) => {
  const [expandedCompleted, setExpandedCompleted] = useState(new Set());

  if (!claim) {
    return (
      <DxcContainer padding="var(--spacing-padding-l)">
        <DxcTypography color="var(--color-fg-neutral-medium)">Loading playbook…</DxcTypography>
      </DxcContainer>
    );
  }

  const isSTP         = claim.routing?.type === RoutingType.STP;
  const phases        = isSTP ? PHASES_STP : PHASES_STANDARD;
  const currentIndex  = getCurrentPhaseIndex(claim);
  const isDenied      = claim.status === 'denied';
  const stpScore      = claim.routing?.stpScore ?? claim.routing?.score ?? null;

  const toggleExpand = (idx) => {
    setExpandedCompleted(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // Compute progress summary
  const allChecklists = phases.map((_, i) => buildChecklistForPhase(i, claim, isSTP));
  const totalItems    = allChecklists.reduce((s, c) => s + c.length, 0);
  const doneItems     = allChecklists.reduce((s, c) => s + c.filter(i => i.done).length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap-m)' }}>

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div style={{
        display:         'flex',
        alignItems:      'center',
        gap:             12,
        padding:         '12px 16px',
        backgroundColor: 'var(--color-bg-neutral-lightest)',
        borderRadius:    8,
        border:          '1px solid #D1D3D4',
        flexWrap:        'wrap',
      }}>
        <span className="material-icons" style={{ fontSize: '20px', color: PHASE_COLOR.current }}>map</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-fg-neutral-stronger)' }}>
            Claim Playbook
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-fg-neutral-medium)', marginTop: 1 }}>
            {isSTP ? 'Straight-Through Processing Path' : 'Standard Processing Path'}
          </div>
        </div>

        {/* Phase counter */}
        <span style={{
          backgroundColor: '#EEF2F7',
          color:           'var(--color-fg-neutral-darker)',
          fontSize:        '11px',
          fontWeight:      600,
          borderRadius:    10,
          padding:         '3px 10px',
          border:          '1px solid #D1D3D4',
          whiteSpace:      'nowrap',
        }}>
          Phase {currentIndex + 1} of {phases.length}
        </span>

        {/* Overall progress chip */}
        <span style={{
          backgroundColor: doneItems === totalItems ? '#e6f7e6' : '#EEF2F7',
          color:           doneItems === totalItems ? PHASE_COLOR.completed : 'var(--color-fg-neutral-medium)',
          fontSize:        '11px',
          fontWeight:      600,
          borderRadius:    10,
          padding:         '3px 10px',
          border:          `1px solid ${doneItems === totalItems ? '#c3e8c0' : '#D1D3D4'}`,
          whiteSpace:      'nowrap',
        }}>
          {doneItems}/{totalItems} complete
        </span>

        {/* STP score */}
        {isSTP && stpScore != null && (
          <span style={{
            backgroundColor: stpScore >= 80 ? '#e6f7e6' : stpScore >= 60 ? '#fff8e1' : '#fdecea',
            color:           stpScore >= 80 ? PHASE_COLOR.completed : stpScore >= 60 ? '#856404' : PHASE_COLOR.denied,
            fontSize:        '11px',
            fontWeight:      700,
            borderRadius:    10,
            padding:         '3px 10px',
            border:          '1px solid #D1D3D4',
            whiteSpace:      'nowrap',
          }}>
            STP Score: {stpScore}%
          </span>
        )}

        {/* Path badge */}
        {isSTP && (
          <span style={{
            backgroundColor: '#e8f4fe',
            color:           PHASE_COLOR.current,
            fontSize:        '10px',
            fontWeight:      700,
            borderRadius:    10,
            padding:         '3px 10px',
            border:          `1px solid ${PHASE_COLOR.current}`,
            textTransform:   'uppercase',
            letterSpacing:   '0.5px',
            whiteSpace:      'nowrap',
          }}>
            ⚡ STP
          </span>
        )}
      </div>

      {/* ── Horizontal stepper ─────────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--color-bg-neutral-lightest)',
        borderRadius:    8,
        border:          '1px solid #D1D3D4',
        padding:         '16px 20px',
      }}>
        <PlaybookStepper
          phases={phases}
          currentIndex={currentIndex}
          isDenied={isDenied}
        />
      </div>

      {/* ── Phase cards ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {phases.map((phase, i) => {
          const state = i < currentIndex ? 'completed'
                      : i === currentIndex ? 'current'
                      : 'upcoming';

          const checklist = buildChecklistForPhase(i, claim, isSTP);
          const actions   = getActionButtons(i, isSTP, onNavigateToTab, onAction);

          return (
            <PhaseCard
              key={phase.id}
              phase={phase}
              phaseIndex={i}
              state={state}
              checklist={checklist}
              actions={actions}
              isDenied={isDenied && state === 'current'}
              isExpanded={expandedCompleted.has(i)}
              onToggleExpand={() => toggleExpand(i)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ClaimPlaybook;
