/**
 * ENHANCED Claim Detail Component
 *
 * This is an enhanced version of ClaimDetail.jsx that includes:
 * - Automatic beneficiary analysis trigger on FNOL load
 * - BeneficiaryAnalysisPanel component integration
 *
 * TO USE THIS:
 * 1. Import BeneficiaryAnalysisPanel at the top of your ClaimDetail.jsx
 * 2. Add the BeneficiaryAnalysisPanel component in the right sidebar (see below)
 * 3. The analysis will automatically trigger when FNOL is opened
 */

// ==========================================
// STEP 1: Add this import to ClaimDetail.jsx
// ==========================================

import BeneficiaryAnalysisPanel from './BeneficiaryAnalysisPanel';

// ==========================================
// STEP 2: In the ClaimDetail component's render, add the panel
// ==========================================

/**
 * Add this in the Right Column - Sidebar section, after QuickActions
 *
 * Location: Around line 450 in ClaimDetail.jsx
 * Look for: <QuickActions claim={claim} onAction={handleAction} />
 */

/* EXAMPLE INTEGRATION: */

export const ExampleIntegration = ({ claim, claimId, currentPolicy, handleAction }) => {
  return (
    <DxcFlex gap="var(--spacing-gap-m)" style={{ alignItems: 'flex-start' }}>
      {/* Left Column - Main Content */}
      <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: 2 }}>
        {/* ... existing tabs and content ... */}
      </DxcFlex>

      {/* Right Column - Sidebar */}
      <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: 1, minWidth: '320px' }}>
        {/* Quick Actions */}
        <QuickActions claim={claim} onAction={handleAction} />

        {/* ✨ NEW: Beneficiary Analysis Panel ✨ */}
        {claim?.sysId && (
          <BeneficiaryAnalysisPanel
            fnolSysId={claim.sysId}
            claimNumber={claim.claimNumber || claim.id}
          />
        )}

        {/* Policy Information */}
        <PolicyInformation claim={claim} policy={currentPolicy} />
      </DxcFlex>
    </DxcFlex>
  );
};

// ==========================================
// STEP 3: Make sure claim object has sysId
// ==========================================

/**
 * The claim object needs to have a sysId field from ServiceNow.
 *
 * If your claim data comes from ServiceNow, ensure the mapping includes:
 * - claim.sysId (the ServiceNow sys_id)
 * - claim.source = 'servicenow'
 *
 * Check serviceNowService.js mapFNOLToClaim() method - it already includes:
 *   id: fnol.sys_id,
 *   sysId: fnol.sys_id,
 *   source: 'servicenow'
 */

// ==========================================
// COMPLETE INTEGRATION EXAMPLE
// ==========================================

/**
 * Here's the complete code snippet to add to ClaimDetail.jsx:
 */

/*

// At the top with other imports:
import BeneficiaryAnalysisPanel from './BeneficiaryAnalysisPanel';

// In the render section, around line 450, modify the Right Column:

<DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: 1, minWidth: '320px' }}>
  {/* Quick Actions *\/}
  <QuickActions claim={claim} onAction={handleAction} />

  {/* Beneficiary Analysis Panel - Auto-triggers on FNOL load *\/}
  {claim?.sysId && claim?.source === 'servicenow' && (
    <BeneficiaryAnalysisPanel
      fnolSysId={claim.sysId}
      claimNumber={claim.claimNumber || claim.fnolNumber || claim.id}
    />
  )}

  {/* Policy Information *\/}
  <PolicyInformation claim={claim} policy={currentPolicy} />
</DxcFlex>

*/

// ==========================================
// CONFIGURATION OPTIONS
// ==========================================

/**
 * You can customize the auto-trigger behavior in BeneficiaryAnalysisPanel.jsx:
 *
 * const {
 *   ...
 * } = useBeneficiaryAnalysis(fnolSysId, {
 *   autoTrigger: true,           // Set to false to disable auto-trigger
 *   autoTriggerDelay: 2000,      // Adjust delay (in milliseconds)
 *   onSuccess: (result) => {
 *     // Custom success handler
 *   },
 *   onError: (err) => {
 *     // Custom error handler
 *   }
 * });
 */

// ==========================================
// TESTING
// ==========================================

/**
 * To test the integration:
 *
 * 1. Open an FNOL record that has a beneficiary analysis in worknotes
 * 2. The BeneficiaryAnalysisPanel should appear in the sidebar
 * 3. After 2 seconds, it should automatically trigger the analysis
 * 4. Watch the browser console for logs:
 *    - "[useBeneficiaryAnalysis] Auto-triggering analysis..."
 *    - "[BeneficiaryAnalyzerService] Triggering ServiceNow analysis..."
 *    - "[ServiceNow] Beneficiary analysis completed successfully"
 *
 * 5. The panel should display:
 *    - Loading spinner while processing
 *    - Success message with beneficiary match status
 *    - Summary of DMS vs PAS beneficiaries
 *    - Share totals with match badges
 */

export default ExampleIntegration;
