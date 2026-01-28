import { DxcButton } from '@dxc-technology/halstack-react';

function AppTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bloom Claims Assistant - Test</h1>
      <p>If you see this, React and Halstack are working!</p>
      <DxcButton label="Test Button" onClick={() => alert('Working!')} />
    </div>
  );
}

export default AppTest;
