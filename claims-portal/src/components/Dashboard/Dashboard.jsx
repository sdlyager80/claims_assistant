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
  DxcAccordion,
  DxcChip,
  DxcSelect,
} from '@dxc-technology/halstack-react';
import { useClaims } from '../../contexts/ClaimsContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import FastTrackBadge from '../shared/FastTrackBadge';
import SLAIndicator from '../shared/SLAIndicator';
import { RoutingType, ClaimStatus } from '../../types/claim.types';
import serviceNowService from '../../services/api/serviceNowService';
import './Dashboard.css';

const Dashboard = ({ onClaimSelect }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0); // 0 = All Open, 1 = Closed
  const [subsetFilter, setSubsetFilter] = useState(null); // Pre-filtered subset
  const [searchValue, setSearchValue] = useState('');
  const [isGridView, setIsGridView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [snowClaims, setSnowClaims] = useState([]);
  const [snowLoading, setSnowLoading] = useState(false);
  const [snowConnected, setSnowConnected] = useState(serviceNowService.isAuthenticated());
  // Multi-attribute filters
  const [typeFilter, setTypeFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [amountRangeFilter, setAmountRangeFilter] = useState('');

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

  const { demoLineOfBusiness } = useDemoMode();

  // Fetch ServiceNow claims when authenticated
  const fetchServiceNowClaims = async () => {
    if (!serviceNowService.isAuthenticated()) return;
    try {
      setSnowLoading(true);
      const fnolRecords = await serviceNowService.getFNOLsGlobal({ limit: 50 });
      const mappedClaims = fnolRecords.map(fnol => serviceNowService.mapFNOLToClaim(fnol));
      setSnowClaims(mappedClaims);
      console.log('[Dashboard] ServiceNow FNOL claims loaded:', mappedClaims.length);
    } catch (err) {
      console.warn('[Dashboard] Could not fetch ServiceNow claims:', err.message);
      setSnowClaims([]);
    } finally {
      setSnowLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchClaims();
    fetchSLAAtRiskCases();
    fetchServiceNowClaims();

    // Listen for auth state changes
    const unsubscribe = serviceNowService.onAuthChange((authenticated) => {
      setSnowConnected(authenticated);
      if (authenticated) {
        fetchServiceNowClaims();
      }
    });

    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  // Refresh claims when demo mode changes
  useEffect(() => {
    fetchClaims();
    fetchSLAAtRiskCases();
  }, [demoLineOfBusiness]);

  // Merge demo claims with ServiceNow claims (deduplicate by sysId)
  const allClaims = useMemo(() => {
    if (!claims) return snowClaims;
    const demoClaims = [...claims];
    const existingSysIds = new Set(demoClaims.map(c => c.sysId).filter(Boolean));
    const uniqueSnowClaims = snowClaims.filter(sc => !existingSysIds.has(sc.sysId));
    return [...demoClaims, ...uniqueSnowClaims];
  }, [claims, snowClaims]);

  // Calculate FastTrack metrics
  const fastTrackMetrics = useMemo(() => {
    if (!allClaims || allClaims.length === 0) {
      return {
        count: 0,
        percentage: 0,
        avgDaysToClose: 0
      };
    }

    const fastTrackClaims = allClaims.filter(c => c.routing?.type === RoutingType.FASTTRACK);
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
      percentage: allClaims.length > 0 ? Math.round((fastTrackClaims.length / allClaims.length) * 100) : 0,
      avgDaysToClose
    };
  }, [allClaims]);

  // Calculate general metrics
  const metrics = useMemo(() => {
    if (!allClaims || allClaims.length === 0) {
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

    const openClaims = allClaims.filter(c =>
      c.status !== ClaimStatus.CLOSED &&
      c.status !== ClaimStatus.DENIED
    ).length;

    const newToday = allClaims.filter(c =>
      new Date(c.createdAt) >= todayStart
    ).length;

    const newThisWeek = allClaims.filter(c =>
      new Date(c.createdAt) >= weekStart
    ).length;

    const pendingReview = allClaims.filter(c =>
      c.status === ClaimStatus.UNDER_REVIEW
    ).length;

    const approvedThisMonth = allClaims.filter(c =>
      c.status === ClaimStatus.APPROVED &&
      new Date(c.updatedAt) >= monthStart
    ).length;

    const declinedThisMonth = allClaims.filter(c =>
      c.status === ClaimStatus.DENIED &&
      new Date(c.updatedAt) >= monthStart
    ).length;

    const totalThisMonth = approvedThisMonth + declinedThisMonth;
    const approvalRate = totalThisMonth > 0
      ? Math.round((approvedThisMonth / totalThisMonth) * 100)
      : 0;

    // Calculate total paid YTD
    const claimsClosedYTD = allClaims.filter(c =>
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
  }, [allClaims]);

  // Workflow group counts for department inventory
  const workflowGroups = useMemo(() => {
    if (!allClaims) return [];
    return [
      { key: 'new_fnol', label: 'New FNOL', count: allClaims.filter(c => c.status === ClaimStatus.NEW || c.status === ClaimStatus.SUBMITTED).length },
      { key: 'awaiting_requirements', label: 'Awaiting Requirements', count: allClaims.filter(c => c.status === ClaimStatus.PENDING_REQUIREMENTS).length },
      { key: 'requirement_received', label: 'Requirement Received / Pending Action', count: allClaims.filter(c => c.status === ClaimStatus.REQUIREMENTS_COMPLETE || c.status === ClaimStatus.IN_REVIEW).length },
      { key: 'manual_followups', label: 'Manual Follow Ups', count: allClaims.filter(c => c.status === ClaimStatus.UNDER_REVIEW).length },
      { key: 'quality_approval', label: 'Quality Approval', count: allClaims.filter(c => c.status === ClaimStatus.IN_APPROVAL).length },
      { key: 'exception_approval', label: 'Exception Approval', count: allClaims.filter(c => c.routing?.type === RoutingType.SIU).length },
      { key: 'pending_actuary', label: 'Pending Actuary', count: allClaims.filter(c => c.status === ClaimStatus.PAYMENT_SCHEDULED).length },
      { key: 'invalidated', label: 'Invalidated Records', count: allClaims.filter(c => c.status === ClaimStatus.DENIED || c.status === ClaimStatus.SUSPENDED).length },
    ];
  }, [allClaims]);

  // Filter claims based on active tab, subset filter, and search
  const filteredClaims = useMemo(() => {
    if (!allClaims) return [];

    let filtered = [...allClaims];

    // Filter by main tab: All Open vs Closed
    if (activeTabIndex === 0) {
      // All Open Claims
      filtered = filtered.filter(c =>
        c.status !== ClaimStatus.CLOSED &&
        c.status !== ClaimStatus.DENIED
      );
    } else if (activeTabIndex === 1) {
      // Closed Claims
      filtered = filtered.filter(c =>
        c.status === ClaimStatus.CLOSED ||
        c.status === ClaimStatus.DENIED
      );
    }

    // Apply subset filter
    if (subsetFilter) {
      switch (subsetFilter) {
        case 'new_fnol':
          filtered = filtered.filter(c => c.status === ClaimStatus.NEW || c.status === ClaimStatus.SUBMITTED);
          break;
        case 'awaiting_requirements':
          filtered = filtered.filter(c => c.status === ClaimStatus.PENDING_REQUIREMENTS);
          break;
        case 'requirement_received':
          filtered = filtered.filter(c => c.status === ClaimStatus.REQUIREMENTS_COMPLETE || c.status === ClaimStatus.IN_REVIEW);
          break;
        case 'manual_followups':
          filtered = filtered.filter(c => c.status === ClaimStatus.UNDER_REVIEW);
          break;
        case 'quality_approval':
          filtered = filtered.filter(c => c.status === ClaimStatus.IN_APPROVAL);
          break;
        case 'exception_approval':
          filtered = filtered.filter(c => c.routing?.type === RoutingType.SIU);
          break;
        case 'pending_actuary':
          filtered = filtered.filter(c => c.status === ClaimStatus.PAYMENT_SCHEDULED);
          break;
        case 'invalidated':
          filtered = filtered.filter(c => c.status === ClaimStatus.DENIED || c.status === ClaimStatus.SUSPENDED);
          break;
      }
    }

    // Multi-attribute filters
    if (typeFilter) {
      filtered = filtered.filter(c => c.type === typeFilter);
    }
    if (productFilter) {
      filtered = filtered.filter(c => {
        const pType = c.policy?.policyType || '';
        return pType.toLowerCase().includes(productFilter.toLowerCase());
      });
    }
    if (amountRangeFilter) {
      const getAmount = (claim) => claim.financial?.claimAmount || claim.financial?.totalClaimed || 0;
      switch (amountRangeFilter) {
        case 'under_50k':
          filtered = filtered.filter(c => getAmount(c) < 50000);
          break;
        case '50k_250k':
          filtered = filtered.filter(c => getAmount(c) >= 50000 && getAmount(c) < 250000);
          break;
        case '250k_1m':
          filtered = filtered.filter(c => getAmount(c) >= 250000 && getAmount(c) < 1000000);
          break;
        case 'over_1m':
          filtered = filtered.filter(c => getAmount(c) >= 1000000);
          break;
      }
    }

    // Filter by search
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(c =>
        c.claimNumber?.toLowerCase().includes(search) ||
        c.fnolNumber?.toLowerCase().includes(search) ||
        c.policy?.policyNumber?.toLowerCase().includes(search) ||
        c.claimant?.name?.toLowerCase().includes(search) ||
        c.insured?.name?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [allClaims, activeTabIndex, subsetFilter, searchValue, typeFilter, productFilter, amountRangeFilter]);

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
  if ((claimsLoading || snowLoading) && !claims?.length && !snowClaims.length) {
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
                    color="#000000"
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
                    color="#000000"
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
                    color="#000000"
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
                        color="#000000"
                        textAlign="center"
                      >
                        {metrics.claimsPaidYTD}
                      </DxcTypography>
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="#000000"
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
                        color="#000000"
                        textAlign="center"
                      >
                        {metrics.pendingReview}
                      </DxcTypography>
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="#000000"
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
                        color="#000000"
                        textAlign="center"
                      >
                        {metrics.approvedThisMonth}
                      </DxcTypography>
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="#000000"
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
                        color="#000000"
                        textAlign="center"
                      >
                        {metrics.declinedThisMonth}
                      </DxcTypography>
                      <DxcTypography
                        fontSize="12px"
                        fontWeight="font-weight-regular"
                        color="#000000"
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
                      color="#000000"
                      textAlign="center"
                    >
                      {fastTrackMetrics.avgDaysToClose}
                    </DxcTypography>
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-regular"
                      color="#000000"
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
                      color={fastTrackMetrics.percentage >= 40 ? "#000000" : "#000000"}
                      textAlign="center"
                    >
                      {fastTrackMetrics.percentage >= 40 ? '✓' : '○'}
                    </DxcTypography>
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-regular"
                      color={fastTrackMetrics.percentage >= 40 ? "#000000" : "#000000"}
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

        {/* ServiceNow FNOL Claims Table */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-04)",
          padding: "var(--spacing-padding-m)"
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                <DxcHeading level={3} text="ServiceNow FNOL Claims" />
                {snowConnected && <DxcBadge label={String(snowClaims.length)} notificationBadge />}
              </DxcFlex>
              <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                {snowLoading && (
                  <DxcSpinner label="Loading..." mode="small" />
                )}
                {serviceNowService.useOAuth && (
                  snowConnected ? (
                    <DxcButton
                      label="Disconnect"
                      mode="tertiary"
                      icon="link_off"
                      size="small"
                      onClick={() => { serviceNowService.clearAuth(); setSnowClaims([]); }}
                    />
                  ) : (
                    <DxcButton
                      label="Connect to ServiceNow"
                      mode="secondary"
                      icon="link"
                      onClick={() => serviceNowService.startOAuthLogin()}
                    />
                  )
                )}
              </DxcFlex>
            </DxcFlex>

            {!snowConnected && serviceNowService.useOAuth ? (
              <DxcContainer padding="var(--spacing-padding-m)" style={{ backgroundColor: "var(--color-bg-neutral-lighter)", borderRadius: "var(--border-radius-m)" }}>
                <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                  <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                    Connect to ServiceNow to view FNOL claims from the global domain.
                  </DxcTypography>
                </DxcFlex>
              </DxcContainer>
            ) : snowClaims.length === 0 && !snowLoading ? (
              <DxcContainer padding="var(--spacing-padding-m)" style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}>
                <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                  No ServiceNow FNOL records found. Check your ServiceNow connection configuration.
                </DxcTypography>
              </DxcContainer>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #000000", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", color: "var(--color-fg-neutral-stronger)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>FNOL Number</th>
                      <th style={{ padding: "12px 16px", color: "var(--color-fg-neutral-stronger)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                      <th style={{ padding: "12px 16px", color: "var(--color-fg-neutral-stronger)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Insured</th>
                      <th style={{ padding: "12px 16px", color: "var(--color-fg-neutral-stronger)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Claimant</th>
                      <th style={{ padding: "12px 16px", color: "var(--color-fg-neutral-stronger)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Policy</th>
                      <th style={{ padding: "12px 16px", color: "var(--color-fg-neutral-stronger)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Opened</th>
                      <th style={{ padding: "12px 16px", color: "var(--color-fg-neutral-stronger)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snowClaims.map((claim, index) => (
                      <tr
                        key={claim.sysId || index}
                        style={{
                          borderBottom: "1px solid var(--border-color-neutral-lighter)",
                          cursor: "pointer",
                          backgroundColor: index % 2 === 0 ? "var(--color-bg-neutral-lightest)" : "var(--color-bg-neutral-lighter)"
                        }}
                        onClick={() => onClaimSelect(claim)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-neutral-light)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "var(--color-bg-neutral-lightest)" : "var(--color-bg-neutral-lighter)"}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000">
                            {claim.fnolNumber || claim.claimNumber || 'N/A'}
                          </DxcTypography>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <DxcBadge label={claim.status || 'unknown'} mode="contextual" color={getStatusColor(claim.status)} />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <DxcTypography fontSize="font-scale-03">{claim.insured?.name || 'N/A'}</DxcTypography>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <DxcTypography fontSize="font-scale-03">{claim.claimant?.name || 'N/A'}</DxcTypography>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <DxcTypography fontSize="font-scale-03">{claim.policy?.policyNumber || 'N/A'}</DxcTypography>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A'}
                          </DxcTypography>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <DxcFlex gap="var(--spacing-gap-xs)">
                            <DxcButton
                              icon="open_in_new"
                              mode="tertiary"
                              size="small"
                              title="Open Claim"
                              onClick={(e) => { e.stopPropagation(); onClaimSelect(claim); }}
                            />
                          </DxcFlex>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DxcFlex>
        </div>

        {/* Department Inventory */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-04)",
          padding: "var(--spacing-padding-m)"
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={3} text="Department Inventory" />
            <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
              Inventory organized by workflow group. Click a group to filter the claims list below.
            </DxcTypography>
            <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
              {workflowGroups.map(group => (
                <div
                  key={group.key}
                  onClick={() => {
                    setSubsetFilter(subsetFilter === group.key ? null : group.key);
                    setActiveTabIndex(0);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--border-radius-m)",
                    border: subsetFilter === group.key
                      ? "2px solid #000000"
                      : "1px solid var(--border-color-neutral-lighter)",
                    backgroundColor: subsetFilter === group.key
                      ? "var(--color-bg-neutral-lighter)"
                      : "var(--color-bg-neutral-lightest)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    minWidth: "140px",
                    textAlign: "center"
                  }}
                >
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                    <DxcTypography
                      fontSize="24px"
                      fontWeight="font-weight-semibold"
                      color={group.count > 0 ? "#000000" : "var(--color-fg-neutral-dark)"}
                    >
                      {group.count}
                    </DxcTypography>
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-semibold"
                      color="var(--color-fg-neutral-stronger)"
                      textAlign="center"
                    >
                      {group.label}
                    </DxcTypography>
                  </DxcFlex>
                </div>
              ))}
            </DxcFlex>
            {subsetFilter && (
              <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                  Filtering by:
                </DxcTypography>
                <DxcChip
                  label={workflowGroups.find(g => g.key === subsetFilter)?.label || subsetFilter}
                  onClose={() => setSubsetFilter(null)}
                />
              </DxcFlex>
            )}
          </DxcFlex>
        </div>

        {/* Main Content Card - Claims Inventory */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-02)",
          padding: "var(--spacing-padding-l)"
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcHeading level={3} text="Claims Inventory" />

            {/* Main Tabs: All Open vs Closed */}
            <DxcTabs iconPosition="left">
              <DxcTabs.Tab
                label="All Open Claims"
                icon="assignment"
                active={activeTabIndex === 0}
                onClick={() => { setActiveTabIndex(0); setCurrentPage(1); }}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="Closed Claims"
                icon="assignment_turned_in"
                active={activeTabIndex === 1}
                onClick={() => { setActiveTabIndex(1); setSubsetFilter(null); setCurrentPage(1); }}
              >
                <div />
              </DxcTabs.Tab>
            </DxcTabs>

            {/* Multi-Attribute Filters */}
            <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap" alignItems="flex-end">
              <DxcTextInput
                placeholder="Search for Claim, Policy, or Quote Numbers..."
                value={searchValue}
                onChange={({ value }) => setSearchValue(value)}
                size="medium"
              />
              <DxcSelect
                label="Type"
                placeholder="All Types"
                value={typeFilter}
                onChange={({ value }) => { setTypeFilter(value); setCurrentPage(1); }}
                options={
                  demoLineOfBusiness === 'PC' ? [
                    { label: 'All Types', value: '' },
                    { label: 'Auto Collision', value: 'auto_collision' },
                    { label: 'Auto Comprehensive', value: 'auto_comprehensive' },
                    { label: 'Property Damage', value: 'commercial_property' },
                    { label: 'Homeowners', value: 'homeowners' },
                    { label: 'Liability', value: 'liability' }
                  ] : [
                    { label: 'All Types', value: '' },
                    { label: 'Death', value: 'death' },
                    { label: 'Maturity', value: 'maturity' },
                    { label: 'Surrender', value: 'surrender' },
                    { label: 'Annuity', value: 'annuity' }
                  ]
                }
                size="small"
              />
              <DxcSelect
                label="Amount Range"
                placeholder="All Amounts"
                value={amountRangeFilter}
                onChange={({ value }) => { setAmountRangeFilter(value); setCurrentPage(1); }}
                options={[
                  { label: 'All Amounts', value: '' },
                  { label: 'Under $50K', value: 'under_50k' },
                  { label: '$50K - $250K', value: '50k_250k' },
                  { label: '$250K - $1M', value: '250k_1m' },
                  { label: 'Over $1M', value: 'over_1m' }
                ]}
                size="small"
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
                    color="#000000"
                  >
                    Card View
                  </DxcTypography>
                  <DxcSwitch
                    checked={isGridView}
                    onChange={(checked) => setIsGridView(checked)}
                  />
                  <DxcTypography
                    fontSize="font-scale-03"
                    color="#000000"
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
                const isServiceNow = submission.source === 'servicenow';
                const displayId = isClaim ? (submission.fnolNumber || submission.claimNumber) : submission.id;
                const displayName = isClaim ? (submission.claimant?.name || submission.insured?.name) : submission.name;
                const displayStatus = isClaim ? submission.status : submission.status;
                const displayType = isClaim
                  ? `LOB: ${submission.type === 'death' ? 'Life' : 'Annuity'}`
                  : submission.type;
                const displaySubmitted = isClaim
                  ? new Date(submission.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                  : submission.submitted;
                const hasFastTrack = isClaim && submission.routing?.type === RoutingType.FASTTRACK;
                const isClosed = isClaim && (submission.status === 'closed' || submission.status === 'denied' || submission.status === 'approved');
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
                              color="#000000"
                            >
                              {displayId}
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-03">
                              {displayName}
                            </DxcTypography>
                            {hasFastTrack && (
                              <FastTrackBadge eligible={true} showLabel={true} size="small" />
                            )}
                            {isServiceNow && (
                              <DxcBadge label="ServiceNow" mode="contextual" color="info" />
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
                                claimStatus={submission.status}
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
