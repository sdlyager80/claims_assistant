# Technical Architecture - Bloom Claims Assistant Portal

## Overview

The Bloom Claims Assistant Portal is a modern React-based user interface for managing life and annuity insurance claims. It serves as the **System of Engagement** layer, integrating with **ServiceNow** as the **System of Action** and leveraging the **FSO (Financial Services Operations) Insurance Data Model**.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER INTERFACE LAYER                           │
│              React + DXC Halstack Components                     │
│                 (Bloom Claims Portal)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API / GraphQL
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  INTEGRATION LAYER                               │
│              API Gateway / Backend for Frontend                  │
│         - Authentication (SSO/MFA)                              │
│         - Request validation                                     │
│         - Response transformation                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬────────────────────┐
        │                │                │                    │
┌───────▼───────┐ ┌─────▼──────┐ ┌──────▼────────┐ ┌─────────▼──────────┐
│  ServiceNow   │ │    IDP     │ │  LexisNexis   │ │   Document         │
│  (System of   │ │  Service   │ │  Death Verify │ │   Storage          │
│   Action)     │ │            │ │               │ │   (S3/Azure)       │
│               │ │            │ │               │ │                    │
│ FSO Insurance │ │ Extract    │ │ Verify        │ │ Claim Docs         │
│ Data Model    │ │ Classify   │ │ Deaths        │ │ Requirements       │
└───────────────┘ └────────────┘ └───────────────┘ └────────────────────┘
```

## ServiceNow Integration

### FSO Insurance Data Model

The portal leverages the **ServiceNow FSO Insurance Data Model**, which includes:

#### Core Tables

1. **sn_insurance_claim**
   - Claim ID (CLM-YYYY-XXX)
   - Insured party reference
   - Claim type (Death, Maturity, Surrender)
   - Claim amount
   - Date of loss
   - Status (Pending Review, In Review, Approved, etc.)
   - Days open
   - SLA tracking
   - FastTrack eligibility

2. **sn_insurance_policy**
   - Policy number
   - Product type (Term Life, Whole Life, Universal Life, Fixed Annuity, Variable Annuity)
   - Coverage amount
   - Policy status
   - Effective date
   - Beneficiary references

3. **sn_insurance_party**
   - Party ID
   - Party type (Insured, Beneficiary, Claimant)
   - Name
   - Contact information
   - Relationship

4. **sn_insurance_coverage**
   - Coverage details
   - Coverage amount
   - Beneficiary allocations
   - Contingent beneficiaries

5. **sn_insurance_requirement**
   - Requirement ID
   - Requirement name (Death Certificate, ID Verification, etc.)
   - Status (Pending, Received, In Progress)
   - Received date
   - Associated documents

6. **sn_insurance_document**
   - Document ID
   - Document type
   - Upload date
   - Classification
   - Storage reference
   - IDP metadata

### ServiceNow API Endpoints

```javascript
// Claims API
GET    /api/now/table/sn_insurance_claim
GET    /api/now/table/sn_insurance_claim/{sys_id}
POST   /api/now/table/sn_insurance_claim
PATCH  /api/now/table/sn_insurance_claim/{sys_id}

// Policy API
GET    /api/now/table/sn_insurance_policy
GET    /api/now/table/sn_insurance_policy/{sys_id}

// Requirements API
GET    /api/now/table/sn_insurance_requirement?claim_id={claim_id}
POST   /api/now/table/sn_insurance_requirement
PATCH  /api/now/table/sn_insurance_requirement/{sys_id}

// Documents API
POST   /api/now/attachment/file?table_name=sn_insurance_claim&table_sys_id={sys_id}
GET    /api/now/attachment/{sys_id}/file

// Custom APIs
POST   /api/x_custom/claims/fnol           # First Notice of Loss
POST   /api/x_custom/claims/death_verify   # Trigger death verification
POST   /api/x_custom/claims/fasttrack      # Evaluate FastTrack eligibility
GET    /api/x_custom/claims/dashboard      # Get dashboard metrics
```

## Intelligent Document Processing (IDP)

### Document Flow

```
1. User uploads document via portal
   ↓
