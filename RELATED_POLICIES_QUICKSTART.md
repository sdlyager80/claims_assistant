# Related Policies Feature - Quick Start

## What Was Added ✅

I've added functionality to **automatically find other life insurance policies** where the deceased person was insured when processing a death claim. This ensures no policies are missed and all death benefits are identified.

### Key Features

- 🔍 **Automatic Search** - Searches for related policies when viewing a death claim
- 💰 **Total Death Benefit** - Shows combined face amount of all related policies
- 🚨 **Warning Alerts** - Highlights when additional policies are found
- ⚡ **Quick Actions** - Buttons to initiate claims or view policy details
- 📊 **Rich Display** - Shows policy details, cash value, loan balance, etc.
- ✨ **DXC Halstack** - Uses 100% Halstack components for consistency

---

## Files Created

### Components
```
claims-portal/src/components/RelatedPoliciesPanel/
├── RelatedPoliciesPanel.jsx         # Main component
├── RelatedPoliciesPanel.css         # Styles
├── RelatedPoliciesPanelExample.jsx  # Integration examples
└── RelatedPoliciesPanelTest.jsx     # Standalone test page
```

### Services
```
claims-portal/src/services/api/policyService.js
└── Added: findRelatedPoliciesForDeathClaim()  # Search function
```

### Data
```
claims-portal/src/data/demoData.js
└── Added: 3 unclaimed demo policies for testing
```

### Documentation
```
RELATED_POLICIES_FEATURE.md        # Comprehensive documentation
RELATED_POLICIES_QUICKSTART.md     # This file
```

---

## Quick Test (5 Minutes)

### Option 1: Standalone Test Page

1. **Import the test page** in your `App.jsx`:
```javascript
import RelatedPoliciesPanelTest from './components/RelatedPoliciesPanel/RelatedPoliciesPanelTest';
```

2. **Add to your routes** or temporarily render:
```javascript
<RelatedPoliciesPanelTest />
```

3. **Open the app** and select a test claim:
   - **Robert Jones** - Will find 2 related policies ($350K total)
   - **Thomas Garcia** - Will find 1 related policy ($200K total)
   - **Harold Mitchell** - Will find 0 related policies (empty state)

### Option 2: Add to Existing Claim View

1. **Import the component**:
```javascript
import RelatedPoliciesPanel from './components/RelatedPoliciesPanel/RelatedPoliciesPanel';
```

2. **Add to your death claim detail view**:
```javascript
<RelatedPoliciesPanel
  claimData={claim}
  onInitiateClaim={(policy) => {
    console.log('Start claim for:', policy.policyNumber);
    // Your navigation logic here
  }}
  onViewPolicy={(policy) => {
    console.log('View policy:', policy.policyNumber);
    // Your navigation logic here
  }}
/>
```

---

## Demo Data

The demo includes these unclaimed policies:

### For Robert Jones (Claim 1)
- **POL-847292** - $250K Whole Life (Issue: 2015-03-20)
- **POL-847293** - $100K Universal Life (Issue: 2012-08-15, Has $5K loan)

### For Thomas Garcia (Claim 3)
- **POL-619248** - $200K Whole Life (Issue: 2017-06-10)

---

## Real Implementation (ServiceNow)

When you're ready to integrate with real data:

### 1. Create API Endpoint

**Path**: `GET /api/x_dxcis_claims/policy_admin/death_claim_related`

**Parameters**:
- `ssn` - Social Security Number
- `name` - Deceased name
- `dob` - Date of birth
- `exclude` - Current policy number (to exclude)

**Returns**:
```json
{
  "asInsured": [...policies],
  "asOwner": [...policies],
  "total": 2,
  "totalFaceAmount": 350000
}
```

### 2. Query Logic

Search for policies where:
- ✅ Insured SSN matches deceased
- ✅ Policy status is "In Force" or "Active"
- ✅ No existing death claim filed
- ❌ Exclude current claim's policy

### 3. Update Service

In `policyService.js`, change `USE_DEMO_DATA = false` and the API will use real endpoints.

---

## Integration Patterns

### Pattern 1: Tab-Based (Recommended)
Add a dedicated "Related Policies" tab:
```javascript
const tabs = [
  { label: 'Overview', content: <ClaimOverview /> },
  { label: 'Related Policies', content: <RelatedPoliciesPanel claimData={claim} /> },
  { label: 'Documents', content: <Documents /> }
];
```

### Pattern 2: Section in Overview
Add as a section after current policy:
```javascript
<DeathEventPanel claimData={claim} />
<PolicySummaryPanel policies={claim.policies} />
<RelatedPoliciesPanel claimData={claim} />  {/* Add here */}
```

