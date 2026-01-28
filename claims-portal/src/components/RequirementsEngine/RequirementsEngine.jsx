import { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcChip,
  DxcDivider,
  DxcInset,
  DxcAccordion
} from '@dxc-technology/halstack-react';
import './RequirementsEngine.css';

/**
 * SA-006: Requirements Engine
 *
 * 3-level hierarchical requirements management:
 * - Claim Level (applies to entire claim)
 * - Policy Level (per policy)
 * - Party Level (per beneficiary/party)
 *
 * Features:
 * - IGO/NIGO workflow
 * - Decision table execution
 * - Letter generation (delta-only)
 * - Document association
 * - Status tracking
 */
const RequirementsEngine = ({ claim, onGenerateRequirements, onGenerateLetter, onUploadDocument, onWaive, onClose }) => {
  const [expandedLevels, setExpandedLevels] = useState({
    claim: true,
    policy: true,
    party: true
  });

  if (!claim) {
    return null;
  }

  const requirements = claim.requirements || [];

  // Group requirements by level
  const claimLevelReqs = requirements.filter(r => r.level === 'claim' || !r.level);
  const policyLevelReqs = requirements.filter(r => r.level === 'policy');
  const partyLevelReqs = requirements.filter(r => r.level === 'party');

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'SATISFIED' || statusUpper === 'IGO') return 'var(--color-fg-success-medium)';
    if (statusUpper === 'IN_REVIEW' || statusUpper === 'PENDING') return 'var(--color-fg-warning-medium)';
    if (statusUpper === 'NIGO' || statusUpper === 'NOT_SATISFIED') return 'var(--color-fg-error-medium)';
    if (statusUpper === 'WAIVED') return 'var(--color-fg-neutral-strong)';
    return 'var(--color-fg-neutral-dark)';
  };

  const getStatusBadge = (status) => {
    return status || 'Pending';
  };

  const getRequirementIcon = (type) => {
    const typeUpper = (type || '').toUpperCase();
    if (typeUpper.includes('DEATH') || typeUpper.includes('CERTIFICATE')) return 'description';
    if (typeUpper.includes('IDENTITY') || typeUpper.includes('ID')) return 'badge';
    if (typeUpper.includes('STATEMENT') || typeUpper.includes('CLAIM')) return 'assignment';
    if (typeUpper.includes('MEDICAL') || typeUpper.includes('PHYSICIAN')) return 'local_hospital';
    return 'task';
  };

  const totalRequirements = requirements.length;
  const satisfiedRequirements = requirements.filter(r => r.status === 'SATISFIED').length;
  const nigoRequirements = requirements.filter(r => r.status === 'NIGO').length;
  const pendingRequirements = requirements.filter(r => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;

  const renderRequirement = (req, index) => (
    <DxcContainer
      key={req.id || index}
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        {/* Requirement Header */}
        <DxcFlex justifyContent="space-between" alignItems="flex-start">
          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
            <span className="material-icons" style={{ fontSize: '24px', color: getStatusColor(req.status) }}>
              {getRequirementIcon(req.type)}
            </span>
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                {req.name}
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                {req.description}
              </DxcTypography>
            </DxcFlex>
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <DxcBadge label={getStatusBadge(req.status)} />
            {req.isMandatory && (
              <DxcChip label="Mandatory" size="small" />
            )}
          </DxcFlex>
        </DxcFlex>

        {/* Requirement Details */}
        <div className="requirement-details-grid">
          {req.dueDate && (
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                Due Date
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01">
                {new Date(req.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
              </DxcTypography>
            </DxcFlex>
          )}

          {req.satisfiedDate && (
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                Satisfied Date
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01">
                {new Date(req.satisfiedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
              </DxcTypography>
            </DxcFlex>
          )}

          {req.documents && req.documents.length > 0 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                Documents
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01">
                {req.documents.length} attached
              </DxcTypography>
            </DxcFlex>
          )}

          {req.metadata?.confidenceScore && (
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                IDP Confidence
              </DxcTypography>
              <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                  {Math.round(req.metadata.confidenceScore * 100)}%
                </DxcTypography>
                {req.metadata.confidenceScore >= 0.9 && (
                  <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-success-medium)' }}>
                    verified
                  </span>
                )}
              </DxcFlex>
            </DxcFlex>
          )}
        </div>

        {/* Requirement Actions */}
        <DxcFlex gap="var(--spacing-gap-s)">
          {onUploadDocument && req.status !== 'SATISFIED' && req.status !== 'WAIVED' && (
            <DxcButton
              label="Upload Document"
              mode="tertiary"
              size="small"
              icon="upload_file"
              onClick={() => onUploadDocument(req)}
            />
          )}
          {onWaive && req.status !== 'SATISFIED' && req.status !== 'WAIVED' && !req.isMandatory && (
            <DxcButton
              label="Waive"
              mode="tertiary"
              size="small"
              icon="cancel"
              onClick={() => onWaive(req)}
            />
          )}
          {req.metadata?.reason && (
            <DxcChip
              label={req.metadata.reason}
              size="small"
              icon="info"
            />
          )}
        </DxcFlex>
      </DxcFlex>
    </DxcContainer>
  );

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '24px' }}>
              checklist
            </span>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
              Requirements Engine
            </DxcTypography>
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-s)">
            {onGenerateRequirements && (
              <DxcButton
                label="Generate Requirements"
                mode="secondary"
                size="small"
                icon="auto_awesome"
                onClick={onGenerateRequirements}
              />
            )}
            {onGenerateLetter && nigoRequirements > 0 && (
              <DxcButton
                label="Generate Letter (Delta Only)"
                mode="secondary"
                size="small"
                icon="mail"
                onClick={onGenerateLetter}
              />
            )}
            {onClose && (
              <DxcButton
                mode="tertiary"
                icon="close"
                onClick={onClose}
              />
            )}
          </DxcFlex>
        </DxcFlex>

        {/* Requirements Summary */}
        <div className="requirements-summary-grid">
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-info-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                TOTAL REQUIREMENTS
              </DxcTypography>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-info-medium)">
                {totalRequirements}
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>

          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-success-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                SATISFIED (IGO)
              </DxcTypography>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)">
                {satisfiedRequirements}
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>

          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-warning-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                PENDING
              </DxcTypography>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                {pendingRequirements}
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>

          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-error-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                NOT GOOD (NIGO)
              </DxcTypography>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                {nigoRequirements}
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>
        </div>

        <DxcDivider />

        {/* Claim Level Requirements */}
        {claimLevelReqs.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '20px', color: 'var(--color-fg-primary-stronger)' }}>
                description
              </span>
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                Claim Level Requirements
              </DxcTypography>
              <DxcChip label={`${claimLevelReqs.length}`} size="small" />
            </DxcFlex>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              {claimLevelReqs.map((req, index) => renderRequirement(req, index))}
            </DxcFlex>
          </DxcFlex>
        )}

        {/* Policy Level Requirements */}
        {policyLevelReqs.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '20px', color: 'var(--color-fg-primary-stronger)' }}>
                policy
              </span>
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                Policy Level Requirements
              </DxcTypography>
              <DxcChip label={`${policyLevelReqs.length}`} size="small" />
            </DxcFlex>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              {policyLevelReqs.map((req, index) => renderRequirement(req, index))}
            </DxcFlex>
          </DxcFlex>
        )}

        {/* Party Level Requirements */}
        {partyLevelReqs.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '20px', color: 'var(--color-fg-primary-stronger)' }}>
                people
              </span>
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                Party Level Requirements
              </DxcTypography>
              <DxcChip label={`${partyLevelReqs.length}`} size="small" />
            </DxcFlex>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              {partyLevelReqs.map((req, index) => renderRequirement(req, index))}
            </DxcFlex>
          </DxcFlex>
        )}

        {/* Empty State */}
        {requirements.length === 0 && (
          <DxcInset>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-neutral-stronger)' }}>
                checklist_rtl
              </span>
              <DxcTypography color="var(--color-fg-neutral-strong)">
                No requirements generated yet
              </DxcTypography>
              {onGenerateRequirements && (
                <DxcButton
                  label="Generate Requirements"
                  mode="primary"
                  size="small"
                  icon="auto_awesome"
                  onClick={onGenerateRequirements}
                />
              )}
            </DxcFlex>
          </DxcInset>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default RequirementsEngine;
