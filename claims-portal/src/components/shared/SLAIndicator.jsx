/**
 * SLA Indicator Component
 * Displays SLA status with countdown and visual alerts
 */

import { DxcFlex, DxcTypography, DxcProgressBar } from '@dxc-technology/halstack-react';
import { useState, useEffect } from 'react';

const SLAIndicator = ({
  slaDate,
  daysOpen = 0,
  slaDays = 10,
  routing = 'standard',
  showProgress = true,
  showCountdown = true
}) => {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [status, setStatus] = useState('on-track');

  useEffect(() => {
    if (!slaDate) return;

    const calculateRemaining = () => {
      const now = new Date();
      const sla = new Date(slaDate);
      const diff = sla - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setDaysRemaining(days);
      setHoursRemaining(hours);

      // Determine status
      if (days < 0) {
        setStatus('breached');
      } else if (days <= 1) {
        setStatus('critical');
      } else if (days <= 3) {
        setStatus('at-risk');
      } else {
        setStatus('on-track');
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [slaDate]);

  // Get color based on status
  const getColor = () => {
    switch (status) {
      case 'breached':
        return '#D0021B';
      case 'critical':
        return '#FF6B00';
      case 'at-risk':
        return '#FFCC00';
      case 'on-track':
        return '#24A148';
      default:
        return '#666666';
    }
  };

  // Get icon based on status
  const getIcon = () => {
    switch (status) {
      case 'breached':
        return 'error';
      case 'critical':
        return 'warning';
      case 'at-risk':
        return 'schedule';
      case 'on-track':
        return 'check_circle';
      default:
        return 'schedule';
    }
  };

  // Calculate progress percentage
  const progressPercent = Math.min(100, Math.max(0, (daysOpen / slaDays) * 100));

  return (
    <DxcFlex direction="column" gap="0.5rem" style={{ width: '100%' }}>
      {/* Status and Countdown */}
      <DxcFlex gap="0.5rem" alignItems="center" justifyContent="space-between">
        <DxcFlex gap="0.5rem" alignItems="center">
          <span
            className="material-icons"
            style={{
              color: getColor(),
              fontSize: '20px'
            }}
          >
            {getIcon()}
          </span>
          <DxcTypography
            fontSize="font-scale-02"
            fontWeight="600"
            color={getColor()}
          >
            {status === 'breached' && 'SLA Breached'}
            {status === 'critical' && 'SLA Critical'}
            {status === 'at-risk' && 'SLA At Risk'}
            {status === 'on-track' && 'On Track'}
          </DxcTypography>
        </DxcFlex>

        {showCountdown && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
            {daysRemaining >= 0 ? (
              <>
                {daysRemaining}d {hoursRemaining}h remaining
              </>
            ) : (
              <>Overdue by {Math.abs(daysRemaining)} days</>
            )}
          </DxcTypography>
        )}
      </DxcFlex>

      {/* Progress Bar */}
      {showProgress && (
        <DxcFlex direction="column" gap="0.25rem">
          <DxcProgressBar
            value={progressPercent}
            showValue={false}
          />
          <DxcFlex justifyContent="space-between">
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
              Day {daysOpen} of {slaDays}
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
              {routing === 'fasttrack' ? 'FastTrack SLA: ≤10 days' : 'Standard SLA'}
            </DxcTypography>
          </DxcFlex>
        </DxcFlex>
      )}
    </DxcFlex>
  );
};

/**
 * SLA Countdown Compact
 * Compact version for list views
 */
export const SLACountdownCompact = ({ daysRemaining, status = 'on-track' }) => {
  const getColor = () => {
    if (daysRemaining < 0) return '#D0021B';
    if (daysRemaining <= 1) return '#FF6B00';
    if (daysRemaining <= 3) return '#FFCC00';
    return '#24A148';
  };

  return (
    <DxcFlex gap="0.25rem" alignItems="center">
      <span
        className="material-icons"
        style={{
          color: getColor(),
          fontSize: '16px'
        }}
      >
        schedule
      </span>
      <DxcTypography
        fontSize="font-scale-01"
        color={getColor()}
        fontWeight="600"
      >
        {daysRemaining >= 0 ? `${daysRemaining}d` : `Overdue ${Math.abs(daysRemaining)}d`}
      </DxcTypography>
    </DxcFlex>
  );
};

export default SLAIndicator;
