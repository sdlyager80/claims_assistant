import { useState, useEffect, useMemo } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcTextInput,
  DxcButton,
  DxcSwitch,
  DxcTabs,
  DxcBadge,
  DxcPaginator,
  DxcInset,
  DxcSpinner,
} from '@dxc-technology/halstack-react';
import { useClaims } from '../../contexts/ClaimsContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import FastTrackBadge from '../shared/FastTrackBadge';
import SLAIndicator from '../shared/SLAIndicator';
import { RoutingType, ClaimStatus } from '../../types/claim.types';
import './Dashboard.css';

const Dashboard = ({ onClaimSelect }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [isGridView, setIsGridView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Get data from contexts
  const {
    claims,
    claimsLoading,
    claimsError,
    fetchClaims,
    filters,
    updateFilters
  } = useClaims();

  const {
    slaAtRiskCases,
    fetchSLAAtRiskCases
  } = useWorkflow();

  // Fetch data on mount
  useEffect(() => {
    fetchClaims();
    fetchSLAAtRiskCases();
  }, []);

  // Calculate FastTrack metrics
  const fastTrackMetrics = useMemo(() => {
    if (!claims || claims.length === 0) {
      return {
        count: 0,
        percentage: 0,
        avgDaysToClose: 0
      };
    }

    const fastTrackClaims = claims.filter(c => c.routing?.type === RoutingType.FASTTRACK);
    const closedFastTrackClaims = fastTrackClaims.filter(c => c.status === ClaimStatus.CLOSED);

    // Calculate average days to close for FastTrack claims
    let totalDays = 0;
    closedFastTrackClaims.forEach(claim => {
      if (claim.createdAt && claim.closedAt) {
        const days = Math.floor((new Date(claim.closedAt) - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24));
        totalDays += days;
      }
    });

    const avgDaysToClose = closedFastTrackClaims.length > 0
      ? Math.round(totalDays / closedFastTrackClaims.length)
      : 0;

    return {
      count: fastTrackClaims.length,
      percentage: Math.round((fastTrackClaims.length / claims.length) * 100),
      avgDaysToClose
    };
  }, [claims]);

  // Calculate general metrics
  const metrics = useMemo(() => {
    if (!claims || claims.length === 0) {
      return {
        openClaims: 0,
        newToday: 0,
        newThisWeek: 0,
        pendingReview: 0,
        approvedThisMonth: 0,
        declinedThisMonth: 0,
        claimsPaidYTD: '$0',
        approvalRate: 0
      };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const openClaims = claims.filter(c =>
      c.status !== ClaimStatus.CLOSED &&
      c.status !== ClaimStatus.DENIED
    ).length;

    const newToday = claims.filter(c =>
      new Date(c.createdAt) >= todayStart
    ).length;

    const newThisWeek = claims.filter(c =>
      new Date(c.createdAt) >= weekStart
    ).length;

    const pendingReview = claims.filter(c =>
      c.status === ClaimStatus.UNDER_REVIEW
    ).length;

    const approvedThisMonth = claims.filter(c =>
      c.status === ClaimStatus.APPROVED &&
      new Date(c.updatedAt) >= monthStart
    ).length;

    const declinedThisMonth = claims.filter(c =>
      c.status === ClaimStatus.DENIED &&
      new Date(c.updatedAt) >= monthStart
    ).length;

    const totalThisMonth = approvedThisMonth + declinedThisMonth;
    const approvalRate = totalThisMonth > 0
      ? Math.round((approvedThisMonth / totalThisMonth) * 100)
      : 0;

    // Calculate total paid YTD
    const claimsClosedYTD = claims.filter(c =>
      c.status === ClaimStatus.CLOSED &&
      new Date(c.closedAt) >= yearStart
    );
    const totalPaidYTD = claimsClosedYTD.reduce((sum, c) =>
      sum + (c.financial?.amountPaid || 0), 0
    );
    const claimsPaidYTD = `$${(totalPaidYTD / 1000000).toFixed(1)}M`;

    return {
      openClaims,
      newToday,
      newThisWeek,
      pendingReview,
      approvedThisMonth,
      declinedThisMonth,
      claimsPaidYTD,
      approvalRate
    };
  }, [claims]);

  // Filter claims based on active tab and search
  const filteredClaims = useMemo(() => {
    if (!claims) return [];

    let filtered = [...claims];

    // Filter by tab
    if (activeTabIndex === 1) {
      // Life Insurance
      filtered = filtered.filter(c => c.type === 'death');
    } else if (activeTabIndex === 2) {
      // Annuities
      filtered = filtered.filter(c => c.type === 'annuity');
    } else if (activeTabIndex === 3) {
      // FastTrack
      filtered = filtered.filter(c => c.routing?.type === RoutingType.FASTTRACK);
    }

    // Filter by search
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(c =>
        c.claimNumber?.toLowerCase().includes(search) ||
        c.policy?.policyNumber?.toLowerCase().includes(search) ||
        c.claimant?.name?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [claims, activeTabIndex, searchValue]);

  // Paginate claims
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * 9;
    return filteredClaims.slice(startIndex, startIndex + 9);
  }, [filteredClaims, currentPage]);

  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case ClaimStatus.NEW:
        return 'info';
      case ClaimStatus.UNDER_REVIEW:
        return 'warning';
      case ClaimStatus.APPROVED:
        return 'success';
      case ClaimStatus.DENIED:
        return 'error';
      case ClaimStatus.CLOSED:
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  // Fallback to mock data if no real claims yet
  const submissionsData = paginatedClaims.length > 0 ? null : [
    {
      id: '1000212',
      name: 'James Smith',
      status: 'In-Progress',
      statusColor: 'warning',
      type: 'LOB: Life',
      submitted: '01/05/2026',
      received: '01/07/2026',
      effective: '01/07/2026'
    },
    {
      id: '1000213',
      name: 'Mary Johnson',
      status: 'Quote Required',
      statusColor: 'error',
      type: 'LOB: Annuity',
      submitted: '01/05/2026',
      received: '01/07/2026',
      effective: '01/07/2026'
    },
    {
      id: '1000214',
      name: 'Robert Davis',
      status: 'New Submission',
      statusColor: 'success',
      type: 'LOB: Life',
      submitted: '01/05/2026',
      received: '01/07/2026',
      effective: '01/07/2026'
    },
    {
      id: '1000215',
      name: 'Patricia Wilson',
      status: 'In-Progress',
      statusColor: 'warning',
      type: 'LOB: Annuity',
      submitted: '01/05/2026',
      received: '01/07/2026',
      effective: '01/07/2026'
    },
    {
      id: '1000216',
      name: 'Michael Brown',
      status: 'In-Progress',
      statusColor: 'warning',
      type: 'LOB: Life',
      submitted: '01/05/2026',
      received: '01/07/2026',
      effective: '01/07/2026'
    }
  ];

  // Show loading state
  if (claimsLoading && !claims) {
    return (
      <div style={{ padding: '24px', width: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DxcSpinner label="Loading dashboard..." />
      </div>
    );
  }

  // Use actual data or fallback to mock
  const displayData = paginatedClaims.length > 0 ? paginatedClaims : submissionsData;

  return (
    <div style={{ padding: '24px', width: '100%', backgroundColor: '#f5f5f5' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Page Title */}
        <DxcHeading level={1} text="Dashboard" />

        {/* Highlights Section - Top Cards */}
        <DxcFlex gap="var(--spacing-gap-m)">
          {/* My Tasks Card */}
          <div style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-04)",
            flex: 1,
            height: "240px",
            boxSizing: "border-box",
            padding: "var(--spacing-padding-m)"
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={3} text="My Tasks" />
              <DxcFlex gap="var(--spacing-gap-none)" alignItems="center">
                {/* Open Claims */}
                <DxcFlex
                  direction="column"
                  gap="var(--spacing-gap-s)"
                  alignItems="center"
                  justifyContent="center"
                  grow={1}
                  basis="0"
                >
                  <DxcTypography
                    fontSize="32px"
                    fontWeight="font-weight-semibold"
                    color="var(--color-fg-secondary-strong)"
                    textAlign="center"
                  >
                    {metrics.openClaims}
                  </DxcTypography>
                  <DxcTypography
                    fontSize="font-scale-03"
                    fontWeight="font-weight-semibold"
                    color="var(--color-fg-neutral-stronger)"
                    textAlign="center"
                  >
                    Open Claims
                  </DxcTypography>
                </DxcFlex>

                {/* Divider */}
                <div style={{ padding: "var(--spacing-padding-xs)" }}>
                  <div style={{
                    height: "97px",
                    width: "1px",
                    backgroundColor: "var(--color-bg-neutral-light)"
                  }} />
                </div>

                {/* New Today */}
                <DxcFlex
                  direction="column"
                  gap="var(--spacing-gap-s)"
                  alignItems="center"
                  justifyContent="center"
                  grow={1}
                  basis="0"
                >
                  <DxcTypography
                    fontSize="32px"
                    fontWeight="font-weight-semibold"
                    color="var(--color-fg-error-medium)"
                    textAlign="center"
                  >
                    {metrics.newToday}
                  </DxcTypography>
                  <DxcTypography
                    fontSize="font-scale-03"
                    fontWeight="font-weight-semibold"
                    color="var(--color-fg-neutral-stronger)"
                    textAlign="center"
                  >
                    New Today
                  </DxcTypography>
                </DxcFlex>

                {/* Divider */}
                <div style={{ padding: "var(--spacing-padding-xs)" }}>
                  <div style={{
                    height: "97px",
                    width: "1px",
                    backgroundColor: "var(--color-bg-neutral-light)"
                  }} />
                </div>

                {/* New This Week */}
                <DxcFlex
                  direction="column"
                  gap="var(--spacing-gap-s)"
                  alignItems="center"
                  justifyContent="center"
                  grow={1}
                  basis="0"
                >
                  <DxcTypography
                    fontSize="32px"
                    fontWeight="font-weight-semibold"
                    color="var(--color-fg-warning-medium)"
                    textAlign="center"
                  >
                    {metrics.newThisWeek}
                  </DxcTypography>
                  <DxcTypography
                    fontSize="font-scale-03"
                    fontWeight="font-weight-semibold"
                    color="var(--color-fg-neutral-stronger)"
                    textAlign="center"
                  >
                    New This Week
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
            </DxcFlex>
          </div>

          {/* Key Metrics Card */}
          <div style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-04)",
            flex: 2,
            height: "240px",
            boxSizing: "border-box",
            padding: "var(--spacing-padding-m)"
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={3} text="Key Metrics" />
              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center" justifyContent="space-between">
                {/* Claims Paid YTD */}
                <div style={{ borderTop: "4px solid var(--border-color-info-medium)", flex: "1" }}>
                  <div style={{ backgroundColor: "var(--color-bg-neutral-lightest)", height: "120px" }}>
                    <DxcFlex
                      direction="column"
                      gap="var(--spacing-gap-xxs)"
                      alignItems="center"
                      justifyContent="center"
                      fullHeight
                    >
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="var(--color-fg-neutral-stronger)"
                        textAlign="center"
                      >
                        CLAIMS PAID YTD
                      </DxcTypography>
                      <DxcTypography
                        fontSize="32px"
                        fontWeight="font-weight-semibold"
                        color="var(--color-fg-secondary-medium)"
                        textAlign="center"
                      >
                        {metrics.claimsPaidYTD}
                      </DxcTypography>
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="var(--color-fg-secondary-medium)"
                        textAlign="center"
                      >
                        +12% vs last year
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>

                {/* Pending Review */}
                <div style={{ borderTop: "4px solid var(--color-semantic03-400)", flex: "1" }}>
                  <div style={{ backgroundColor: "var(--color-bg-neutral-lightest)", height: "120px" }}>
                    <DxcFlex
                      direction="column"
                      gap="var(--spacing-gap-xxs)"
                      alignItems="center"
                      justifyContent="center"
                      fullHeight
                    >
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="var(--color-fg-neutral-stronger)"
                        textAlign="center"
                      >
                        PENDING REVIEW
                      </DxcTypography>
                      <DxcTypography
                        fontSize="32px"
                        fontWeight="font-weight-semibold"
                        color="var(--color-fg-warning-medium)"
                        textAlign="center"
                      >
                        {metrics.pendingReview}
                      </DxcTypography>
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="var(--color-fg-warning-medium)"
                        textAlign="center"
                      >
                        {slaAtRiskCases?.length || 0} at risk
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>

                {/* Approved This Month */}
                <div style={{ borderTop: "4px solid var(--color-semantic02-500)", flex: "1" }}>
                  <div style={{ backgroundColor: "var(--color-bg-neutral-lightest)", height: "120px" }}>
                    <DxcFlex
                      direction="column"
                      gap="var(--spacing-gap-xxs)"
                      alignItems="center"
                      justifyContent="center"
                      fullHeight
                    >
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="var(--color-fg-neutral-stronger)"
                        textAlign="center"
                      >
                        APPROVED THIS MONTH
                      </DxcTypography>
                      <DxcTypography
                        fontSize="32px"
                        fontWeight="font-weight-semibold"
                        color="var(--color-fg-success-medium)"
                        textAlign="center"
                      >
                        {metrics.approvedThisMonth}
                      </DxcTypography>
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="var(--color-fg-success-medium)"
                        textAlign="center"
                      >
                        {metrics.approvalRate}% approval rate
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>

                {/* Declined This Month */}
                <div style={{ borderTop: "4px solid var(--color-semantic04-500)", flex: "1" }}>
                  <div style={{ backgroundColor: "var(--color-bg-neutral-lightest)", height: "120px" }}>
                    <DxcFlex
                      direction="column"
                      gap="var(--spacing-gap-xxs)"
                      alignItems="center"
                      justifyContent="center"
                      fullHeight
                    >
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="var(--color-fg-neutral-stronger)"
                        textAlign="center"
                      >
                        DECLINED THIS MONTH
                      </DxcTypography>
                      <DxcTypography
                        fontSize="32px"
                        fontWeight="font-weight-semibold"
                        color="var(--color-fg-error-medium)"
                        textAlign="center"
                      >
                        {metrics.declinedThisMonth}
                      </DxcTypography>
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="var(--color-fg-error-medium)"
                        textAlign="center"
                      >
                        {100 - metrics.approvalRate}% decline rate
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>
              </DxcFlex>
            </DxcFlex>
          </div>
        </DxcFlex>

        {/* FastTrack Metrics Card */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-04)",
          padding: "var(--spacing-padding-m)"
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
              <DxcHeading level={3} text="FastTrack Performance" />
              <FastTrackBadge eligible={true} showLabel={false} size="small" />
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center" justifyContent="space-between">
              {/* FastTrack Claims */}
              <div style={{ borderTop: "4px solid #0095FF", flex: "1" }}>
                <div style={{ backgroundColor: "var(--color-bg-neutral-lightest)", height: "120px" }}>
                  <DxcFlex
                    direction="column"
                    gap="var(--spacing-gap-xxs)"
                    alignItems="center"
                    justifyContent="center"
                    fullHeight
                  >
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-regular"
                      color="var(--color-fg-neutral-stronger)"
                      textAlign="center"
                    >
                      FASTTRACK CLAIMS
                    </DxcTypography>
                    <DxcTypography
                      fontSize="32px"
                      fontWeight="font-weight-semibold"
                      color="#0095FF"
                      textAlign="center"
                    >
                      {fastTrackMetrics.count}
                    </DxcTypography>
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-regular"
                      color="#0095FF"
                      textAlign="center"
                    >
                      {fastTrackMetrics.percentage}% of total
                    </DxcTypography>
                  </DxcFlex>
                </div>
              </div>

              {/* Avg Days to Close */}
              <div style={{ borderTop: "4px solid var(--color-semantic02-500)", flex: "1" }}>
                <div style={{ backgroundColor: "var(--color-bg-neutral-lightest)", height: "120px" }}>
                  <DxcFlex
                    direction="column"
                    gap="var(--spacing-gap-xxs)"
                    alignItems="center"
                    justifyContent="center"
                    fullHeight
                  >
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-regular"
                      color="var(--color-fg-neutral-stronger)"
                      textAlign="center"
                    >
                      AVG DAYS TO CLOSE
                    </DxcTypography>
                    <DxcTypography
                      fontSize="32px"
                      fontWeight="font-weight-semibold"
                      color="var(--color-fg-success-medium)"
                      textAlign="center"
                    >
                      {fastTrackMetrics.avgDaysToClose}
                    </DxcTypography>
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-regular"
                      color="var(--color-fg-success-medium)"
                      textAlign="center"
                    >
                      Target: ≤10 days
                    </DxcTypography>
                  </DxcFlex>
                </div>
              </div>

              {/* Target Achievement */}
              <div style={{ borderTop: "4px solid var(--color-semantic03-400)", flex: "1" }}>
                <div style={{ backgroundColor: "var(--color-bg-neutral-lightest)", height: "120px" }}>
                  <DxcFlex
                    direction="column"
                    gap="var(--spacing-gap-xxs)"
                    alignItems="center"
                    justifyContent="center"
                    fullHeight
                  >
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-regular"
                      color="var(--color-fg-neutral-stronger)"
                      textAlign="center"
                    >
                      TARGET ACHIEVEMENT
                    </DxcTypography>
                    <DxcTypography
                      fontSize="32px"
                      fontWeight="font-weight-semibold"
                      color={fastTrackMetrics.percentage >= 40 ? "var(--color-fg-success-medium)" : "var(--color-fg-warning-medium)"}
                      textAlign="center"
                    >
                      {fastTrackMetrics.percentage >= 40 ? '✓' : '○'}
                    </DxcTypography>
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-regular"
                      color={fastTrackMetrics.percentage >= 40 ? "var(--color-fg-success-medium)" : "var(--color-fg-warning-medium)"}
                      textAlign="center"
                    >
                      {fastTrackMetrics.percentage >= 40 ? 'Meeting goal' : 'Below target'}
                    </DxcTypography>
                  </DxcFlex>
                </div>
              </div>
            </DxcFlex>
          </DxcFlex>
        </div>

        {/* Main Content Card - My Priorities */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-02)",
          padding: "var(--spacing-padding-l)"
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcHeading level={3} text="My Priorities" />

            {/* Tabs */}
            <DxcTabs iconPosition="left">
              <DxcTabs.Tab
                label="All Claims"
                icon="assignment"
                active={activeTabIndex === 0}
                onClick={() => setActiveTabIndex(0)}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="Life Insurance"
                icon="favorite"
                active={activeTabIndex === 1}
                onClick={() => setActiveTabIndex(1)}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="Annuities"
                icon="account_balance"
                active={activeTabIndex === 2}
                onClick={() => setActiveTabIndex(2)}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="FastTrack"
                icon="flash_on"
                active={activeTabIndex === 3}
                onClick={() => setActiveTabIndex(3)}
              >
                <div />
              </DxcTabs.Tab>
            </DxcTabs>

            {/* Toolbar */}
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcTextInput
                placeholder="Search for Claim, Policy, or Quote Numbers..."
                value={searchValue}
                onChange={({ value }) => setSearchValue(value)}
                size="medium"
              />
              <DxcFlex gap="var(--spacing-gap-ml)" alignItems="center">
                <DxcButton
                  label="Columns"
                  mode="tertiary"
                  icon="view_column"
                  onClick={() => {}}
                />
                <DxcFlex gap="var(--spacing-gap-none)" alignItems="center">
                  <DxcTypography
                    fontSize="font-scale-03"
                    color="var(--color-fg-secondary-strong)"
                  >
                    Card View
                  </DxcTypography>
                  <DxcSwitch
                    checked={isGridView}
                    onChange={(checked) => setIsGridView(checked)}
                  />
                  <DxcTypography
                    fontSize="font-scale-03"
                    color="var(--color-fg-secondary-strong)"
                  >
                    Grid View
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
            </DxcFlex>

            {/* Cards List or Grid */}
            <DxcFlex
              direction={isGridView ? "row" : "column"}
              gap="var(--spacing-gap-m)"
              wrap={isGridView ? "wrap" : "nowrap"}
            >
              {displayData && displayData.map((submission, index) => {
                // For real claims, use the claim data structure
                const isClaim = submission.claimNumber !== undefined;
                const displayId = isClaim ? submission.claimNumber : submission.id;
                const displayName = isClaim ? submission.claimant?.name : submission.name;
                const displayStatus = isClaim ? submission.status : submission.status;
                const displayType = isClaim
                  ? `LOB: ${submission.type === 'death' ? 'Life' : 'Annuity'}`
                  : submission.type;
                const displaySubmitted = isClaim
                  ? new Date(submission.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                  : submission.submitted;
                const hasFastTrack = isClaim && submission.routing?.type === RoutingType.FASTTRACK;
                const hasSLA = isClaim && submission.workflow?.sla?.dueDate;

                return (
                  <DxcContainer
                    key={index}
                    style={
                      isGridView
                        ? { backgroundColor: "var(--color-bg-neutral-lighter)", flex: "1 1 calc(50% - var(--spacing-gap-m) / 2)", minWidth: "400px", cursor: "pointer", borderRadius: "var(--border-radius-m)", border: "1px solid var(--border-color-neutral-lighter)" }
                        : { backgroundColor: "var(--color-bg-neutral-lighter)", cursor: "pointer", borderRadius: "var(--border-radius-m)", border: "1px solid var(--border-color-neutral-lighter)" }
                    }
                    onClick={() => onClaimSelect(submission)}
                  >
                    <DxcInset space="var(--spacing-padding-m)">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcFlex justifyContent="space-between" alignItems="center">
                          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                            <DxcTypography
                              fontSize="font-scale-03"
                              fontWeight="font-weight-semibold"
                              color="var(--color-fg-secondary-medium)"
                            >
                              {displayId}
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-03">
                              {displayName}
                            </DxcTypography>
                            {hasFastTrack && (
                              <FastTrackBadge eligible={true} showLabel={true} size="small" />
                            )}
                          </DxcFlex>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                          <DxcButton
                            icon="check"
                            mode="tertiary"
                            title="Approve"
                            onClick={() => {}}
                          />
                          <DxcButton
                            icon="cancel"
                            mode="tertiary"
                            title="Decline"
                            onClick={() => {}}
                          />
                          <DxcButton
                            icon="swap_horiz"
                            mode="tertiary"
                            title="Transfer"
                            onClick={() => {}}
                          />
                        </DxcFlex>
                      </DxcFlex>

                        <DxcFlex gap="var(--spacing-gap-m)" alignItems="center" wrap="wrap">
                          <DxcBadge
                            label={displayStatus}
                            mode="contextual"
                            color={isClaim ? getStatusColor(displayStatus) : submission.statusColor}
                          />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            {displayType}
                          </DxcTypography>
                          <div style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-fg-neutral-strong)"
                          }} />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            Submitted: {displaySubmitted}
                          </DxcTypography>
                          {hasSLA && (
                            <>
                              <div style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "var(--color-fg-neutral-strong)"
                              }} />
                              <SLAIndicator
                                slaDate={submission.workflow.sla.dueDate}
                                compact={true}
                              />
                            </>
                          )}
                          {!isClaim && (
                            <>
                              <div style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "var(--color-fg-neutral-strong)"
                              }} />
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                Received: {submission.received}
                              </DxcTypography>
                              <div style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "var(--color-fg-neutral-strong)"
                              }} />
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                Effective: {submission.effective}
                              </DxcTypography>
                            </>
                          )}
                        </DxcFlex>
                      </DxcFlex>
                    </DxcInset>
                  </DxcContainer>
                );
              })}
            </DxcFlex>

            {/* Paginator */}
            <DxcPaginator
              currentPage={currentPage}
              itemsPerPage={9}
              totalItems={filteredClaims.length}
              showGoToPage={true}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </DxcFlex>
        </div>
      </DxcFlex>
    </div>
  );
};

export default Dashboard;
