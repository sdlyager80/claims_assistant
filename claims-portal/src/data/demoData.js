/**
 * Demo Data Generator
 *
 * Generates realistic sample claims with full orchestration metadata:
 * - FastTrack routing (40% of claims)
 * - Workflow/SLA data
 * - Requirements with various statuses
 * - Policy information
 * - Financial data
 * - Timeline events
 */

import {
  ClaimStatus,
  ClaimType,
  RoutingType,
  RequirementStatus,
  RequirementType
} from '../types/claim.types';

/**
 * Generate random date within a range
 */
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generate random SSN
 */
const randomSSN = () => {
  return `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

/**
 * Sample names pool
 */
const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const randomName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

/**
 * Generate requirements based on claim characteristics
 * SA-006: 3-level hierarchy (Claim, Policy, Party)
 */
const generateRequirements = (claim) => {
  const requirements = [];

  // Convert createdAt to Date if it's a string
  const createdAtDate = typeof claim.createdAt === 'string' ? new Date(claim.createdAt) : claim.createdAt;
  const isFastTrack = claim.routing?.type === RoutingType.FASTTRACK;

  // ==================== CLAIM LEVEL REQUIREMENTS ====================

  // Death Certificate (always required at claim level)
  requirements.push({
    id: `${claim.id}-req-1`,
    level: 'claim',
    type: RequirementType.DEATH_CERTIFICATE,
    name: 'Certified Death Certificate',
    description: 'Official death certificate from state vital records',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.PENDING,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-1`, name: 'death_certificate.pdf' }] : [],
    metadata: {
      confidenceScore: isFastTrack ? 0.96 : null,
      idpClassification: isFastTrack ? 'death_certificate' : null
    }
  });

  // Claimant Statement (claim level)
  requirements.push({
    id: `${claim.id}-req-2`,
    level: 'claim',
    type: RequirementType.CLAIMANT_STATEMENT,
    name: 'Claimant Statement of Claim',
    description: 'Signed statement of claim form',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-2`, name: 'claimant_statement.pdf' }] : [{ id: `doc-${claim.id}-2`, name: 'claimant_statement_draft.pdf' }],
    metadata: {
      confidenceScore: isFastTrack ? 0.93 : 0.78,
      reason: isFastTrack ? null : 'Signature verification in progress'
    }
  });

  // NIGO example for demo purposes (low quality ID)
  if (!isFastTrack && Math.random() > 0.5) {
    requirements.push({
      id: `${claim.id}-req-3`,
      level: 'claim',
      type: RequirementType.PROOF_OF_IDENTITY,
      name: 'Government-Issued Photo ID',
      description: 'Driver\'s license, passport, or state ID',
      status: RequirementStatus.NIGO,
      isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      satisfiedDate: null,
      documents: [{ id: `doc-${claim.id}-3`, name: 'id_scan_blurry.jpg' }],
      metadata: {
        confidenceScore: 0.45,
        reason: 'Document image quality too low - unable to verify identity details. Please resubmit a clear, legible copy.'
      }
    });
  } else {
    requirements.push({
      id: `${claim.id}-req-3`,
      level: 'claim',
      type: RequirementType.PROOF_OF_IDENTITY,
      name: 'Government-Issued Photo ID',
      description: 'Driver\'s license, passport, or state ID',
      status: RequirementStatus.PENDING,
      isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      satisfiedDate: null,
      documents: [],
      metadata: {}
    });
  }

  // ==================== POLICY LEVEL REQUIREMENTS ====================

  // Policy Verification (always at policy level)
  requirements.push({
    id: `${claim.id}-req-4`,
    level: 'policy',
    type: 'POLICY_VERIFICATION',
    name: 'Policy In-Force Verification',
    description: 'Verify policy status and coverage at date of death',
    status: RequirementStatus.SATISFIED,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: new Date(createdAtDate.getTime() + 6 * 60 * 60 * 1000).toISOString(),
    documents: [],
    metadata: {
      verificationSource: 'Policy Admin System',
      policyNumber: claim.policy.policyNumber
    }
  });

  // Check if policy is contestable (issued < 2 years ago)
  const policyIssueDate = new Date(claim.policy.issueDate);
  const contestableDate = new Date(policyIssueDate);
  contestableDate.setFullYear(contestableDate.getFullYear() + 2);

  if (new Date(claim.insured.dateOfDeath) < contestableDate) {
    requirements.push({
      id: `${claim.id}-req-5`,
      level: 'policy',
      type: RequirementType.MEDICAL_RECORDS,
      name: 'Medical Records & Attending Physician Statement',
      description: 'Complete medical history and APS required for contestable policies',
      status: RequirementStatus.PENDING,
      isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      satisfiedDate: null,
      documents: [],
      metadata: { reason: 'Policy within 2-year contestable period' }
    });
  }

  // High value claim requirement
  if (claim.financial.claimAmount > 500000) {
    requirements.push({
      id: `${claim.id}-req-6`,
      level: 'policy',
      type: RequirementType.ATTENDING_PHYSICIAN_STATEMENT,
      name: 'Attending Physician Statement (APS)',
      description: 'Detailed APS required for claims exceeding $500,000',
      status: RequirementStatus.PENDING,
      isMandatory: false,
      dueDate: new Date(createdAtDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      satisfiedDate: null,
      documents: [],
      metadata: { reason: `High value claim: ${formatCurrency(claim.financial.claimAmount)}` }
    });
  }

  // ==================== PARTY LEVEL REQUIREMENTS ====================

  // Beneficiary Verification (party level)
  requirements.push({
    id: `${claim.id}-req-7`,
    level: 'party',
    type: 'BENEFICIARY_VERIFICATION',
    name: 'Beneficiary Identity Verification',
    description: 'SSN verification and identity confirmation',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-7`, name: 'beneficiary_ssn_card.pdf' }] : [],
    metadata: {
      confidenceScore: isFastTrack ? 0.97 : 0.82,
      partyId: claim.parties?.[1]?.id,
      partyName: claim.claimant?.name
    }
  });

  // Tax Form W-9 (party level)
  requirements.push({
    id: `${claim.id}-req-8`,
    level: 'party',
    type: 'TAX_FORM',
    name: 'IRS Form W-9',
    description: 'W-9 form for tax reporting and 1099 generation',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.PENDING,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-8`, name: 'w9_form.pdf' }] : [],
    metadata: {
      partyId: claim.parties?.[1]?.id,
      partyName: claim.claimant?.name
    }
  });

  // Payment Election Form (party level)
  requirements.push({
    id: `${claim.id}-req-9`,
    level: 'party',
    type: 'PAYMENT_ELECTION',
    name: 'Payment Election Form',
    description: 'ACH direct deposit or check payment selection',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.PENDING,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-9`, name: 'payment_election.pdf' }] : [],
    metadata: {
      partyId: claim.parties?.[1]?.id,
      partyName: claim.claimant?.name,
      paymentMethod: isFastTrack ? 'ACH' : 'Not selected'
    }
  });

  // Waived requirement example
  if (!isFastTrack && Math.random() > 0.7) {
    requirements.push({
      id: `${claim.id}-req-10`,
      level: 'party',
      type: 'ADDITIONAL_DOCUMENTATION',
      name: 'Proof of Relationship',
      description: 'Marriage certificate or other proof of relationship to insured',
      status: RequirementStatus.WAIVED,
      isMandatory: false,
      dueDate: new Date(createdAtDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      satisfiedDate: null,
      documents: [],
      metadata: {
        reason: 'Waived by senior examiner - relationship verified through policy records',
        waivedBy: 'Jane Examiner',
        waivedDate: new Date(createdAtDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }

  return requirements;
};

// Helper function for currency formatting in requirements
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Generate timeline events for a claim
 */
const generateTimeline = (claim) => {
  const events = [];

  events.push({
    id: `${claim.id}-event-1`,
    timestamp: claim.createdAt,
    type: 'claim.created',
    source: 'cma',
    user: { name: 'System', role: 'system' },
    description: 'Claim submitted via online portal',
    metadata: { channel: 'beneficiary_portal' }
  });

  events.push({
    id: `${claim.id}-event-2`,
    timestamp: new Date(new Date(claim.createdAt).getTime() + 5 * 60 * 1000).toISOString(),
    type: 'policy.verified',
    source: 'policy',
    user: { name: 'System', role: 'system' },
    description: 'Policy verified in Policy Admin system',
    metadata: { policyNumber: claim.policy.policyNumber, status: 'in-force' }
  });

  events.push({
    id: `${claim.id}-event-3`,
    timestamp: new Date(new Date(claim.createdAt).getTime() + 10 * 60 * 1000).toISOString(),
    type: 'death.verified',
    source: 'verification',
    user: { name: 'LexisNexis', role: 'external' },
    description: 'Death verification completed (3-point match)',
    metadata: { confidence: 0.95, matchPoints: ['ssn', 'name', 'dob'] }
  });

  if (claim.routing?.type === RoutingType.FASTTRACK) {
    events.push({
      id: `${claim.id}-event-4`,
      timestamp: new Date(new Date(claim.createdAt).getTime() + 15 * 60 * 1000).toISOString(),
      type: 'routing.fasttrack',
      source: 'fso',
      user: { name: 'Routing Engine', role: 'system' },
      description: 'Claim routed to FastTrack processing',
      metadata: { score: claim.routing.score, eligible: true }
    });
  }

  events.push({
    id: `${claim.id}-event-5`,
    timestamp: new Date(new Date(claim.createdAt).getTime() + 20 * 60 * 1000).toISOString(),
    type: 'requirements.generated',
    source: 'requirements',
    user: { name: 'Decision Table Engine', role: 'system' },
    description: `${claim.requirements?.length || 3} requirements generated`,
    metadata: { mandatoryCount: 3, optionalCount: 0 }
  });

  return events;
};

/**
 * Generate a single demo claim
 */
const generateClaim = (index, isFastTrack = false) => {
  const now = new Date();
  const createdDate = randomDate(
    new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)   // 1 day ago
  );

  const insuredName = randomName();
  const claimantName = randomName();
  const policyNumber = `POL-${Math.floor(Math.random() * 900000 + 100000)}`;
  const claimNumber = `CLM-${String(index).padStart(6, '0')}`;

  // Random claim amount between $100K and $1M
  const claimAmount = Math.floor(Math.random() * 900000 + 100000);

  // Policy issue date (1-10 years ago)
  const policyIssueDate = randomDate(
    new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() - 1 * 365 * 24 * 60 * 60 * 1000)
  );

  // Death date (1-60 days ago)
  const deathDate = randomDate(
    new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  );

  // Status distribution
  const statusOptions = [
    ClaimStatus.NEW,
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.APPROVED,
    ClaimStatus.CLOSED
  ];
  const status = isFastTrack && Math.random() > 0.3
    ? ClaimStatus.CLOSED
    : statusOptions[Math.floor(Math.random() * statusOptions.length)];

  // Calculate days open
  const daysOpen = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

  // SLA date based on routing type
  const slaDays = isFastTrack ? 10 : 30;
  const slaDate = new Date(createdDate.getTime() + slaDays * 24 * 60 * 60 * 1000);
  const daysToSla = Math.floor((slaDate - now) / (1000 * 60 * 60 * 24));

  // Helper functions for random data
  const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
  const mannerOfDeath = ['Natural', 'Accident', 'Homicide', 'Suicide', 'Pending', 'Unknown'];
  const proofTypes = ['Death Certificate', 'Coroner Report', 'Hospital Record', 'Funeral Home Statement'];
  const regions = ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest'];
  const companyCodes = ['BLM', 'ALI', 'GLP', 'NWL', 'FST'];
  const partyRoles = ['Insured', 'Primary Beneficiary', 'Contingent Beneficiary', 'Owner', 'Notifier', 'Recipient', 'Agent', 'Assignee', 'Funeral Home'];

  const claim = {
    id: `claim-${index}`,
    claimNumber,
    status,
    type: ClaimType.DEATH,
    createdAt: createdDate.toISOString(),
    updatedAt: new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: status === ClaimStatus.CLOSED ? new Date(createdDate.getTime() + (isFastTrack ? 7 : 25) * 24 * 60 * 60 * 1000).toISOString() : null,

    // SA-003: Death Event Details
    deathEvent: {
      dateOfDeath: deathDate.toISOString().split('T')[0],
      mannerOfDeath: mannerOfDeath[Math.floor(Math.random() * mannerOfDeath.length)],
      causeOfDeath: 'Natural Causes',
      deathInUSA: Math.random() > 0.1,
      countryOfDeath: Math.random() > 0.1 ? 'USA' : 'Canada',
      stateOfDeath: states[Math.floor(Math.random() * states.length)],
      proofOfDeathSourceType: proofTypes[Math.floor(Math.random() * proofTypes.length)],
      proofOfDeathDate: new Date(deathDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      certifiedDOB: randomDate(new Date(1940, 0, 1), new Date(1980, 11, 31)).toISOString().split('T')[0],
      verificationSource: 'LexisNexis',
      verificationScore: isFastTrack ? Math.floor(Math.random() * 10 + 90) : Math.floor(Math.random() * 20 + 70),
      specialEvent: Math.random() > 0.9 ? 'Disaster Related' : null
    },

    // Insured information
    insured: {
      name: insuredName,
      ssn: randomSSN(),
      dateOfBirth: randomDate(
        new Date(1940, 0, 1),
        new Date(1980, 11, 31)
      ).toISOString().split('T')[0],
      dateOfDeath: deathDate.toISOString().split('T')[0],
      age: Math.floor(Math.random() * 40 + 50)
    },

    // Claimant information
    claimant: {
      name: claimantName,
      relationship: 'Spouse',
      contactInfo: {
        email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`,
        phone: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`
      }
    },

    // SA-004: Policy Portfolio (can have multiple policies)
    policies: [
      {
        policyNumber,
        policyType: 'Term Life',
        policyStatus: 'In Force',
        issueDate: policyIssueDate.toISOString().split('T')[0],
        issueState: states[Math.floor(Math.random() * states.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        companyCode: companyCodes[Math.floor(Math.random() * companyCodes.length)],
        planCode: `TL${Math.floor(Math.random() * 900 + 100)}`,
        faceAmount: claimAmount,
        currentCashValue: claimAmount * 0.6,
        loanBalance: Math.random() > 0.7 ? Math.floor(claimAmount * 0.1) : 0,
        paidToDate: new Date(deathDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'Policy Admin',
        owner: insuredName
      }
    ],

    // Legacy policy field for backward compatibility
    policy: {
      policyNumber,
      type: 'Term Life',
      status: 'In Force',
      issueDate: policyIssueDate.toISOString().split('T')[0],
      faceAmount: claimAmount,
      owner: insuredName
    },

    // SA-005: Party Management (All 9 party types)
    parties: [
      {
        id: `party-${index}-1`,
        name: insuredName,
        role: 'Insured',
        source: 'Policy Admin',
        resState: states[Math.floor(Math.random() * states.length)],
        dateOfBirth: randomDate(new Date(1940, 0, 1), new Date(1980, 11, 31)).toISOString().split('T')[0],
        ssn: randomSSN(),
        phone: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: `${insuredName.toLowerCase().replace(' ', '.')}@email.com`,
        address: `${Math.floor(Math.random() * 9999)} Main St, Anytown, ${states[Math.floor(Math.random() * states.length)]} ${Math.floor(Math.random() * 90000 + 10000)}`,
        verificationStatus: 'Verified',
        verificationScore: 98,
        cslnAction: 'Verified',
        cslnResult: 'Match'
      },
      {
        id: `party-${index}-2`,
        name: claimantName,
        role: 'Primary Beneficiary',
        source: 'Policy Admin',
        resState: states[Math.floor(Math.random() * states.length)],
        dateOfBirth: randomDate(new Date(1950, 0, 1), new Date(1990, 11, 31)).toISOString().split('T')[0],
        ssn: randomSSN(),
        phone: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`,
        address: `${Math.floor(Math.random() * 9999)} Oak Ave, Somewhere, ${states[Math.floor(Math.random() * states.length)]} ${Math.floor(Math.random() * 90000 + 10000)}`,
        verificationStatus: isFastTrack ? 'Verified' : 'Pending',
        verificationScore: isFastTrack ? 95 : 78,
        cslnAction: 'Search',
        cslnResult: isFastTrack ? 'Match' : 'Pending Review'
      },
      {
        id: `party-${index}-3`,
        name: randomName(),
        role: 'Notifier',
        source: 'FNOL',
        resState: states[Math.floor(Math.random() * states.length)],
        phone: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: `notifier${index}@email.com`,
        verificationStatus: 'Pending'
      }
    ],

    // SA-012: AI Insights
    aiInsights: {
      riskScore: isFastTrack ? Math.floor(Math.random() * 25 + 10) : Math.floor(Math.random() * 30 + 40),
      alerts: isFastTrack ? [] : [
        {
          id: `alert-${index}-1`,
          severity: Math.random() > 0.7 ? 'High' : 'Medium',
          category: 'Beneficiary Change',
          title: 'Recent Beneficiary Modification',
          message: 'Beneficiary was changed within 6 months of death',
          description: 'Policy beneficiary was updated 4 months before date of death, which may require additional review.',
          confidence: 85,
          recommendation: 'Review beneficiary change documentation and rationale',
          timestamp: new Date(deathDate.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },

    // Financial information with detailed PMI and Tax fields
    financial: {
      claimAmount,
      reserve: claimAmount * 0.9,
      amountPaid: status === ClaimStatus.CLOSED ? claimAmount : 0,

      // PMI calculation (state-specific rates)
      pmiState: states[Math.floor(Math.random() * states.length)],
      pmiRate: isFastTrack ? 0.10 : 0.08, // 10% or 8% annual rate
      pmiDays: Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24)),
      interestAmount: status === ClaimStatus.CLOSED ? Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) : 0,

      netBenefitProceeds: claimAmount,
      netBenefitPMI: status === ClaimStatus.CLOSED ? Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) : 0,

      // Tax calculations
      federalTaxRate: 24,
      stateTaxRate: 5.75,
      taxableAmount: status === ClaimStatus.CLOSED ? Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) : 0, // Only interest is taxable
      federalTaxWithheld: status === ClaimStatus.CLOSED ? Math.floor((Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) * 0.24)) : 0,
      stateTaxWithheld: status === ClaimStatus.CLOSED ? Math.floor((Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) * 0.0575)) : 0,
      taxWithheld: status === ClaimStatus.CLOSED ? Math.floor((Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) * 0.2975)) : 0,

      percentage: 100,
      currency: 'USD',

      // Detailed payment records
      payments: status === ClaimStatus.CLOSED ? [
        {
          id: `payment-${index}-1`,
          paymentNumber: `PAY-${String(index).padStart(6, '0')}`,
          payeeId: `party-${index}-2`,
          payeeName: claimantName,
          payeeSSN: randomSSN(),
          payeeAddress: `${Math.floor(Math.random() * 9999)} Oak Ave, Somewhere, ${states[Math.floor(Math.random() * states.length)]} ${Math.floor(Math.random() * 90000 + 10000)}`,

          // Benefit breakdown
          benefitAmount: claimAmount,
          netBenefitProceeds: claimAmount,
          netBenefitPMI: Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365),

          // PMI details
          pmiCalculation: {
            state: states[Math.floor(Math.random() * states.length)],
            rate: isFastTrack ? 10 : 8,
            dateOfDeath: deathDate.toISOString().split('T')[0],
            settlementDate: new Date(createdDate.getTime() + (isFastTrack ? 7 : 25) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            days: Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24)),
            amount: Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365)
          },

          // Tax details
          taxWithholding: {
            federalRate: 24,
            stateRate: 5.75,
            taxableAmount: Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365),
            federalWithheld: Math.floor((Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) * 0.24)),
            stateWithheld: Math.floor((Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) * 0.0575)),
            totalWithheld: Math.floor((Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) * 0.2975))
          },
          taxWithheld: Math.floor((Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) * 0.2975)),

          // Net payment to beneficiary
          netPayment: claimAmount + Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) - Math.floor((Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365) * 0.2975)),

          percentage: 100,
          paymentMethod: Math.random() > 0.5 ? 'ACH' : 'Check',

          // Banking info (if ACH)
          bankInfo: Math.random() > 0.5 ? {
            accountType: Math.random() > 0.5 ? 'Checking' : 'Savings',
            routingNumber: `${Math.floor(Math.random() * 900000000 + 100000000)}`,
            accountNumberLast4: `****${Math.floor(Math.random() * 9000 + 1000)}`
          } : null,

          // Payment dates and status
          scheduledDate: new Date(createdDate.getTime() + (isFastTrack ? 7 : 25) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paymentDate: new Date(createdDate.getTime() + (isFastTrack ? 7 : 25) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Completed',

          // GL Posting
          glPosting: {
            posted: true,
            postingDate: new Date(createdDate.getTime() + (isFastTrack ? 8 : 26) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            batchNumber: `GL-${Math.floor(Math.random() * 900000 + 100000)}`,
            accountCodes: {
              benefit: '5000-1000',
              pmi: '5000-1100',
              tax: '2000-3000'
            }
          },

          // 1099 generation
          tax1099: {
            generated: true,
            year: new Date().getFullYear(),
            formType: '1099-MISC',
            box3Amount: Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24))) / 365)
          }
        }
      ] : []
    },

    // Routing information (FastTrack or Standard)
    routing: isFastTrack ? {
      type: RoutingType.FASTTRACK,
      score: Math.floor(Math.random() * 10 + 85), // 85-95
      eligible: true,
      evaluatedAt: new Date(createdDate.getTime() + 15 * 60 * 1000).toISOString(),
      criteria: {
        deathVerification: true,
        policyInForce: true,
        beneficiaryMatch: true,
        noContestability: policyIssueDate < new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
        claimAmountThreshold: claimAmount <= 500000,
        noAnomalies: true
      }
    } : {
      type: RoutingType.STANDARD,
      score: Math.floor(Math.random() * 15 + 70), // 70-84
      eligible: false,
      evaluatedAt: new Date(createdDate.getTime() + 15 * 60 * 1000).toISOString(),
      criteria: {
        deathVerification: true,
        policyInForce: true,
        beneficiaryMatch: Math.random() > 0.5,
        noContestability: policyIssueDate < new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
        claimAmountThreshold: claimAmount <= 500000,
        noAnomalies: Math.random() > 0.3
      }
    },

    // Workflow information (FSO)
    workflow: {
      fsoCase: `FSO-${claimNumber}`,
      currentTask: status === ClaimStatus.CLOSED ? null : 'Review Requirements',
      assignedTo: status === ClaimStatus.CLOSED ? null : 'John Smith',
      daysOpen,
      sla: {
        dueDate: slaDate.toISOString(),
        daysRemaining: daysToSla,
        atRisk: daysToSla < 3 && status !== ClaimStatus.CLOSED
      }
    }
  };

  // Add requirements
  claim.requirements = generateRequirements(claim);

  // Add timeline
  claim.timeline = generateTimeline(claim);

  return claim;
};

/**
 * Generate demo claims dataset
 * Target: 40% FastTrack claims
 */
export const generateDemoClaims = (count = 20) => {
  const claims = [];
  const fastTrackCount = Math.floor(count * 0.4); // 40% FastTrack

  // Generate FastTrack claims
  for (let i = 1; i <= fastTrackCount; i++) {
    claims.push(generateClaim(i, true));
  }

  // Generate Standard claims
  for (let i = fastTrackCount + 1; i <= count; i++) {
    claims.push(generateClaim(i, false));
  }

  // Shuffle array
  return claims.sort(() => Math.random() - 0.5);
};

/**
 * Generate demo policies (linked to claims)
 */
export const generateDemoPolicies = (claims) => {
  return claims.map(claim => ({
    id: claim.policy.policyNumber,
    policyNumber: claim.policy.policyNumber,
    status: claim.policy.status,
    type: claim.policy.type,
    issueDate: claim.policy.issueDate,
    faceAmount: claim.policy.faceAmount,
    owner: claim.policy.owner,
    insured: claim.insured.name,
    beneficiaries: [
      {
        name: claim.claimant.name,
        relationship: claim.claimant.relationship,
        percentage: 100,
        type: 'Primary'
      }
    ],
    premiumAmount: Math.floor(claim.policy.faceAmount * 0.001),
    premiumFrequency: 'Annual'
  }));
};

/**
 * Generate demo FSO cases
 */
export const generateDemoFSOCases = (claims) => {
  return claims.map(claim => ({
    id: claim.workflow.fsoCase,
    claimId: claim.id,
    claimNumber: claim.claimNumber,
    status: claim.status === ClaimStatus.CLOSED ? 'Closed' : 'Open',
    priority: claim.routing?.type === RoutingType.FASTTRACK ? 'High' : 'Normal',
    currentTask: claim.workflow.currentTask,
    assignedTo: claim.workflow.assignedTo,
    sla: claim.workflow.sla,
    playbook: claim.routing?.type === RoutingType.FASTTRACK ? 'FastTrack Death Claim' : 'Standard Death Claim',
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt
  }));
};

/**
 * Export default demo dataset
 */
const demoClaims = generateDemoClaims(20);

export default {
  claims: demoClaims,
  policies: generateDemoPolicies(demoClaims),
  fsoCases: generateDemoFSOCases(demoClaims)
};
