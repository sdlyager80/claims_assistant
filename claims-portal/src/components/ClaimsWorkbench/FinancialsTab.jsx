/**
 * Financials Tab Component
 * Displays financial information including reserves, payment history, and pending payments
 * Supports both L&A and P&C modes
 */

import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcHeading,
  DxcInset
} from '@dxc-technology/halstack-react';
import MetricCard from '../shared/MetricCard';
import ReserveManagementPanel from '../ReserveManagementPanel/ReserveManagementPanel';

const FinancialsTab = ({
  demoLineOfBusiness,
  claim,
  financialData,
  formatCurrency,
  onShowPMICalculator,
  onShowTaxCalculator,
  onPaymentClick
}) => {
  const getPaymentStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'PAID' || statusUpper === 'COMPLETED' || statusUpper === 'ISSUED') {
      return 'success';
    }
    if (statusUpper === 'PENDING' || statusUpper === 'PENDING APPROVAL' || statusUpper === 'SCHEDULED') {
      return 'warning';
    }
    if (statusUpper === 'CANCELLED' || statusUpper === 'FAILED' || statusUpper === 'REJECTED') {
      return 'error';
    }
    if (statusUpper === 'ON HOLD' || statusUpper === 'PROCESSING') {
      return 'warning';
    }
    return undefined;
  };

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-l)">
      {demoLineOfBusiness === 'PC' ? (
        <>
          {/* P&C Mode: Reserve Management Panel */}
          <ReserveManagementPanel financial={claim.financial} />
        </>
      ) : (
        <>
          {/* L&A Mode: Reserve Summary */}
          <DxcFlex gap="var(--spacing-gap-m)">
            <MetricCard
              label="TOTAL CLAIM AMOUNT"
              value={formatCurrency(financialData.totalClaimAmount)}
              variant="info"
            />
            <MetricCard
              label="TOTAL PAID"
              value={formatCurrency(financialData.reserves.paid)}
              variant="success"
            />
            <MetricCard
              label="OUTSTANDING RESERVE"
              value={formatCurrency(financialData.reserves.outstanding)}
              variant="warning"
            />
          </DxcFlex>
        </>
      )}

      {/* Reserve Details */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcHeading level={4} text="Reserve History" />
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
          border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex justifyContent="space-between">
              <DxcTypography fontSize="font-scale-03">Initial Reserve Set</DxcTypography>
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                {formatCurrency(financialData.reserves.initial)}
              </DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography fontSize="font-scale-03">Payments Issued</DxcTypography>
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000">
                -{formatCurrency(financialData.reserves.paid)}
              </DxcTypography>
            </DxcFlex>
            <div style={{ borderTop: "1px solid var(--border-color-neutral-light)", paddingTop: "var(--spacing-gap-s)" }}>
              <DxcFlex justifyContent="space-between">
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">Current Reserve</DxcTypography>
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000">
                  {formatCurrency(financialData.reserves.current)}
                </DxcTypography>
              </DxcFlex>
            </div>
          </DxcFlex>
        </DxcContainer>
      </DxcFlex>

      {/* Payment History */}
      {demoLineOfBusiness === 'LA' && (
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcHeading level={4} text="Payment History" />
            <DxcFlex gap="var(--spacing-gap-s)">
              {/* Only show PMI Calculator for death claims */}
              {claim.type === 'death' && (
                <DxcButton
                  label="Calculate PMI"
                  mode="secondary"
                  size="small"
                  icon="calculate"
                  onClick={onShowPMICalculator}
                />
              )}
              <DxcButton
                label="Tax Withholding"
                mode="secondary"
                size="small"
                icon="account_balance"
                onClick={onShowTaxCalculator}
              />
              <DxcButton label="View EOB" mode="tertiary" size="small" icon="description" />
            </DxcFlex>
          </DxcFlex>
          {financialData.payments.map((payment, index) => (
            <DxcContainer
              key={index}
              style={{ backgroundColor: "var(--color-bg-neutral-lighter)", cursor: "pointer" }}
              border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
              onClick={() => onPaymentClick(payment)}
            >
              <DxcInset space="var(--spacing-padding-m)">
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000">
                        {payment.id}
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{payment.payee}</DxcTypography>
                      <DxcBadge
                        label={payment.status}
                        {...(getPaymentStatusColor(payment.status) && { color: getPaymentStatusColor(payment.status) })}
                      />
                    </DxcFlex>
                    <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="#000000">
                      {formatCurrency(payment.amount)}
                    </DxcTypography>
                  </DxcFlex>
                  <div className="payment-details-grid">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Type</DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{payment.type}</DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Date Paid</DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{payment.date}</DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Method</DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{payment.method}</DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Check/Reference #</DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{payment.checkNumber || 'N/A'}</DxcTypography>
                    </DxcFlex>
                    {payment.netBenefitProceeds && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Net Benefit Proceeds</DxcTypography>
                        <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.netBenefitProceeds)}</DxcTypography>
                      </DxcFlex>
                    )}
                    {payment.netBenefitPMI && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Net Benefit PMI</DxcTypography>
                        <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.netBenefitPMI)}</DxcTypography>
                      </DxcFlex>
                    )}
                    {payment.taxWithheld && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Tax Withheld</DxcTypography>
                        <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.taxWithheld)}</DxcTypography>
                      </DxcFlex>
                    )}
                    {payment.percentage && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Percent</DxcTypography>
                        <DxcTypography fontSize="font-scale-03">{payment.percentage}%</DxcTypography>
                      </DxcFlex>
                    )}
                  </div>
                </DxcFlex>
              </DxcInset>
            </DxcContainer>
          ))}
        </DxcFlex>
      )}

      {/* Pending Payments */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcHeading level={4} text="Pending Payments" />
          <DxcButton label="Schedule Payment" mode="primary" icon="add" />
        </DxcFlex>
        {financialData.pendingPayments.map((payment, index) => (
          <DxcContainer
            key={index}
            style={{ backgroundColor: "var(--color-bg-warning-lightest)" }}
            border={{ color: "var(--border-color-warning-lighter)", style: "solid", width: "1px" }}
          >
            <DxcInset space="var(--spacing-padding-m)">
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000">
                      {payment.id}
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-03">{payment.payee}</DxcTypography>
                    <DxcBadge
                        label={payment.status}
                        {...(getPaymentStatusColor(payment.status) && { color: getPaymentStatusColor(payment.status) })}
                      />
                  </DxcFlex>
                  <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="#000000">
                    {formatCurrency(payment.amount)}
                  </DxcTypography>
                </DxcFlex>
                <DxcFlex gap="var(--spacing-gap-l)" alignItems="center">
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Type</DxcTypography>
                    <DxcTypography fontSize="font-scale-03">{payment.type}</DxcTypography>
                  </DxcFlex>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Scheduled Date</DxcTypography>
                    <DxcTypography fontSize="font-scale-03">{payment.scheduledDate}</DxcTypography>
                  </DxcFlex>
                  <DxcFlex gap="var(--spacing-gap-s)" style={{ marginLeft: "auto" }}>
                    <DxcButton label="Approve" mode="primary" size="small" />
                    <DxcButton label="Reject" mode="secondary" size="small" />
                  </DxcFlex>
                </DxcFlex>
              </DxcFlex>
            </DxcInset>
          </DxcContainer>
        ))}
      </DxcFlex>
    </DxcFlex>
  );
};

export default FinancialsTab;
