/**
 * Dashboard Metrics Card Component
 * Displays key claim metrics: Claims Paid YTD, Pending Review, Approved, Declined
 */

import { DxcFlex, DxcContainer, DxcTypography } from '@dxc-technology/halstack-react';
import MetricCard from '../shared/MetricCard';
import { ClaimStatus } from '../../types/claim.types';

const DashboardMetricsCard = ({ claims, demoLineOfBusiness }) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Calculate metrics
  const claimsPaidYTD = claims?.filter(c => c.status === ClaimStatus.CLOSED && c.closedAt)
    .reduce((sum, claim) => {
      // Handle both LA (amountPaid) and P&C (paidToDate) financial fields
      const paidAmount = claim.financial?.amountPaid || claim.financial?.paidToDate || claim.financial?.claimAmount || 0;
      return sum + paidAmount;
    }, 0) || 0;

  const pendingReview = claims?.filter(c =>
    [ClaimStatus.UNDER_REVIEW, ClaimStatus.IN_REVIEW, ClaimStatus.PENDING_REQUIREMENTS, 'pending_info'].includes(c.status)
  ).length || 0;

  const approvedThisMonth = claims?.filter(c => {
    if (c.status !== ClaimStatus.APPROVED && c.status !== ClaimStatus.CLOSED) return false;
    const approvedDate = new Date(c.approvedAt || c.closedAt);
    const now = new Date();
    return approvedDate.getMonth() === now.getMonth() &&
           approvedDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const declinedThisMonth = claims?.filter(c => {
    if (c.status !== ClaimStatus.DENIED) return false;
    const deniedDate = new Date(c.deniedAt);
    const now = new Date();
    return deniedDate?.getMonth() === now.getMonth() &&
           deniedDate?.getFullYear() === now.getFullYear();
  }).length || 0;

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
        {/* Card Title */}
        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
          Key Metrics
        </DxcTypography>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--spacing-gap-m)'
        }}>
          {/* Claims Paid YTD */}
          <MetricCard
            label={demoLineOfBusiness === 'PC' ? 'CLAIMS PAID YTD' : 'CLAIMS PAID YTD'}
            value={formatCurrency(claimsPaidYTD)}
            variant="success"
            valueColor="var(--color-fg-secondary-medium)"
          />

          {/* Pending Review */}
          <MetricCard
            label="PENDING REVIEW"
            value={pendingReview}
            variant="warning"
            valueColor="var(--color-fg-warning-medium)"
          />

          {/* Approved This Month */}
          <MetricCard
            label="APPROVED THIS MONTH"
            value={approvedThisMonth}
            variant="success"
            valueColor="var(--color-fg-success-medium)"
          />

          {/* Declined This Month */}
          <MetricCard
            label="DECLINED THIS MONTH"
            value={declinedThisMonth}
            variant="error"
            valueColor="var(--color-fg-error-medium)"
          />
        </div>
      </DxcFlex>
    </DxcContainer>
  );
};

export default DashboardMetricsCard;
