import { useState } from 'react';
import { DxcApplicationLayout, DxcFlex, DxcButton } from '@dxc-technology/halstack-react';
import './App.css';

function AppSimple() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <DxcApplicationLayout>
      <DxcApplicationLayout.Header>
        <DxcFlex gap="1rem" alignItems="center">
          <h2 style={{ margin: 0, color: '#5f249f' }}>
            Bloom Claims Assistant
          </h2>
        </DxcFlex>
      </DxcApplicationLayout.Header>

      <DxcApplicationLayout.SideNav>
        <DxcApplicationLayout.SideNav.Link
          onClick={() => setCurrentView('dashboard')}
          selected={currentView === 'dashboard'}
        >
          Dashboard
        </DxcApplicationLayout.SideNav.Link>
      </DxcApplicationLayout.SideNav>

      <DxcApplicationLayout.Main>
        <div style={{ padding: '2rem' }}>
          <h1>Dashboard</h1>
          <p>Welcome to Bloom Claims Assistant</p>
          <DxcButton label="Test Button" onClick={() => alert('Working!')} />
        </div>
      </DxcApplicationLayout.Main>
    </DxcApplicationLayout>
  );
}

export default AppSimple;