2. Document sent to IDP service (e.g., Azure Form Recognizer, AWS Textract)
   ↓
3. IDP extracts and classifies:
   - Document type (Death Certificate, ID, Claim Form)
   - Key data fields (Name, Date, Policy Number, etc.)
   - Confidence scores
   ↓
4. Extracted data sent to ServiceNow
   ↓
5. Auto-populate claim fields
   ↓
6. Trigger requirements engine
   ↓
7. Update claim status
```

### IDP Integration Points

```javascript
// IDP Service Integration
export class IDPService {
  async processDocument(file, claimId) {
    // 1. Upload to storage
    const storageUrl = await this.uploadToStorage(file);

    // 2. Trigger IDP processing
    const idpResult = await this.callIDPService({
      documentUrl: storageUrl,
      documentType: 'auto-detect',
      claimContext: claimId
    });

    // 3. Parse IDP results
    const extractedData = {
      documentType: idpResult.classification.type,
      confidence: idpResult.classification.confidence,
      fields: {
        insuredName: idpResult.fields.insuredName?.value,
        dateOfDeath: idpResult.fields.dateOfDeath?.value,
        policyNumber: idpResult.fields.policyNumber?.value,
        deathCertificateNumber: idpResult.fields.certificateNumber?.value,
        // ... other fields
      },
      rawText: idpResult.fullText
    };

    // 4. Create document record in ServiceNow
    const docRecord = await serviceNowAPI.createDocument({
      claim_id: claimId,
      document_type: extractedData.documentType,
      storage_url: storageUrl,
      idp_metadata: JSON.stringify(idpResult),
      extracted_data: JSON.stringify(extractedData.fields),
      confidence_score: extractedData.confidence
    });

    // 5. Auto-populate claim data if confidence is high
    if (extractedData.confidence > 0.85) {
      await this.autopopulateClaim(claimId, extractedData.fields);
    }

    return {
      documentId: docRecord.sys_id,
      extractedData,
      requiresReview: extractedData.confidence < 0.85
    };
  }

  async autopopulateClaim(claimId, fields) {
    // Update claim with extracted data
    return await serviceNowAPI.updateClaim(claimId, {
      insured_name: fields.insuredName,
      date_of_loss: fields.dateOfDeath,
      policy_number: fields.policyNumber,
      // Mark fields as auto-populated for review
      auto_populated_fields: Object.keys(fields).join(',')
    });
  }
}
```

## Submission Intake Flow

### Email/Portal Intake Process

```javascript
// Email Intake (via ServiceNow Email Reader or custom service)
export class EmailIntakeService {
  async processIncomingEmail(email) {
    // 1. Extract email metadata
    const metadata = {
      from: email.sender,
      subject: email.subject,
      receivedDate: email.date,
      body: email.body
    };

    // 2. Create claim in ServiceNow
    const claim = await serviceNowAPI.createClaim({
      state: 'new',
      source: 'email',
      claimant_email: metadata.from,
      description: metadata.body,
      short_description: metadata.subject
    });

    // 3. Process attachments through IDP
    for (const attachment of email.attachments) {
      const idpResult = await idpService.processDocument(
        attachment,
        claim.sys_id
      );

      // 4. Create requirement records based on document type
      if (idpResult.extractedData.documentType === 'Death Certificate') {
        await this.fulfillRequirement(claim.sys_id, 'death_certificate');
      }
    }

    // 5. Trigger death verification if we have enough data
    if (claim.insured_name && claim.date_of_loss) {
      await this.triggerDeathVerification(claim);
    }

    // 6. Run requirements engine
    await this.generateRequirements(claim);

    // 7. Evaluate FastTrack eligibility
    await this.evaluateFastTrack(claim);

    return claim;
  }
}

