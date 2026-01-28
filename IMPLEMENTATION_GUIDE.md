# Implementation Guide - Bloom Claims Assistant Portal

## Phase 1 Implementation Overview

This guide provides detailed instructions for implementing and extending the Bloom Claims Assistant Portal with real backend integrations and business logic.

## Architecture

### Frontend (Current Implementation)
- **Framework**: React 18.3.1 with Vite
- **UI Library**: DXC Halstack React 16.0.0 (100% Halstack components)
- **State Management**: React useState (can be upgraded to Redux/Context as needed)
- **Styling**: Emotion CSS-in-JS (via Halstack)

### Backend Integration Points (To Be Implemented)

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│                  (Halstack Components)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST/GraphQL APIs
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                   API Gateway / BFF                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬─────────────────────┐
        │               │               │                     │
┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐ ┌───────────▼────────┐
│ Claims       │ │ Policy    │ │ Document    │ │ Integration        │
│ Service      │ │ Service   │ │ Service     │ │ Services           │
└──────────────┘ └───────────┘ └─────────────┘ └────────────────────┘
                                                  - LexisNexis
                                                  - Assure BPM
                                                  - Rules Engine
```

## Phase 1A: Intake & Triage Implementation

### 1. SSO/MFA Integration

#### Current State
- Placeholder user info in header (`Sarah Johnson`)
- No authentication implemented

#### Implementation Steps

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize SSO (e.g., Azure AD, Okta)
    const initAuth = async () => {
      try {
        const authProvider = await initializeAuthProvider();
        const userData = await authProvider.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return { user, loading };
};
```

#### Integration Points
- Azure Active Directory (recommended)
- Okta
- Auth0
- Custom OAuth2 provider

### 2. Email/Mail IDP with Auto-Classification

#### Implementation Steps

1. **Set up Email Ingestion**
```javascript
// src/services/emailIntakeService.js
export class EmailIntakeService {
  async processIncomingEmail(email) {
    // Extract attachments
    const attachments = await this.extractAttachments(email);

    // Classify documents using ML/AI
    const classifications = await this.classifyDocuments(attachments);

    // Extract data from email body
    const claimData = await this.extractClaimData(email.body);

    // Create preliminary claim record
    const claim = await this.createClaim({
      source: 'email',
      data: claimData,
      documents: classifications
    });

    return claim;
  }

  async classifyDocuments(attachments) {
    // Integrate with IDP service (e.g., Azure Form Recognizer, AWS Textract)
    return await idpService.classify(attachments);
  }
}
```

2. **Update Dashboard to Show Auto-Classified Claims**
```javascript
// In Dashboard.jsx, add filtering for source
const autoClassifiedClaims = submissionsData.filter(
  claim => claim.source === 'email' && claim.classification_confidence > 0.8
);
```

### 3. LexisNexis Death Verification

#### Current State
- Displayed in timeline as completed event
- No actual integration

#### Implementation Steps

```javascript
// src/services/lexisNexisService.js
export class LexisNexisService {
  constructor(apiKey, environment) {
    this.apiKey = apiKey;
    this.baseUrl = environment === 'production'
      ? 'https://api.lexisnexis.com/v1'
      : 'https://api-sandbox.lexisnexis.com/v1';
  }

  async verifyDeath(params) {
    const {
      firstName,
      lastName,
      dateOfBirth,
      dateOfDeath,
      ssn
    } = params;

    try {
      const response = await fetch(`${this.baseUrl}/death-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          dob: dateOfBirth,
          dod: dateOfDeath,
          ssn: ssn
        })
      });

      const result = await response.json();

      return {
        verified: result.death_verified,
        matchScore: result.match_score,
        dateOfDeath: result.verified_death_date,
        source: result.verification_source,
        confidence: result.confidence_level
      };
    } catch (error) {
      console.error('LexisNexis verification failed:', error);
      throw error;
    }
  }
}

