/**
 * Demo Data Generator
 *
 * Generates deterministic sample claims with full orchestration metadata:
 * - Uses seeded PRNG for reproducible data across page loads
 * - 5 hand-crafted showcase claims + 15 seeded claims
 * - STP routing (40% of claims)
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
  const isSTP = claim.routing?.type === RoutingType.STP;

  // CLAIM LEVEL
  requirements.push({
    id: `${claim.id}-req-1`, level: 'claim', type: RequirementType.DEATH_CERTIFICATE,
    name: 'Certified Death Certificate', description: 'Official death certificate from state vital records',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 2 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-1`, name: 'death_certificate.pdf' }] : [],
    metadata: { confidenceScore: isSTP ? 0.96 : null, idpClassification: isSTP ? 'death_certificate' : null }
  });

  requirements.push({
    id: `${claim.id}-req-2`, level: 'claim', type: RequirementType.CLAIMANT_STATEMENT,
    name: 'Claimant Statement of Claim', description: 'Signed statement of claim form',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isSTP
      ? [{ id: `doc-${claim.id}-2`, name: 'claimant_statement.pdf' }]
      : [{ id: `doc-${claim.id}-2`, name: 'claimant_statement_draft.pdf' }],
    metadata: { confidenceScore: isSTP ? 0.93 : 0.78, reason: isSTP ? null : 'Signature verification in progress' }
  });

  requirements.push({
    id: `${claim.id}-req-3`, level: 'claim', type: RequirementType.PROOF_OF_IDENTITY,
    name: 'Government-Issued Photo ID', description: "Driver's license, passport, or state ID",
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-3`, name: 'drivers_license.pdf' }] : [],
    metadata: isSTP ? { confidenceScore: 0.95 } : {}
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
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-7`, name: 'beneficiary_ssn_card.pdf' }] : [],
    metadata: { confidenceScore: isSTP ? 0.97 : 0.82, partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name }
  });

  requirements.push({
    id: `${claim.id}-req-8`, level: 'party', type: 'TAX_FORM',
    name: 'IRS Form W-9', description: 'W-9 form for tax reporting and 1099 generation',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 10 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 3 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-8`, name: 'w9_form.pdf' }] : [],
    metadata: { partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name }
  });

  requirements.push({
    id: `${claim.id}-req-9`, level: 'party', type: 'PAYMENT_ELECTION',
    name: 'Payment Election Form', description: 'ACH direct deposit or check payment selection',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 10 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 2 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-9`, name: 'payment_election.pdf' }] : [],
    metadata: { partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name, paymentMethod: isSTP ? 'ACH' : 'Not selected' }
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
  if (claim.routing?.type === RoutingType.STP) {
    events.push({ id: `${claim.id}-event-4`, timestamp: new Date(new Date(claim.createdAt).getTime() + 15 * 60000).toISOString(), type: 'routing.stp', source: 'fso', user: { name: 'Routing Engine', role: 'system' }, description: 'Claim routed to STP processing', metadata: { score: claim.routing.score, eligible: true } });
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
const NOW = new Date();
const DAY = 86400000;

// ============================================================
// 5 Hand-crafted showcase claims
// ============================================================
const createShowcaseClaims = () => {
  const claims = [];

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

  // ---- CLAIM 2: STP, CLOSED, clean claim ----
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
      routing: { type: RoutingType.STP, score: 92, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } },
      workflow: { fsoCase: 'FSO-CLM-000002', currentTask: null, assignedTo: null, daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: Math.ceil((slaDate - closedDate) / DAY), atRisk: false } }
    };
    claim.sysId = 'demo-sys-id-2'; claim.fnolNumber = 'FNOL0000002';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 3: NEW, STP eligible, just submitted ----
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
      routing: { type: RoutingType.STP, score: 91, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } },
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

  // ---- CLAIM 6: Sam Wright (Option 1 Policy Holder) - NEW, STP eligible ----
  {
    const createdDate = new Date(NOW.getTime() - 5 * DAY);
    const deathDate = new Date(NOW.getTime() - 10 * DAY);
    const slaDate = new Date(createdDate.getTime() + 10 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-sw', claimNumber: 'CLM-000021', status: ClaimStatus.NEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: createdDate.toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Cardiac Arrest',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'CA', proofOfDeathSourceType: 'Death Certificate',
        proofOfDeathDate: new Date(deathDate.getTime() + 2 * DAY).toISOString().split('T')[0],
        certifiedDOB: '1968-03-14', verificationSource: 'LexisNexis', verificationScore: 96, specialEvent: null
      },
      insured: { name: 'Sam Wright', ssn: maskedSSN('3892'), dateOfBirth: '1968-03-14', dateOfDeath: deathDate.toISOString().split('T')[0], age: 56 },
      claimant: { name: 'Jennifer Wright', relationship: 'Spouse', contactInfo: { email: 'jennifer.wright@email.com', phone: '415-555-0273' } },
      policies: [{ policyNumber: 'POL-290471', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2019-07-15', issueState: 'CA', region: 'West', companyCode: 'BLM', planCode: 'TL250', faceAmount: 250000, currentCashValue: 150000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 15 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Sam Wright' }],
      policy: { policyNumber: 'POL-290471', type: 'Term Life', policyType: 'Term Life', status: 'In Force', policyStatus: 'In Force', issueDate: '2019-07-15', issueState: 'CA', faceAmount: 250000, owner: 'Sam Wright', region: 'West', companyCode: 'BLM', planCode: 'TL250', paidToDate: new Date(deathDate.getTime() - 15 * DAY).toISOString().split('T')[0], source: 'Policy Admin', currentCashValue: 150000, loanBalance: 0 },
      parties: [
        { id: 'party-sw-1', name: 'Sam Wright', role: 'Insured', source: 'Policy Admin', resState: 'CA', dateOfBirth: '1968-03-14', ssn: maskedSSN('3892'), phone: '415-555-0100', email: 'sam.wright@email.com', address: '2847 Sunset Blvd, Los Angeles, CA 90028', verificationStatus: 'Verified', verificationScore: 97, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-sw-2', name: 'Jennifer Wright', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'CA', dateOfBirth: '1970-08-22', ssn: maskedSSN('5641'), phone: '415-555-0273', email: 'jennifer.wright@email.com', address: '2847 Sunset Blvd, Los Angeles, CA 90028', verificationStatus: 'Verified', verificationScore: 95, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-sw-3', name: 'Jennifer Wright', role: 'Notifier', source: 'FNOL', resState: 'CA', phone: '415-555-0273', email: 'jennifer.wright@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 18, alerts: [] },
      financial: { claimAmount: 250000, reserve: 225000, amountPaid: 0, pmiState: 'CA', pmiRate: 0.10, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 250000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 9.3, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STP, score: 93, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } },
      workflow: { fsoCase: 'FSO-CLM-000021', currentTask: 'Review Requirements', assignedTo: 'Sarah Johnson', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: false } }
    };
    claim.sysId = 'demo-sys-id-sw'; claim.fnolNumber = 'FNOL0000021';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 7: Aiden Hakim (Option 2 Policy Holder) - UNDER_REVIEW, Standard ----
  {
    const createdDate = new Date(NOW.getTime() - 12 * DAY);
    const deathDate = new Date(NOW.getTime() - 18 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-ah', claimNumber: 'CLM-000022', status: ClaimStatus.UNDER_REVIEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 3 * DAY).toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Hypertensive Heart Disease',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'NY', proofOfDeathSourceType: 'Hospital Record',
        proofOfDeathDate: new Date(deathDate.getTime() + 3 * DAY).toISOString().split('T')[0],
        certifiedDOB: '1972-05-18', verificationSource: 'LexisNexis', verificationScore: 88, specialEvent: null
      },
      insured: { name: 'Aiden Hakim', ssn: maskedSSN('7614'), dateOfBirth: '1972-05-18', dateOfDeath: deathDate.toISOString().split('T')[0], age: 53 },
      claimant: { name: 'Layla Hakim', relationship: 'Spouse', contactInfo: { email: 'layla.hakim@email.com', phone: '646-555-0438' } },
      policies: [{ policyNumber: 'POL-382156', policyType: 'Whole Life', policyStatus: 'In Force', issueDate: '2017-11-01', issueState: 'NY', region: 'Northeast', companyCode: 'NWL', planCode: 'WL350', faceAmount: 350000, currentCashValue: 82000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 20 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Aiden Hakim' }],
      policy: { policyNumber: 'POL-382156', type: 'Whole Life', policyType: 'Whole Life', status: 'In Force', policyStatus: 'In Force', issueDate: '2017-11-01', issueState: 'NY', faceAmount: 350000, owner: 'Aiden Hakim', region: 'Northeast', companyCode: 'NWL', planCode: 'WL350', paidToDate: new Date(deathDate.getTime() - 20 * DAY).toISOString().split('T')[0], source: 'Policy Admin', currentCashValue: 82000, loanBalance: 0 },
      parties: [
        { id: 'party-ah-1', name: 'Aiden Hakim', role: 'Insured', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1972-05-18', ssn: maskedSSN('7614'), phone: '646-555-0200', email: 'aiden.hakim@email.com', address: '415 West 45th Street, New York, NY 10036', verificationStatus: 'Verified', verificationScore: 96, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-ah-2', name: 'Layla Hakim', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1974-11-30', ssn: maskedSSN('4127'), phone: '646-555-0438', email: 'layla.hakim@email.com', address: '415 West 45th Street, New York, NY 10036', verificationStatus: 'Pending', verificationScore: 81, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-ah-3', name: 'Layla Hakim', role: 'Notifier', source: 'FNOL', resState: 'NY', phone: '646-555-0438', email: 'layla.hakim@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 46, alerts: [
        { id: 'alert-ah-1', severity: 'Medium', category: 'Address Discrepancy', title: 'Claimant Address Mismatch', message: 'Claimant address differs from policy records', description: 'Beneficiary address submitted in FNOL does not match the address on file in the Policy Admin system. Identity verification is recommended before proceeding with payment.', confidence: 78, recommendation: 'Request updated address confirmation and government-issued photo ID', timestamp: new Date(createdDate.getTime() + 1 * DAY).toISOString() }
      ] },
      financial: { claimAmount: 350000, reserve: 315000, amountPaid: 0, pmiState: 'NY', pmiRate: 0.08, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 350000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 6.85, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 68, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: true, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000022', currentTask: 'Review Requirements', assignedTo: 'Sarah Johnson', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'demo-sys-id-ah'; claim.fnolNumber = 'FNOL0000022';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 8: Ethan Carter (CLM-000147) - UNDER_REVIEW, Complex Estate w/ Trust/Corp Beneficiaries ----
  {
    const createdDate = new Date(NOW.getTime() - 30 * DAY);
    const deathDate   = new Date('2026-01-15');
    const slaDate     = new Date(createdDate.getTime() + 45 * DAY);
    const daysOpen    = Math.floor((NOW - createdDate) / DAY);
    const daysToSla   = Math.ceil((slaDate - NOW) / DAY);
    const pmiDays     = Math.floor((NOW - deathDate) / DAY);
    const fmtDate = (d) => new Date(NOW.getTime() + d * DAY).toISOString().split('T')[0];
    const pastDate = (d) => new Date(NOW.getTime() - d * DAY).toISOString().split('T')[0];

    const claim = {
      id: 'claim-ec', claimNumber: 'CLM-000147', status: ClaimStatus.UNDER_REVIEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 5 * DAY).toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: '2026-01-15', mannerOfDeath: 'Natural', causeOfDeath: 'Myocardial Infarction',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'TX', proofOfDeathSourceType: 'Death Certificate',
        proofOfDeathDate: '2026-01-18', certifiedDOB: '1967-04-22', verificationSource: 'EDRS',
        verificationScore: 99, specialEvent: null
      },
      insured: { name: 'Ethan Carter', ssn: maskedSSN('8812'), dateOfBirth: '1967-04-22', dateOfDeath: '2026-01-15', age: 58 },
      claimant: { name: 'Isabella Hughes', relationship: 'Sibling', contactInfo: { email: 'isabella.hughes@email.com', phone: '512-555-0192' } },
      policies: [{ policyNumber: 'POL-571390', policyType: 'Universal Life', policyStatus: 'In Force', issueDate: '2012-03-01', issueState: 'TX', region: 'South', companyCode: 'BLM', planCode: 'UL500', faceAmount: 500000, currentCashValue: 184200, loanBalance: 0, paidToDate: '2026-01-01', source: 'Policy Admin', owner: 'Ethan Carter' }],
      policy: { policyNumber: 'POL-571390', type: 'Universal Life', policyType: 'Universal Life', status: 'In Force', policyStatus: 'In Force', issueDate: '2012-03-01', issueState: 'TX', faceAmount: 500000, owner: 'Ethan Carter', region: 'South', companyCode: 'BLM', planCode: 'UL500', paidToDate: '2026-01-01', source: 'Policy Admin', currentCashValue: 184200, loanBalance: 0 },
      parties: [
        { id: 'party-ec-1', name: 'Ethan Carter', role: 'Insured', source: 'Policy Admin', resState: 'TX', dateOfBirth: '1967-04-22', ssn: maskedSSN('8812'), phone: '512-555-0100', email: 'ethan.carter@email.com', address: '3801 Ranch Road, Austin, TX 78704', verificationStatus: 'Verified', verificationScore: 99, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-ec-2', name: 'Isabella Hughes', role: 'Primary Beneficiary', partyType: 'individual', allocation: 40, source: 'Policy Admin', resState: 'TX', dateOfBirth: '1969-05-14', ssn: maskedSSN('4721'), phone: '512-555-0192', email: 'isabella.hughes@email.com', address: '4521 Oak Creek Drive, Austin, TX 78745', verificationStatus: 'In Review', verificationScore: 82, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-ec-3', name: 'Carter Family Irrevocable Trust', role: 'Primary Beneficiary', partyType: 'trust', allocation: 35, authorizedSigner: 'Benjamin Clark (Trustee)', source: 'Policy Admin', phone: '512-555-0380', email: 'b.clark@cartertrustee.com', address: '200 Congress Ave Suite 400, Austin, TX 78701', verificationStatus: 'Pending', verificationScore: null },
        { id: 'party-ec-4', name: 'Estate of Ethan Carter', role: 'Contingent Beneficiary', partyType: 'estate', allocation: 15, authorizedSigner: 'Mia Robinson (Administrator)', source: 'Policy Admin', phone: '512-555-0455', email: 'm.robinson@austinlegal.com', address: '1011 San Jacinto Blvd, Austin, TX 78701', verificationStatus: 'Pending', verificationScore: null },
        { id: 'party-ec-5', name: 'Carter & Sons Construction LLC', role: 'Contingent Beneficiary', partyType: 'corporate', allocation: 10, authorizedSigner: 'Lucas Wright (CEO)', source: 'Policy Admin', phone: '512-555-0711', email: 'lucas.wright@carterconst.com', address: '8900 E Ben White Blvd, Austin, TX 78741', verificationStatus: 'Pending', verificationScore: null },
        { id: 'party-ec-6', name: 'Dr. Emily Foster', role: 'Attending Physician', partyType: 'provider', source: 'FNOL', phone: '512-555-0892', email: 'efoster@austinmedical.com', address: '1301 W 38th St, Austin, TX 78705', verificationStatus: 'Verified', verificationScore: 97 },
        { id: 'party-ec-7', name: 'Isabella Hughes', role: 'Notifier', source: 'FNOL', resState: 'TX', phone: '512-555-0192', email: 'isabella.hughes@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 52, alerts: [
        { id: 'alert-ec-1', severity: 'Medium', category: 'Complex Estate', title: 'Trust & Estate Beneficiaries', message: 'Claim involves trust, estate, and corporate beneficiaries requiring entity documentation', description: 'Multiple non-individual beneficiaries require additional documentation: Trust Agreement, Letters Testamentary, and Corporate Resolution.', confidence: 95, recommendation: 'Request all entity documentation packages concurrently to avoid delays', timestamp: createdDate.toISOString() },
        { id: 'alert-ec-2', severity: 'Medium', category: 'Document', title: 'APS Resubmission Required', message: 'Attending physician statement returned NIGO due to illegible scan', description: 'APS from Dr. Emily Foster was returned as NIGO — resubmit at 300 dpi minimum.', confidence: 100, recommendation: 'Contact Dr. Foster office to resubmit at required resolution', timestamp: new Date(createdDate.getTime() + 10 * DAY).toISOString() }
      ] },
      financial: { claimAmount: 500000, reserve: 450000, amountPaid: 0, pmiState: 'TX', pmiRate: 0.08, pmiDays, interestAmount: 0, netBenefitProceeds: 500000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 0, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 48, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: false, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000147', currentTask: 'Gather Entity Documentation', assignedTo: 'Sarah Johnson', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 5 } }
    };

    claim.sysId = 'demo-sys-id-ec'; claim.fnolNumber = 'FNOL0000147';
    claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);

    // Pre-generated 39 requirements — complex estate with trust, estate entity & corp beneficiaries
    claim.requirements = [
      // ─── Claim Level (System Auto-Verified) ───
      { id: 'ec-r01', level: 'claim', name: 'EDRS Death Verification', description: 'Electronic Death Registration System auto-lookup — confirmed via Texas EDRS registry', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(28), dueDate: fmtDate(-25), documents: [{ id: 'ec-d01', name: 'death_cert_edrs.pdf' }], metadata: { confidenceScore: 0.99, verificationSource: 'Texas EDRS' } },
      { id: 'ec-r02', level: 'claim', name: 'OFAC / Sanctions Screening', description: 'All parties screened against OFAC SDN list and state sanctions databases — no matches', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(29), dueDate: fmtDate(-26), documents: [], metadata: { confidenceScore: 1.0, verificationSource: 'OFAC API' } },
      // ─── Policy Level (Auto-Verified) ───
      { id: 'ec-r03', level: 'policy', name: 'Policy In-Force Verification', description: 'Universal Life $500K confirmed in force at date of death — no lapse or surrender', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(29), dueDate: fmtDate(-26), documents: [{ id: 'ec-d03', name: 'policy_admin_extract.pdf' }], metadata: { confidenceScore: 0.99, verificationSource: 'Policy Admin System' } },
      { id: 'ec-r04', level: 'policy', name: 'Contestability Period Check', description: 'Policy issued 2012-03-01 — past the 2-year contestability window. No further investigation required.', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(29), dueDate: fmtDate(-26), documents: [], metadata: { confidenceScore: 0.99 } },
      { id: 'ec-r05', level: 'policy', name: 'Beneficiary Designation on File', description: 'All 4 named beneficiaries confirmed with correct allocation percentages (40/35/15/10)', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(28), dueDate: fmtDate(-25), documents: [], metadata: { confidenceScore: 0.98, verificationSource: 'Bene Designation Extract' } },
      { id: 'ec-r06', level: 'policy', name: 'Universal Life Coverage Confirmation', description: 'Face amount $500,000 — current cash value $184,200 — no outstanding loans', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(28), dueDate: fmtDate(-25), documents: [], metadata: { confidenceScore: 0.99 } },
      // ─── Isabella Hughes — Primary Beneficiary (Individual, 40%) ───
      { id: 'ec-r07', level: 'party', partyId: 'party-ec-2', name: 'Claimant Statement of Claim', description: 'Signed Form BLM-1042 — IDP confidence 78%, signature verification in progress on page 3', status: 'in_review', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(4), documents: [{ id: 'ec-d07', name: 'claimant_statement_draft.pdf' }], metadata: { confidenceScore: 0.78, reason: 'Signature verification in progress — IDP flagged signature area on page 3' } },
      { id: 'ec-r08', level: 'party', partyId: 'party-ec-2', name: 'Certified Death Certificate', description: 'Certified copy from Texas vital records — submitted by claimant and cross-matched with EDRS', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(20), dueDate: fmtDate(-17), documents: [{ id: 'ec-d08', name: 'death_cert_certified.pdf' }], metadata: { confidenceScore: 0.97 } },
      { id: 'ec-r09', level: 'party', partyId: 'party-ec-2', name: 'Government-Issued Photo ID', description: "Driver's license — IDP confidence 82%, name and DOB match in progress", status: 'in_review', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(4), documents: [{ id: 'ec-d09', name: 'drivers_license_ih.pdf' }], metadata: { confidenceScore: 0.82 } },
      { id: 'ec-r10', level: 'party', partyId: 'party-ec-2', name: 'IRS Form W-9', description: 'W-9 required for 1099-INT reporting on PMI interest earned during processing', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(7), documents: [], metadata: {} },
      { id: 'ec-r11', level: 'party', partyId: 'party-ec-2', name: 'Payment Election Form', description: 'ACH direct deposit or check — lump sum or settlement option selection required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(7), documents: [], metadata: { paymentMethod: 'Not selected' } },
      { id: 'ec-r12', level: 'party', partyId: 'party-ec-2', name: 'Proof of Relationship Verification', description: 'Relationship to insured confirmed from policy records and FNOL attestation', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(25), dueDate: fmtDate(-22), documents: [], metadata: { confidenceScore: 0.95 } },
      { id: 'ec-r13', level: 'party', partyId: 'party-ec-2', name: 'OFAC Individual Screening', description: 'Individual SDN and state sanctions search — no matches found', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(29), dueDate: fmtDate(-26), documents: [], metadata: { confidenceScore: 1.0 } },
      { id: 'ec-r14', level: 'party', partyId: 'party-ec-2', name: 'Identity Verification (SSN Match)', description: '3-point match: name, DOB, address — confirmed via LexisNexis', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(28), dueDate: fmtDate(-25), documents: [], metadata: { confidenceScore: 0.94 } },
      // ─── Carter Family Irrevocable Trust — Primary Beneficiary (Trust, 35%) ───
      { id: 'ec-r15', level: 'party', partyId: 'party-ec-3', name: 'Trust Agreement', description: 'Full trust agreement document — all pages, amendments, and schedules required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r16', level: 'party', partyId: 'party-ec-3', name: 'Certificate of Trust Existence', description: 'Abbreviated certificate confirming trust existence, trustee authority, and tax ID', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r17', level: 'party', partyId: 'party-ec-3', name: 'Letters of Authority / Trustee Resolution', description: 'Trustee resolution authorizing claim payment — returned for re-execution (notarization missing)', status: 'nigo', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(3), documents: [{ id: 'ec-d17', name: 'trustee_resolution_draft.pdf' }], metadata: { confidenceScore: 0.31, reason: '❌ NIGO: Document was not properly executed — notarization missing. Returned to trustee for re-execution.' } },
      { id: 'ec-r18', level: 'party', partyId: 'party-ec-3', name: 'Trust Tax ID (EIN)', description: 'IRS-issued EIN for the trust — required for 1099 and payment processing', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r19', level: 'party', partyId: 'party-ec-3', name: 'Trustee Government-Issued ID', description: "Benjamin Clark's driver's license or passport — identity verification for authorized signer", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r20', level: 'party', partyId: 'party-ec-3', name: 'Trustee IRS Form W-9', description: 'W-9 in name of trust with trust EIN — required for tax reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r21', level: 'party', partyId: 'party-ec-3', name: 'Payment Election Form (Trust)', description: 'Wire transfer or check in name of trust — bank letter on trust letterhead required for ACH', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: { paymentMethod: 'Not selected' } },
      { id: 'ec-r22', level: 'party', partyId: 'party-ec-3', name: 'SOS Entity Verification', description: 'Texas Secretary of State confirmation — trust registration and good standing', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(14), documents: [], metadata: {} },
      // ─── Estate of Ethan Carter — Contingent Beneficiary (Estate, 15%) ───
      { id: 'ec-r23', level: 'party', partyId: 'party-ec-4', name: 'Letters Testamentary / Letters of Administration', description: 'Court-issued authorization for estate administrator Mia Robinson — certified copy required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: 'ec-r24', level: 'party', partyId: 'party-ec-4', name: 'Small Estate Affidavit Eligibility Check', description: 'Checking if estate qualifies for small estate affidavit (TX threshold $75K) — benefit share is $75K (15% of $500K)', status: 'in_review', isMandatory: false, pri: 'conditional', dueDate: fmtDate(5), documents: [], metadata: { reason: '⏳ Reviewing eligibility: benefit share $75,000 is at TX small estate threshold. Legal review in progress.' } },
      { id: 'ec-r25', level: 'party', partyId: 'party-ec-4', name: 'Estate EIN from IRS', description: 'Employer Identification Number for estate — required for payment and tax reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: 'ec-r26', level: 'party', partyId: 'party-ec-4', name: 'Administrator Government-Issued ID', description: "Mia Robinson's driver's license or passport — identity verification for authorized administrator", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: 'ec-r27', level: 'party', partyId: 'party-ec-4', name: 'Administrator IRS Form W-9', description: 'W-9 in name of estate with estate EIN — required for 1099 reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(16), documents: [], metadata: {} },
      { id: 'ec-r28', level: 'party', partyId: 'party-ec-4', name: 'Payment Election Form (Estate)', description: 'Wire or check in name of estate — court authorization may be required for wire transfer', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(18), documents: [], metadata: { paymentMethod: 'Not selected' } },
      { id: 'ec-r29', level: 'party', partyId: 'party-ec-4', name: 'Surety Bond Verification', description: 'Confirm administrator has filed required surety bond with probate court (if applicable)', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(14), documents: [], metadata: {} },
      // ─── Carter & Sons Construction LLC — Contingent Beneficiary (Corporate, 10%) ───
      { id: 'ec-r30', level: 'party', partyId: 'party-ec-5', name: 'Corporate Resolution', description: 'Board resolution authorizing receipt of life insurance proceeds — signed by all officers', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r31', level: 'party', partyId: 'party-ec-5', name: 'Articles of Incorporation', description: 'Certificate of formation or articles of organization — from Texas SOS filing records', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r32', level: 'party', partyId: 'party-ec-5', name: 'SOS Business Entity Verification', description: 'Texas Secretary of State — entity active, good standing, not dissolved or forfeited', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r33', level: 'party', partyId: 'party-ec-5', name: 'Certificate of Good Standing', description: 'Texas Comptroller certificate — current franchise tax status and good standing', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: 'ec-r34', level: 'party', partyId: 'party-ec-5', name: 'Authorized Signatory Government ID', description: "Lucas Wright (CEO) driver's license — identity verification for corporate authorized signer", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r35', level: 'party', partyId: 'party-ec-5', name: 'Corporate W-9 (EIN)', description: 'W-9 in corporate name with business EIN — required for 1099-MISC reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r36', level: 'party', partyId: 'party-ec-5', name: 'Payment Election Form (Corporate)', description: 'Wire transfer preferred — corporate banking letter with authorized officer signature required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: { paymentMethod: 'Not selected' } },
      // ─── Dr. Emily Foster — Attending Physician ───
      { id: 'ec-r37', level: 'party', partyId: 'party-ec-6', name: 'Attending Physician Statement (APS)', description: 'APS from Dr. Emily Foster required — myocardial infarction confirmation for UL policy review', status: 'nigo', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(2), documents: [{ id: 'ec-d37', name: 'aps_form_scan.pdf' }], metadata: { confidenceScore: 0.41, reason: '❌ NIGO: Document quality insufficient — illegible scan. Please resubmit at 300 dpi minimum.' } },
      { id: 'ec-r38', level: 'party', partyId: 'party-ec-6', name: 'Medical Records Authorization (HIPAA)', description: 'Signed HIPAA release from authorized estate representative for complete medical records', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r39', level: 'party', partyId: 'party-ec-6', name: 'NPI Verification', description: "Dr. Foster's National Provider Identifier verified against NPI registry — confirmed active", status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(25), dueDate: fmtDate(-22), documents: [], metadata: { confidenceScore: 1.0, verificationSource: 'NPI Registry' } },
    ];

    claims.push(claim);
  }

  return claims;
};

// ============================================================
// Generate remaining 15 claims with seeded PRNG
// ============================================================
const generateSeededClaim = (index, isSTP) => {
  const createdDate = seededDate(new Date(NOW.getTime() - 30 * DAY), new Date(NOW.getTime() - 1 * DAY));
  const insuredName = seeded() > 0.5 ? seededMaleName() : seededFemaleName();
  const claimantName = seeded() > 0.5 ? seededFemaleName() : seededMaleName();
  const policyNumber = `POL-${Math.floor(seeded() * 900000 + 100000)}`;
  const claimNumber = `CLM-${String(index).padStart(6, '0')}`;
  const claimAmount = Math.floor(seeded() * 200000 + 50000);
  const policyIssueDate = seededDate(new Date(NOW.getTime() - 10 * 365 * DAY), new Date(NOW.getTime() - 3 * 365 * DAY));
  const deathDate = seededDate(new Date(NOW.getTime() - 45 * DAY), new Date(NOW.getTime() - 3 * DAY));

  const statusOptions = isSTP
    ? [ClaimStatus.CLOSED, ClaimStatus.CLOSED, ClaimStatus.APPROVED, ClaimStatus.UNDER_REVIEW]
    : [ClaimStatus.NEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.APPROVED, ClaimStatus.PENDING_REQUIREMENTS];
  const status = seededPick(statusOptions);
  const isClosed = status === ClaimStatus.CLOSED;
  const closedDate = isClosed ? new Date(createdDate.getTime() + (isSTP ? 7 : 25) * DAY) : null;
  const daysOpen = Math.floor(((isClosed ? closedDate : NOW) - createdDate) / DAY);
  const slaDays = isSTP ? 10 : 30;
  const slaDate = new Date(createdDate.getTime() + slaDays * DAY);
  const daysToSla = isClosed ? Math.ceil((slaDate - closedDate) / DAY) : Math.ceil((slaDate - NOW) / DAY);
  const state = seededPick(STATES);

  const mannerOptions = ['Natural', 'Natural', 'Natural', 'Accident', 'Pending'];
  const manner = seededPick(mannerOptions);
  const causeMap = { 'Natural': 'Natural Causes', 'Accident': 'Accidental Injury', 'Pending': 'Under Investigation' };

  const pmiDays = isClosed ? Math.floor((closedDate - deathDate) / DAY) : Math.floor((NOW - deathDate) / DAY);
  const interestAmount = isClosed ? Math.floor((claimAmount * (isSTP ? 0.10 : 0.08) * pmiDays) / 365) : 0;

  const claim = {
    id: `claim-${index}`, claimNumber, status, type: ClaimType.DEATH,
    createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + seeded() * 24 * 3600000).toISOString(), closedAt: isClosed ? closedDate.toISOString() : null,
    deathEvent: {
      dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: manner, causeOfDeath: causeMap[manner],
      deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: state, proofOfDeathSourceType: seededPick(PROOF_TYPES),
      proofOfDeathDate: new Date(deathDate.getTime() + 3 * DAY).toISOString().split('T')[0],
      certifiedDOB: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0],
      verificationSource: 'LexisNexis', verificationScore: isSTP ? Math.floor(seeded() * 10 + 90) : Math.floor(seeded() * 20 + 70), specialEvent: null
    },
    insured: { name: insuredName, ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), dateOfBirth: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], dateOfDeath: deathDate.toISOString().split('T')[0], age: Math.floor(seeded() * 30 + 50) },
    claimant: { name: claimantName, relationship: 'Spouse', contactInfo: { email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}` } },
    policies: [{ policyNumber, policyType: 'Term Life', policyStatus: 'In Force', issueDate: policyIssueDate.toISOString().split('T')[0], issueState: state, region: seededPick(REGIONS), companyCode: seededPick(COMPANY_CODES), planCode: `TL${Math.floor(seeded() * 900 + 100)}`, faceAmount: claimAmount, currentCashValue: Math.floor(claimAmount * 0.6), loanBalance: seeded() > 0.8 ? Math.floor(claimAmount * 0.1) : 0, paidToDate: new Date(deathDate.getTime() - 30 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: insuredName }],
    policy: { policyNumber, type: 'Term Life', status: 'In Force', issueDate: policyIssueDate.toISOString().split('T')[0], faceAmount: claimAmount, owner: insuredName },
    parties: [
      { id: `party-${index}-1`, name: insuredName, role: 'Insured', source: 'Policy Admin', resState: state, dateOfBirth: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `${insuredName.toLowerCase().replace(' ', '.')}@email.com`, address: `${Math.floor(seeded() * 9999)} Main St, Anytown, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' },
      { id: `party-${index}-2`, name: claimantName, role: 'Primary Beneficiary', source: 'Policy Admin', resState: state, dateOfBirth: seededDate(new Date(1945, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, address: `${Math.floor(seeded() * 9999)} Oak Ave, Somewhere, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, verificationStatus: isSTP ? 'Verified' : 'Pending', verificationScore: isSTP ? 95 : 78, cslnAction: 'Search', cslnResult: isSTP ? 'Match' : 'Pending Review' },
      { id: `party-${index}-3`, name: claimantName, role: 'Notifier', source: 'FNOL', resState: state, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `notifier${index}@email.com`, verificationStatus: 'Verified' }
    ],
    aiInsights: { riskScore: isSTP ? Math.floor(seeded() * 25 + 10) : Math.floor(seeded() * 30 + 40), alerts: isSTP ? [] : (seeded() > 0.5 ? [{ id: `alert-${index}-1`, severity: 'Medium', category: 'Beneficiary Change', title: 'Recent Beneficiary Modification', message: 'Beneficiary was changed within 12 months of death', description: 'Policy beneficiary was updated before date of death, which may require additional review.', confidence: 75, recommendation: 'Review beneficiary change documentation and rationale', timestamp: new Date(deathDate.getTime() - 180 * DAY).toISOString() }] : []) },
    financial: { claimAmount, reserve: isClosed ? 0 : Math.floor(claimAmount * 0.9), amountPaid: isClosed ? claimAmount : 0, pmiState: state, pmiRate: isSTP ? 0.10 : 0.08, pmiDays, interestAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: interestAmount, federalTaxWithheld: Math.floor(interestAmount * 0.24), stateTaxWithheld: Math.floor(interestAmount * 0.0575), taxWithheld: Math.floor(interestAmount * 0.2975), percentage: 100, currency: 'USD',
      payments: isClosed ? [{ id: `payment-${index}-1`, paymentNumber: `PAY-${String(index).padStart(6, '0')}`, payeeId: `party-${index}-2`, payeeName: claimantName, payeeSSN: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), payeeAddress: `${Math.floor(seeded() * 9999)} Oak Ave, Somewhere, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, benefitAmount: claimAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, pmiCalculation: { state, rate: isSTP ? 10 : 8, dateOfDeath: deathDate.toISOString().split('T')[0], settlementDate: closedDate.toISOString().split('T')[0], days: pmiDays, amount: interestAmount }, taxWithholding: { federalRate: 24, stateRate: 5.75, taxableAmount: interestAmount, federalWithheld: Math.floor(interestAmount * 0.24), stateWithheld: Math.floor(interestAmount * 0.0575), totalWithheld: Math.floor(interestAmount * 0.2975) }, taxWithheld: Math.floor(interestAmount * 0.2975), netPayment: claimAmount + interestAmount - Math.floor(interestAmount * 0.2975), percentage: 100, paymentMethod: seeded() > 0.5 ? 'ACH' : 'Check', bankInfo: { accountType: 'Checking', routingNumber: '021000021', accountNumberLast4: `****${Math.floor(seeded() * 9000 + 1000)}` }, scheduledDate: closedDate.toISOString().split('T')[0], paymentDate: closedDate.toISOString().split('T')[0], status: 'Completed', glPosting: { posted: true, postingDate: new Date(closedDate.getTime() + DAY).toISOString().split('T')[0], batchNumber: `GL-${Math.floor(seeded() * 900000 + 100000)}`, accountCodes: { benefit: '5000-1000', pmi: '5000-1100', tax: '2000-3000' } }, tax1099: { generated: true, year: NOW.getFullYear(), formType: '1099-MISC', box3Amount: interestAmount } }] : [] },
    routing: isSTP ? { type: RoutingType.STP, score: Math.floor(seeded() * 10 + 85), eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } } : { type: RoutingType.STANDARD, score: Math.floor(seeded() * 15 + 70), eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: seeded() > 0.4, noContestability: true, claimAmountThreshold: true, noAnomalies: seeded() > 0.3 } },
    workflow: { fsoCase: `FSO-${claimNumber}`, currentTask: isClosed ? null : 'Review Requirements', assignedTo: isClosed ? null : seededPick(['John Smith', 'Sarah Johnson', 'Jane Examiner']), daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: !isClosed && daysToSla < 3 } }
  };
  claim.sysId = `demo-sys-id-${index}`; claim.fnolNumber = `FNOL${String(index).padStart(7, '0')}`;
  claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
  return claim;
};

export const generateDemoClaims = () => {
  const showcaseClaims = createShowcaseClaims();
  const seededClaims = [];
  const stpIndices = [6, 8, 11, 14, 17, 19];
  for (let i = 6; i <= 20; i++) {
    seededClaims.push(generateSeededClaim(i, stpIndices.includes(i)));
  }
  return [...showcaseClaims, ...seededClaims];
};

export const generateDemoPolicies = (claims) => {
  const claimPolicies = claims.map(claim => ({
    id: claim.policy.policyNumber, policyNumber: claim.policy.policyNumber, status: claim.policy.status, type: claim.policy.type, issueDate: claim.policy.issueDate, faceAmount: claim.policy.faceAmount, owner: claim.policy.owner, insured: claim.insured.name,
    beneficiaries: claim.parties.filter(p => p.role === 'Primary Beneficiary' || p.role === 'Contingent Beneficiary').map(p => ({ name: p.name, relationship: p.role === 'Primary Beneficiary' ? claim.claimant.relationship : 'Child', percentage: p.role === 'Primary Beneficiary' ? 50 : 25, type: p.role === 'Primary Beneficiary' ? 'Primary' : 'Contingent' })),
    premiumAmount: Math.floor(claim.policy.faceAmount * 0.001), premiumFrequency: 'Annual',
    policyType: claim.policy.type, policyStatus: claim.policy.status,
    region: claims[0]?.policies?.[0]?.region || 'Midwest',
    companyCode: claims[0]?.policies?.[0]?.companyCode || 'BLM',
    planCode: claims[0]?.policies?.[0]?.planCode || 'TL200',
    currentCashValue: claims[0]?.policies?.[0]?.currentCashValue || 0,
    loanBalance: claims[0]?.policies?.[0]?.loanBalance || 0,
    source: 'Policy Admin'
  }));

  // Add unclaimed policies for some deceased insureds (for Related Policies feature)
  const unclaimedPolicies = [
    // Additional policy for Robert Jones (Claim 1)
    {
      id: 'POL-847292', policyNumber: 'POL-847292',
      policyStatus: 'In Force', status: 'In Force',
      policyType: 'Whole Life', type: 'Whole Life',
      issueDate: '2015-03-20',
      issueState: 'IL',
      faceAmount: 250000,
      owner: 'Robert Jones',
      insured: 'Robert Jones',
      region: 'Midwest',
      companyCode: 'BLM',
      planCode: 'WL250',
      currentCashValue: 45000,
      loanBalance: 0,
      source: 'Policy Admin',
      premiumAmount: 250,
      premiumFrequency: 'Monthly',
      beneficiaries: [
        { name: 'Elizabeth Jones', relationship: 'Spouse', percentage: 100, type: 'Primary' }
      ]
    },
    // Another policy for Robert Jones
    {
      id: 'POL-847293', policyNumber: 'POL-847293',
      policyStatus: 'In Force', status: 'In Force',
      policyType: 'Universal Life', type: 'Universal Life',
      issueDate: '2012-08-15',
      issueState: 'IL',
      faceAmount: 100000,
      owner: 'Robert Jones',
      insured: 'Robert Jones',
      region: 'Midwest',
      companyCode: 'BLM',
      planCode: 'UL100',
      currentCashValue: 28000,
      loanBalance: 5000,
      source: 'Policy Admin',
      premiumAmount: 150,
      premiumFrequency: 'Monthly',
      beneficiaries: [
        { name: 'David Jones', relationship: 'Child', percentage: 50, type: 'Primary' },
        { name: 'Rachel Jones', relationship: 'Child', percentage: 50, type: 'Primary' }
      ]
    },
    // Additional policy for Thomas Garcia (Claim 3)
    {
      id: 'POL-619248', policyNumber: 'POL-619248',
      policyStatus: 'In Force', status: 'In Force',
      policyType: 'Whole Life', type: 'Whole Life',
      issueDate: '2017-06-10',
      issueState: 'TX',
      faceAmount: 200000,
      owner: 'Thomas Garcia',
      insured: 'Thomas Garcia',
      region: 'Southwest',
      companyCode: 'GLP',
      planCode: 'WL200',
      currentCashValue: 38000,
      loanBalance: 0,
      source: 'Policy Admin',
      premiumAmount: 200,
      premiumFrequency: 'Monthly',
      beneficiaries: [
        { name: 'Maria Garcia', relationship: 'Spouse', percentage: 100, type: 'Primary' }
      ]
    }
  ];

  return [...claimPolicies, ...unclaimedPolicies];
};

export const generateDemoFSOCases = (claims) => {
  return claims.map(claim => ({
    id: claim.workflow.fsoCase, claimId: claim.id, claimNumber: claim.claimNumber, status: claim.status === ClaimStatus.CLOSED ? 'Closed' : 'Open', priority: claim.routing?.type === RoutingType.STP ? 'High' : 'Normal', currentTask: claim.workflow.currentTask, assignedTo: claim.workflow.assignedTo, sla: claim.workflow.sla, playbook: claim.routing?.type === RoutingType.STP ? 'STP Death Claim' : 'Standard Death Claim', createdAt: claim.createdAt, updatedAt: claim.updatedAt
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

// Requirements tab demo data — reuses the Ethan Carter (CLM-000147) showcase claim
// Used by RequirementsEngine to show rich demo requirements for FNOL/ServiceNow claims
export const getRequirementsDemoData = () => {
  const ec = getDemoData().claims.find(c => c.id === 'claim-ec');
  if (!ec) return { parties: [], requirements: [] };
  return { parties: ec.parties, requirements: ec.requirements };
};
