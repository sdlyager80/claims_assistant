# Auto-Trigger Beneficiary Analysis on FNOL Click

## Overview

When a user clicks on an FNOL record, the beneficiary analysis subflow will automatically trigger after a 2-second delay. The analysis retrieves beneficiary data from worknotes and invokes the ServiceNow subflow.

---

## What Was Created

### 1. **Custom Hook: `useBeneficiaryAnalysis`**
   - Location: `claims-portal/src/hooks/useBeneficiaryAnalysis.js`
   - Purpose: Manages beneficiary analysis state and auto-triggering
   - Features:
     - ✅ Automatically triggers analysis on mount
     - ✅ Configurable delay before triggering
     - ✅ Loading, error, and success state management
     - ✅ Success/error callbacks
     - ✅ Manual trigger option
     - ✅ Data fetching without subflow trigger

### 2. **Component: `BeneficiaryAnalysisPanel`**
   - Location: `claims-portal/src/components/ClaimDetail/BeneficiaryAnalysisPanel.jsx`
   - Purpose: Displays beneficiary analysis in ClaimDetail sidebar
   - Features:
     - ✅ Auto-triggers analysis when FNOL loads
     - ✅ Shows loading spinner during analysis
     - ✅ Displays match status with badges
     - ✅ Shows beneficiary counts (DMS vs PAS)
     - ✅ Displays share totals and match results
     - ✅ Error handling with retry option
     - ✅ Collapsible panel

### 3. **Integration Guide**
   - Location: `claims-portal/src/components/ClaimDetail/ClaimDetail_Enhanced.jsx`
   - Purpose: Shows how to integrate the panel into ClaimDetail

---

## Integration Steps

### Step 1: Add Import to ClaimDetail.jsx

```javascript
// At the top of ClaimDetail.jsx with other imports
import BeneficiaryAnalysisPanel from './BeneficiaryAnalysisPanel';
```

### Step 2: Add Panel to Sidebar

Find the Right Column - Sidebar section (around line 450) and add the panel:

```javascript
{/* Right Column - Sidebar */}
<DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: 1, minWidth: '320px' }}>
  {/* Quick Actions */}
  <QuickActions claim={claim} onAction={handleAction} />

  {/* ✨ NEW: Beneficiary Analysis Panel - Auto-triggers when FNOL loads ✨ */}
  {claim?.sysId && claim?.source === 'servicenow' && (
    <BeneficiaryAnalysisPanel
      fnolSysId={claim.sysId}
      claimNumber={claim.claimNumber || claim.fnolNumber || claim.id}
    />
  )}

  {/* Policy Information */}
  <PolicyInformation claim={claim} policy={currentPolicy} />
</DxcFlex>
```

### Step 3: Ensure Claim Has ServiceNow sys_id

The claim object must have:
- `claim.sysId` - ServiceNow sys_id
- `claim.source = 'servicenow'` - Indicates it's from ServiceNow

**Already configured** in `serviceNowService.js`:

```javascript
mapFNOLToClaim(fnol) {
  return {
    id: fnol.sys_id,
    sysId: fnol.sys_id,        // ✅ Already included
    source: 'servicenow',       // ✅ Already included
    // ... other fields
  };
}
```

---

## How It Works

### Flow Diagram

```
┌─────────────────────────────┐
│ User Clicks FNOL Record     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ ClaimDetail Component Loads │
│ - Fetches claim data        │
│ - Renders claim details     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ BeneficiaryAnalysisPanel Mounts     │
│ - Receives fnolSysId prop           │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ useBeneficiaryAnalysis Hook Init    │
│ - autoTrigger: true                 │
│ - autoTriggerDelay: 2000ms          │
└──────────┬──────────────────────────┘
           │
           ▼ (wait 2 seconds)
┌─────────────────────────────────────┐
│ Auto-Trigger Analysis               │
│ 1. Show loading spinner             │
│ 2. Fetch beneficiary data from      │
│    ServiceNow worknotes             │
│ 3. Trigger analyzer subflow         │
│ 4. Wait for subflow result          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Display Results                     │
│ - Match status badge                │
│ - Beneficiary counts                │
│ - Share totals                      │
│ - Summary message                   │
└─────────────────────────────────────┘
```