// Usage in IntakeForms.jsx
const handleSubmit = async () => {
  // Verify death before creating claim
  const verificationResult = await lexisNexisService.verifyDeath({
    firstName: formData.insuredName.split(' ')[0],
    lastName: formData.insuredName.split(' ')[1],
    dateOfDeath: formData.dateOfDeath,
    // ... other fields
  });

  if (verificationResult.verified) {
    // Proceed with claim creation
    await createClaim(formData);
  } else {
    // Show alert that verification failed
    setAlert({
      type: 'error',
      message: 'Death verification failed. Please review the information.'
    });
  }
};
```

### 4. Event-Driven Triggers

#### Implementation with Assure BPM Toolkit

```javascript
// src/services/bpmService.js
export class AssureBPMService {
  async triggerWorkflow(eventType, claimData) {
    const workflows = {
      'death-claim-received': 'death_claim_workflow_v1',
      'maturity-date-reached': 'maturity_workflow_v1',
      'death-verification-complete': 'requirement_generation_workflow_v1'
    };

    const workflowId = workflows[eventType];

    return await this.startWorkflow(workflowId, claimData);
  }

  async startWorkflow(workflowId, payload) {
    // Integration with Assure BPM
    const response = await fetch(`${this.bpmBaseUrl}/workflows/${workflowId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.bpmToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  }
}
```

## Phase 1B: Processing & Automation

### 1. FastTrack (STP) for Eligible Claims

#### Eligibility Rules

```javascript
// src/services/fastTrackService.js
export class FastTrackService {
  async evaluateEligibility(claim, policy) {
    const checks = {
      deathVerified: claim.deathVerificationStatus === 'verified',
      policyActive: policy.status === 'active',
      noBeneficiaryConflicts: policy.beneficiaries.every(b => !b.disputed),
      allRequirementsReceived: claim.requirements.every(r => r.status === 'received'),
      withinCoveragePeriod: this.checkCoveragePeriod(policy),
      noFraudFlags: !claim.fraudFlags || claim.fraudFlags.length === 0,
      standardClaim: claim.claimAmount <= policy.coverage &&
                     claim.type === 'death' &&
                     policy.type !== 'contestable'
    };

    const eligible = Object.values(checks).every(check => check === true);

    return {
      eligible,
      checks,
      estimatedProcessingDays: eligible ? 10 : 90,
      fastTrackTier: eligible ? 'tier-1-stp' : null
    };
  }

  async processFastTrackClaim(claimId) {
    // Automatic processing for STP-eligible claims
    const claim = await this.getClaim(claimId);

    // Auto-approve if all checks pass
    if (claim.fastTrackEligible) {
      await this.approveClaim(claimId, {
        approver: 'system',
        method: 'automated-stp',
        timestamp: new Date().toISOString()
      });

      // Trigger disbursement
      await this.triggerDisbursement(claimId);

      return { status: 'approved', processingDays: 10 };
    }
  }
}
```

#### Update ClaimsWorkbench to Show FastTrack Status

```javascript
// In ClaimsWorkbench.jsx
const [fastTrackStatus, setFastTrackStatus] = useState(null);

useEffect(() => {
  const evaluateFastTrack = async () => {
    const result = await fastTrackService.evaluateEligibility(claim, policy);
    setFastTrackStatus(result);
  };

  evaluateFastTrack();
}, [claim]);

// Display in UI
{fastTrackStatus?.eligible && (
  <DxcAlert
    semantic="success"
    message={{
      text: `This claim is FastTrack eligible! Estimated processing: ${fastTrackStatus.estimatedProcessingDays} days`
    }}
  />
)}
```

### 2. Policy & Party Fuzzy Matching with Deduplication

#### Implementation

```javascript
// src/services/matchingService.js
import Fuse from 'fuse.js';

export class FuzzyMatchingService {
  async findMatchingPolicies(claimData) {
    // Fuzzy search on policy number, insured name, SSN
    const searchOptions = {
      keys: [
        { name: 'policyNumber', weight: 0.5 },
        { name: 'insuredName', weight: 0.3 },
        { name: 'ssn', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true
    };

    const fuse = new Fuse(this.policies, searchOptions);
    const results = fuse.search(claimData.policyNumber);

    return results.map(result => ({
      policy: result.item,
      matchScore: 1 - result.score,
      matched: result.score < 0.3
    }));
  }

  async deduplicateParties(parties) {
    // Group similar parties
    const groups = [];

    for (const party of parties) {
      const matches = await this.findSimilarParties(party);

      if (matches.length > 0) {
        // Merge party data
        const mergedParty = this.mergePartyData([party, ...matches]);
        groups.push(mergedParty);
      } else {
        groups.push(party);
      }
    }

    return groups;
  }
}
```

### 3. Beneficiary-of-Record Analyzer with Conflict Detection

```javascript
// src/services/beneficiaryService.js
export class BeneficiaryService {
  async analyzebeneficiaries(policy, claim) {
    const conflicts = [];
    const beneficiaries = policy.beneficiaries;

    // Check for multiple beneficiaries with same percentage
    const percentages = beneficiaries.map(b => b.percentage);
    if (percentages.reduce((a, b) => a + b, 0) !== 100) {
      conflicts.push({
        type: 'percentage_mismatch',
        severity: 'high',
        message: 'Beneficiary percentages do not sum to 100%'
      });
    }

    // Check for deceased beneficiaries
    for (const beneficiary of beneficiaries) {
      const deathCheck = await lexisNexisService.verifyDeath({
        firstName: beneficiary.firstName,
        lastName: beneficiary.lastName,
        dateOfBirth: beneficiary.dob
      });

      if (deathCheck.verified) {
        conflicts.push({
          type: 'deceased_beneficiary',
          severity: 'high',
          beneficiary: beneficiary.name,
          message: `Beneficiary ${beneficiary.name} is deceased`
        });
      }
    }

    // Check for contingent beneficiaries if primary is deceased
    if (conflicts.some(c => c.type === 'deceased_beneficiary')) {
      const contingent = beneficiaries.filter(b => b.type === 'contingent');
      if (contingent.length === 0) {
        conflicts.push({
          type: 'no_contingent_beneficiary',
          severity: 'critical',
          message: 'Primary beneficiary deceased with no contingent beneficiary'
        });
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      beneficiaries,
      requiresManualReview: conflicts.some(c => c.severity === 'critical')
    };
  }
}
```

### 4. Requirement Rules Engine

#### Implementation

```javascript
// src/services/requirementsEngine.js
export class RequirementsEngine {
  constructor() {
    this.rules = this.loadRules();
  }

  loadRules() {
    return {
      'death_claim': {
        universal: [
          { id: 'death_certificate', name: 'Death Certificate', required: true },
          { id: 'claim_form', name: 'Completed Claim Form', required: true },
          { id: 'beneficiary_id', name: 'Beneficiary ID Verification', required: true }
        ],
        conditional: [
          {
            condition: (claim, policy) => policy.contestable,
            requirements: [
              { id: 'medical_records', name: 'Medical Records', required: true },
              { id: 'autopsy_report', name: 'Autopsy Report', required: false }
            ]
          },
          {
            condition: (claim, policy) => claim.claimAmount > 100000,
            requirements: [
              { id: 'fraud_investigation', name: 'Fraud Investigation', required: true }
            ]
          }
        ],
        byState: {
          'CA': [
            { id: 'ca_disclosure', name: 'California Disclosure Form', required: true }
          ],
          'NY': [
            { id: 'ny_beneficiary_form', name: 'NY Beneficiary Designation Form', required: true }
          ]
        }
      }
    };
  }

  async generateRequirements(claim, policy) {
    const claimTypeRules = this.rules[claim.type] || this.rules['death_claim'];

    let requirements = [...claimTypeRules.universal];

    // Add conditional requirements
    for (const conditionalRule of claimTypeRules.conditional) {
      if (conditionalRule.condition(claim, policy)) {
        requirements = [...requirements, ...conditionalRule.requirements];
      }
    }

    // Add state-specific requirements
    const stateReqs = claimTypeRules.byState[policy.state] || [];
    requirements = [...requirements, ...stateReqs];

    // Initialize requirement status
    return requirements.map(req => ({
      ...req,
      status: 'pending',
      receivedDate: null,
      notes: []
    }));
  }

  async updateRequirementStatus(claimId, requirementId, status, documents) {
    // Update requirement with new status and attached documents
    return await claimsService.updateRequirement(claimId, requirementId, {
      status,
      receivedDate: status === 'received' ? new Date().toISOString() : null,
      documents
    });
  }
}
```

### 5. IGO (In Good Order) Tracker with Delta-Only Updates

```javascript
// src/services/igoService.js
export class IGOService {
  async checkIGOStatus(claim) {
    const requirements = claim.requirements;

    const status = {
      total: requirements.length,
      received: requirements.filter(r => r.status === 'received').length,
      pending: requirements.filter(r => r.status === 'pending').length,
      inProgress: requirements.filter(r => r.status === 'in_progress').length
    };

    const isIGO = status.pending === 0 && status.inProgress === 0;
    const percentComplete = (status.received / status.total) * 100;

    return {
      isIGO,
      percentComplete,
      status,
      missingRequirements: requirements.filter(r => r.status !== 'received')
    };
  }

  async trackIGOChanges(claimId, previousState, currentState) {
    // Only track changes (delta)
    const changes = [];

    for (const req of currentState.requirements) {
      const previousReq = previousState.requirements.find(r => r.id === req.id);

      if (!previousReq || previousReq.status !== req.status) {
        changes.push({
          requirementId: req.id,
          requirementName: req.name,
          previousStatus: previousReq?.status || null,
          newStatus: req.status,
          timestamp: new Date().toISOString()
        });
      }
    }

    if (changes.length > 0) {
      await this.logIGOChanges(claimId, changes);
      await this.notifyStakeholders(claimId, changes);
    }

    return changes;
  }
}
```

## Workbench Enhancements

### 1. Real-Time Updates with WebSockets

```javascript
// src/hooks/useRealtimeUpdates.js
import { useEffect, useState } from 'react';

export const useRealtimeUpdates = (claimId) => {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.claims.example.com/claims/${claimId}/updates`);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUpdates(prev => [...prev, update]);
    };