// Portal Intake (FNOL form)
export class PortalIntakeService {
  async submitFNOL(formData, documents) {
    // 1. Validate form data
    const validation = this.validateFNOLData(formData);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // 2. Create claim in ServiceNow
    const claim = await serviceNowAPI.createClaim({
      state: 'new',
      source: 'portal',
      claim_type: formData.claimType,
      insured_name: formData.insuredName,
      date_of_loss: formData.dateOfDeath,
      policy_number: formData.policyNumber,
      claimant_name: formData.claimantName,
      claimant_email: formData.claimantEmail,
      claimant_phone: formData.claimantPhone,
      relationship: formData.relationship,
      description: formData.description
    });

    // 3. Process uploaded documents
    const documentResults = [];
    for (const doc of documents) {
      const result = await idpService.processDocument(doc, claim.sys_id);
      documentResults.push(result);
    }

    // 4. Lookup policy information
    const policy = await serviceNowAPI.getPolicy(formData.policyNumber);
    await serviceNowAPI.linkClaimToPolicy(claim.sys_id, policy.sys_id);

    // 5. Generate requirements based on claim type and policy
    const requirements = await requirementsEngine.generate(claim, policy);
    await serviceNowAPI.createRequirements(claim.sys_id, requirements);

    // 6. Trigger death verification (if death claim)
    if (formData.claimType === 'death') {
      await lexisNexisService.verifyDeath({
        firstName: extractFirstName(formData.insuredName),
        lastName: extractLastName(formData.insuredName),
        dateOfBirth: policy.insured_dob,
        dateOfDeath: formData.dateOfDeath,
        ssn: policy.insured_ssn
      });
    }

    // 7. Check FastTrack eligibility
    const fastTrackEval = await fastTrackService.evaluate(claim, policy);
    if (fastTrackEval.eligible) {
      await serviceNowAPI.updateClaim(claim.sys_id, {
        fasttrack_eligible: true,
        target_resolution_days: 10
      });
    }

    // 8. Assign to queue based on claim characteristics
    const assignment = await this.assignToQueue(claim, policy);

    return {
      claimId: claim.number,
      claimSysId: claim.sys_id,
      fastTrackEligible: fastTrackEval.eligible,
      requirementsGenerated: requirements.length,
      assignedTo: assignment.queue
    };
  }
}
```

## Data Model Mapping

### Portal Data → ServiceNow FSO

| Portal Field | ServiceNow Table | ServiceNow Field |
|---|---|---|
| Claim ID | sn_insurance_claim | number |
| Insured Name | sn_insurance_claim | insured_name |
| Claim Type | sn_insurance_claim | claim_type |
| Status | sn_insurance_claim | state |
| Product Type | sn_insurance_policy | product_type |
| Claim Amount | sn_insurance_claim | claim_amount |
| Date of Loss | sn_insurance_claim | date_of_loss |
| Days Open | sn_insurance_claim | (calculated: today - sys_created_on) |
| Policy Number | sn_insurance_policy | number |
| Claimant Info | sn_insurance_party | (party_type = 'claimant') |
| Beneficiaries | sn_insurance_party | (party_type = 'beneficiary') |
| Requirements | sn_insurance_requirement | requirement_name, status |
| Documents | sn_insurance_document | attachment reference |

## Authentication & Authorization

### SSO Integration with ServiceNow

```javascript
// OAuth 2.0 / SAML integration
export class AuthService {
  async authenticateUser() {
    // 1. Redirect to ServiceNow OAuth endpoint
    const authUrl = `${SERVICENOW_INSTANCE}/oauth_auth.do?` +
      `response_type=code&` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${REDIRECT_URI}&` +
      `scope=useraccount`;

    window.location.href = authUrl;
  }

  async handleCallback(code) {
    // 2. Exchange code for access token
    const tokenResponse = await fetch(`${SERVICENOW_INSTANCE}/oauth_token.do`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI
      })
    });

    const { access_token, refresh_token } = await tokenResponse.json();

    // 3. Store tokens securely
    this.storeTokens(access_token, refresh_token);

    // 4. Get user profile
    const userProfile = await this.getUserProfile(access_token);

    return userProfile;
  }
}
```

### Role-Based Access Control

```javascript
// Roles defined in ServiceNow
const ROLES = {
  CLAIMS_EXAMINER: 'x_insurance.claims_examiner',
  CLAIMS_SUPERVISOR: 'x_insurance.claims_supervisor',
  CLAIMS_PROCESSOR: 'x_insurance.claims_processor',
  FINANCE_APPROVER: 'x_insurance.finance_approver'
};

// Role-based UI rendering
function renderDashboard(userRoles) {
  if (userRoles.includes(ROLES.CLAIMS_SUPERVISOR)) {
    return <SupervisorDashboard />; // Show team metrics, queue stats
  } else if (userRoles.includes(ROLES.CLAIMS_EXAMINER)) {
    return <ExaminerDashboard />; // Show assigned claims
  } else if (userRoles.includes(ROLES.FINANCE_APPROVER)) {
    return <FinanceDashboard />; // Show claims ready for payment
  }
}
```

## Performance Considerations

### Caching Strategy

```javascript
// Cache ServiceNow data locally
export class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = {
      claims: 2 * 60 * 1000,      // 2 minutes
      policies: 15 * 60 * 1000,   // 15 minutes
      requirements: 5 * 60 * 1000  // 5 minutes
    };
  }

  async getClaim(claimId) {
    const cached = this.get(`claim:${claimId}`);
    if (cached) return cached;

    const claim = await serviceNowAPI.getClaim(claimId);
    this.set(`claim:${claimId}`, claim, this.ttl.claims);
    return claim;
  }
}
```

### Real-Time Updates

```javascript
// WebSocket connection to ServiceNow for real-time updates
export class RealtimeService {
  connect(claimId) {
    const ws = new WebSocket(
      `wss://${SERVICENOW_INSTANCE}/api/now/connect/ws`
    );