### Timing

1. **T+0s**: User opens FNOL record
2. **T+0.5s**: ClaimDetail component renders
3. **T+0.5s**: BeneficiaryAnalysisPanel mounts
4. **T+2.5s**: Auto-trigger activates (2s delay after mount)
5. **T+2.5s - T+5s**: Analysis runs (fetches data + triggers subflow)
6. **T+5s**: Results display

---

## Configuration Options

### Adjust Auto-Trigger Delay

In `BeneficiaryAnalysisPanel.jsx`:

```javascript
const {
  ...
} = useBeneficiaryAnalysis(fnolSysId, {
  autoTrigger: true,
  autoTriggerDelay: 2000,    // Change this value (milliseconds)
  onSuccess: (result) => {
    console.log('Analysis complete:', result);
  },
  onError: (err) => {
    console.error('Analysis failed:', err);
  }
});
```

### Disable Auto-Trigger

To require manual trigger only:

```javascript
const {
  ...
} = useBeneficiaryAnalysis(fnolSysId, {
  autoTrigger: false,  // User must click button to trigger
  onSuccess: (result) => {
    console.log('Analysis complete:', result);
  }
});
```

### Change Success/Error Handlers

```javascript
const {
  ...
} = useBeneficiaryAnalysis(fnolSysId, {
  autoTrigger: true,
  autoTriggerDelay: 1000,
  onSuccess: (result) => {
    // Custom success handling
    toast.success('Beneficiary analysis complete!');
    logAnalyticsEvent('beneficiary_analysis_success', {
      fnolSysId,
      beneficiaryCount: result.beneficiaryData?.Output?.length
    });
  },
  onError: (err) => {
    // Custom error handling
    toast.error('Beneficiary analysis failed');
    logAnalyticsEvent('beneficiary_analysis_error', {
      fnolSysId,
      error: err.message
    });
  }
});
```

---

## Testing

### Test Checklist

- [ ] **Open FNOL Record**
  - Navigate to a claim that has a ServiceNow sys_id
  - ClaimDetail page should load

- [ ] **Verify Panel Appears**
  - BeneficiaryAnalysisPanel should be visible in the right sidebar
  - Title: "Beneficiary Analysis"

- [ ] **Verify Auto-Trigger**
  - After 2 seconds, panel should show loading spinner
  - Message: "Analyzing beneficiaries..."

- [ ] **Check Console Logs**
  ```
  [useBeneficiaryAnalysis] Auto-triggering analysis with delay: 2000 ms
  [useBeneficiaryAnalysis] Triggering analysis for FNOL: abc123...
  [BeneficiaryAnalyzerService] Triggering ServiceNow analysis for FNOL: abc123...
  [ServiceNow] Fetching beneficiary analysis from worknotes...
  [ServiceNow] Beneficiary analysis completed successfully
  ```

- [ ] **Verify Results Display**
  - Success message or warning
  - Beneficiary counts (DMS vs PAS)
  - Share totals with match badges
  - "View Full Beneficiary Comparison" button

- [ ] **Test Error Handling**
  - Test with FNOL that has no worknote data
  - Should show error message with "Retry" button

- [ ] **Test Manual Trigger**
  - Click "Retry Analysis" button
  - Should trigger analysis again

- [ ] **Test Collapse/Expand**
  - Click "Collapse" button
  - Panel should minimize showing only status badge
  - Click "Expand" to restore

### Test with Mock Data

If you want to test without ServiceNow, you can temporarily modify the hook:

```javascript
// In useBeneficiaryAnalysis.js - FOR TESTING ONLY
const triggerAnalysis = useCallback(async () => {
  setLoading(true);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

  // Mock success response
  const mockResult = {
    success: true,
    fnolSysId,
    beneficiaryData: {
      Output: [
        { DMS: [{ FirstBeneficiaryName: "John Doe", ... }] },
        { PAS: [{ FirstBeneficiaryName: "John Doe", ... }] },
        { Summary: "All beneficiaries match perfectly" },
        { BeneScoring: [
          { totalBeneficiaryShares: [
            { PrimaryShares: { DMS: "100%", PAS: "100%", Match: "MATCH" } }
          ]}
        ]}
      ]
    }
  };

  setAnalysisResult(mockResult);
  setAnalysisData(mockResult.beneficiaryData);
  setLoading(false);
}, [fnolSysId]);
```

---

## Troubleshooting

### Issue: Panel doesn't appear

**Solution:**
- Check that `claim.sysId` exists
- Check that `claim.source === 'servicenow'`
- Verify ClaimDetail.jsx has the import and integration code

### Issue: Auto-trigger doesn't start

**Solution:**
- Check browser console for errors
- Verify `autoTrigger: true` in hook configuration
- Ensure `fnolSysId` prop is passed correctly

### Issue: "No beneficiary data found in worknotes"

**Solution:**
- Verify the FNOL has a worknote with beneficiary JSON
- Check that worknote contains `"Output"`, `"DMS"`, or `"BeneScoring"` keys
- Use ServiceNow UI to manually add test worknote

### Issue: Subflow execution fails

**Solution:**
- Verify subflow sys_id is correct: `3D680e66961d0bb25062a3fd68f681ce38`
- Check ServiceNow workflow configuration (see BENEFICIARY_ANALYSIS_FIX.md)
- Ensure subflow has input variables: `fnol_sys_id`, `beneficiary_data`

---

## ServiceNow Workflow Requirements

**IMPORTANT:** The ServiceNow subflow must be configured correctly:

### Subflow Configuration

**Subflow Name:** Bene Analyzer Data Pull
**Subflow sys_id:** `3D680e66961d0bb25062a3fd68f681ce38`

**Input Variables:**
- `fnol_sys_id` (String) - FNOL record sys_id
- `beneficiary_data` (String) - JSON string of beneficiary data

**REST API Node:**
- **Method:** POST (not GET)
- **URL:** `https://dev-1.hub-1.sai-dev.assure.dxc.com/api/uds/v2/pnc/pncpolicies/${policy_id}`
- **Headers:** `Content-Type: application/json`
- **Body:** `${beneficiary_data}` (JSON in request body, NOT in URL)

See `BENEFICIARY_ANALYSIS_FIX.md` for complete ServiceNow configuration guide.

---

## Related Files

| File | Purpose |
|------|---------|
| `useBeneficiaryAnalysis.js` | Custom React hook for analysis state management |
| `BeneficiaryAnalysisPanel.jsx` | UI component for ClaimDetail sidebar |
| `BeneficiaryAnalysisPanel.css` | Panel styling |
| `ClaimDetail_Enhanced.jsx` | Integration example and guide |
| `serviceNowService.js` | ServiceNow API methods (already updated) |
| `beneficiaryAnalyzerService.js` | Beneficiary analysis service (already updated) |
| `BENEFICIARY_ANALYSIS_FIX.md` | ServiceNow workflow configuration guide |
| `BENEFICIARY_ANALYSIS_QUICKSTART.md` | Quick reference guide |

---

## Summary

✅ **What happens when user clicks FNOL:**

1. FNOL record opens in ClaimDetail
2. BeneficiaryAnalysisPanel appears in sidebar
3. After 2 seconds, analysis auto-triggers
4. Panel shows loading spinner
5. Hook fetches beneficiary data from ServiceNow worknotes
6. Hook triggers ServiceNow subflow with data
7. Subflow calls external API with JSON in request body
8. Results display in panel with match status

✅ **No manual action required** - Analysis happens automatically

✅ **User can:**
- View analysis results immediately
- Retry if analysis fails
- Collapse/expand panel
- Click to view full beneficiary comparison

---

**Last Updated:** 2026-02-16