    return () => ws.close();
  }, [claimId]);

  return updates;
};

// Usage in ClaimsWorkbench.jsx
const realtimeUpdates = useRealtimeUpdates(claim.id);

useEffect(() => {
  if (realtimeUpdates.length > 0) {
    const latestUpdate = realtimeUpdates[realtimeUpdates.length - 1];
    // Update UI based on latest update
    refreshClaimData();
  }
}, [realtimeUpdates]);
```

### 2. SLA Monitoring with Alerts

```javascript
// src/services/slaService.js
export class SLAService {
  async calculateSLA(claim) {
    const slaTargets = {
      'tier-1-stp': 10, // days
      'standard': 90,
      'complex': 120
    };

    const claimTier = claim.fastTrackEligible ? 'tier-1-stp' :
                      claim.complexity === 'high' ? 'complex' : 'standard';

    const targetDays = slaTargets[claimTier];
    const daysSinceSubmission = this.calculateDays(claim.submittedDate, new Date());
    const daysRemaining = targetDays - daysSinceSubmission;

    const status = daysRemaining > 5 ? 'on-track' :
                   daysRemaining > 0 ? 'at-risk' : 'breached';

    return {
      targetDays,
      daysSinceSubmission,
      daysRemaining,
      status,
      targetCloseDate: this.addDays(claim.submittedDate, targetDays),
      percentTimeElapsed: (daysSinceSubmission / targetDays) * 100
    };
  }

