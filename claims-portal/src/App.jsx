import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const { user, productLine, switchProductLine } = useApp();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [sidenavExpanded, setSidenavExpanded] = useState(false); // Start minimized
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
  const [snowConnected, setSnowConnected] = useState(serviceNowService.isAuthenticated());
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const actionsButtonRef = useRef(null);

  // Track ServiceNow connection state
  useEffect(() => {
    const unsubscribe = serviceNowService.onAuthChange((authenticated) => {
      setSnowConnected(authenticated);
    });
    return () => unsubscribe?.();
  }, []);

  // Close actions menu on outside click or scroll
  useEffect(() => {
    const close = () => setActionsMenuOpen(false);
    if (actionsMenuOpen) {
      document.addEventListener('mousedown', close);
      document.addEventListener('scroll', close, true);
    }
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [actionsMenuOpen]);

  const openActionsMenu = useCallback((e) => {
    e.stopPropagation();
    const rect = actionsButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setActionsMenuOpen(prev => !prev);
  }, []);

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
    ...( productLine !== 'pc' ? [{
      label: "New Claim FNOL Party Portal",
      icon: "add_circle",
      selected: currentView === 'intake',
      onClick: () => handleNavigationClick('intake')
    }] : []),
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
                {/* Actions Menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    ref={actionsButtonRef}
                    onClick={openActionsMenu}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', cursor: 'pointer',
                      background: 'transparent',
                      border: '1px solid var(--color-border-primary-medium)',
                      borderRadius: 'var(--border-radius-s)',
                      color: 'var(--color-fg-primary-stronger)',
                      fontSize: '14px', fontWeight: '500',
                      userSelect: 'none'
                    }}
                  >
                    Actions
                    <span className="material-icons" style={{ fontSize: '18px' }}>expand_more</span>
                  </button>
                  {actionsMenuOpen && createPortal(
                    <div
                      onMouseDown={e => e.stopPropagation()}
                      style={{
                        position: 'fixed',
                        top: menuPos.top,
                        right: menuPos.right,
                        minWidth: '250px',
                        backgroundColor: 'var(--color-bg-neutral-lightest)',
                        border: '1px solid var(--border-color-neutral-lighter)',
                        borderRadius: 'var(--border-radius-m)',
                        boxShadow: 'var(--shadow-mid-04)',
                        zIndex: 99999,
                        overflow: 'hidden'
                      }}>
                      {/* Product Line Toggle Section */}
                      <div style={{ padding: '8px 16px 4px', borderBottom: '1px solid var(--border-color-neutral-lighter)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-fg-neutral-strong)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                          Demo Product Line
                        </div>
                        <div style={{ display: 'flex', gap: '6px', paddingBottom: '8px' }}>
                          {[
                            { id: 'la', label: 'L&A', icon: 'favorite', title: 'Life & Annuity' },
                            { id: 'pc', label: 'P&C', icon: 'directions_car', title: 'Property and Casualty' }
                          ].map(pl => (
                            <button
                              key={pl.id}
                              onClick={() => { switchProductLine(pl.id); setActionsMenuOpen(false); }}
                              title={pl.title}
                              style={{
                                flex: 1,
                                padding: '7px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                background: productLine === pl.id ? 'var(--color-bg-primary-strong)' : 'var(--color-bg-neutral-lighter)',
                                border: productLine === pl.id ? '1.5px solid var(--color-border-primary-medium)' : '1.5px solid transparent',
                                borderRadius: 'var(--border-radius-s)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: productLine === pl.id ? '600' : '400',
                                color: productLine === pl.id ? 'var(--color-fg-primary-stronger)' : 'var(--color-fg-neutral-dark)',
                                transition: 'all 0.15s'
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: '15px' }}>{pl.icon}</span>
                              {pl.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ServiceNow Connect Section */}
                      {serviceNowService.useOAuth && (
                        snowConnected ? (
                          <button
                            onClick={() => {
                              serviceNowService.clearAuth();
                              setSnowConnected(false);
                              setActionsMenuOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: 'var(--color-fg-neutral-dark)',
                              textAlign: 'left',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-neutral-lighter)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--color-fg-error-medium)' }}>link_off</span>
                            Disconnect from ServiceNow
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              serviceNowService.startOAuthLogin();
                              setActionsMenuOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: 'var(--color-fg-neutral-dark)',
                              textAlign: 'left',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-neutral-lighter)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--color-fg-success-medium)' }}>link</span>
                            Connect to ServiceNow
                          </button>
                        )
                      )}
                    </div>,
                    document.body
                  )}
                </div>
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
