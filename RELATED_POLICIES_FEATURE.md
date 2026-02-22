# Related Policies for Death Claims - Feature Documentation

## Overview

When a death claim is filed for a life insurance policy, it's critical to identify **all other policies** where the deceased was the insured or owner. This ensures that:

1. All eligible beneficiaries receive their benefits
2. The company fulfills all death claim obligations
3. Claims handlers don't miss policies that require death claims
4. Beneficiaries are properly notified of all available policies

This feature automatically searches for and displays related policies when viewing a death claim, allowing claims handlers to quickly initiate claims on all applicable policies.

---

## Business Value

### Key Benefits

- **Completeness**: Ensures no policy is overlooked when processing death claims
- **Efficiency**: Automatic search eliminates manual policy lookups
- **Compliance**: Helps meet regulatory requirements for timely death benefit payments
- **Customer Service**: Beneficiaries receive all benefits they're entitled to
- **Revenue Protection**: Reduces risk of complaints and regulatory issues

### Typical Use Cases

1. **Multiple Policies on Same Insured**: Deceased owns term life, whole life, and universal life policies
2. **Group + Individual Coverage**: Deceased has both group and individual policies
3. **Joint Policies**: Deceased is joint owner on policies with spouse
4. **Old Policies**: Identifying forgotten or lapsed policies that may have paid-up values

---

## What Was Added

### 1. Service Layer Enhancement

**File**: `claims-portal/src/services/api/policyService.js`

**New Function**: `findRelatedPoliciesForDeathClaim(deceasedInfo, excludePolicyNumber)`

```javascript
// Search for all policies where deceased is insured or owner
const result = await findRelatedPoliciesForDeathClaim({
  ssn: '***-**-1234',
  name: 'John Doe',
  dateOfBirth: '1960-01-15'
}, 'POL-123456'); // Exclude current claim's policy

// Returns:
// {
//   asInsured: [...policies],
//   asOwner: [...policies],
//   total: 2,
//   totalFaceAmount: 500000
// }
```

**Features**:
- Searches by SSN, name, and date of birth
- Excludes the current claim's policy (no duplicate)
- Groups results by relationship (insured vs owner)
- Calculates total potential death benefit
- Includes demo mode for testing
- Implements caching for performance

---

### 2. UI Component

**File**: `claims-portal/src/components/RelatedPoliciesPanel/RelatedPoliciesPanel.jsx`

**Component**: `<RelatedPoliciesPanel />`

#### Features

✅ **Automatic Search**: Searches on component mount using claim data
✅ **Loading State**: Shows spinner while searching
✅ **Error Handling**: Displays user-friendly error messages
✅ **Empty State**: Clear message when no related policies found
✅ **Alert Banner**: Highlights when policies are found with total benefit amount
✅ **Policy Cards**: Rich display of each policy with key details
✅ **Action Buttons**: "Initiate Death Claim" and "View Policy Details"
✅ **Responsive Design**: Works on desktop and mobile
✅ **DXC Halstack**: 100% Halstack components for consistency

#### Props

```javascript
<RelatedPoliciesPanel
  claimData={claim}              // Current claim object
  onInitiateClaim={(policy) => {}}  // Callback to start new claim
  onViewPolicy={(policy) => {}}     // Callback to view policy details
/>
```

#### Visual Design

- **Warning Border**: Related policies have orange/warning border for visibility
- **Death Benefit Highlight**: Face amount shown in large, bold, error-colored text
- **Status Badges**: Clear policy status indicators
- **Hover Effects**: Cards lift and highlight on hover
- **Material Icons**: Policy and warning icons for visual clarity

---

### 3. Demo Data Enhancement

**File**: `claims-portal/src/data/demoData.js`

Added unclaimed policies for testing:
- **Robert Jones** (Claim 1): 2 additional policies ($250K Whole Life + $100K Universal Life)
- **Thomas Garcia** (Claim 3): 1 additional policy ($200K Whole Life)

Total demo showcase: **$550K in related policies** across 3 additional policies

---

### 4. Integration Examples

**File**: `claims-portal/src/components/RelatedPoliciesPanel/RelatedPoliciesPanelExample.jsx`

Includes:
- Tab-based integration example
- Single-page layout example
- Automated claim creation workflow example
- ServiceNow integration notes and guidance

---

## How to Use

### Basic Integration

1. **Import the component**:
```javascript
import RelatedPoliciesPanel from './components/RelatedPoliciesPanel/RelatedPoliciesPanel';
```

2. **Add to your claim detail view**:
```javascript
<RelatedPoliciesPanel
  claimData={claim}
  onInitiateClaim={handleInitiateClaim}
  onViewPolicy={handleViewPolicy}
/>
```

