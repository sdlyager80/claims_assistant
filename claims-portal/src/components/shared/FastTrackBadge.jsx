/**
 * FastTrack Badge Component
 * Displays FastTrack eligibility status with visual indicator
 */

import { DxcBadge, DxcFlex, DxcTypography } from '@dxc-technology/halstack-react';
import { RoutingType } from '../../types/claim.types';

const FastTrackBadge = ({
  routing,
  eligible = null,
  showLabel = true,
  size = 'medium',
  showIcon = true
}) => {
  // Determine if FastTrack
  const isFastTrack = routing === RoutingType.FASTTRACK ||
                      (eligible !== null && eligible === true);

  if (!isFastTrack && eligible === false) {
    // Not FastTrack eligible - show standard badge
    return showLabel ? (
      <DxcBadge
        label="Standard"
        size={size}
      />
    ) : null;
  }

  if (!isFastTrack) {
    // No routing info - don't show badge
    return null;
  }

  // FastTrack badge with icon
  return (
    <DxcFlex gap="0.5rem" alignItems="center">
      {showIcon && (
        <span
          className="material-icons"
          style={{
            color: '#0095FF',
            fontSize: size === 'small' ? '16px' : '20px'
          }}
        >
          flash_on
        </span>
      )}
      {showLabel && (
        <DxcBadge
          label="FastTrack"
          size={size}
        />
      )}
    </DxcFlex>
  );
};

/**
 * FastTrack Eligibility Indicator
 * Shows eligibility with confidence score
 */
export const FastTrackEligibilityIndicator = ({ eligibility }) => {
  if (!eligibility) return null;

  const { eligible, confidence, reason } = eligibility;

  return (
    <DxcFlex direction="column" gap="0.5rem">
      <DxcFlex gap="0.5rem" alignItems="center">
        <FastTrackBadge eligible={eligible} />
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
          Confidence: {confidence}%
        </DxcTypography>
      </DxcFlex>
      {reason && (
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
          {reason}
        </DxcTypography>
      )}
    </DxcFlex>
  );
};

export default FastTrackBadge;