  async monitorSLAs() {
    // Background job to check all active claims
    const activeClaims = await claimsService.getActiveClaims();

    for (const claim of activeClaims) {
      const sla = await this.calculateSLA(claim);

      if (sla.status === 'at-risk') {
        await this.sendAlert({
          type: 'sla-at-risk',
          claimId: claim.id,
          daysRemaining: sla.daysRemaining,
          assignedTo: claim.assignedExaminer
        });
      } else if (sla.status === 'breached') {
        await this.escalate({
          type: 'sla-breach',
          claimId: claim.id,
          daysPastDue: Math.abs(sla.daysRemaining),
          assignedTo: claim.assignedExaminer,
          supervisor: claim.supervisor
        });
      }
    }
  }
}
```

### 3. Fraud/Legal Hold Flags

```javascript
// Add to ClaimsWorkbench.jsx
{claim.fraudFlags && claim.fraudFlags.length > 0 && (
  <DxcAlert
    semantic="error"
    title="Fraud Alert"
    message={{
      text: `This claim has been flagged for potential fraud: ${claim.fraudFlags.join(', ')}`
    }}
  />
)}

{claim.legalHold && (
  <DxcAlert
    semantic="warning"
    title="Legal Hold"
    message={{
      text: `This claim is under legal hold. Do not proceed without legal approval. Reason: ${claim.legalHoldReason}`
    }}
  />
)}
```

## API Integration Structure

### Recommended API Client Setup

```javascript
// src/api/client.js
import axios from 'axios';