### Pattern 3: Dashboard Widget
Show count on dashboard:
```javascript
const relatedPoliciesCount = await getRelatedPoliciesCount(claim);
// Show badge: "3 Related Policies Require Attention"
```

---

## Key Benefits

### For Claims Handlers
- ✅ No manual policy lookups needed
- ✅ See all policies at a glance
- ✅ Initiate multiple claims quickly
- ✅ Total death benefit calculation

### For Business
- ✅ **Compliance** - Meet prompt payment laws
- ✅ **Completeness** - No policies missed
- ✅ **Efficiency** - Faster processing
- ✅ **Customer Service** - Beneficiaries get all benefits

### For Beneficiaries
- ✅ All eligible benefits identified
- ✅ Faster claim initiation
- ✅ Complete notification

---

## Common Scenarios

### Scenario 1: Multiple Policies Found
**What happens**: Alert banner shows count and total benefit
**Action**: Claims handler reviews and initiates claims

### Scenario 2: No Related Policies
**What happens**: Green success message "No Other Policies Found"
**Action**: Continue with current claim processing

### Scenario 3: Large Portfolio
**What happens**: All policies displayed in scrollable cards
**Action**: Claims handler prioritizes based on face amount

---

## Workflow Automation Ideas

### Automatic Claim Creation
When primary claim is approved, auto-create FNOLs for related policies:
```javascript
// Pre-populate with death certificate, deceased info, beneficiary details
// Link to original claim for reference
// Assign to same examiner
```

### Notifications
Send alert when related policies are found:
```javascript
// Email to examiner: "3 additional policies require death claims"
// Dashboard badge: "Action Required"
```

### Business Rules
Create ServiceNow business rule:
```javascript
// On death claim submission → search for related policies
// If found → create workflow task "Review Related Policies"
// On claim approval → trigger automated claim creation
```

---

## Next Steps

1. **Test with Demo Data** (5 min)
   - Run test page
   - Try all 3 test scenarios
   - Check console logs

2. **Review Integration Examples** (10 min)
   - See `RelatedPoliciesPanelExample.jsx`
   - Choose integration pattern
   - Plan where to add component

3. **Read Full Documentation** (20 min)
   - See `RELATED_POLICIES_FEATURE.md`
   - Understand API requirements
   - Review ServiceNow integration

4. **Integrate into Your App** (30 min)
   - Add component to claim detail view
   - Implement handler functions
   - Test with demo data

5. **Backend Implementation** (2-4 hours)
   - Create ServiceNow API endpoint
   - Write policy search query
   - Test with real data

---

## Support

### Files to Reference

- **Component Code**: `RelatedPoliciesPanel.jsx`
- **Integration Examples**: `RelatedPoliciesPanelExample.jsx`
- **Full Documentation**: `RELATED_POLICIES_FEATURE.md`
- **Test Page**: `RelatedPoliciesPanelTest.jsx`

### Key Functions

```javascript
// Service function
import { findRelatedPoliciesForDeathClaim } from './services/api/policyService';

// Component
import RelatedPoliciesPanel from './components/RelatedPoliciesPanel/RelatedPoliciesPanel';
```

---

## Visual Preview

When related policies are found, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 ALERT: Additional Policies Identified                     │
│ The deceased has 2 other policies that may require death     │
│ claims. Total potential death benefit: $350,000              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ POL-847292  [In Force]                          $250,000    │
│ Whole Life • Issued 2015-03-20                 Death Benefit│
│                                                              │
│ Insured: Robert Jones    Owner: Robert Jones                │
│ Region: Midwest          Company: BLM                        │
│                                                              │
│ [Initiate Death Claim]  [View Policy Details]               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ POL-847293  [In Force]                          $100,000    │
│ Universal Life • Issued 2012-08-15             Death Benefit│
│                                                              │
│ Insured: Robert Jones    Owner: Robert Jones                │
│ Loan Balance: $5,000                                         │
│                                                              │
│ [Initiate Death Claim]  [View Policy Details]               │
└─────────────────────────────────────────────────────────────┘
```

---

## Questions?

Refer to:
1. **This file** - Quick start and overview
2. **RELATED_POLICIES_FEATURE.md** - Comprehensive documentation
3. **RelatedPoliciesPanelExample.jsx** - Code examples
4. **RelatedPoliciesPanelTest.jsx** - Testing guide

---

**Ready to test? Start with the test page and see it in action!** 🚀
