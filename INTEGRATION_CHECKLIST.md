# Integration Checklist - Auto-Trigger Beneficiary Analysis

## 🎯 Goal
When a user clicks on an FNOL record, automatically trigger beneficiary analysis after 2 seconds.

---

## ✅ Prerequisites (Already Done)

- ✅ `serviceNowService.js` - Updated with beneficiary analysis methods
- ✅ `beneficiaryAnalyzerService.js` - Updated with ServiceNow integration
- ✅ `useBeneficiaryAnalysis.js` - Custom hook created
- ✅ `BeneficiaryAnalysisPanel.jsx` - UI component created
- ✅ `BeneficiaryAnalysisPanel.css` - Styling created

---

## 📝 Steps to Integrate

### Step 1: Open ClaimDetail.jsx

```bash
File: claims-portal/src/components/ClaimDetail/ClaimDetail.jsx
```

### Step 2: Add Import (Line ~15)

Add this import with the other component imports:

```javascript
import BeneficiaryAnalysisPanel from './BeneficiaryAnalysisPanel';
```

**Location:** Near line 15, with other imports like `FastTrackBadge`, `SLAIndicator`, etc.

### Step 3: Add Panel to Sidebar (Line ~450)

Find this section in the render:

```javascript
{/* Right Column - Sidebar */}
<DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: 1, minWidth: '320px' }}>
  {/* Quick Actions */}
  <QuickActions claim={claim} onAction={handleAction} />

  {/* Policy Information */}
  <PolicyInformation claim={claim} policy={currentPolicy} />
</DxcFlex>
```

**Change it to:**

```javascript
{/* Right Column - Sidebar */}
<DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: 1, minWidth: '320px' }}>
  {/* Quick Actions */}
  <QuickActions claim={claim} onAction={handleAction} />

  {/* ✨ NEW: Beneficiary Analysis - Auto-triggers on FNOL load ✨ */}
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

### Step 4: Save and Test

That's it! The integration is complete.

---

## 🧪 Testing Steps

### 1. Start the Application

```bash
cd claims-portal
npm run dev
```

### 2. Open an FNOL Record

- Navigate to a claim from ServiceNow (must have `claim.sysId`)
- The ClaimDetail page should load

### 3. Verify Panel Appears

Look for "Beneficiary Analysis" panel in the right sidebar

### 4. Watch Auto-Trigger

- After 2 seconds, loading spinner should appear
- Message: "Analyzing beneficiaries..."

### 5. Check Browser Console

You should see logs like:

```
[useBeneficiaryAnalysis] Auto-triggering analysis with delay: 2000 ms
[useBeneficiaryAnalysis] Triggering analysis for FNOL: abc123xyz
[BeneficiaryAnalyzerService] Triggering ServiceNow analysis for FNOL: abc123xyz
[ServiceNow] Fetching beneficiary analysis from worknotes for FNOL: abc123xyz
[ServiceNow] Found beneficiary analysis in worknote
[ServiceNow] Triggering Bene Analyzer subflow for FNOL: abc123xyz
[ServiceNow] Subflow executed successfully
[useBeneficiaryAnalysis] Analysis completed successfully
```

### 6. Verify Results Display

The panel should show:
- ✅ Success badge ("Beneficiaries Match" or "Review Required")
- 📊 Beneficiary counts (DMS: X, PAS: Y)
- 📈 Share totals with match badges
- 📄 Summary text
- 🔍 "View Full Beneficiary Comparison" button

---

## 🎨 What It Looks Like

```
┌─────────────────────────────────────────────┐
│  Beneficiary Analysis            [Collapse] │
├─────────────────────────────────────────────┤
│                                              │
│  ✓ Beneficiaries Match                      │
│  All four beneficiaries match perfectly...  │
│                                              │
│  DMS BENEFICIARIES       PAS BENEFICIARIES  │
│        4                        4            │
│                                              │
│  SHARE TOTALS                                │
│  Primary: DMS 100% | PAS 100%  [✓ MATCH]   │
│  Contingent: DMS 100% | PAS 100% [✓ MATCH] │
│                                              │
│  [View Full Beneficiary Comparison]          │
│                                              │
└─────────────────────────────────────────────┘
```

---

## ⚙️ Configuration (Optional)

### Change Auto-Trigger Delay

Edit `BeneficiaryAnalysisPanel.jsx` (line ~30):

```javascript
const {
  ...
} = useBeneficiaryAnalysis(fnolSysId, {
  autoTrigger: true,
  autoTriggerDelay: 2000,  // Change to 1000, 3000, etc.
  ...
});
```

### Disable Auto-Trigger

To require manual trigger:

```javascript
const {
  ...
} = useBeneficiaryAnalysis(fnolSysId, {
  autoTrigger: false,  // User must click button
  ...
});
```

---

## 🐛 Troubleshooting

### Panel Doesn't Appear

**Check:**
- Is `claim.sysId` present? (console.log(claim))
- Is `claim.source === 'servicenow'`?
- Did you add the import?
- Did you add the panel component in render?

**Fix:**
```javascript
// Debug: Add this temporarily to see what's in claim
console.log('Claim data:', {
  id: claim?.id,
  sysId: claim?.sysId,
  source: claim?.source
});
```

### Auto-Trigger Doesn't Start

**Check:**
- Browser console for errors
- Is `fnolSysId` prop being passed?
- Is `autoTrigger: true` in hook config?

**Fix:**
```javascript
// In BeneficiaryAnalysisPanel.jsx
console.log('Panel mounted with fnolSysId:', fnolSysId);
```

### "No beneficiary data found"

**Check:**
- Does FNOL have a worknote with JSON?
- Does JSON contain "Output", "DMS", or "BeneScoring"?

**Fix:**
- Add test worknote in ServiceNow manually
- Use example JSON from BENEFICIARY_ANALYSIS_FIX.md

### Subflow Fails

**Check:**
- ServiceNow subflow configuration (see BENEFICIARY_ANALYSIS_FIX.md)
- Subflow sys_id is correct: `3D680e66961d0bb25062a3fd68f681ce38`
- REST API uses POST, not GET
- JSON in request body, not URL

---

## 📚 Reference Documentation

- **Full Details:** `AUTO_TRIGGER_BENEFICIARY_ANALYSIS.md`
- **ServiceNow Config:** `BENEFICIARY_ANALYSIS_FIX.md`
- **Quick Reference:** `BENEFICIARY_ANALYSIS_QUICKSTART.md`
- **Integration Example:** `ClaimDetail_Enhanced.jsx`

---

## ✨ Summary

### What You Need to Do:

1. ✏️ Add import to `ClaimDetail.jsx`
2. ✏️ Add `<BeneficiaryAnalysisPanel />` to sidebar
3. ✅ Save and test

### What Happens Automatically:

1. ✅ Panel appears when FNOL loads
2. ✅ After 2 seconds, analysis triggers
3. ✅ Data fetched from ServiceNow worknotes
4. ✅ Subflow invoked with correct parameters
5. ✅ Results displayed in panel

**That's it! Two small code changes and you're done. 🎉**

---

**Last Updated:** 2026-02-16
