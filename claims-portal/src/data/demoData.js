/**
 * Demo Data Generator
 *
 * Generates deterministic sample claims with full orchestration metadata:
 * - Uses seeded PRNG for reproducible data across page loads
 * - 5 hand-crafted showcase claims + 15 seeded claims
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

// ============================================================
// Seeded PRNG (mulberry32) for deterministic random generation
// ============================================================
const createSeededRandom = (seed) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Global seeded random - same seed = same data every time
const seeded = createSeededRandom(42);

const seededDate = (start, end) => {
  return new Date(start.getTime() + seeded() * (end.getTime() - start.getTime()));
};

const maskedSSN = (last4) => `***-**-${last4}`;

const seededPick = (arr) => arr[Math.floor(seeded() * arr.length)];

const FIRST_NAMES_MALE = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Thomas', 'Daniel', 'Mark'];
const FIRST_NAMES_FEMALE = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Susan', 'Margaret', 'Dorothy', 'Lisa', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Garcia', 'Miller', 'Wilson', 'Moore', 'Taylor'];

const seededMaleName = () => `${seededPick(FIRST_NAMES_MALE)} ${seededPick(LAST_NAMES)}`;
const seededFemaleName = () => `${seededPick(FIRST_NAMES_FEMALE)} ${seededPick(LAST_NAMES)}`;

const STATES = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest'];
const COMPANY_CODES = ['BLM', 'ALI', 'GLP', 'NWL', 'FST'];
const PROOF_TYPES = ['Death Certificate', 'Coroner Report', 'Hospital Record', 'Funeral Home Statement'];

// ============================================================
// Requirement generation
// ============================================================
const generateRequirements = (claim) => {
  const requirements = [];
  const createdAtDate = typeof claim.createdAt === 'string' ? new Date(claim.createdAt) : claim.createdAt;
  const isFastTrack = claim.routing?.type === RoutingType.FASTTRACK;

  // CLAIM LEVEL
  requirements.push({
    id: `${claim.id}-req-1`, level: 'claim', type: RequirementType.DEATH_CERTIFICATE,
    name: 'Certified Death Certificate', description: 'Official death certificate from state vital records',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 2 * 86400000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-1`, name: 'death_certificate.pdf' }] : [],
    metadata: { confidenceScore: isFastTrack ? 0.96 : null, idpClassification: isFastTrack ? 'death_certificate' : null }
  });

  requirements.push({
    id: `${claim.id}-req-2`, level: 'claim', type: RequirementType.CLAIMANT_STATEMENT,
    name: 'Claimant Statement of Claim', description: 'Signed statement of claim form',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isFastTrack
      ? [{ id: `doc-${claim.id}-2`, name: 'claimant_statement.pdf' }]
      : [{ id: `doc-${claim.id}-2`, name: 'claimant_statement_draft.pdf' }],
    metadata: { confidenceScore: isFastTrack ? 0.93 : 0.78, reason: isFastTrack ? null : 'Signature verification in progress' }
  });

  requirements.push({
    id: `${claim.id}-req-3`, level: 'claim', type: RequirementType.PROOF_OF_IDENTITY,
    name: 'Government-Issued Photo ID', description: "Driver's license, passport, or state ID",
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-3`, name: 'drivers_license.pdf' }] : [],
    metadata: isFastTrack ? { confidenceScore: 0.95 } : {}
  });

  // POLICY LEVEL
  requirements.push({
    id: `${claim.id}-req-4`, level: 'policy', type: 'POLICY_VERIFICATION',
    name: 'Policy In-Force Verification', description: 'Verify policy status and coverage at date of death',
    status: RequirementStatus.SATISFIED, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 3 * 86400000).toISOString(),
    satisfiedDate: new Date(createdAtDate.getTime() + 6 * 3600000).toISOString(),
    documents: [],
    metadata: { verificationSource: 'Policy Admin System', policyNumber: claim.policy.policyNumber }
  });

  // PARTY LEVEL
  requirements.push({
    id: `${claim.id}-req-7`, level: 'party', type: 'BENEFICIARY_VERIFICATION',
    name: 'Beneficiary Identity Verification', description: 'SSN verification and identity confirmation',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-7`, name: 'beneficiary_ssn_card.pdf' }] : [],
    metadata: { confidenceScore: isFastTrack ? 0.97 : 0.82, partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name }
  });

  requirements.push({
    id: `${claim.id}-req-8`, level: 'party', type: 'TAX_FORM',
    name: 'IRS Form W-9', description: 'W-9 form for tax reporting and 1099 generation',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 10 * 86400000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 3 * 86400000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-8`, name: 'w9_form.pdf' }] : [],
    metadata: { partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name }
  });

  requirements.push({
    id: `${claim.id}-req-9`, level: 'party', type: 'PAYMENT_ELECTION',
    name: 'Payment Election Form', description: 'ACH direct deposit or check payment selection',
    status: isFastTrack ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 10 * 86400000).toISOString(),
    satisfiedDate: isFastTrack ? new Date(createdAtDate.getTime() + 2 * 86400000).toISOString() : null,
    documents: isFastTrack ? [{ id: `doc-${claim.id}-9`, name: 'payment_election.pdf' }] : [],
    metadata: { partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name, paymentMethod: isFastTrack ? 'ACH' : 'Not selected' }
  });

  return requirements;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const generateTimeline = (claim) => {
  const events = [];
  events.push({ id: `${claim.id}-event-1`, timestamp: claim.createdAt, type: 'claim.created', source: 'cma', user: { name: 'System', role: 'system' }, description: 'Claim submitted via online portal', metadata: { channel: 'beneficiary_portal' } });
  events.push({ id: `${claim.id}-event-2`, timestamp: new Date(new Date(claim.createdAt).getTime() + 5 * 60000).toISOString(), type: 'policy.verified', source: 'policy', user: { name: 'System', role: 'system' }, description: 'Policy verified in Policy Admin system', metadata: { policyNumber: claim.policy.policyNumber, status: 'in-force' } });
  events.push({ id: `${claim.id}-event-3`, timestamp: new Date(new Date(claim.createdAt).getTime() + 10 * 60000).toISOString(), type: 'death.verified', source: 'verification', user: { name: 'LexisNexis', role: 'external' }, description: 'Death verification completed (3-point match)', metadata: { confidence: 0.95, matchPoints: ['ssn', 'name', 'dob'] } });
  if (claim.routing?.type === RoutingType.FASTTRACK) {
    events.push({ id: `${claim.id}-event-4`, timestamp: new Date(new Date(claim.createdAt).getTime() + 15 * 60000).toISOString(), type: 'routing.fasttrack', source: 'fso', user: { name: 'Routing Engine', role: 'system' }, description: 'Claim routed to FastTrack processing', metadata: { score: claim.routing.score, eligible: true } });
  }
  events.push({ id: `${claim.id}-event-5`, timestamp: new Date(new Date(claim.createdAt).getTime() + 20 * 60000).toISOString(), type: 'requirements.generated', source: 'requirements', user: { name: 'Decision Table Engine', role: 'system' }, description: `${claim.requirements?.length || 3} requirements generated`, metadata: { mandatoryCount: 3, optionalCount: 0 } });
  return events;
};

const generateWorkNotes = (claim) => {
  const createdAtDate = typeof claim.createdAt === 'string' ? new Date(claim.createdAt) : claim.createdAt;
  const noteTemplates = [
    'Initial claim review completed. All submitted documents have been received and logged.',
    'Verified death certificate against LexisNexis records. 3-point match confirmed.',
    'Contacted claimant to request additional documentation for beneficiary verification.'
  ];
  const authors = ['claims.adjuster', 'stephanie.lyons', 'john.examiner'];
  const notes = [];
  for (let i = 0; i < 3; i++) {
    const noteDate = new Date(createdAtDate.getTime() + (i + 1) * 86400000);
    notes.push({
      sys_id: `wn-${claim.id}-${i + 1}`, element: 'work_notes', element_id: claim.sysId || claim.id,
      name: 'x_dxcis_claims_a_0_claims_fnol', value: noteTemplates[i],
      sys_created_on: noteDate.toISOString().replace('T', ' ').substring(0, 19), sys_created_by: authors[i]
    });
  }
  return notes.sort((a, b) => new Date(b.sys_created_on) - new Date(a.sys_created_on));
};

// ============================================================
// Constants
// ============================================================
// Set to March 1, 2026 for Connect demo dates
const NOW = new Date('2026-03-01T12:00:00');
const DAY = 86400000;

// ============================================================
// 5 Hand-crafted showcase claims
// ============================================================
const createShowcaseClaims = () => {
  const claims = [];

  // ---- CLAIM 0A: $50K STP - APPROVED (Straight Through Processing) ----
  {
    const createdDate = new Date(NOW.getTime() - 3 * DAY);
    const deathDate = new Date(NOW.getTime() - 8 * DAY);
    const approvedDate = new Date(createdDate.getTime() + 6 * 3600000); // 6 hours later
    const slaDate = new Date(createdDate.getTime() + 10 * DAY);
    const daysOpen = Math.floor((approvedDate - createdDate) / DAY);
    const claimAmount = 50000;

    const claim = {
      id: 'claim-0a', claimNumber: 'CLM-000050', status: ClaimStatus.APPROVED, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: approvedDate.toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Natural Causes',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'CA', proofOfDeathSourceType: 'Death Certificate',
        proofOfDeathDate: new Date(deathDate.getTime() + 2 * DAY).toISOString().split('T')[0],
        certifiedDOB: '1960-08-14', verificationSource: 'LexisNexis', verificationScore: 98, specialEvent: null
      },
      insured: { name: 'Thomas Chen', ssn: maskedSSN('5892'), dateOfBirth: '1960-08-14', dateOfDeath: deathDate.toISOString().split('T')[0], age: 65 },
      claimant: { name: 'Lisa Chen', relationship: 'Spouse', contactInfo: { email: 'lisa.chen@email.com', phone: '415-555-0892' } },
      policies: [{
        policyNumber: 'POL-892456', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2015-06-20',
        issueState: 'CA', region: 'West', companyCode: 'BLM', planCode: 'TL50', faceAmount: claimAmount,
        currentCashValue: 30000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 20 * DAY).toISOString().split('T')[0],
        source: 'Policy Admin', owner: 'Thomas Chen'
      }],
      policy: { policyNumber: 'POL-892456', type: 'Term Life', status: 'In Force', issueDate: '2015-06-20', faceAmount: claimAmount, owner: 'Thomas Chen' },
      parties: [
        { id: 'party-0a-1', name: 'Thomas Chen', role: 'Insured', source: 'Policy Admin', resState: 'CA', dateOfBirth: '1960-08-14', ssn: maskedSSN('5892'), phone: '415-555-0891', email: 'thomas.chen@email.com', address: '2840 Market Street, San Francisco, CA 94114', verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-0a-2', name: 'Lisa Chen', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'CA', dateOfBirth: '1962-11-30', ssn: maskedSSN('4107'), phone: '415-555-0892', email: 'lisa.chen@email.com', address: '2840 Market Street, San Francisco, CA 94114', verificationStatus: 'Verified', verificationScore: 97, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-0a-3', name: 'Lisa Chen', role: 'Notifier', source: 'FNOL', resState: 'CA', phone: '415-555-0892', email: 'lisa.chen@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: {
        riskScore: 8,
        alerts: [],
        stpEligible: true,
        stpReason: 'All verification criteria met: Death certificate verified, beneficiary matches, policy in force, no contestability issues, amount under $100K threshold'
      },
      financial: {
        claimAmount, reserve: claimAmount, amountPaid: 0, pmiState: 'CA', pmiRate: 0.10, pmiDays: 0,
        interestAmount: 0, netBenefitProceeds: claimAmount, netBenefitPMI: 0,
        federalTaxRate: 0, stateTaxRate: 0, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0,
        percentage: 100, currency: 'USD', payments: []
      },
      routing: {
        type: RoutingType.FASTTRACK, score: 98, eligible: true,
        evaluatedAt: new Date(createdDate.getTime() + 5 * 60000).toISOString(),
        criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true }
      },
      workflow: {
        fsoCase: 'FSO-CLM-000050', currentTask: 'Payment Scheduled', assignedTo: 'Automated System', daysOpen,
        sla: { dueDate: slaDate.toISOString(), daysRemaining: Math.ceil((slaDate - approvedDate) / DAY), atRisk: false }
      }
    };
    claim.sysId = 'demo-sys-id-0a'; claim.fnolNumber = 'FNOL0000050';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 0B: $250K - AI DETECTED SPOUSE NAME MISMATCH (Requires Review) ----
  {
    const createdDate = new Date(NOW.getTime() - 5 * DAY);
    const deathDate = new Date(NOW.getTime() - 10 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);
    const claimAmount = 250000;

    const claim = {
      id: 'claim-0b', claimNumber: 'CLM-000051', status: ClaimStatus.PENDING_REQUIREMENTS, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 2 * DAY).toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Natural Causes',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'NY', proofOfDeathSourceType: 'Death Certificate',
        proofOfDeathDate: new Date(deathDate.getTime() + 3 * DAY).toISOString().split('T')[0],
        certifiedDOB: '1958-03-22', verificationSource: 'LexisNexis', verificationScore: 95, specialEvent: null
      },
      insured: { name: 'Richard Thompson', ssn: maskedSSN('7293'), dateOfBirth: '1958-03-22', dateOfDeath: deathDate.toISOString().split('T')[0], age: 68 },
      claimant: { name: 'Jennifer Thompson', relationship: 'Spouse', contactInfo: { email: 'jennifer.thompson@email.com', phone: '212-555-0847' } },
      policies: [{
        policyNumber: 'POL-784521', policyType: 'Universal Life', policyStatus: 'In Force', issueDate: '2010-04-15',
        issueState: 'NY', region: 'Northeast', companyCode: 'BLM', planCode: 'UL250', faceAmount: claimAmount,
        currentCashValue: 180000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 25 * DAY).toISOString().split('T')[0],
        source: 'Policy Admin', owner: 'Richard Thompson'
      }],
      policy: { policyNumber: 'POL-784521', type: 'Universal Life', status: 'In Force', issueDate: '2010-04-15', faceAmount: claimAmount, owner: 'Richard Thompson' },
      parties: [
        { id: 'party-0b-1', name: 'Richard Thompson', role: 'Insured', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1958-03-22', ssn: maskedSSN('7293'), phone: '212-555-0846', email: 'richard.thompson@email.com', address: '485 Park Avenue, New York, NY 10022', verificationStatus: 'Verified', verificationScore: 97, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-0b-2', name: 'Susan Thompson', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1960-07-18', ssn: maskedSSN('4156'), phone: '212-555-0732', email: 'susan.thompson@email.com', address: '485 Park Avenue, New York, NY 10022', verificationStatus: 'Unverified', verificationScore: 45, cslnAction: 'Alert', cslnResult: 'Name Mismatch' },
        { id: 'party-0b-3', name: 'Jennifer Thompson', role: 'Notifier', source: 'FNOL', resState: 'NY', phone: '212-555-0847', email: 'jennifer.thompson@email.com', verificationStatus: 'Pending', cslnAction: 'Review Required', cslnResult: 'Different Person' }
      ],
      aiInsights: {
        riskScore: 72,
        alerts: [{
          id: 'alert-0b-1',
          severity: 'High',
          category: 'Beneficiary Mismatch',
          title: 'Spouse Name Does Not Match Beneficiary',
          message: 'Current spouse Jennifer Thompson does not match beneficiary Susan Thompson on policy',
          description: 'The person filing the claim (Jennifer Thompson) identifies as the current spouse, but the policy shows Susan Thompson as the primary beneficiary. This suggests the beneficiary designation was not updated after a divorce/remarriage. Manual review and updated beneficiary designation documentation required.',
          confidence: 94,
          recommendation: 'Contact claimant to verify marital status and obtain updated beneficiary designation or divorce decree. May require proof of marriage to current spouse.',
          timestamp: new Date(createdDate.getTime() + 2 * 3600000).toISOString(),
          detectedBy: 'AI Beneficiary Verification Engine'
        }],
        stpEligible: false,
        stpReason: 'Beneficiary name mismatch detected - requires manual review'
      },
      financial: {
        claimAmount, reserve: claimAmount, amountPaid: 0, pmiState: 'NY', pmiRate: 0.08, pmiDays: 0,
        interestAmount: 0, netBenefitProceeds: claimAmount, netBenefitPMI: 0,
        federalTaxRate: 0, stateTaxRate: 0, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0,
        percentage: 100, currency: 'USD', payments: []
      },
      routing: {
        type: RoutingType.STANDARD, score: 28, eligible: false,
        evaluatedAt: new Date(createdDate.getTime() + 2 * 3600000).toISOString(),
        criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: false, noAnomalies: false }
      },
      workflow: {
        fsoCase: 'FSO-CLM-000051', currentTask: 'Beneficiary Verification', assignedTo: 'Sarah Martinez', daysOpen,
        sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 7 }
      }
    };
    claim.sysId = 'demo-sys-id-0b'; claim.fnolNumber = 'FNOL0000051';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 0C: Annuity Surrender - $75K (No death, policy owner request) ----
  {
    const createdDate = new Date(NOW.getTime() - 8 * DAY);
    const approvedDate = new Date(createdDate.getTime() + 4 * DAY);
    const slaDate = new Date(createdDate.getTime() + 15 * DAY);
    const daysOpen = Math.floor((approvedDate - createdDate) / DAY);
    const claimAmount = 75000;

    const claim = {
      id: 'claim-0c', claimNumber: 'CLM-000052', status: ClaimStatus.APPROVED, type: ClaimType.SURRENDER,
      createdAt: createdDate.toISOString(), updatedAt: approvedDate.toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: null,
        mannerOfDeath: 'N/A - Surrender',
        causeOfDeath: 'N/A - No Death',
        deathInUSA: null,
        countryOfDeath: null,
        stateOfDeath: null,
        proofOfDeathSourceType: 'N/A',
        proofOfDeathDate: null,
        certifiedDOB: '1965-12-08',
        verificationSource: 'Policy Admin',
        verificationScore: 98,
        specialEvent: 'Annuity Surrender'
      },
      insured: {
        name: 'Patricia Williams',
        ssn: maskedSSN('8524'),
        dateOfBirth: '1965-12-08',
        dateOfDeath: null,
        age: 60
      },
      claimant: {
        name: 'Patricia Williams',
        relationship: 'Policy Owner',
        contactInfo: { email: 'patricia.williams@email.com', phone: '404-555-0734' }
      },
      policies: [{
        policyNumber: 'POL-459123', policyType: 'Variable Annuity', policyStatus: 'In Force', issueDate: '2016-09-10',
        issueState: 'GA', region: 'Southeast', companyCode: 'ALI', planCode: 'VA-FLEX', faceAmount: 0,
        currentCashValue: claimAmount, loanBalance: 0, paidToDate: new Date(createdDate.getTime() - 30 * DAY).toISOString().split('T')[0],
        source: 'Policy Admin', owner: 'Patricia Williams'
      }],
      policy: {
        policyNumber: 'POL-459123', type: 'Variable Annuity', status: 'In Force', issueDate: '2016-09-10',
        faceAmount: 0, currentCashValue: claimAmount, owner: 'Patricia Williams'
      },
      parties: [
        { id: 'party-0c-1', name: 'Patricia Williams', role: 'Policy Owner', source: 'Policy Admin', resState: 'GA', dateOfBirth: '1965-12-08', ssn: maskedSSN('8524'), phone: '404-555-0734', email: 'patricia.williams@email.com', address: '3680 Peachtree Road, Atlanta, GA 30319', verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' }
      ],
      aiInsights: {
        riskScore: 12,
        alerts: [],
        stpEligible: true,
        stpReason: 'Full surrender request verified. Owner identity confirmed, no contestability period, surrender value confirmed.'
      },
      financial: {
        claimAmount, reserve: 0, amountPaid: 0, pmiState: null, pmiRate: 0, pmiDays: 0,
        interestAmount: 0, netBenefitProceeds: claimAmount, netBenefitPMI: 0,
        surrenderCharge: 3750, // 5% surrender charge
        netAmount: claimAmount - 3750,
        federalTaxRate: 24, stateTaxRate: 6, taxableAmount: claimAmount, // Full amount is taxable for annuity
        federalTaxWithheld: Math.floor(claimAmount * 0.24),
        stateTaxWithheld: Math.floor(claimAmount * 0.06),
        taxWithheld: Math.floor(claimAmount * 0.30),
        percentage: 100, currency: 'USD', payments: []
      },
      routing: {
        type: RoutingType.FASTTRACK, score: 96, eligible: true,
        evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(),
        criteria: { deathVerification: null, policyInForce: true, beneficiaryMatch: null, noContestability: true, claimAmountThreshold: true, noAnomalies: true }
      },
      workflow: {
        fsoCase: 'FSO-CLM-000052', currentTask: 'Payment Scheduled', assignedTo: 'Automated System', daysOpen,
        sla: { dueDate: slaDate.toISOString(), daysRemaining: Math.ceil((slaDate - approvedDate) / DAY), atRisk: false }
      }
    };
    claim.sysId = 'demo-sys-id-0c'; claim.fnolNumber = 'FNOL0000052';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 1: Elizabeth Jones (featured, UNDER_REVIEW, Standard) ----
  {
    const createdDate = new Date(NOW.getTime() - 20 * DAY);
    const deathDate = new Date(NOW.getTime() - 25 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-1', claimNumber: 'CLM-000001', status: ClaimStatus.UNDER_REVIEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 2 * DAY).toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Natural Causes',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'IL', proofOfDeathSourceType: 'Death Certificate',
        proofOfDeathDate: new Date(deathDate.getTime() + 3 * DAY).toISOString().split('T')[0],
        certifiedDOB: '1958-06-15', verificationSource: 'LexisNexis', verificationScore: 88, specialEvent: null
      },
      insured: { name: 'Robert Jones', ssn: maskedSSN('4821'), dateOfBirth: '1958-06-15', dateOfDeath: deathDate.toISOString().split('T')[0], age: 67 },
      claimant: { name: 'Elizabeth Jones', relationship: 'Spouse', contactInfo: { email: 'elizabeth.jones@email.com', phone: '312-555-0147' } },
      policies: [{ policyNumber: 'POL-847291', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2018-05-10', issueState: 'IL', region: 'Midwest', companyCode: 'BLM', planCode: 'TL200', faceAmount: 150000, currentCashValue: 90000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 30 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Robert Jones' }],
      policy: { policyNumber: 'POL-847291', type: 'Term Life', status: 'In Force', issueDate: '2018-05-10', faceAmount: 150000, owner: 'Robert Jones' },
      parties: [
        { id: 'party-1-1', name: 'Robert Jones', role: 'Insured', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1958-06-15', ssn: maskedSSN('4821'), phone: '312-555-0198', email: 'robert.jones@email.com', address: '742 Maple Drive, Springfield, IL 62704', verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-1-2', name: 'Elizabeth Jones', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1960-03-22', ssn: maskedSSN('7193'), phone: '312-555-0147', email: 'elizabeth.jones@email.com', address: '742 Maple Drive, Springfield, IL 62704', verificationStatus: 'Pending', verificationScore: 82, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-1-3', name: 'David Jones', role: 'Contingent Beneficiary', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1988-09-14', ssn: maskedSSN('3056'), phone: '312-555-0234', email: 'david.jones@email.com', address: '1580 Oak Lane, Springfield, IL 62701', verificationStatus: 'Pending', verificationScore: 78, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-1-4', name: 'Rachel Jones', role: 'Contingent Beneficiary', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1991-12-03', ssn: maskedSSN('8412'), phone: '312-555-0367', email: 'rachel.jones@email.com', address: '2204 Pine Street, Chicago, IL 60614', verificationStatus: 'Pending', verificationScore: 80, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-1-5', name: 'Elizabeth Jones', role: 'Notifier', source: 'FNOL', resState: 'IL', phone: '312-555-0147', email: 'elizabeth.jones@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 45, alerts: [{ id: 'alert-1-1', severity: 'Medium', category: 'Beneficiary Change', title: 'Recent Beneficiary Modification', message: 'Beneficiary designation was updated 8 months before date of death', description: 'Policy beneficiary was updated 8 months before date of death. While this is within a typical review window, it should be verified during standard processing.', confidence: 72, recommendation: 'Review beneficiary change documentation and rationale', timestamp: new Date(deathDate.getTime() - 240 * DAY).toISOString() }] },
      financial: { claimAmount: 150000, reserve: 135000, amountPaid: 0, pmiState: 'IL', pmiRate: 0.08, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 150000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 76, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: true, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000001', currentTask: 'Review Requirements', assignedTo: 'John Smith', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'demo-sys-id-1'; claim.fnolNumber = 'FNOL0000001';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 2: FastTrack, CLOSED, clean claim ----
  {
    const createdDate = new Date(NOW.getTime() - 12 * DAY);
    const deathDate = new Date(NOW.getTime() - 18 * DAY);
    const closedDate = new Date(createdDate.getTime() + 7 * DAY);
    const slaDate = new Date(createdDate.getTime() + 10 * DAY);
    const daysOpen = Math.floor((closedDate - createdDate) / DAY);
    const pmiDays = Math.floor((closedDate - deathDate) / DAY);
    const claimAmount = 100000;
    const interestAmount = Math.floor((claimAmount * 0.10 * pmiDays) / 365);

    const claim = {
      id: 'claim-2', claimNumber: 'CLM-000002', status: ClaimStatus.CLOSED, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: closedDate.toISOString(), closedAt: closedDate.toISOString(),
      deathEvent: { dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Natural Causes', deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'FL', proofOfDeathSourceType: 'Death Certificate', proofOfDeathDate: new Date(deathDate.getTime() + 2 * DAY).toISOString().split('T')[0], certifiedDOB: '1952-11-08', verificationSource: 'LexisNexis', verificationScore: 96, specialEvent: null },
      insured: { name: 'Harold Mitchell', ssn: maskedSSN('2947'), dateOfBirth: '1952-11-08', dateOfDeath: deathDate.toISOString().split('T')[0], age: 73 },
      claimant: { name: 'Margaret Mitchell', relationship: 'Spouse', contactInfo: { email: 'margaret.mitchell@email.com', phone: '813-555-0291' } },
      policies: [{ policyNumber: 'POL-523184', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2016-03-15', issueState: 'FL', region: 'Southeast', companyCode: 'ALI', planCode: 'TL150', faceAmount: claimAmount, currentCashValue: 60000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 15 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Harold Mitchell' }],
      policy: { policyNumber: 'POL-523184', type: 'Term Life', status: 'In Force', issueDate: '2016-03-15', faceAmount: claimAmount, owner: 'Harold Mitchell' },
      parties: [
        { id: 'party-2-1', name: 'Harold Mitchell', role: 'Insured', source: 'Policy Admin', resState: 'FL', dateOfBirth: '1952-11-08', ssn: maskedSSN('2947'), phone: '813-555-0198', email: 'harold.mitchell@email.com', address: '4521 Palm Court, Tampa, FL 33602', verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-2-2', name: 'Margaret Mitchell', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'FL', dateOfBirth: '1955-07-20', ssn: maskedSSN('6183'), phone: '813-555-0291', email: 'margaret.mitchell@email.com', address: '4521 Palm Court, Tampa, FL 33602', verificationStatus: 'Verified', verificationScore: 96, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-2-3', name: 'Margaret Mitchell', role: 'Notifier', source: 'FNOL', resState: 'FL', phone: '813-555-0291', email: 'margaret.mitchell@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 15, alerts: [] },
      financial: { claimAmount, reserve: 0, amountPaid: claimAmount, pmiState: 'FL', pmiRate: 0.10, pmiDays, interestAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: interestAmount, federalTaxWithheld: Math.floor(interestAmount * 0.24), stateTaxWithheld: Math.floor(interestAmount * 0.0575), taxWithheld: Math.floor(interestAmount * 0.2975), percentage: 100, currency: 'USD',
        payments: [{ id: 'payment-2-1', paymentNumber: 'PAY-000002', payeeId: 'party-2-2', payeeName: 'Margaret Mitchell', payeeSSN: maskedSSN('6183'), payeeAddress: '4521 Palm Court, Tampa, FL 33602', benefitAmount: claimAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, pmiCalculation: { state: 'FL', rate: 10, dateOfDeath: deathDate.toISOString().split('T')[0], settlementDate: closedDate.toISOString().split('T')[0], days: pmiDays, amount: interestAmount }, taxWithholding: { federalRate: 24, stateRate: 5.75, taxableAmount: interestAmount, federalWithheld: Math.floor(interestAmount * 0.24), stateWithheld: Math.floor(interestAmount * 0.0575), totalWithheld: Math.floor(interestAmount * 0.2975) }, taxWithheld: Math.floor(interestAmount * 0.2975), netPayment: claimAmount + interestAmount - Math.floor(interestAmount * 0.2975), percentage: 100, paymentMethod: 'ACH', bankInfo: { accountType: 'Checking', routingNumber: '063107513', accountNumberLast4: '****7829' }, scheduledDate: closedDate.toISOString().split('T')[0], paymentDate: closedDate.toISOString().split('T')[0], status: 'Completed', glPosting: { posted: true, postingDate: new Date(closedDate.getTime() + DAY).toISOString().split('T')[0], batchNumber: 'GL-482910', accountCodes: { benefit: '5000-1000', pmi: '5000-1100', tax: '2000-3000' } }, tax1099: { generated: true, year: NOW.getFullYear(), formType: '1099-MISC', box3Amount: interestAmount } }] },
      routing: { type: RoutingType.FASTTRACK, score: 92, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } },
      workflow: { fsoCase: 'FSO-CLM-000002', currentTask: null, assignedTo: null, daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: Math.ceil((slaDate - closedDate) / DAY), atRisk: false } }
    };
    claim.sysId = 'demo-sys-id-2'; claim.fnolNumber = 'FNOL0000002';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 3: NEW, FastTrack eligible, just submitted ----
  {
    const createdDate = new Date(NOW.getTime() - 2 * DAY);
    const deathDate = new Date(NOW.getTime() - 5 * DAY);
    const slaDate = new Date(createdDate.getTime() + 10 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-3', claimNumber: 'CLM-000003', status: ClaimStatus.NEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: createdDate.toISOString(), closedAt: null,
      deathEvent: { dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Accident', causeOfDeath: 'Motor Vehicle Accident', deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'TX', proofOfDeathSourceType: 'Death Certificate', proofOfDeathDate: new Date(deathDate.getTime() + 2 * DAY).toISOString().split('T')[0], certifiedDOB: '1970-04-22', verificationSource: 'LexisNexis', verificationScore: 94, specialEvent: null },
      insured: { name: 'Thomas Garcia', ssn: maskedSSN('5612'), dateOfBirth: '1970-04-22', dateOfDeath: deathDate.toISOString().split('T')[0], age: 55 },
      claimant: { name: 'Maria Garcia', relationship: 'Spouse', contactInfo: { email: 'maria.garcia@email.com', phone: '214-555-0382' } },
      policies: [{ policyNumber: 'POL-619247', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2020-01-15', issueState: 'TX', region: 'Southwest', companyCode: 'GLP', planCode: 'TL175', faceAmount: 175000, currentCashValue: 105000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 10 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Thomas Garcia' }],
      policy: { policyNumber: 'POL-619247', type: 'Term Life', status: 'In Force', issueDate: '2020-01-15', faceAmount: 175000, owner: 'Thomas Garcia' },
      parties: [
        { id: 'party-3-1', name: 'Thomas Garcia', role: 'Insured', source: 'Policy Admin', resState: 'TX', dateOfBirth: '1970-04-22', ssn: maskedSSN('5612'), phone: '214-555-0100', email: 'thomas.garcia@email.com', address: '8901 Bluebonnet Lane, Dallas, TX 75201', verificationStatus: 'Verified', verificationScore: 97, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-3-2', name: 'Maria Garcia', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'TX', dateOfBirth: '1972-08-11', ssn: maskedSSN('8934'), phone: '214-555-0382', email: 'maria.garcia@email.com', address: '8901 Bluebonnet Lane, Dallas, TX 75201', verificationStatus: 'Verified', verificationScore: 95, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-3-3', name: 'Maria Garcia', role: 'Notifier', source: 'FNOL', resState: 'TX', phone: '214-555-0382', email: 'maria.garcia@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 22, alerts: [] },
      financial: { claimAmount: 175000, reserve: 157500, amountPaid: 0, pmiState: 'TX', pmiRate: 0.10, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 175000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 0, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.FASTTRACK, score: 91, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } },
      workflow: { fsoCase: 'FSO-CLM-000003', currentTask: 'Review Requirements', assignedTo: 'Sarah Johnson', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: false } }
    };
    claim.sysId = 'demo-sys-id-3'; claim.fnolNumber = 'FNOL0000003';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 4: APPROVED, Standard, disaster-related (Accident, not Homicide) ----
  {
    const createdDate = new Date(NOW.getTime() - 22 * DAY);
    const deathDate = new Date(NOW.getTime() - 28 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-4', claimNumber: 'CLM-000004', status: ClaimStatus.APPROVED, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 18 * DAY).toISOString(), closedAt: null,
      deathEvent: { dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Accident', causeOfDeath: 'Hurricane-related injuries', deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'FL', proofOfDeathSourceType: 'Coroner Report', proofOfDeathDate: new Date(deathDate.getTime() + 5 * DAY).toISOString().split('T')[0], certifiedDOB: '1965-02-28', verificationSource: 'LexisNexis', verificationScore: 85, specialEvent: 'Disaster Related' },
      insured: { name: 'William Davis', ssn: maskedSSN('3478'), dateOfBirth: '1965-02-28', dateOfDeath: deathDate.toISOString().split('T')[0], age: 60 },
      claimant: { name: 'Susan Davis', relationship: 'Spouse', contactInfo: { email: 'susan.davis@email.com', phone: '305-555-0419' } },
      policies: [{ policyNumber: 'POL-738156', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2019-09-01', issueState: 'FL', region: 'Southeast', companyCode: 'NWL', planCode: 'TL250', faceAmount: 200000, currentCashValue: 120000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 20 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'William Davis' }],
      policy: { policyNumber: 'POL-738156', type: 'Term Life', status: 'In Force', issueDate: '2019-09-01', faceAmount: 200000, owner: 'William Davis' },
      parties: [
        { id: 'party-4-1', name: 'William Davis', role: 'Insured', source: 'Policy Admin', resState: 'FL', dateOfBirth: '1965-02-28', ssn: maskedSSN('3478'), phone: '305-555-0200', email: 'william.davis@email.com', address: '1234 Ocean Drive, Miami, FL 33139', verificationStatus: 'Verified', verificationScore: 97, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-4-2', name: 'Susan Davis', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'FL', dateOfBirth: '1967-05-14', ssn: maskedSSN('9201'), phone: '305-555-0419', email: 'susan.davis@email.com', address: '1234 Ocean Drive, Miami, FL 33139', verificationStatus: 'Verified', verificationScore: 93, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-4-3', name: 'Susan Davis', role: 'Notifier', source: 'FNOL', resState: 'FL', phone: '305-555-0419', email: 'susan.davis@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 38, alerts: [{ id: 'alert-4-1', severity: 'Medium', category: 'Special Event', title: 'Disaster-Related Claim', message: 'Claim filed under disaster event provisions', description: 'Death occurred during a hurricane event. Expedited processing may be warranted per disaster provisions.', confidence: 90, recommendation: 'Apply disaster provisions for expedited processing', timestamp: createdDate.toISOString() }] },
      financial: { claimAmount: 200000, reserve: 180000, amountPaid: 0, pmiState: 'FL', pmiRate: 0.08, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 200000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 78, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000004', currentTask: 'Schedule Payment', assignedTo: 'John Smith', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'demo-sys-id-4'; claim.fnolNumber = 'FNOL0000004';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 5: UNDER_REVIEW, Standard, SLA at risk, pending investigation ----
  {
    const createdDate = new Date(NOW.getTime() - 27 * DAY);
    const deathDate = new Date(NOW.getTime() - 35 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-5', claimNumber: 'CLM-000005', status: ClaimStatus.UNDER_REVIEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 20 * DAY).toISOString(), closedAt: null,
      deathEvent: { dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Pending', causeOfDeath: 'Under Investigation', deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'NY', proofOfDeathSourceType: 'Hospital Record', proofOfDeathDate: new Date(deathDate.getTime() + 4 * DAY).toISOString().split('T')[0], certifiedDOB: '1960-10-05', verificationSource: 'LexisNexis', verificationScore: 82, specialEvent: null },
      insured: { name: 'Richard Moore', ssn: maskedSSN('6745'), dateOfBirth: '1960-10-05', dateOfDeath: deathDate.toISOString().split('T')[0], age: 65 },
      claimant: { name: 'Patricia Moore', relationship: 'Spouse', contactInfo: { email: 'patricia.moore@email.com', phone: '718-555-0563' } },
      policies: [{ policyNumber: 'POL-415892', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2015-06-20', issueState: 'NY', region: 'Northeast', companyCode: 'FST', planCode: 'TL125', faceAmount: 125000, currentCashValue: 75000, loanBalance: 12500, paidToDate: new Date(deathDate.getTime() - 25 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Richard Moore' }],
      policy: { policyNumber: 'POL-415892', type: 'Term Life', status: 'In Force', issueDate: '2015-06-20', faceAmount: 125000, owner: 'Richard Moore' },
      parties: [
        { id: 'party-5-1', name: 'Richard Moore', role: 'Insured', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1960-10-05', ssn: maskedSSN('6745'), phone: '718-555-0100', email: 'richard.moore@email.com', address: '567 Broadway, Brooklyn, NY 11201', verificationStatus: 'Verified', verificationScore: 96, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-5-2', name: 'Patricia Moore', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1962-01-18', ssn: maskedSSN('2389'), phone: '718-555-0563', email: 'patricia.moore@email.com', address: '567 Broadway, Brooklyn, NY 11201', verificationStatus: 'Pending', verificationScore: 79, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-5-3', name: 'Patricia Moore', role: 'Notifier', source: 'FNOL', resState: 'NY', phone: '718-555-0563', email: 'patricia.moore@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 58, alerts: [
        { id: 'alert-5-1', severity: 'High', category: 'Investigation', title: 'Pending Cause of Death', message: 'Manner of death is still under investigation', description: 'The manner and cause of death have not been finalized. Medical examiner investigation is ongoing.', confidence: 95, recommendation: 'Await final medical examiner report before proceeding with approval', timestamp: createdDate.toISOString() },
        { id: 'alert-5-2', severity: 'Medium', category: 'Policy Loan', title: 'Outstanding Policy Loan', message: 'Policy has an outstanding loan balance of $12,500', description: 'Loan balance will be deducted from benefit amount at time of payment.', confidence: 100, recommendation: 'Deduct loan balance from net benefit calculation', timestamp: createdDate.toISOString() }
      ] },
      financial: { claimAmount: 125000, reserve: 112500, amountPaid: 0, pmiState: 'NY', pmiRate: 0.08, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 125000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 6.85, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 71, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: true, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000005', currentTask: 'Review Requirements', assignedTo: 'Jane Examiner', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'demo-sys-id-5'; claim.fnolNumber = 'FNOL0000005';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  return claims;
};

// ============================================================
// Generate remaining 15 claims with seeded PRNG
// ============================================================
const generateSeededClaim = (index, isFastTrack) => {
  const createdDate = seededDate(new Date(NOW.getTime() - 30 * DAY), new Date(NOW.getTime() - 1 * DAY));
  const insuredName = seeded() > 0.5 ? seededMaleName() : seededFemaleName();
  const claimantName = seeded() > 0.5 ? seededFemaleName() : seededMaleName();
  const policyNumber = `POL-${Math.floor(seeded() * 900000 + 100000)}`;
  const claimNumber = `CLM-${String(index).padStart(6, '0')}`;
  const claimAmount = Math.floor(seeded() * 200000 + 50000);
  const policyIssueDate = seededDate(new Date(NOW.getTime() - 10 * 365 * DAY), new Date(NOW.getTime() - 3 * 365 * DAY));
  const deathDate = seededDate(new Date(NOW.getTime() - 45 * DAY), new Date(NOW.getTime() - 3 * DAY));

  const statusOptions = isFastTrack
    ? [ClaimStatus.CLOSED, ClaimStatus.CLOSED, ClaimStatus.APPROVED, ClaimStatus.UNDER_REVIEW]
    : [ClaimStatus.NEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.APPROVED, ClaimStatus.PENDING_REQUIREMENTS];
  const status = seededPick(statusOptions);
  const isClosed = status === ClaimStatus.CLOSED;
  const closedDate = isClosed ? new Date(createdDate.getTime() + (isFastTrack ? 7 : 25) * DAY) : null;
  const daysOpen = Math.floor(((isClosed ? closedDate : NOW) - createdDate) / DAY);
  const slaDays = isFastTrack ? 10 : 30;
  const slaDate = new Date(createdDate.getTime() + slaDays * DAY);
  const daysToSla = isClosed ? Math.ceil((slaDate - closedDate) / DAY) : Math.ceil((slaDate - NOW) / DAY);
  const state = seededPick(STATES);

  const mannerOptions = ['Natural', 'Natural', 'Natural', 'Accident', 'Pending'];
  const manner = seededPick(mannerOptions);
  const causeMap = { 'Natural': 'Natural Causes', 'Accident': 'Accidental Injury', 'Pending': 'Under Investigation' };

  const pmiDays = isClosed ? Math.floor((closedDate - deathDate) / DAY) : Math.floor((NOW - deathDate) / DAY);
  const interestAmount = isClosed ? Math.floor((claimAmount * (isFastTrack ? 0.10 : 0.08) * pmiDays) / 365) : 0;

  const claim = {
    id: `claim-${index}`, claimNumber, status, type: ClaimType.DEATH,
    createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + seeded() * 24 * 3600000).toISOString(), closedAt: isClosed ? closedDate.toISOString() : null,
    deathEvent: {
      dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: manner, causeOfDeath: causeMap[manner],
      deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: state, proofOfDeathSourceType: seededPick(PROOF_TYPES),
      proofOfDeathDate: new Date(deathDate.getTime() + 3 * DAY).toISOString().split('T')[0],
      certifiedDOB: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0],
      verificationSource: 'LexisNexis', verificationScore: isFastTrack ? Math.floor(seeded() * 10 + 90) : Math.floor(seeded() * 20 + 70), specialEvent: null
    },
    insured: { name: insuredName, ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), dateOfBirth: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], dateOfDeath: deathDate.toISOString().split('T')[0], age: Math.floor(seeded() * 30 + 50) },
    claimant: { name: claimantName, relationship: 'Spouse', contactInfo: { email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}` } },
    policies: [{ policyNumber, policyType: 'Term Life', policyStatus: 'In Force', issueDate: policyIssueDate.toISOString().split('T')[0], issueState: state, region: seededPick(REGIONS), companyCode: seededPick(COMPANY_CODES), planCode: `TL${Math.floor(seeded() * 900 + 100)}`, faceAmount: claimAmount, currentCashValue: Math.floor(claimAmount * 0.6), loanBalance: seeded() > 0.8 ? Math.floor(claimAmount * 0.1) : 0, paidToDate: new Date(deathDate.getTime() - 30 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: insuredName }],
    policy: { policyNumber, type: 'Term Life', status: 'In Force', issueDate: policyIssueDate.toISOString().split('T')[0], faceAmount: claimAmount, owner: insuredName },
    parties: [
      { id: `party-${index}-1`, name: insuredName, role: 'Insured', source: 'Policy Admin', resState: state, dateOfBirth: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `${insuredName.toLowerCase().replace(' ', '.')}@email.com`, address: `${Math.floor(seeded() * 9999)} Main St, Anytown, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' },
      { id: `party-${index}-2`, name: claimantName, role: 'Primary Beneficiary', source: 'Policy Admin', resState: state, dateOfBirth: seededDate(new Date(1945, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, address: `${Math.floor(seeded() * 9999)} Oak Ave, Somewhere, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, verificationStatus: isFastTrack ? 'Verified' : 'Pending', verificationScore: isFastTrack ? 95 : 78, cslnAction: 'Search', cslnResult: isFastTrack ? 'Match' : 'Pending Review' },
      { id: `party-${index}-3`, name: claimantName, role: 'Notifier', source: 'FNOL', resState: state, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `notifier${index}@email.com`, verificationStatus: 'Verified' }
    ],
    aiInsights: { riskScore: isFastTrack ? Math.floor(seeded() * 25 + 10) : Math.floor(seeded() * 30 + 40), alerts: isFastTrack ? [] : (seeded() > 0.5 ? [{ id: `alert-${index}-1`, severity: 'Medium', category: 'Beneficiary Change', title: 'Recent Beneficiary Modification', message: 'Beneficiary was changed within 12 months of death', description: 'Policy beneficiary was updated before date of death, which may require additional review.', confidence: 75, recommendation: 'Review beneficiary change documentation and rationale', timestamp: new Date(deathDate.getTime() - 180 * DAY).toISOString() }] : []) },
    financial: { claimAmount, reserve: isClosed ? 0 : Math.floor(claimAmount * 0.9), amountPaid: isClosed ? claimAmount : 0, pmiState: state, pmiRate: isFastTrack ? 0.10 : 0.08, pmiDays, interestAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: interestAmount, federalTaxWithheld: Math.floor(interestAmount * 0.24), stateTaxWithheld: Math.floor(interestAmount * 0.0575), taxWithheld: Math.floor(interestAmount * 0.2975), percentage: 100, currency: 'USD',
      payments: isClosed ? [{ id: `payment-${index}-1`, paymentNumber: `PAY-${String(index).padStart(6, '0')}`, payeeId: `party-${index}-2`, payeeName: claimantName, payeeSSN: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), payeeAddress: `${Math.floor(seeded() * 9999)} Oak Ave, Somewhere, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, benefitAmount: claimAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, pmiCalculation: { state, rate: isFastTrack ? 10 : 8, dateOfDeath: deathDate.toISOString().split('T')[0], settlementDate: closedDate.toISOString().split('T')[0], days: pmiDays, amount: interestAmount }, taxWithholding: { federalRate: 24, stateRate: 5.75, taxableAmount: interestAmount, federalWithheld: Math.floor(interestAmount * 0.24), stateWithheld: Math.floor(interestAmount * 0.0575), totalWithheld: Math.floor(interestAmount * 0.2975) }, taxWithheld: Math.floor(interestAmount * 0.2975), netPayment: claimAmount + interestAmount - Math.floor(interestAmount * 0.2975), percentage: 100, paymentMethod: seeded() > 0.5 ? 'ACH' : 'Check', bankInfo: { accountType: 'Checking', routingNumber: '021000021', accountNumberLast4: `****${Math.floor(seeded() * 9000 + 1000)}` }, scheduledDate: closedDate.toISOString().split('T')[0], paymentDate: closedDate.toISOString().split('T')[0], status: 'Completed', glPosting: { posted: true, postingDate: new Date(closedDate.getTime() + DAY).toISOString().split('T')[0], batchNumber: `GL-${Math.floor(seeded() * 900000 + 100000)}`, accountCodes: { benefit: '5000-1000', pmi: '5000-1100', tax: '2000-3000' } }, tax1099: { generated: true, year: NOW.getFullYear(), formType: '1099-MISC', box3Amount: interestAmount } }] : [] },
    routing: isFastTrack ? { type: RoutingType.FASTTRACK, score: Math.floor(seeded() * 10 + 85), eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } } : { type: RoutingType.STANDARD, score: Math.floor(seeded() * 15 + 70), eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: seeded() > 0.4, noContestability: true, claimAmountThreshold: true, noAnomalies: seeded() > 0.3 } },
    workflow: { fsoCase: `FSO-${claimNumber}`, currentTask: isClosed ? null : 'Review Requirements', assignedTo: isClosed ? null : seededPick(['John Smith', 'Sarah Johnson', 'Jane Examiner']), daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: !isClosed && daysToSla < 3 } }
  };
  claim.sysId = `demo-sys-id-${index}`; claim.fnolNumber = `FNOL${String(index).padStart(7, '0')}`;
  claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
  return claim;
};

export const generateDemoClaims = () => {
  const showcaseClaims = createShowcaseClaims();
  const seededClaims = [];
  const fastTrackIndices = [6, 8, 11, 14, 17, 19];
  for (let i = 6; i <= 20; i++) {
    seededClaims.push(generateSeededClaim(i, fastTrackIndices.includes(i)));
  }
  return [...showcaseClaims, ...seededClaims];
};

export const generateDemoPolicies = (claims) => {
  return claims.map(claim => ({
    id: claim.policy.policyNumber, policyNumber: claim.policy.policyNumber, status: claim.policy.status, type: claim.policy.type, issueDate: claim.policy.issueDate, faceAmount: claim.policy.faceAmount, owner: claim.policy.owner, insured: claim.insured.name,
    beneficiaries: claim.parties.filter(p => p.role === 'Primary Beneficiary' || p.role === 'Contingent Beneficiary').map(p => ({ name: p.name, relationship: p.role === 'Primary Beneficiary' ? claim.claimant.relationship : 'Child', percentage: p.role === 'Primary Beneficiary' ? 50 : 25, type: p.role === 'Primary Beneficiary' ? 'Primary' : 'Contingent' })),
    premiumAmount: Math.floor(claim.policy.faceAmount * 0.001), premiumFrequency: 'Annual'
  }));
};

export const generateDemoFSOCases = (claims) => {
  return claims.map(claim => ({
    id: claim.workflow.fsoCase, claimId: claim.id, claimNumber: claim.claimNumber, status: claim.status === ClaimStatus.CLOSED ? 'Closed' : 'Open', priority: claim.routing?.type === RoutingType.FASTTRACK ? 'High' : 'Normal', currentTask: claim.workflow.currentTask, assignedTo: claim.workflow.assignedTo, sla: claim.workflow.sla, playbook: claim.routing?.type === RoutingType.FASTTRACK ? 'FastTrack Death Claim' : 'Standard Death Claim', createdAt: claim.createdAt, updatedAt: claim.updatedAt
  }));
};

let cachedDemoData = null;

export const getDemoData = () => {
  if (!cachedDemoData) {
    const demoClaims = generateDemoClaims();
    cachedDemoData = { claims: demoClaims, policies: generateDemoPolicies(demoClaims), fsoCases: generateDemoFSOCases(demoClaims) };
  }
  return cachedDemoData;
};

const demoDataInstance = getDemoData();
export default demoDataInstance;
