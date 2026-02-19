/**
 * ClaimLifecycleTracker — "Pizza Tracker"
 *
 * Horizontal step indicator showing what stage of the claim lifecycle
 * a claim has reached. Adapts to STP vs standard routing.
 */

const STEPS_STANDARD = [
  { key: 'fnol',         label: 'FNOL'         },
  { key: 'review',       label: 'Review'       },
  { key: 'requirements', label: 'Requirements' },
  { key: 'assessment',   label: 'Assessment'   },
  { key: 'decision',     label: 'Decision'     },
  { key: 'closed',       label: 'Closed'       },
];

const STEPS_STP = [
  { key: 'fnol',     label: 'FNOL'     },
  { key: 'stp',      label: 'STP Eval' },
  { key: 'approved', label: 'Approved' },
  { key: 'payment',  label: 'Payment'  },
  { key: 'closed',   label: 'Closed'   },
];

const getActiveStep = (status, isSTP) => {
  if (isSTP) {
    const map = {
      new: 0, submitted: 0,
      under_review: 1, in_review: 1,
      approved: 2,
      payment_scheduled: 3, payment_complete: 3,
      closed: 4, denied: 4,
    };
    return map[status] ?? 0;
  }
  const map = {
    new: 0, submitted: 0,
    under_review: 1, in_review: 1,
    pending_requirements: 2,
    requirements_complete: 3, in_approval: 3,
    approved: 4, denied: 4,
    closed: 5, payment_complete: 5,
  };
  return map[status] ?? 0;
};

const ClaimLifecycleTracker = ({ status, routing, compact = false }) => {
  const isSTP = routing === 'fasttrack';
  const isDenied = status === 'denied';
  const steps = isSTP ? STEPS_STP : STEPS_STANDARD;
  const activeStep = getActiveStep(status, isSTP);

  const circleSize = compact ? 14 : 18;
  const innerSize  = compact ? 5  : 6;
  const fontSize   = compact ? '8px' : '9px';
  const lineMin    = compact ? 12 : 20;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {steps.map((step, i) => {
        const isCompleted = i < activeStep;
        const isCurrent   = i === activeStep;
        const isError     = isDenied && i === activeStep;

        const fillColor   = isError     ? 'var(--color-fg-error-medium)'
                          : isCompleted ? 'var(--color-fg-secondary-medium)'
                          : isCurrent   ? 'var(--color-fg-secondary-medium)'
                          : 'transparent';

        const borderColor = isError     ? 'var(--color-fg-error-medium)'
                          : isCompleted || isCurrent ? 'var(--color-fg-secondary-medium)'
                          : 'var(--color-fg-neutral-medium)';

        const lineColor   = i < activeStep
                          ? 'var(--color-fg-secondary-medium)'
                          : 'var(--color-fg-neutral-lighter)';

        const labelColor  = isCurrent   ? 'var(--color-fg-neutral-stronger)'
                          : isCompleted ? 'var(--color-fg-neutral-dark)'
                          : 'var(--color-fg-neutral-medium)';

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', flex: i < steps.length - 1 ? '1' : '0' }}>
            {/* Step circle + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: circleSize, height: circleSize, borderRadius: '50%',
                backgroundColor: fillColor,
                border: `2px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isCompleted && (
                  <span style={{ color: 'white', fontSize: compact ? '8px' : '10px', lineHeight: 1, fontWeight: 700 }}>✓</span>
                )}
                {isCurrent && !isCompleted && (
                  <div style={{ width: innerSize, height: innerSize, borderRadius: '50%', backgroundColor: 'white' }} />
                )}
              </div>
              <div style={{
                fontSize, color: labelColor, marginTop: 3,
                whiteSpace: 'nowrap',
                fontWeight: isCurrent ? 700 : 400,
                letterSpacing: '0.2px',
              }}>
                {step.label}
              </div>
            </div>

            {/* Connecting line (not after last step) */}
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                minWidth: lineMin,
                backgroundColor: lineColor,
                marginTop: circleSize / 2 - 1,
                alignSelf: 'flex-start',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClaimLifecycleTracker;