3. **Implement handlers**:
```javascript
const handleInitiateClaim = (policy) => {
  // Navigate to FNOL form with pre-populated data
  navigate(`/claims/new?policyNumber=${policy.policyNumber}&relatedClaim=${claim.claimNumber}`);
};

const handleViewPolicy = (policy) => {
  // Navigate to policy detail view
  navigate(`/policies/${policy.policyNumber}`);
};
```

### Recommended Placement

#### Option 1: Dedicated Tab (Recommended)
Add a "Related Policies" tab in the claim detail tabs:
```javascript
const tabs = [
  { label: 'Overview', content: <ClaimOverview /> },
  { label: 'Death Event', content: <DeathEventPanel /> },
  { label: 'Related Policies', content: <RelatedPoliciesPanel /> },
  { label: 'Documents', content: <Documents /> }
];
```

#### Option 2: Section in Overview
Add as a section after the current policy:
```javascript
<DxcFlex direction="column" gap="var(--spacing-gap-l)">
  <DeathEventPanel claimData={claim} />
  <PolicySummaryPanel policies={claim.policies} />
  <RelatedPoliciesPanel claimData={claim} /> {/* Add here */}
</DxcFlex>
```

---

## ServiceNow Backend Integration

### API Endpoint

Create a REST endpoint in your ServiceNow scoped application:

**Endpoint**: `GET /api/x_dxcis_claims/policy_admin/death_claim_related`

