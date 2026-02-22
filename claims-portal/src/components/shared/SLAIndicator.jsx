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
  showCountdown = true,
  claimStatus = null,
  compact = false
}) => {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [status, setStatus] = useState('on-track');

  // Check if claim is closed/denied
  const isClosed = claimStatus === 'closed' || claimStatus === 'denied' || claimStatus === 'approved';

  useEffect(() => {
    if (!slaDate) return;

    // If claim is closed, show completed state
    if (isClosed) {
      setDaysRemaining(0);
      setHoursRemaining(0);
      setStatus('closed');
      return;
    }

    const calculateRemaining = () => {
      const now = new Date();
      const sla = new Date(slaDate);
      const diff = sla - now;

      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setDaysRemaining(days);
      setHoursRemaining(hours);

      // Determine status
      if (days < 0) {
        setStatus('overdue');
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
  }, [slaDate, isClosed]);

  // Get color based on status
  const getColor = () => {
    switch (status) {
      case 'closed':
        return '#666666';
      case 'overdue':
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
      case 'closed':
        return 'check_circle';
      case 'overdue':
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

  // Compact mode for dashboard cards
  if (compact) {
    if (isClosed) {
      return (
        <DxcFlex gap="0.25rem" alignItems="center">
          <span className="material-icons" style={{ color: '#666666', fontSize: '16px' }}>
            check_circle
          </span>
          <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM: Data values black */ fontWeight={600}>
            Closed
          </DxcTypography>
        </DxcFlex>
      );
    }

    return (
      <DxcFlex gap="0.25rem" alignItems="center">
        <span className="material-icons" style={{ color: getColor(), fontSize: '16px' }}>
          {getIcon()}
        </span>
        <DxcTypography fontSize="font-scale-01" color="#000000" fontWeight={600}>
          {status === 'overdue'
            ? `SLA Overdue ${Math.abs(daysRemaining)}d`
            : status === 'critical'
            ? `SLA Critical ${daysRemaining}d`
            : status === 'at-risk'
            ? `SLA At Risk ${daysRemaining}d`
            : `${daysRemaining}d remaining`
          }
        </DxcTypography>
      </DxcFlex>
    );
  }

  // Calculate progress percentage
  const progressPercent = Math.min(100, Math.max(0, (daysOpen / slaDays) * 100));

  // Closed claim state - full display
  if (isClosed) {
    return (
      <DxcFlex direction="column" gap="0.5rem" style={{ width: '100%' }}>
        <DxcFlex gap="0.5rem" alignItems="center" justifyContent="space-between">
          <DxcFlex gap="0.5rem" alignItems="center">
            <span className="material-icons" style={{ color: '#666666', fontSize: '20px' }}>
              check_circle
            </span>
            <DxcTypography fontSize="font-scale-02" fontWeight={600} color="#000000" /* BLOOM: Data values black */>
              Closed
            </DxcTypography>
          </DxcFlex>
          {showCountdown && (
            <DxcTypography fontSize="font-scale-01" color="#000000">
              Completed
            </DxcTypography>
          )}
        </DxcFlex>
        {showProgress && (
          <DxcFlex direction="column" gap="0.25rem">
            <DxcProgressBar value={100} showValue={false} />
            <DxcFlex justifyContent="space-between">
              <DxcTypography fontSize="font-scale-01" color="#000000">
                Completed in {daysOpen} days
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="#000000">
                {routing === 'fasttrack' ? 'STP SLA: ≤10 days' : 'Standard SLA'}
              </DxcTypography>
            </DxcFlex>
          </DxcFlex>
        )}
      </DxcFlex>
    );
  }

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
            fontWeight={600}
            color="#000000"
          >
            {status === 'overdue' && 'SLA Overdue'}
            {status === 'critical' && 'SLA Critical'}
            {status === 'at-risk' && 'SLA At Risk'}
            {status === 'on-track' && 'On Track'}
          </DxcTypography>
        </DxcFlex>

        {showCountdown && (
          <DxcTypography fontSize="font-scale-01" color="#000000">
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
            <DxcTypography fontSize="font-scale-01" color="#000000">
              Day {daysOpen} of {slaDays}
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="#000000">
              {routing === 'fasttrack' ? 'STP SLA: ≤10 days' : 'Standard SLA'}
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
export const SLACountdownCompact = ({ daysRemaining, status = 'on-track', claimStatus = null }) => {
  const isClosed = claimStatus === 'closed' || claimStatus === 'denied' || claimStatus === 'approved';

  if (isClosed) {
    return (
      <DxcFlex gap="0.25rem" alignItems="center">
        <span className="material-icons" style={{ color: '#666666', fontSize: '16px' }}>
          check_circle
        </span>
        <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM: Data values black */ fontWeight={600}>
          Closed
        </DxcTypography>
      </DxcFlex>
    );
  }

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
        color="#000000"
        fontWeight={600}
      >
        {daysRemaining >= 0 ? `${daysRemaining}d` : `Overdue ${Math.abs(daysRemaining)}d`}
      </DxcTypography>
    </DxcFlex>
  );
};

export default SLAIndicator;
