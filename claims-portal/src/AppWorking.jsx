import { useState } from 'react';
import { DxcFlex } from '@dxc-technology/halstack-react';
import DashboardSimple from './components/Dashboard/DashboardSimple';
import ClaimsWorkbenchSimple from './components/ClaimsWorkbench/ClaimsWorkbenchSimple';
import QueueManagement from './components/QueueManagement/QueueManagement';
import IntakeFormsSimple from './components/IntakeForms/IntakeFormsSimple';
import ReportsAnalytics from './components/Reports/ReportsAnalytics';
import './App.css';

function AppWorking() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);

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

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedClaim(null);
  };

  const handleNewClaim = () => {
    setCurrentView('intake');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardSimple onClaimSelect={handleClaimSelect} onNewClaim={handleNewClaim} />;
      case 'workbench':
        return <ClaimsWorkbenchSimple claim={selectedClaim} onBack={handleBackToDashboard} />;
      case 'intake':
        return <IntakeFormsSimple onBack={handleBackToDashboard} />;
      case 'queue':
        return <QueueManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      default:
        return <DashboardSimple onClaimSelect={handleClaimSelect} onNewClaim={handleNewClaim} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <DxcFlex gap="1rem" alignItems="center" justifyContent="space-between">
          <DxcFlex gap="1rem" alignItems="center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#0095FF"/>
              <path d="M16 8L20 16L16 24L12 16L16 8Z" fill="white"/>
            </svg>
            <h2 style={{ margin: 0, color: '#0095FF', fontSize: '20px', fontWeight: 600 }}>
              Bloom Claims Assistant
            </h2>
          </DxcFlex>
          <DxcFlex gap="1rem" alignItems="center">
            <span style={{ fontSize: '14px', color: '#666' }}>Sarah Johnson</span>
            <span style={{ fontSize: '14px', color: '#666' }}>s.johnson@insurance.com</span>
          </DxcFlex>
        </DxcFlex>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: '240px',
          backgroundColor: '#fff',
          borderRight: '1px solid #e0e0e0',
          padding: '1rem 0'
        }}>
          <nav>
            <button
              onClick={() => handleNavigationClick('dashboard')}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: currentView === 'dashboard' ? '#E6F4FF' : 'transparent',
                color: currentView === 'dashboard' ? '#0095FF' : '#666',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: currentView === 'dashboard' ? 600 : 400,
                borderLeft: currentView === 'dashboard' ? '3px solid #0095FF' : '3px solid transparent'
              }}
            >
              My Claims
            </button>
            <button
              onClick={() => handleNavigationClick('intake')}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: currentView === 'intake' ? '#E6F4FF' : 'transparent',
                color: currentView === 'intake' ? '#0095FF' : '#666',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: currentView === 'intake' ? 600 : 400,
                borderLeft: currentView === 'intake' ? '3px solid #0095FF' : '3px solid transparent'
              }}
            >
              New Claim (FNOL)
            </button>
            <button
              onClick={() => handleNavigationClick('queue')}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: currentView === 'queue' ? '#E6F4FF' : 'transparent',
                color: currentView === 'queue' ? '#0095FF' : '#666',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: currentView === 'queue' ? 600 : 400,
                borderLeft: currentView === 'queue' ? '3px solid #0095FF' : '3px solid transparent'
              }}
            >
              Queue Management
            </button>
            <button
              onClick={() => handleNavigationClick('reports')}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: currentView === 'reports' ? '#E6F4FF' : 'transparent',
                color: currentView === 'reports' ? '#0095FF' : '#666',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: currentView === 'reports' ? 600 : 400,
                borderLeft: currentView === 'reports' ? '3px solid #0095FF' : '3px solid transparent'
              }}
            >
              Reports & Analytics
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AppWorking;
