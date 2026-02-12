import { useState, useEffect, useMemo } from 'react';
import useAriaLiveRegion from '../../hooks/useAriaLiveRegion.jsx';
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
  DxcAlert,
} from '@dxc-technology/halstack-react';
import { useClaims } from '../../contexts/ClaimsContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { useApp } from '../../contexts/AppContext';
import FastTrackBadge from '../shared/FastTrackBadge';
import SLAIndicator from '../shared/SLAIndicator';
import { RoutingType, ClaimStatus } from '../../types/claim.types';
import serviceNowService from '../../services/api/serviceNowService';
import { sanitizeInput } from '../../utils/validation';
import DashboardMetricsCard from './DashboardMetricsCard';
import FastTrackMetricsCard from './FastTrackMetricsCard';
import DepartmentInventorySection from './DepartmentInventorySection';
import ServiceNowClaimsTable from './ServiceNowClaimsTable';
import MyTasksCard from './MyTasksCard';
import ClaimCard from './ClaimCard';
import PhaseInventory from './PhaseInventory';
import './Dashboard.css';

const Dashboard = ({ onClaimSelect }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0); // 0 = All Open, 1 = Closed
  const [subsetFilter, setSubsetFilter] = useState(null); // Pre-filtered subset
  const [selectedPhase, setSelectedPhase] = useState(null); // Selected phase for drill-down
  const [searchValue, setSearchValue] = useState('');
  const [isGridView, setIsGridView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [snowClaims, setSnowClaims] = useState([]);
  const [snowLoading, setSnowLoading] = useState(false);
  const [snowError, setSnowError] = useState(null);
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

  const { user } = useApp();

  // ARIA live region for announcing changes
  const [announce, LiveRegion] = useAriaLiveRegion();

  // Fetch ServiceNow claims when authenticated
  const fetchServiceNowClaims = async () => {
    if (!serviceNowService.isAuthenticated()) return;
    try {
      setSnowLoading(true);
      setSnowError(null);
      const fnolRecords = await serviceNowService.getFNOLsGlobal({ limit: 50 });
      const mappedClaims = fnolRecords.map(fnol => serviceNowService.mapFNOLToClaim(fnol));
      setSnowClaims(mappedClaims);
    } catch (err) {
      console.error('[Dashboard] Failed to fetch ServiceNow claims:', err);
      setSnowError(`Failed to load ServiceNow claims: ${err.message}`);
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

  // Calculate Total Open Inventory for logged-in user
  const totalOpenInventory = useMemo(() => {
    if (!allClaims || allClaims.length === 0) return 0;

    // Count all open claims assigned to the current user
    // If user is not logged in or claims don't have assignedTo, show all open claims
    return allClaims.filter(c => {
      const isOpen = c.status !== ClaimStatus.CLOSED && c.status !== ClaimStatus.DENIED;

      // If no user context or claim has no assignedTo field, include all open claims
      if (!user || !c.assignedTo) return isOpen;

      // Otherwise, filter by assignment
      const isAssignedToUser = c.assignedTo === user.name || c.assignedTo === user.id;
      return isOpen && isAssignedToUser;
    }).length;
  }, [allClaims, user]);

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

    // Apply phase filter (takes precedence over subset filter)
    if (selectedPhase) {
      filtered = filtered.filter(c => selectedPhase.statuses.includes(c.status));

      // Filter by user assignment if user exists
      if (user) {
        filtered = filtered.filter(c =>
          !c.assignedTo || c.assignedTo === user.name || c.assignedTo === user.id
        );
      }
    } else if (subsetFilter) {
      // Apply subset filter only if no phase is selected
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
  }, [allClaims, activeTabIndex, subsetFilter, selectedPhase, searchValue, typeFilter, productFilter, amountRangeFilter, user]);

  // Announce filtered results to screen readers
  useEffect(() => {
    if (filteredClaims.length === 0) {
      announce('No claims found matching your criteria');
    } else {
      const tabName = activeTabIndex === 0 ? 'open' : 'closed';
      announce(`Showing ${filteredClaims.length} ${tabName} ${filteredClaims.length === 1 ? 'claim' : 'claims'}`);
    }
  }, [filteredClaims.length, activeTabIndex, announce]);

  // Paginate claims
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * 9;
    return filteredClaims.slice(startIndex, startIndex + 9);
  }, [filteredClaims, currentPage]);

  // Helper to get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
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
        // Handle string statuses like 'investigation'
        if (statusLower === 'investigation' || statusLower === 'fraud_investigation') return 'error';
        return 'neutral';
    }
  };

  // Handler for phase click - drills into filtered view
  const handlePhaseClick = (phase) => {
    if (selectedPhase?.key === phase.key) {
      // Clicking same phase again clears the filter
      setSelectedPhase(null);
    } else {
      setSelectedPhase(phase);
      setActiveTabIndex(0); // Switch to open claims tab
      setSubsetFilter(null); // Clear subset filter
      setCurrentPage(1); // Reset to first page

      // Scroll to Claims Inventory section
      setTimeout(() => {
        const claimsSection = document.querySelector('[aria-label*="Claims Inventory"]');
        if (claimsSection) {
          claimsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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

        {/* ARIA Live Region for announcements */}
        <LiveRegion />

        {/* Error Alert */}
        {claimsError && (
          <DxcAlert
            type="error"
            inlineText={`Failed to load claims: ${claimsError}`}
            size="fillParent"
            closable
            onClose={() => {}}
          >
            <DxcButton
              label="Retry"
              mode="secondary"
              size="small"
              icon="refresh"
              onClick={() => fetchClaims()}
            />
          </DxcAlert>
        )}

        {/* Total Open Inventory - Large KPI Tile */}
        <div style={{
          backgroundColor: 'var(--color-bg-info-lighter)',
          borderRadius: 'var(--border-radius-m)',
          boxShadow: 'var(--shadow-high-01)',
          padding: 'var(--spacing-padding-xl)',
          border: '2px solid var(--color-border-info-medium)'
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
            <DxcTypography
              fontSize="font-scale-02"
              fontWeight="font-weight-semibold"
              color="var(--color-fg-neutral-stronger)"
              textAlign="center"
            >
              TOTAL OPEN INVENTORY
            </DxcTypography>
            <DxcTypography
              fontSize="56px"
              fontWeight="font-weight-bold"
              color="var(--color-fg-info-dark)"
              textAlign="center"
              style={{ lineHeight: '1' }}
            >
              {totalOpenInventory}
            </DxcTypography>
            <DxcTypography
              fontSize="font-scale-03"
              fontWeight="font-weight-regular"
              color="var(--color-fg-neutral-strong)"
              textAlign="center"
            >
              {user ? `Open cases assigned to ${user.name}` : 'Open cases assigned to you'}
            </DxcTypography>
          </DxcFlex>
        </div>

        {/* Inventory by Phase */}
        <PhaseInventory
          claims={allClaims}
          user={user}
          onPhaseClick={handlePhaseClick}
          selectedPhase={selectedPhase}
        />

        {/* Highlights Section - Top Cards */}
        <DxcFlex gap="var(--spacing-gap-m)">
          {/* My Tasks Card */}
          <div style={{ flex: 1 }}>
            <MyTasksCard claims={allClaims} />
          </div>

          {/* Key Metrics Card */}
          <div style={{ flex: 2 }}>
            <DashboardMetricsCard claims={allClaims} demoLineOfBusiness={demoLineOfBusiness} />
          </div>
        </DxcFlex>

        {/* FastTrack Metrics Card */}
        <FastTrackMetricsCard claims={allClaims} />

        {/* ServiceNow FNOL Claims Table - DISABLED */}
        {/* Uncomment below to re-enable ServiceNow integration
        {(snowClaims.length > 0 || snowLoading || snowError) && (
          <ServiceNowClaimsTable
            snowClaims={snowClaims}
            snowLoading={snowLoading}
            snowError={snowError}
            snowConnected={snowConnected}
            onClaimSelect={onClaimSelect}
            onRetry={fetchServiceNowClaims}
            onDisconnect={() => {
              serviceNowService.clearAuth();
              setSnowClaims([]);
            }}
          />
        )}
        */}

        {/* Department Inventory */}
        <DepartmentInventorySection
          claims={allClaims}
          demoLineOfBusiness={demoLineOfBusiness}
          subsetFilter={subsetFilter}
          onFilterChange={(newFilter) => {
            setSubsetFilter(newFilter);
            setActiveTabIndex(0);
            setCurrentPage(1);
          }}
        />

        {/* Main Content Card - Claims Inventory */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-02)",
          padding: "var(--spacing-padding-l)"
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                <DxcHeading level={3} text="Claims Inventory" />
                {selectedPhase && (
                  <DxcBadge
                    label={`Filtered: ${selectedPhase.label}`}
                    mode="contextual"
                    color="info"
                  />
                )}
              </DxcFlex>
              {selectedPhase && (
                <DxcButton
                  label="Clear Filter"
                  mode="secondary"
                  size="small"
                  icon="close"
                  onClick={() => setSelectedPhase(null)}
                />
              )}
            </DxcFlex>

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
                onChange={({ value }) => setSearchValue(sanitizeInput(value))}
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
                  onClick={() => alert('Column customization feature\n\nThis will allow you to show/hide columns and reorder them to match your workflow preferences.')}
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
              {displayData && displayData.map((submission, index) => (
                <ClaimCard
                  key={index}
                  submission={submission}
                  isGridView={isGridView}
                  onSelect={onClaimSelect}
                />
              ))}
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