export class APIClient {
  constructor(baseURL, authToken) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Handle token refresh
          return this.refreshTokenAndRetry(error);
        }
        return Promise.reject(error);
      }
    );
  }

  // Claims API
  async getClaim(claimId) {
    const response = await this.client.get(`/claims/${claimId}`);
    return response.data;
  }

  async createClaim(claimData) {
    const response = await this.client.post('/claims', claimData);
    return response.data;
  }

  async updateClaim(claimId, updates) {
    const response = await this.client.patch(`/claims/${claimId}`, updates);
    return response.data;
  }

  // Policy API
  async getPolicy(policyNumber) {
    const response = await this.client.get(`/policies/${policyNumber}`);
    return response.data;
  }

  // Documents API
  async uploadDocument(claimId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(
      `/claims/${claimId}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  }
}
```

## Testing Strategy

### Unit Tests

```javascript
// src/components/Dashboard/Dashboard.test.jsx
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
  test('renders metrics correctly', () => {
    render(<Dashboard onClaimSelect={jest.fn()} />);

    expect(screen.getByText('$24.8M')).toBeInTheDocument();
    expect(screen.getByText('WRITTEN PREMIUM YTD')).toBeInTheDocument();
  });

  test('filters claims by search', () => {
    const { getByPlaceholderText } = render(<Dashboard />);
    const searchInput = getByPlaceholderText(/search for submission/i);

    // Test search functionality
  });
});
```

### Integration Tests

```javascript
// tests/integration/claim-submission.test.js
describe('Claim Submission Flow', () => {
  test('complete claim submission', async () => {
    // Step 1: Fill claim information
    await fillClaimInfo({
      type: 'death',
      policyNumber: 'POL-123',
      insuredName: 'John Doe'
    });

    // Step 2: Fill claimant information
    await fillClaimantInfo({
      name: 'Jane Doe',
      email: 'jane@example.com'
    });

    // Step 3: Upload documents
    await uploadDocuments([deathCertificate, id]);

    // Submit and verify
    await submitClaim();
    expect(await screen.findByText(/claim submitted successfully/i)).toBeInTheDocument();
  });
});
```

## Deployment

### Environment Configuration

```bash
# .env.production
VITE_API_BASE_URL=https://api.claims.production.example.com
VITE_LEXISNEXIS_API_KEY=your_production_key
VITE_BPM_BASE_URL=https://bpm.production.example.com
VITE_AUTH_DOMAIN=auth.example.com
VITE_AUTH_CLIENT_ID=your_client_id
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Performance Optimization

### Code Splitting

```javascript
// Lazy load components
import { lazy, Suspense } from 'react';

const ClaimsWorkbench = lazy(() => import('./components/ClaimsWorkbench/ClaimsWorkbench'));
const IntakeForms = lazy(() => import('./components/IntakeForms/IntakeForms'));

// Wrap in Suspense
<Suspense fallback={<DxcSpinner />}>
  <ClaimsWorkbench />
</Suspense>
```

### Caching Strategy

```javascript
// src/utils/cache.js
export class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }
}
```

## Security Best Practices

1. **Input Validation**: Validate all user inputs on both frontend and backend
2. **Authentication**: Implement proper SSO/MFA
3. **Authorization**: Role-based access control (RBAC)
4. **Data Encryption**: Encrypt sensitive data in transit and at rest
5. **Audit Logging**: Log all claim actions for compliance
6. **CORS Configuration**: Proper CORS setup for API calls
7. **CSP Headers**: Content Security Policy headers

## Monitoring & Observability

```javascript
// src/utils/monitoring.js
export class MonitoringService {
  trackEvent(eventName, properties) {
    // Integration with analytics (e.g., Google Analytics, Mixpanel)
    window.gtag?.('event', eventName, properties);
  }

  trackError(error, context) {
    // Integration with error tracking (e.g., Sentry)
    console.error('Error:', error, context);
  }

  trackPerformance(metricName, value) {
    // Track performance metrics
    window.performance?.mark(metricName);
  }
}
```

## Next Steps

1. **Phase 2 Planning**: ACE Integration for letter generation
2. **Phase 3 Features**: Disbursement and settlements
3. **Advanced Analytics**: Predictive models for claim outcomes
4. **Mobile App**: React Native implementation
5. **API Documentation**: OpenAPI/Swagger documentation
6. **User Training**: Create training materials and documentation

---

For additional support, refer to:
- [DXC Halstack Documentation](https://developer.dxc.com/halstack/)
- [Assure BPM Toolkit Documentation](https://developer.assure.dxc.com/)
- Internal development team wiki
