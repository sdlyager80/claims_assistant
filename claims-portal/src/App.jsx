import { useState } from 'react';
import { DxcApplicationLayout, DxcFlex, DxcTypography, DxcButton } from '@dxc-technology/halstack-react';
import Dashboard from './components/Dashboard/Dashboard';
import ClaimsWorkbench from './components/ClaimsWorkbench/ClaimsWorkbench';
import IntakeForms from './components/IntakeForms/IntakeForms';
import FNOLWorkspace from './components/FNOLWorkspace/FNOLWorkspace';
import PendingClaimsReview from './components/PendingClaimsReview/PendingClaimsReview';
import RequirementsReceived from './components/RequirementsReceived/RequirementsReceived';
import ClaimsHandlerDashboard from './components/ClaimsHandlerDashboard/ClaimsHandlerDashboard';
import ThemeSettings from './components/ThemeSettings/ThemeSettings';

// Context Providers
import { AppProvider, useApp } from './contexts/AppContext';
import { ClaimsProvider } from './contexts/ClaimsContext';
import { PolicyProvider } from './contexts/PolicyContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { DocumentProvider } from './contexts/DocumentContext';

// Services
import serviceNowService from './services/api/serviceNowService';

import './App.css';

/**
 * Main Application Component (wrapped with context providers)
 */
function AppContent() {

  // Access global app context
  const { user } = useApp();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [sidenavExpanded, setSidenavExpanded] = useState(false); // Start minimized
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);

  const handleClaimSelect = async (claim) => {
    console.log('[App] handleClaimSelect called with claim:', claim);
    setSelectedClaim(claim);
    setCurrentView('workbench');

    // Trigger beneficiary analysis API immediately when FNOL is clicked
    const sysId = claim?.sysId || claim?.sys_id || claim?.servicenow_sys_id;
    if (sysId && !sysId.startsWith('demo-')) {
      console.log('[App] Triggering beneficiary analysis for sys_id:', sysId);
      try {
        await serviceNowService.getBeneficiaryAnalyzer(sysId);
        console.log('[App] Beneficiary analysis triggered successfully');
      } catch (error) {
        console.error('[App] Error triggering beneficiary analysis:', error);
        // Don't block navigation on error
      }
    }
  };

  const handleNavigationClick = (view) => {
    setCurrentView(view);
    if (view !== 'workbench') {
      setSelectedClaim(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onClaimSelect={handleClaimSelect} />;
      case 'handlerDashboard':
        return <ClaimsHandlerDashboard />;
      case 'workbench':
        return <ClaimsWorkbench claim={selectedClaim} onBack={() => handleNavigationClick('dashboard')} />;
      case 'intake':
        return <IntakeForms />;
      case 'fnolWorkspace':
        return <FNOLWorkspace onClaimSelect={handleClaimSelect} />;
      case 'pendingReview':
        return <PendingClaimsReview onClaimSelect={handleClaimSelect} />;
      case 'requirementsReceived':
        return <RequirementsReceived onClaimSelect={handleClaimSelect} />;
      default:
        return <Dashboard onClaimSelect={handleClaimSelect} />;
    }
  };

  const sidenavItems = [
    {
      label: "Dashboard",
      icon: "dashboard",
      selected: currentView === 'dashboard',
      onClick: () => handleNavigationClick('dashboard')
    },
    {
      label: "My Claims Workbench",
      icon: "assignment_ind",
      selected: currentView === 'handlerDashboard',
      onClick: () => handleNavigationClick('handlerDashboard')
    },
    {
      label: "New Claim FNOL Party Portal",
      icon: "add_circle",
      selected: currentView === 'intake',
      onClick: () => handleNavigationClick('intake')
    },
    {
      label: "New FNOL Workspace",
      icon: "work",
      selected: currentView === 'fnolWorkspace',
      onClick: () => handleNavigationClick('fnolWorkspace')
    },
    {
      label: "Pending Claims Review",
      icon: "pending_actions",
      selected: currentView === 'pendingReview',
      onClick: () => handleNavigationClick('pendingReview')
    },
    {
      label: "Requirements Received",
      icon: "mail",
      selected: currentView === 'requirementsReceived',
      onClick: () => handleNavigationClick('requirementsReceived')
    },
  ];

  return (
    <>
    <DxcApplicationLayout
      header={
        <DxcApplicationLayout.Header
          appTitle={
            <img
              src="/Bloom_logo.jpg"
              alt="Bloom Insurance"
              style={{ height: '32px', width: 'auto' }}
            />
          }
          sideContent={(isResponsive) =>
            isResponsive ? null : (
              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                <div
                  onClick={() => {
                    setIsThemeSettingsOpen(true);
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-fg-neutral-strong)',
                    fontSize: '24px',
                    userSelect: 'none'
                  }}
                  title="Theme Settings"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setIsThemeSettingsOpen(true);
                    }
                  }}
                >
                  <span className="material-icons">palette</span>
                </div>
                <DxcFlex direction="column" gap="var(--spacing-gap-none)">
                  <DxcTypography>{user?.name || 'User'}</DxcTypography>
                  <DxcTypography
                    fontSize="font-scale-01"
                    color="var(--color-fg-neutral-stronger)"
                  >
                    {user?.email || ''}
                  </DxcTypography>
                </DxcFlex>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-bg-primary-lighter)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-fg-primary-stronger)",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </div>
              </DxcFlex>
            )
          }
        />
      }
      sidenav={
        <DxcApplicationLayout.Sidenav
          navItems={sidenavItems}
          expanded={sidenavExpanded}
          onExpandedChange={setSidenavExpanded}
        />
      }
    >
      <DxcApplicationLayout.Main>
        {renderContent()}
      </DxcApplicationLayout.Main>
    </DxcApplicationLayout>
    <ThemeSettings
      isOpen={isThemeSettingsOpen}
      onClose={() => setIsThemeSettingsOpen(false)}
      onThemeChange={(colors) => {
        // Theme applied successfully
      }}
    />
    </>
  );
}

/**
 * App Wrapper with Context Providers
 * Wraps the application with all context providers in the correct order
 */
function App() {

  return (
    <AppProvider>
      <ClaimsProvider>
        <PolicyProvider>
          <WorkflowProvider>
            <DocumentProvider>
              <AppContent />
            </DocumentProvider>
          </WorkflowProvider>
        </PolicyProvider>
      </ClaimsProvider>
    </AppProvider>
  );
}

export default App;
