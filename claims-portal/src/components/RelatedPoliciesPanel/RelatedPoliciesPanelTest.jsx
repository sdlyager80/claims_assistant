/**
 * Test Page for Related Policies Panel
 *
 * This is a standalone test page to view the RelatedPoliciesPanel in action.
 * Use this to test the component without integrating it into the full app.
 *
 * To use:
 * 1. Import this in your App.jsx or routing
 * 2. Navigate to the test route
 * 3. See the component with demo data
 */

import { useState } from 'react';
import { DxcContainer, DxcFlex, DxcTypography, DxcButton, DxcHeading } from '@dxc-technology/halstack-react';
import RelatedPoliciesPanel from './RelatedPoliciesPanel';
import demoData from '../../data/demoData';

const RelatedPoliciesPanelTest = () => {
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Get test claims from demo data
  const testClaims = [
    {
      id: 'claim-1',
      name: 'Robert Jones - 2 Related Policies',
      claim: demoData.claims.find(c => c.id === 'claim-1')
    },
    {
      id: 'claim-3',
      name: 'Thomas Garcia - 1 Related Policy',
      claim: demoData.claims.find(c => c.id === 'claim-3')
    },
    {
      id: 'claim-2',
      name: 'Harold Mitchell - No Related Policies',
      claim: demoData.claims.find(c => c.id === 'claim-2')
    }
  ];

  const handleInitiateClaim = (policy) => {
    console.log('🚀 Initiating claim for policy:', policy.policyNumber);
    console.log('Policy details:', policy);

    // Show alert for demo
    alert(`Initiating death claim for policy ${policy.policyNumber}\n\nFace Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(policy.faceAmount)}\n\nIn a real implementation, this would:\n1. Pre-populate FNOL form\n2. Link to original claim\n3. Copy death certificate\n4. Navigate to intake form`);
  };

  const handleViewPolicy = (policy) => {
    console.log('👁️ Viewing policy:', policy.policyNumber);
    console.log('Policy details:', policy);

    // Show alert for demo
    alert(`Viewing policy ${policy.policyNumber}\n\nIn a real implementation, this would navigate to the Policy Detail View.`);
  };

  return (
    <DxcContainer padding="var(--spacing-padding-xxl)">
      <DxcFlex direction="column" gap="var(--spacing-gap-xl)">
        {/* Header */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcHeading level={1} text="Related Policies Panel - Test Page" />
          <DxcTypography fontSize="font-scale-02">
            This test page demonstrates the Related Policies feature for death claims.
            Select a test claim below to see how the component identifies and displays related policies.
          </DxcTypography>
        </DxcFlex>

        {/* Test Claim Selector */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              Select a Test Claim:
            </DxcTypography>
            <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
              {testClaims.map((testCase) => (
                <DxcButton
                  key={testCase.id}
                  label={testCase.name}
                  mode={selectedClaim?.id === testCase.id ? 'primary' : 'secondary'}
                  onClick={() => setSelectedClaim(testCase)}
                />
              ))}
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* Selected Claim Info */}
        {selectedClaim && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-info-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontWeight="font-weight-semibold">
                Test Claim: {selectedClaim.claim.claimNumber}
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01">
                <strong>Deceased:</strong> {selectedClaim.claim.insured.name} (DOD: {selectedClaim.claim.insured.dateOfDeath})
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01">
                <strong>Current Claim Policy:</strong> {selectedClaim.claim.policy.policyNumber} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedClaim.claim.policy.faceAmount)}
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Related Policies Panel */}
        {selectedClaim && (
          <div style={{ border: '2px dashed var(--color-border-primary-strong)', padding: '16px', borderRadius: '8px' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)" style={{ marginBottom: '16px' }}>
              <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-primary-strong)">
                ⬇️ Related Policies Panel Component ⬇️
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                This panel automatically searches for policies where the deceased is the insured.
              </DxcTypography>
            </DxcFlex>

            <RelatedPoliciesPanel
              claimData={selectedClaim.claim}
              onInitiateClaim={handleInitiateClaim}
              onViewPolicy={handleViewPolicy}
            />
          </div>
        )}

        {/* Instructions */}
        {!selectedClaim && (
          <DxcContainer
            padding="var(--spacing-padding-l)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', textAlign: 'center' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '64px', color: 'var(--color-fg-neutral-stronger)' }}>
                touch_app
              </span>
              <DxcTypography fontWeight="font-weight-semibold">
                Select a test claim above to see the Related Policies Panel
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Console Output Instructions */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
              💡 Testing Tips:
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01">
              • Open browser console to see detailed logs
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01">
              • Click "Initiate Death Claim" to see pre-population logic
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01">
              • Click "View Policy Details" to see navigation behavior
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01">
              • Try different test claims to see various scenarios
            </DxcTypography>
          </DxcFlex>
        </DxcContainer>
      </DxcFlex>
    </DxcContainer>
  );
};

export default RelatedPoliciesPanelTest;

/**
 * TO ADD TO YOUR APP:
 *
 * Option 1: Add to App.jsx routing
 * import RelatedPoliciesPanelTest from './components/RelatedPoliciesPanel/RelatedPoliciesPanelTest';
 *
 * // In your routes or content:
 * <Route path="/test/related-policies" element={<RelatedPoliciesPanelTest />} />
 *
 * Option 2: Temporarily replace your main view
 * In main.jsx or App.jsx:
 * import RelatedPoliciesPanelTest from './components/RelatedPoliciesPanel/RelatedPoliciesPanelTest';
 *
 * // Temporarily render:
 * <RelatedPoliciesPanelTest />
 */