**Query Parameters**:
- `ssn`: Social Security Number (masked)
- `name`: Full name of deceased
- `dob`: Date of birth (ISO format)
- `exclude`: Policy number to exclude (current claim's policy)

**Response Format**:
```json
{
  "asInsured": [
    {
      "policyNumber": "POL-123456",
      "policyType": "Whole Life",
      "policyStatus": "In Force",
      "faceAmount": 250000,
      "issueDate": "2015-03-20",
      "owner": "John Doe",
      "insured": "John Doe",
      "region": "Midwest",
      "companyCode": "BLM",
      "currentCashValue": 45000,
      "loanBalance": 0
    }
  ],
  "asOwner": [],
  "total": 1,
  "totalFaceAmount": 250000
}
```

### Server-Side Script Example

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var ssn = request.queryParams.ssn;
    var name = request.queryParams.name;
    var dob = request.queryParams.dob;
    var excludePolicy = request.queryParams.exclude;

    var result = {
        asInsured: [],
        asOwner: [],
        total: 0,
        totalFaceAmount: 0
    };

    // Query Policy Admin table
    var policyGR = new GlideRecord('x_dxcis_policy_admin_policy');
    policyGR.addQuery('insured_ssn', ssn);
    policyGR.addQuery('policy_status', 'In Force');
    policyGR.addQuery('policy_number', '!=', excludePolicy);
    policyGR.query();

    while (policyGR.next()) {
        // Check if policy already has a death claim
        var existingClaim = new GlideRecord('x_dxcis_claims_fnol');
        existingClaim.addQuery('policy_number', policyGR.getValue('policy_number'));
        existingClaim.addQuery('claim_type', 'Death');
        existingClaim.query();

        if (!existingClaim.hasNext()) {
            var policy = {
                policyNumber: policyGR.getValue('policy_number'),
                policyType: policyGR.getValue('policy_type'),
                policyStatus: policyGR.getValue('policy_status'),
                faceAmount: parseInt(policyGR.getValue('face_amount')),
                issueDate: policyGR.getValue('issue_date'),
                owner: policyGR.getValue('owner_name'),
                insured: policyGR.getValue('insured_name'),
                region: policyGR.getValue('region'),
                companyCode: policyGR.getValue('company_code'),
                currentCashValue: parseInt(policyGR.getValue('cash_value') || 0),
                loanBalance: parseInt(policyGR.getValue('loan_balance') || 0)
            };

            result.asInsured.push(policy);
            result.totalFaceAmount += policy.faceAmount;
        }
    }

    result.total = result.asInsured.length;

    return result;
})(request, response);
```

---

## Workflow Automation

### Automatic Claim Creation

You can automate the creation of death claims for related policies:

```javascript
// When a death claim is approved, automatically create FNOLs for related policies
export const autoCreateRelatedClaims = async (originalClaim) => {
  const deceasedInfo = {
    ssn: originalClaim.insured.ssn,
    name: originalClaim.insured.name,
    dateOfBirth: originalClaim.insured.dateOfBirth
  };

  const relatedPolicies = await findRelatedPoliciesForDeathClaim(
    deceasedInfo,
    originalClaim.policy.policyNumber
  );

  for (const policy of relatedPolicies.asInsured) {
    await createFNOL({
      policyNumber: policy.policyNumber,
      claimType: 'Death',
      dateOfDeath: originalClaim.deathEvent.dateOfDeath,
      insured: originalClaim.insured,
      notifier: originalClaim.claimant,
      relatedClaim: originalClaim.claimNumber,
      deathCertificateOnFile: true,
      autoCreated: true,
      source: 'Automated Related Policy Discovery'
    });
  }
};
```

### Business Rules

In ServiceNow, create business rules to trigger actions:

1. **On Death Claim Submission**: Search for related policies
2. **On Death Verification**: Create workflow task to review related policies
3. **On Claim Approval**: Auto-create FNOLs for related policies (with approval)

---

## Testing

### Demo Mode Testing

The feature includes demo mode with sample data:

1. View **Claim 1 (CLM-000001)** - Robert Jones
   - Should find 2 related policies
   - Total: $350K additional death benefit

2. View **Claim 3 (CLM-000003)** - Thomas Garcia
   - Should find 1 related policy
   - Total: $200K additional death benefit

3. View **Claim 2 (CLM-000002)** - Harold Mitchell
   - Should find 0 related policies
   - Shows empty state

### Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Deceased has multiple policies | Display all in-force policies |
| Deceased has only one policy | Show "No Other Policies Found" |
| All related policies already claimed | Show "No Other Policies Found" |
| Policy lookup fails | Show error message |
| Slow API response | Show loading spinner |

---

## Performance Considerations

### Caching Strategy

- Related policies cached for **30 minutes**
- Cache key includes deceased SSN and excluded policy
- Shorter TTL than regular policy lookups (more dynamic)

### Optimization Tips

1. **Index Database**: Ensure SSN and insured_name are indexed
2. **Limit Results**: Consider limiting to active policies only
3. **Background Processing**: For large portfolios, consider async search
4. **Pagination**: If deceased has many policies, implement pagination

---

## Future Enhancements

### Phase 2 Considerations

1. **Beneficiary Matching**: Highlight policies with same beneficiaries
2. **Claim Status Tracking**: Show if related claims have been initiated
3. **Bulk Actions**: "Initiate Claims for All" button
4. **Notification System**: Alert examiner when related policies are found
5. **Analytics**: Track how often related policies are discovered
6. **Machine Learning**: Predict likelihood of additional policies

### Advanced Features

- **Cross-Company Search**: Search across affiliated companies
- **Historical Policies**: Include lapsed policies with paid-up values
- **Annuity Products**: Include annuity contracts with death benefits
- **Group Coverage**: Search for group life and AD&D policies

---

## Compliance & Regulatory

### NAIC Guidelines

This feature supports compliance with:
- **Model Regulation XXX**: Unclaimed life insurance benefits
- **Prompt Payment Laws**: Timely identification and payment of death benefits
- **Escheatment Prevention**: Finding policies before they become unclaimed property

### Audit Trail

Ensure the following is logged:
- When related policy search was performed
- What policies were found
- Which policies had claims initiated
- User actions and timestamps

---

## Support & Questions

### Common Issues

**Q: Related policies not showing up**
- Verify deceased SSN is correct
- Check policy status (must be In Force)
- Ensure policy hasn't already been claimed
- Check API endpoint connectivity

**Q: Performance is slow**
- Enable caching
- Index database fields
- Consider async background search
- Implement pagination for large results

**Q: How to handle policies found after claim is closed?**
- Create separate workflow for "late discovered" policies
- Consider reopening original claim or creating linked claim
- Document discovery process for audit

---

## Files Modified/Created

### New Files
- `claims-portal/src/components/RelatedPoliciesPanel/RelatedPoliciesPanel.jsx`
- `claims-portal/src/components/RelatedPoliciesPanel/RelatedPoliciesPanel.css`
- `claims-portal/src/components/RelatedPoliciesPanel/RelatedPoliciesPanelExample.jsx`
- `RELATED_POLICIES_FEATURE.md` (this file)

### Modified Files
- `claims-portal/src/services/api/policyService.js` - Added `findRelatedPoliciesForDeathClaim()`
- `claims-portal/src/data/demoData.js` - Added unclaimed demo policies

---

## Summary

The **Related Policies for Death Claims** feature provides:

✅ Automatic discovery of related policies
✅ Clear visual presentation with action buttons
✅ Ready-to-use React component with DXC Halstack
✅ Service layer integration
✅ Demo data for testing
✅ Integration examples and documentation
✅ ServiceNow backend guidance

This feature helps ensure complete and compliant death claim processing by identifying all policies requiring claims when a death occurs.

---

**For questions or support, refer to the example integration file or contact the development team.**
