# Policy Enrichment Guide

This guide explains how to fetch and use policy details with FNOL records.

## Overview

The ServiceNow service now supports fetching full policy details from policy sys_id references in FNOL records.

## New Methods

### 1. Get Policy by Sys ID

```javascript
import serviceNowService from './services/api/serviceNowService';

// Fetch policy by sys_id
const policy = await serviceNowService.getPolicyBySysId('policy_sys_id_here');

console.log('Policy Number:', policy.policy_number);
console.log('Coverage Amount:', policy.coverage_amount);
console.log('Policy Type:', policy.policy_type);
```

### 2. Get Policy by Policy Number

```javascript
// Fetch policy by policy number
const policy = await serviceNowService.getPolicyByNumber('POL-12345');

console.log('Policy Details:', policy);
```

### 3. Enrich Single FNOL with Policy

```javascript
// Fetch FNOL
const fnol = await serviceNowService.getFNOL('fnol_sys_id');

// Enrich with policy details
const enrichedFnol = await serviceNowService.enrichFNOLWithPolicy(fnol);

console.log('Policy Details:', enrichedFnol.policy_details);
```

### 4. Auto-Enrich Multiple FNOLs

```javascript
// Fetch FNOLs with automatic policy enrichment
const fnols = await serviceNowService.getFNOLsGlobal({
  limit: 50,
  enrichWithPolicy: true  // Enable policy enrichment
});

fnols.forEach(fnol => {
  console.log('FNOL:', fnol.number);
  if (fnol.policy_details) {
    console.log('  Policy Number:', fnol.policy_details.policy_number);
    console.log('  Coverage:', fnol.policy_details.coverage_amount);
    console.log('  Status:', fnol.policy_details.policy_status);
  }
});
```

## Policy Data Structure

When enriched, FNOL records will include a `policy_details` object with:

```javascript
{
  policy_number: "POL-12345",
  policy_type: "Term Life Insurance",
  policy_status: "Active",
  coverage_amount: 500000,
  face_amount: 500000,
  effective_date: "2020-01-01",
  issue_date: "2019-12-15",
  expiration_date: "2030-01-01",
  premium_amount: 1200,
  beneficiaries: [...],
  riders: [...],
  // ... other policy fields
}
```

## Usage in Components

### Example: Dashboard Component

```javascript
import { useEffect, useState } from 'react';
import serviceNowService from '../../services/api/serviceNowService';

function Dashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        // Fetch FNOLs with policy enrichment
        const fnols = await serviceNowService.getFNOLsGlobal({
          limit: 20,
          enrichWithPolicy: true
        });

        // Map to claim format (policy details automatically included)
        const mappedClaims = fnols.map(fnol =>
          serviceNowService.mapFNOLToClaim(fnol)
        );

        setClaims(mappedClaims);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  return (
    <div>
      {claims.map(claim => (
        <div key={claim.id}>
          <h3>{claim.claimNumber}</h3>
          <p>Policy: {claim.policy.policyNumber}</p>
          <p>Coverage: ${claim.policy.coverageAmount?.toLocaleString()}</p>
          <p>Type: {claim.policy.policyType}</p>
          <p>Status: {claim.policy.policyStatus}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example: Claim Detail Component

```javascript
import { useEffect, useState } from 'react';
import serviceNowService from '../../services/api/serviceNowService';

function ClaimDetail({ claimSysId }) {
  const [claim, setClaim] = useState(null);

  useEffect(() => {
    const fetchClaimWithPolicy = async () => {
      try {
        // Fetch FNOL
        const fnol = await serviceNowService.getFNOL(claimSysId);

        // Enrich with policy
        const enrichedFnol = await serviceNowService.enrichFNOLWithPolicy(fnol);

        // Map to claim format
        const mappedClaim = serviceNowService.mapFNOLToClaim(enrichedFnol);

        setClaim(mappedClaim);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchClaimWithPolicy();
  }, [claimSysId]);

  if (!claim) return <div>Loading...</div>;

  return (
    <div>
      <h2>Claim: {claim.claimNumber}</h2>

      <section>
        <h3>Policy Information</h3>
        <p>Policy Number: {claim.policy.policyNumber}</p>
        <p>Policy Type: {claim.policy.policyType}</p>
        <p>Coverage Amount: ${claim.policy.coverageAmount?.toLocaleString()}</p>
        <p>Status: {claim.policy.policyStatus}</p>
        <p>Effective Date: {claim.policy.effectiveDate}</p>
        <p>Premium: ${claim.policy.premiumAmount?.toLocaleString()}</p>
      </section>

      {claim.policy.beneficiaries && (
        <section>
          <h3>Beneficiaries</h3>
          {/* Render beneficiaries */}
        </section>
      )}

      {claim.policy.riders && (
        <section>
          <h3>Riders</h3>
          {/* Render riders */}
        </section>
      )}
    </div>
  );
}
```

## Configuration

### Custom Policy Table Name

If your policy table has a different name:

```javascript
// Specify custom policy table
const policy = await serviceNowService.getPolicyBySysId(
  'policy_sys_id',
  'custom_policy_table_name'
);

// Or for batch enrichment
const fnols = await serviceNowService.getFNOLsGlobal({
  enrichWithPolicy: true,
  policyTable: 'custom_policy_table_name'
});
```

## Performance Considerations

### Enrichment Strategy

**Option 1: Enrich on-demand (recommended for detail views)**
```javascript
// Only enrich when viewing a single claim
const fnol = await serviceNowService.getFNOL(sysId);
const enriched = await serviceNowService.enrichFNOLWithPolicy(fnol);
```

**Option 2: Batch enrichment (good for lists with few items)**
```javascript
// Enrich multiple claims at once (uses Promise.all)
const fnols = await serviceNowService.getFNOLsGlobal({
  limit: 10,
  enrichWithPolicy: true
});
```

**Option 3: Manual enrichment (for custom caching)**
```javascript
// Fetch claims without enrichment
const fnols = await serviceNowService.getFNOLsGlobal({ limit: 50 });

// Enrich only visible items
const visibleFnols = fnols.slice(0, 10);
const enriched = await Promise.all(
  visibleFnols.map(fnol => serviceNowService.enrichFNOLWithPolicy(fnol))
);
```

## Error Handling

Policy enrichment is designed to be resilient:

```javascript
try {
  const fnol = await serviceNowService.getFNOL(sysId);
  const enriched = await serviceNowService.enrichFNOLWithPolicy(fnol);

  // If policy fetch fails, enriched will still contain the original FNOL
  if (enriched.policy_details) {
    console.log('Policy loaded successfully');
  } else {
    console.log('Using basic policy info from FNOL');
  }
} catch (error) {
  console.error('Failed to fetch FNOL:', error);
}
```

## Benefits

✅ **Complete Policy Information** - Access all policy fields, not just the policy number
✅ **Beneficiary Data** - Get full beneficiary list with the policy
✅ **Riders & Endorsements** - Access all policy riders and modifications
✅ **Real-time Data** - Always fetch the latest policy information
✅ **Flexible** - Enrich on-demand or in batch
✅ **Resilient** - Gracefully handles missing policy references

## Notes

- Policy enrichment requires the FNOL to have a valid `policy` or `policy_sys_id` field pointing to a policy record
- If the policy reference is missing or invalid, the FNOL will be returned without enrichment
- Policy table name defaults to `x_dxcis_claims_a_0_policy` but can be customized
- All enrichment calls go through the backend proxy to avoid CORS issues
