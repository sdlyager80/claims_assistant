import { useState } from 'react';
import { DxcApplicationLayout, DxcFlex, DxcTypography, DxcButton } from '@dxc-technology/halstack-react';
import Dashboard from './components/Dashboard/Dashboard';
import ClaimsWorkbench from './components/ClaimsWorkbench/ClaimsWorkbench';
import IntakeForms from './components/IntakeForms/IntakeForms';
import FNOLWorkspace from './components/FNOLWorkspace/FNOLWorkspace';
import PendingClaimsReview from './components/PendingClaimsReview/PendingClaimsReview';
import RequirementsReceived from './components/RequirementsReceived/RequirementsReceived';
import ThemeSettings from './components/ThemeSettings/ThemeSettings';
import CommercialClaimDemo from './components/CommercialClaimDemo';

// Context Providers
import { AppProvider, useApp } from './contexts/AppContext';
import { DemoModeProvider, useDemoMode } from './contexts/DemoModeContext';
import { ClaimsProvider } from './contexts/ClaimsContext';
import { PolicyProvider } from './contexts/PolicyContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { DocumentProvider } from './contexts/DocumentContext';

import './App.css';

/**
 * Main Application Component (wrapped with context providers)
 */
function AppContent() {

  // Access global app context
  const { user } = useApp();
  const { demoLineOfBusiness, toggleDemoMode } = useDemoMode();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [sidenavExpanded, setSidenavExpanded] = useState(true);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);

  const handleClaimSelect = (claim) => {
    setSelectedClaim(claim);
    setCurrentView('workbench');
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
      case 'commercialDemo':
        return <CommercialClaimDemo />;
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
      label: "Commercial Demo - Bloom & Petals",
      icon: "store",
      selected: currentView === 'commercialDemo',
      onClick: () => handleNavigationClick('commercialDemo')
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
    {/* Skip to main content link for keyboard navigation */}
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>

    <DxcApplicationLayout
      header={
        <DxcApplicationLayout.Header
          appTitle={
            <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
              <img
                src="/bloom-logo.jpg"
                alt="Bloom Insurance"
                style={{
                  height: '36px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
              <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Claims Assistant</span>
            </DxcFlex>
          }
          sideContent={(isResponsive) =>
            isResponsive ? null : (
              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    Demo Mode:
                  </DxcTypography>
                  <DxcButton
                    label="L&A"
                    mode={demoLineOfBusiness === 'LA' ? 'primary' : 'tertiary'}
                    size="small"
                    aria-label={`Switch to Life and Annuity demo mode${demoLineOfBusiness === 'LA' ? ' (currently selected)' : ''}`}
                    aria-pressed={demoLineOfBusiness === 'LA'}
                    onClick={() => toggleDemoMode('LA')}
                  />
                  <DxcButton
                    label="P&C"
                    mode={demoLineOfBusiness === 'PC' ? 'primary' : 'tertiary'}
                    size="small"
                    aria-label={`Switch to Property and Casualty demo mode${demoLineOfBusiness === 'PC' ? ' (currently selected)' : ''}`}
                    aria-pressed={demoLineOfBusiness === 'PC'}
                    onClick={() => toggleDemoMode('PC')}
                  />
                </DxcFlex>
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
                  aria-label="Open theme settings"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsThemeSettingsOpen(true);
                    }
                  }}
                >
                  <span className="material-icons" aria-hidden="true">palette</span>
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
      <DxcApplicationLayout.Main id="main-content">
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
      <DemoModeProvider>
        <ClaimsProvider>
          <PolicyProvider>
            <WorkflowProvider>
              <DocumentProvider>
                <AppContent />
              </DocumentProvider>
            </WorkflowProvider>
          </PolicyProvider>
        </ClaimsProvider>
      </DemoModeProvider>
    </AppProvider>
  );
}

export default App;
