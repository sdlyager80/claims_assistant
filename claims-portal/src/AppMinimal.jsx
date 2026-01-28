import { DxcButton, DxcCard, DxcFlex } from '@dxc-technology/halstack-react';
import './App.css';

function AppMinimal() {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Bloom Claims Assistant</h1>
      <DxcFlex gap="1rem" direction="column">
        <DxcCard>
          <h2>Testing Basic Components</h2>
          <p>If you see this, basic Halstack components work!</p>
          <DxcButton label="Click Me" onClick={() => alert('Button works!')} />
        </DxcCard>

        <DxcCard>
          <h3>Dashboard Preview</h3>
          <p>This would be the dashboard content</p>
        </DxcCard>
      </DxcFlex>
    </div>
  );
}

export default AppMinimal;
