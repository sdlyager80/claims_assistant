/**
 * STP Badge Component
 * Displays STP (Straight Through Processing) eligibility status with visual indicator
 */

import { DxcBadge, DxcFlex, DxcTypography } from '@dxc-technology/halstack-react';
import { RoutingType } from '../../types/claim.types';

const STPBadge = ({
  routing,
  eligible = null,
  showLabel = true,
  size = 'medium',
  showIcon = true,
  label = 'STP'
}) => {
  // Determine if STP
  const isSTP = routing === RoutingType.STP ||
                (eligible !== null && eligible === true);

  if (!isSTP && eligible === false) {
    // Not STP eligible - show standard badge
    return showLabel ? (
      <DxcBadge
        label="Standard"
        size={size}
      />
    ) : null;
  }

  if (!isSTP) {
    // No routing info - don't show badge
    return null;
  }

  // STP badge with icon
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
          label={label}
          size={size}
        />
      )}
    </DxcFlex>
  );
};

/**
 * STP Eligibility Indicator
 * Shows eligibility with confidence score
 */
export const STPEligibilityIndicator = ({ eligibility }) => {
  if (!eligibility) return null;

  const { eligible, confidence, reason } = eligibility;

  return (
    <DxcFlex direction="column" gap="0.5rem">
      <DxcFlex gap="0.5rem" alignItems="center">
        <STPBadge eligible={eligible} />
        <DxcTypography fontSize="font-scale-01" color="#000000">
          Confidence: {confidence}%
        </DxcTypography>
      </DxcFlex>
      {reason && (
        <DxcTypography fontSize="font-scale-01" color="#000000">
          {reason}
        </DxcTypography>
      )}
    </DxcFlex>
  );
};

export default STPBadge;