    ws.onopen = () => {
      // Subscribe to claim updates
      ws.send(JSON.stringify({
        action: 'subscribe',
        table: 'sn_insurance_claim',
        sys_id: claimId
      }));
    };

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      // Trigger UI refresh
      this.notifyListeners(update);
    };
  }
}
```

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────────────┐
│                    CloudFront / CDN                      │
│                  (Static Asset Delivery)                 │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    S3 / Azure Blob                       │
│               (React App Static Files)                   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  API Gateway / APIM                      │
│         (Authentication, Rate Limiting, Routing)         │
└────────────────────────┬────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │         │
        ┌───────────▼──┐  ┌──▼────────────┐
        │ ServiceNow   │  │  IDP Service  │
        │  Instance    │  │  (Azure/AWS)  │
        └──────────────┘  └───────────────┘
```

## Security Considerations

1. **Data Encryption**
   - TLS 1.3 for all API communication
   - Encrypted storage for documents (S3 SSE / Azure Storage Encryption)
   - Field-level encryption for PII in ServiceNow

2. **Access Control**
   - OAuth 2.0 with ServiceNow
   - JWT tokens with short expiration
   - Role-based access control (RBAC)
   - Row-level security in ServiceNow

3. **Audit Logging**
   - All claim actions logged in ServiceNow audit tables
   - Document access tracking
   - User activity monitoring

4. **Compliance**
   - HIPAA compliance for health information
   - SOC 2 Type II
   - GDPR for data privacy
   - State insurance regulations

## Next Steps for Implementation

1. **Phase 1: ServiceNow Setup**
   - Configure FSO Insurance Data Model
   - Create custom tables and fields
   - Set up API endpoints
   - Configure workflows

2. **Phase 2: IDP Integration**
   - Select and configure IDP provider
   - Train models for document classification
   - Set up document storage
   - Implement extraction logic

3. **Phase 3: Portal Integration**
   - Connect portal to ServiceNow APIs
   - Implement authentication
   - Build out remaining views (Workbench, Queue, Reports)
   - Add real-time updates

4. **Phase 4: Testing & UAT**
   - Integration testing
   - User acceptance testing
   - Performance testing
   - Security testing

5. **Phase 5: Production Deployment**
   - Deploy to production environment
   - Configure monitoring and alerting
   - Train users
   - Go live

---

**For Development Questions**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
**For Component Usage**: See [HALSTACK_COMPONENT_GUIDE.md](./HALSTACK_COMPONENT_GUIDE.md)
