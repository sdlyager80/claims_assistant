import { useState } from 'react';
import { DxcApplicationLayout, DxcFlex, DxcTypography, DxcButton } from '@dxc-technology/halstack-react';
import Dashboard from './components/Dashboard/Dashboard';
import ClaimsWorkbench from './components/ClaimsWorkbench/ClaimsWorkbench';
import IntakeForms from './components/IntakeForms/IntakeForms';
import ThemeSettings from './components/ThemeSettings/ThemeSettings';

// Context Providers
import { AppProvider, useApp } from './contexts/AppContext';
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

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [sidenavExpanded, setSidenavExpanded] = useState(true);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);

  const handleClaimSelect = (claim) => {
    console.log('[App] handleClaimSelect called with claim:', claim);
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
        return <ClaimsWorkbench claim={selectedClaim} />;
      case 'intake':
        return <IntakeForms />;
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
      label: "My Claims",
      icon: "assignment",
      selected: currentView === 'claims',
      onClick: () => handleNavigationClick('claims')
    },
    {
      label: "New Claim (FNOL)",
      icon: "add_circle",
      selected: currentView === 'intake',
      onClick: () => handleNavigationClick('intake')
    },
  ];

  return (
    <>
    <DxcApplicationLayout
      header={
        <DxcApplicationLayout.Header
          appTitle="Bloom Claims Assistant"
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
