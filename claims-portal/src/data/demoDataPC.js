/**
 * P&C Demo Data Generator
 *
 * Property and Casualty Claims demo dataset:
 * - 5 hand-crafted showcase claims
 * - 10 seeded claims with varied loss types
 * - Fast Track routing (~35% of claims)
 * - Auto, Homeowners, Commercial Property, Liability
 */

import { ClaimStatus, RoutingType, RequirementStatus } from '../types/claim.types';

// P&C Claim Types
export const PCClaimType = {
  AUTO_COLLISION: 'auto_collision',
  AUTO_COMPREHENSIVE: 'auto_comprehensive',
  HOMEOWNERS: 'homeowners',
  COMMERCIAL_PROPERTY: 'commercial_property',
  AUTO_LIABILITY: 'auto_liability',
  WORKERS_COMP: 'workers_comp'
};

// P&C Requirement Types
export const PCRequirementType = {
  POLICE_REPORT: 'police_report',
  DAMAGE_PHOTOS: 'damage_photos',
  REPAIR_ESTIMATE: 'repair_estimate',
  PROOF_OF_OWNERSHIP: 'proof_of_ownership',
  MEDICAL_BILLS: 'medical_bills',
  RENTAL_RECEIPT: 'rental_receipt',
  CONTRACTOR_ESTIMATE: 'contractor_estimate',
  CLAIMANT_STATEMENT: 'claimant_statement',
  PROOF_OF_IDENTITY: 'proof_of_identity',
  COVERAGE_VERIFICATION: 'coverage_verification'
};

// ============================================================
// Seeded PRNG
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

const seeded = createSeededRandom(99); // Different seed from L&A

const seededDate = (start, end) =>
  new Date(start.getTime() + seeded() * (end.getTime() - start.getTime()));

const seededPick = (arr) => arr[Math.floor(seeded() * arr.length)];

const FIRST_NAMES = ['James', 'Jennifer', 'Robert', 'Michael', 'Linda', 'Patricia', 'David', 'Susan', 'William', 'Karen', 'Carlos', 'Aisha', 'Wei', 'Sofia', 'Marcus'];
const LAST_NAMES = ['Williams', 'Thompson', 'Chen', 'Wilson', 'Garcia', 'Anderson', 'Martinez', 'Taylor', 'Nguyen', 'Robinson', 'Lee', 'Harris', 'Clark', 'Lewis', 'Walker'];
const STATES = ['CA', 'TX', 'FL', 'NY', 'IL', 'GA', 'OH', 'WA', 'AZ', 'CO'];
const VEHICLE_MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Tesla', 'Subaru', 'Dodge', 'Hyundai'];
const VEHICLE_MODELS = { Toyota: 'Camry', Honda: 'Accord', Ford: 'F-150', Chevrolet: 'Malibu', Nissan: 'Altima', BMW: '3 Series', Tesla: 'Model 3', Subaru: 'Outback', Dodge: 'Charger', Hyundai: 'Sonata' };
const COMPANY_CODES = ['BLM', 'ALI', 'GLP', 'NWL', 'FST'];

const seededName = () => `${seededPick(FIRST_NAMES)} ${seededPick(LAST_NAMES)}`;

const NOW = new Date();
const DAY = 86400000;

// ============================================================
// P&C Requirements Generator
// ============================================================
const generatePCRequirements = (claim) => {
  const requirements = [];
  const createdAtDate = new Date(claim.createdAt);
  const isFT = claim.routing?.type === RoutingType.STP;
  const type = claim.type;
  const isAuto = type === PCClaimType.AUTO_COLLISION || type === PCClaimType.AUTO_COMPREHENSIVE;
  const isProperty = type === PCClaimType.HOMEOWNERS || type === PCClaimType.COMMERCIAL_PROPERTY;

  requirements.push({
    id: `${claim.id}-req-1`, level: 'claim', type: PCRequirementType.CLAIMANT_STATEMENT,
    name: 'Claimant Loss Statement', description: 'Signed statement describing the loss event in detail',
    status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 5 * DAY).toISOString(),
    satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
    documents: isFT ? [{ id: `doc-${claim.id}-1`, name: 'claimant_statement.pdf' }] : [],
    metadata: { confidenceScore: isFT ? 0.95 : 0.78 }
  });

  if (isAuto) {
    requirements.push({
      id: `${claim.id}-req-2`, level: 'claim', type: PCRequirementType.POLICE_REPORT,
      name: 'Police / Accident Report', description: 'Official police report or accident report from responding agency',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: type === PCClaimType.AUTO_COLLISION,
      dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 2 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-2`, name: 'police_report.pdf' }] : [],
      metadata: { confidenceScore: isFT ? 0.97 : null, reportNumber: isFT ? `RPT-${claim.id.toUpperCase()}` : null }
    });

    requirements.push({
      id: `${claim.id}-req-3`, level: 'claim', type: PCRequirementType.DAMAGE_PHOTOS,
      name: 'Vehicle Damage Photos', description: 'Clear photos of all vehicle damage from multiple angles',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 3 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-3a`, name: 'damage_front.jpg' }, { id: `doc-${claim.id}-3b`, name: 'damage_rear.jpg' }, { id: `doc-${claim.id}-3c`, name: 'damage_side.jpg' }] : [],
      metadata: {}
    });

    requirements.push({
      id: `${claim.id}-req-4`, level: 'claim', type: PCRequirementType.REPAIR_ESTIMATE,
      name: 'Certified Repair Estimate', description: 'Written estimate from a licensed repair facility',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 3 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-4`, name: 'repair_estimate.pdf' }] : [],
      metadata: { estimateAmount: isFT ? claim.financial?.repairEstimate : null }
    });
  }

  if (isProperty) {
    requirements.push({
      id: `${claim.id}-req-2`, level: 'claim', type: PCRequirementType.DAMAGE_PHOTOS,
      name: 'Property Damage Photos', description: 'Comprehensive photographic documentation of all damage',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 5 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 2 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-2a`, name: 'exterior_damage.jpg' }, { id: `doc-${claim.id}-2b`, name: 'interior_damage.jpg' }] : [],
      metadata: {}
    });

    requirements.push({
      id: `${claim.id}-req-3`, level: 'claim', type: PCRequirementType.CONTRACTOR_ESTIMATE,
      name: 'Licensed Contractor Estimate', description: 'Written repair/rebuild estimate from a licensed contractor',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 10 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 4 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-3`, name: 'contractor_estimate.pdf' }] : [],
      metadata: { estimateAmount: isFT ? claim.financial?.repairEstimate : null }
    });
  }

  requirements.push({
    id: `${claim.id}-req-5`, level: 'policy', type: PCRequirementType.COVERAGE_VERIFICATION,
    name: 'Coverage Verification', description: 'Verify active coverage at date of loss, deductible, and applicable limits',
    status: RequirementStatus.SATISFIED, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 2 * DAY).toISOString(),
    satisfiedDate: new Date(createdAtDate.getTime() + 4 * 3600000).toISOString(),
    documents: [],
    metadata: { verificationSource: 'Policy Admin System', policyNumber: claim.policy.policyNumber }
  });

  requirements.push({
    id: `${claim.id}-req-6`, level: 'party', type: PCRequirementType.PROOF_OF_IDENTITY,
    name: 'Claimant Identity Verification', description: "Government-issued photo ID — driver's license or passport",
    status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
    satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
    documents: isFT ? [{ id: `doc-${claim.id}-6`, name: 'drivers_license.pdf' }] : [],
    metadata: { confidenceScore: isFT ? 0.96 : null }
  });

  return requirements;
};

// ============================================================
// P&C Timeline Generator
// ============================================================
const generatePCTimeline = (claim) => {
  const events = [];
  const base = new Date(claim.createdAt).getTime();
  const isFT = claim.routing?.type === RoutingType.STP;

  events.push({ id: `${claim.id}-evt-1`, timestamp: claim.createdAt, type: 'claim.created', source: 'portal', user: { name: 'System', role: 'system' }, description: 'Loss reported via online claims portal', metadata: { channel: 'policyholder_portal' } });
  events.push({ id: `${claim.id}-evt-2`, timestamp: new Date(base + 3 * 60000).toISOString(), type: 'coverage.verified', source: 'policy', user: { name: 'System', role: 'system' }, description: 'Coverage verified in Policy Admin system', metadata: { policyNumber: claim.policy.policyNumber, status: 'active' } });

  if (isFT) {
    events.push({ id: `${claim.id}-evt-3`, timestamp: new Date(base + 8 * 60000).toISOString(), type: 'routing.fasttrack', source: 'routing', user: { name: 'Routing Engine', role: 'system' }, description: 'Claim qualified for STP (Straight Through Processing)', metadata: { score: claim.routing.score, eligible: true } });
    events.push({ id: `${claim.id}-evt-4`, timestamp: new Date(base + 12 * 60000).toISOString(), type: 'estimate.approved', source: 'appraisal', user: { name: 'Auto Appraisal Service', role: 'external' }, description: 'Repair estimate reviewed and approved', metadata: { amount: claim.financial?.repairEstimate } });
  } else {
    events.push({ id: `${claim.id}-evt-3`, timestamp: new Date(base + 15 * 60000).toISOString(), type: 'adjuster.assigned', source: 'routing', user: { name: 'Assignment Engine', role: 'system' }, description: 'Field adjuster assigned for inspection', metadata: { assignedTo: claim.workflow?.assignedTo } });
  }

  events.push({ id: `${claim.id}-evt-5`, timestamp: new Date(base + 20 * 60000).toISOString(), type: 'requirements.generated', source: 'requirements', user: { name: 'Decision Table Engine', role: 'system' }, description: `${claim.requirements?.length || 3} requirements generated for this claim`, metadata: {} });

  return events;
};

// ============================================================
// P&C Work Notes Generator
// ============================================================
const generatePCWorkNotes = (claim) => {
  const createdAtDate = new Date(claim.createdAt);
  const isAuto = claim.type === PCClaimType.AUTO_COLLISION || claim.type === PCClaimType.AUTO_COMPREHENSIVE;
  const notes = isAuto ? [
    'Initial loss report reviewed. Police report and damage photos received. Scheduling repair shop inspection.',
    'Repair estimate from certified shop received. Amount within expected range for reported damage.',
    'Spoke with claimant to confirm rental car arrangements. Rental pre-authorized for 7 days.'
  ] : [
    'Initial loss report reviewed. Property damage photos submitted by policyholder.',
    'Field adjuster visited property. Preliminary estimate prepared and submitted for review.',
    'Contacted contractor for second estimate. Awaiting response within 3 business days.'
  ];
  const authors = ['p.adjuster', 's.lyons', 'j.examiner'];

  return notes.map((text, i) => ({
    sys_id: `wn-${claim.id}-${i + 1}`, element: 'work_notes', element_id: claim.sysId || claim.id,
    name: 'x_dxcis_claims_a_0_claims_fnol', value: text,
    sys_created_on: new Date(createdAtDate.getTime() + (i + 1) * DAY).toISOString().replace('T', ' ').substring(0, 19),
    sys_created_by: authors[i]
  })).sort((a, b) => new Date(b.sys_created_on) - new Date(a.sys_created_on));
};

// ============================================================
// 5 Hand-crafted P&C Showcase Claims
// ============================================================
const createPCShowcaseClaims = () => {
  const claims = [];

  // ---- CLAIM PC-1: Auto Collision — Fast Track, CLOSED ----
  {
    const createdDate = new Date(NOW.getTime() - 10 * DAY);
    const lossDate = new Date(NOW.getTime() - 12 * DAY);
    const closedDate = new Date(createdDate.getTime() + 5 * DAY);
    const slaDate = new Date(createdDate.getTime() + 7 * DAY);

    const claim = {
      id: 'pc-claim-1', claimNumber: 'CLM-PC-000001', status: ClaimStatus.CLOSED,
      type: PCClaimType.AUTO_COLLISION,
      createdAt: createdDate.toISOString(), updatedAt: closedDate.toISOString(), closedAt: closedDate.toISOString(),
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Rear-end collision at traffic light',
        lossLocation: 'Houston, TX', lossDescription: 'Policyholder vehicle struck from behind at intersection of Main St & Commerce Blvd.',
        weatherConditions: 'Clear', policeReportNumber: 'RPT-2026-04821', faultDetermination: 'Third-party at fault'
      },
      insured: { name: 'Jennifer Williams', dateOfBirth: '1985-03-14', licenseNumber: 'TX-W8842913' },
      claimant: { name: 'Jennifer Williams', relationship: 'Policyholder', contactInfo: { email: 'j.williams@email.com', phone: '713-555-0192' } },
      vehicle: { year: 2022, make: 'Toyota', model: 'Camry', vin: '4T1BF3EK8CU109032', color: 'Silver', mileage: 28400 },
      policy: { policyNumber: 'PA-TX-847291', type: 'Personal Auto', status: 'Active', issueDate: '2021-04-01', coverageLimit: 100000, deductible: 500, owner: 'Jennifer Williams' },
      parties: [
        { id: 'pc-party-1-1', name: 'Jennifer Williams', role: 'Policyholder', source: 'Policy Admin', resState: 'TX', dateOfBirth: '1985-03-14', phone: '713-555-0192', email: 'j.williams@email.com', address: '4521 Oak Forest Dr, Houston, TX 77018', verificationStatus: 'Verified', verificationScore: 98 },
        { id: 'pc-party-1-2', name: 'Derek Nash', role: 'Third Party', source: 'FNOL', resState: 'TX', phone: '713-555-0371', email: 'dnash@email.com', address: '887 Westview Terrace, Houston, TX 77055', verificationStatus: 'Verified', verificationScore: 90 }
      ],
      aiInsights: { riskScore: 12, alerts: [] },
      financial: {
        claimAmount: 4200, deductible: 500, repairEstimate: 4200, salvageValue: 0,
        reserve: 0, amountPaid: 3700, currency: 'USD',
        payments: [{ id: 'pc-pay-1-1', paymentNumber: 'PAY-PC-000001', payeeName: 'Jennifer Williams', benefitAmount: 3700, paymentMethod: 'ACH', status: 'Completed', paymentDate: closedDate.toISOString().split('T')[0] }]
      },
      routing: { type: RoutingType.STP, score: 93, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 5 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: true, minorDamage: true, establishedPolicyholder: true, noFraudIndicators: true } },
      workflow: { fsoCase: 'FSO-PC-000001', currentTask: null, assignedTo: null, daysOpen: 5, sla: { dueDate: slaDate.toISOString(), daysRemaining: 2, atRisk: false } }
    };
    claim.sysId = 'pc-demo-sys-id-1'; claim.fnolNumber = 'FNOL-PC-0000001';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM PC-2: Homeowners — Standard, UNDER_REVIEW ----
  {
    const createdDate = new Date(NOW.getTime() - 18 * DAY);
    const lossDate = new Date(NOW.getTime() - 21 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'pc-claim-2', claimNumber: 'CLM-PC-000002', status: ClaimStatus.UNDER_REVIEW,
      type: PCClaimType.HOMEOWNERS,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 3 * DAY).toISOString(), closedAt: null,
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Severe hailstorm — roof and siding damage',
        lossLocation: 'Nashville, TN', lossDescription: 'Significant roof damage and exterior siding damage from golf-ball size hail during storm event.',
        weatherConditions: 'Severe hailstorm — 2" hail reported by NWS', policeReportNumber: null, faultDetermination: 'Weather event (no fault)'
      },
      insured: { name: 'Robert Thompson', dateOfBirth: '1971-08-22' },
      claimant: { name: 'Robert Thompson', relationship: 'Policyholder', contactInfo: { email: 'r.thompson@email.com', phone: '615-555-0274' } },
      property: { address: '1842 Magnolia Lane, Nashville, TN 37211', type: 'Single Family Residence', yearBuilt: 2003, squareFootage: 2400 },
      policy: { policyNumber: 'HO-TN-523184', type: 'Homeowners', status: 'Active', issueDate: '2018-06-01', coverageLimit: 380000, deductible: 2500, owner: 'Robert Thompson' },
      parties: [
        { id: 'pc-party-2-1', name: 'Robert Thompson', role: 'Policyholder', source: 'Policy Admin', resState: 'TN', dateOfBirth: '1971-08-22', phone: '615-555-0274', email: 'r.thompson@email.com', address: '1842 Magnolia Lane, Nashville, TN 37211', verificationStatus: 'Verified', verificationScore: 96 },
        { id: 'pc-party-2-2', name: 'Laura Thompson', role: 'Co-Insured', source: 'Policy Admin', resState: 'TN', phone: '615-555-0274', email: 'l.thompson@email.com', address: '1842 Magnolia Lane, Nashville, TN 37211', verificationStatus: 'Verified', verificationScore: 95 }
      ],
      aiInsights: { riskScore: 28, alerts: [{ id: 'pc-alert-2-1', severity: 'Low', category: 'Weather Event', title: 'Regional CAT Event', message: 'Multiple claims filed in this zip code for the same storm event', description: 'NWS confirmed severe hail event on the reported date. 18 claims filed in 37211 area code — consistent with documented storm path.', confidence: 92, recommendation: 'Apply CAT event handling — expedite contractor scheduling', timestamp: createdDate.toISOString() }] },
      financial: {
        claimAmount: 34500, deductible: 2500, repairEstimate: 34500, salvageValue: 0,
        reserve: 32000, amountPaid: 0, currency: 'USD', payments: []
      },
      routing: { type: RoutingType.STANDARD, score: 74, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 10 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: true, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: true } },
      workflow: { fsoCase: 'FSO-PC-000002', currentTask: 'Adjuster Inspection', assignedTo: 'Maria Rodriguez', daysOpen: 18, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 5 } }
    };
    claim.sysId = 'pc-demo-sys-id-2'; claim.fnolNumber = 'FNOL-PC-0000002';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM PC-3: Auto Comprehensive (Total Loss / Theft) — PENDING_REQUIREMENTS ----
  {
    const createdDate = new Date(NOW.getTime() - 8 * DAY);
    const lossDate = new Date(NOW.getTime() - 9 * DAY);
    const slaDate = new Date(createdDate.getTime() + 14 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'pc-claim-3', claimNumber: 'CLM-PC-000003', status: ClaimStatus.PENDING_REQUIREMENTS,
      type: PCClaimType.AUTO_COMPREHENSIVE,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 2 * DAY).toISOString(), closedAt: null,
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Vehicle theft — reported to police',
        lossLocation: 'Phoenix, AZ', lossDescription: 'Policyholder vehicle stolen overnight from residential driveway. Police report filed.',
        weatherConditions: 'N/A', policeReportNumber: 'PHX-2026-19472', faultDetermination: 'Theft — no fault'
      },
      insured: { name: 'Michael Chen', dateOfBirth: '1990-11-05', licenseNumber: 'AZ-C4490127' },
      claimant: { name: 'Michael Chen', relationship: 'Policyholder', contactInfo: { email: 'm.chen@email.com', phone: '602-555-0388' } },
      vehicle: { year: 2020, make: 'Tesla', model: 'Model 3', vin: '5YJ3E1EB4LF123456', color: 'Midnight Silver', mileage: 41200, actualCashValue: 38000 },
      policy: { policyNumber: 'PA-AZ-619247', type: 'Personal Auto', status: 'Active', issueDate: '2020-03-15', coverageLimit: 50000, deductible: 1000, owner: 'Michael Chen' },
      parties: [
        { id: 'pc-party-3-1', name: 'Michael Chen', role: 'Policyholder', source: 'Policy Admin', resState: 'AZ', dateOfBirth: '1990-11-05', phone: '602-555-0388', email: 'm.chen@email.com', address: '2210 E Camelback Rd #304, Phoenix, AZ 85016', verificationStatus: 'Verified', verificationScore: 97 }
      ],
      aiInsights: { riskScore: 35, alerts: [{ id: 'pc-alert-3-1', severity: 'Medium', category: 'Total Loss', title: 'Total Loss Threshold Exceeded', message: 'Vehicle ACV likely exceeds repair threshold — total loss processing recommended', description: 'Based on reported vehicle details and market data, the actual cash value indicates this claim should be processed as a total loss.', confidence: 88, recommendation: 'Assign total loss specialist and obtain title documentation', timestamp: createdDate.toISOString() }] },
      financial: {
        claimAmount: 37000, deductible: 1000, repairEstimate: 37000, salvageValue: 3500,
        reserve: 36000, amountPaid: 0, currency: 'USD', payments: []
      },
      routing: { type: RoutingType.STANDARD, score: 68, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 8 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: false, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: true } },
      workflow: { fsoCase: 'FSO-PC-000003', currentTask: 'Await Police Report', assignedTo: 'David Park', daysOpen: 8, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'pc-demo-sys-id-3'; claim.fnolNumber = 'FNOL-PC-0000003';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM PC-4: Auto Liability — SIU Routing, UNDER_REVIEW ----
  {
    const createdDate = new Date(NOW.getTime() - 22 * DAY);
    const lossDate = new Date(NOW.getTime() - 25 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'pc-claim-4', claimNumber: 'CLM-PC-000004', status: ClaimStatus.UNDER_REVIEW,
      type: PCClaimType.AUTO_LIABILITY,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 5 * DAY).toISOString(), closedAt: null,
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Multi-vehicle accident — liability disputed',
        lossLocation: 'Atlanta, GA', lossDescription: 'Three-vehicle accident. Third party alleging our policyholder caused collision. Liability contested. Opposing attorney retained.',
        weatherConditions: 'Light rain, reduced visibility', policeReportNumber: 'ATL-2026-00872', faultDetermination: 'Disputed — under investigation'
      },
      insured: { name: 'James Wilson', dateOfBirth: '1978-04-16', licenseNumber: 'GA-W5531094' },
      claimant: { name: 'James Wilson', relationship: 'Policyholder', contactInfo: { email: 'j.wilson@email.com', phone: '404-555-0517' } },
      vehicle: { year: 2019, make: 'Ford', model: 'F-150', vin: '1FTEW1EP5KFB01234', color: 'Black', mileage: 62000 },
      policy: { policyNumber: 'PA-GA-738156', type: 'Personal Auto', status: 'Active', issueDate: '2017-08-15', coverageLimit: 300000, deductible: 1000, owner: 'James Wilson' },
      parties: [
        { id: 'pc-party-4-1', name: 'James Wilson', role: 'Policyholder', source: 'Policy Admin', resState: 'GA', dateOfBirth: '1978-04-16', phone: '404-555-0517', email: 'j.wilson@email.com', address: '3389 Peachtree Rd NE, Atlanta, GA 30326', verificationStatus: 'Verified', verificationScore: 94 },
        { id: 'pc-party-4-2', name: 'Sandra Kim', role: 'Third Party Claimant', source: 'FNOL', resState: 'GA', phone: '404-555-0892', email: 'sandra.kim@email.com', address: '782 Marietta Blvd NW, Atlanta, GA 30318', verificationStatus: 'Pending', verificationScore: 72 },
        { id: 'pc-party-4-3', name: 'Thomas Brown', role: 'Third Party Claimant', source: 'FNOL', resState: 'GA', phone: '404-555-0134', email: 't.brown@email.com', address: '1104 Cascade Ave SW, Atlanta, GA 30311', verificationStatus: 'Pending', verificationScore: 68 }
      ],
      aiInsights: { riskScore: 72, alerts: [
        { id: 'pc-alert-4-1', severity: 'High', category: 'Liability Dispute', title: 'Contested Liability — Legal Representation', message: 'Third-party has retained legal counsel. Potential bodily injury exposure.', description: 'Opposing attorney demand letter received. Third party alleging neck and back injuries. Medical treatment ongoing. Potential BI exposure $75K-$150K.', confidence: 85, recommendation: 'Assign to senior liability adjuster. Retain defense counsel.', timestamp: createdDate.toISOString() },
        { id: 'pc-alert-4-2', severity: 'Medium', category: 'SIU Review', title: 'Claim Referred to SIU', message: 'SIU review initiated due to timeline inconsistencies in third-party statements', description: 'Conflicting witness statements regarding vehicle positions. SIU referral initiated per claim handling guidelines.', confidence: 78, recommendation: 'SIU investigation ongoing — do not settle pending review', timestamp: new Date(createdDate.getTime() + 3 * DAY).toISOString() }
      ] },
      financial: {
        claimAmount: 125000, deductible: 1000, repairEstimate: 18500, salvageValue: 0,
        reserve: 120000, amountPaid: 0, currency: 'USD', payments: []
      },
      routing: { type: RoutingType.SIU, score: 45, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 20 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: false, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: false } },
      workflow: { fsoCase: 'FSO-PC-000004', currentTask: 'SIU Investigation', assignedTo: 'Lisa Chen', daysOpen: 22, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 5 } }
    };
    claim.sysId = 'pc-demo-sys-id-4'; claim.fnolNumber = 'FNOL-PC-0000004';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM PC-5: Commercial Property — Standard, SLA at risk ----
  {
    const createdDate = new Date(NOW.getTime() - 26 * DAY);
    const lossDate = new Date(NOW.getTime() - 28 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'pc-claim-5', claimNumber: 'CLM-PC-000005', status: ClaimStatus.UNDER_REVIEW,
      type: PCClaimType.COMMERCIAL_PROPERTY,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 10 * DAY).toISOString(), closedAt: null,
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Kitchen fire — commercial restaurant',
        lossLocation: 'Chicago, IL', lossDescription: 'Commercial kitchen fire causing extensive smoke, heat, and water damage throughout the premises. Fire suppression system activated.',
        weatherConditions: 'N/A', policeReportNumber: 'CPD-2026-FF-0042', faultDetermination: 'Accidental — faulty equipment'
      },
      insured: { name: 'Davidson Restaurant Group LLC', dateOfBirth: null },
      claimant: { name: 'Marcus Davidson', relationship: 'Named Insured / Business Owner', contactInfo: { email: 'm.davidson@davidsonrestaurants.com', phone: '312-555-0748' } },
      property: { address: '840 N Michigan Ave, Chicago, IL 60611', type: 'Commercial Restaurant', yearBuilt: 1998, squareFootage: 4800, businessName: 'Davidson Grille' },
      policy: { policyNumber: 'CP-IL-415892', type: 'Commercial Property', status: 'Active', issueDate: '2022-01-01', coverageLimit: 1200000, deductible: 10000, owner: 'Davidson Restaurant Group LLC' },
      parties: [
        { id: 'pc-party-5-1', name: 'Marcus Davidson', role: 'Policyholder', source: 'Policy Admin', resState: 'IL', phone: '312-555-0748', email: 'm.davidson@davidsonrestaurants.com', address: '840 N Michigan Ave, Chicago, IL 60611', verificationStatus: 'Verified', verificationScore: 95 },
        { id: 'pc-party-5-2', name: 'Davidson Restaurant Group LLC', role: 'Named Insured', source: 'Policy Admin', resState: 'IL', phone: '312-555-0748', email: 'insurance@davidsonrestaurants.com', address: '840 N Michigan Ave, Chicago, IL 60611', verificationStatus: 'Verified', verificationScore: 98 }
      ],
      aiInsights: { riskScore: 55, alerts: [
        { id: 'pc-alert-5-1', severity: 'High', category: 'Business Interruption', title: 'Business Interruption Coverage Active', message: 'Business closed since loss date — BI coverage triggered. Track revenue loss carefully.', description: 'Restaurant has been closed for operations since the fire. Business Interruption coverage activated. Revenue documentation required to calculate BI payment.', confidence: 97, recommendation: 'Request 12 months of revenue records. Assign BI specialist.', timestamp: createdDate.toISOString() },
        { id: 'pc-alert-5-2', severity: 'Medium', category: 'SLA Risk', title: 'SLA Approaching — Complex Claim', message: `SLA deadline in ${daysToSla} days. Multiple coverage components require coordination.`, description: 'This claim involves property damage, business interruption, and equipment breakdown coverage. Complexity may require timeline extension request.', confidence: 90, recommendation: 'Request SLA extension or escalate to supervisor', timestamp: new Date(createdDate.getTime() + 20 * DAY).toISOString() }
      ] },
      financial: {
        claimAmount: 285000, deductible: 10000, repairEstimate: 195000, salvageValue: 0,
        businessInterruptionEstimate: 90000, reserve: 280000, amountPaid: 0, currency: 'USD', payments: []
      },
      routing: { type: RoutingType.STANDARD, score: 62, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: true, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: true } },
      workflow: { fsoCase: 'FSO-PC-000005', currentTask: 'Await Contractor Estimate', assignedTo: 'Stephanie Lyons', daysOpen: 26, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla <= 5 } }
    };
    claim.sysId = 'pc-demo-sys-id-5'; claim.fnolNumber = 'FNOL-PC-0000005';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claims.push(claim);
  }


  // ---- CLAIM PC-6: Commercial Property — STP, CLOSED (IoT-Validated Winter Storm) ----
  {
    const createdDate = new Date(NOW.getTime() - 8 * DAY);
    const lossDate = createdDate;
    const closedDate = new Date(createdDate.getTime() + 4 * 3600000); // approved in 45 min, closed same day
    const slaDate = new Date(createdDate.getTime() + 1 * DAY);

    const claim = {
      id: 'pc-claim-6', claimNumber: 'CLM-PC-000006', status: ClaimStatus.CLOSED,
      type: PCClaimType.COMMERCIAL_PROPERTY,
      createdAt: createdDate.toISOString(), updatedAt: closedDate.toISOString(), closedAt: closedDate.toISOString(),
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Winter storm — frozen pipe burst',
        lossLocation: 'Chicago, IL', lossDescription: 'Extreme cold event (-5°F) caused pipe burst in commercial florist storage area. FloodStop Pro IoT sensors triggered immediate detection at 3:45 AM. Emergency mitigation started within 2 hours. Prior claim CLM-2024-012847 — all prevention measures followed.',
        weatherConditions: 'Winter Storm Warning — -5°F, 25 mph winds, NOAA confirmed', policeReportNumber: null, faultDetermination: 'Weather event (no fault)'
      },
      insured: { name: "Kim's Flowers & Gifts", dateOfBirth: null },
      claimant: { name: 'Kim Lee', relationship: 'Named Insured / Business Owner', contactInfo: { email: 'kim@bloomandpetals.com', phone: '503-555-0234' } },
      property: { address: '1847 Main Street, Chicago, IL 60601', type: 'Commercial Florist', yearBuilt: 2010, squareFootage: 2200, businessName: "Kim's Flowers & Gifts" },
      policy: { policyNumber: 'BOP-IL-789456', type: 'Business Owners Policy', status: 'Active', issueDate: '2023-06-01', coverageLimit: 500000, deductible: 5000, owner: "Kim's Flowers & Gifts" },
      parties: [
        { id: 'pc-party-6-1', name: 'Kim Lee', role: 'Policyholder', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1982-03-15', phone: '503-555-0234', email: 'kim@bloomandpetals.com', address: '1847 Main Street, Chicago, IL 60601', verificationStatus: 'Verified', verificationScore: 99 },
        { id: 'pc-party-6-2', name: "Kim's Flowers & Gifts", role: 'Named Insured', source: 'Policy Admin', resState: 'IL', phone: '503-555-0234', email: 'kim@bloomandpetals.com', address: '1847 Main Street, Chicago, IL 60601', verificationStatus: 'Verified', verificationScore: 98 }
      ],
      aiInsights: {
        riskScore: 8,
        alerts: [
          {
            id: 'pc-ai-6-1',
            severity: 'Low',
            category: 'Weather Corroboration',
            title: 'Loss Event Validated — Freeze Timing & Severity Confirmed',
            message: 'NOAA weather data and IoT sensor logs independently corroborate the reported loss event.',
            description: 'Automated analysis cross-referenced NOAA Winter Storm Warning data with IoT sensor readings from FloodStop Pro. Temperature sensor TEMP-BPF-001 recorded -5°F at 02:30 — consistent with the freeze threshold for commercial pipe failure. Water sensor WATER-BPF-002 activated at 03:45, aligning precisely with the reported burst event. Loss timing, temperature severity, and physical sensor evidence are fully corroborated across independent data sources.',
            recommendation: 'No further weather validation required. Freeze timing and severity confirmed. Proceed with STP approval.',
            confidence: 99,
            timestamp: createdDate.toISOString()
          },
          {
            id: 'pc-ai-6-2',
            severity: 'Low',
            category: 'Estimate Validation',
            title: 'No Inflation Indicators Detected — Estimate Within Expected Range',
            message: 'Damage estimate of $19,500 validates against 127 comparable commercial pipe burst claims.',
            description: 'Claimed amount of $19,500 benchmarked against comparable commercial property pipe burst losses in the Midwest (2024–2026 cohort, n=127). Estimate falls within expected range for a florist with refrigerated storage, retail floor, walk-in cooler, and business interruption. No line-item inflation, round-number anomalies, duplicate billing, or cost escalation patterns detected. Inventory loss quantum is consistent with a florist of this size and seasonal stock profile.',
            recommendation: 'Settlement amount validated. No independent appraisal required. Approve as submitted.',
            confidence: 96,
            timestamp: createdDate.toISOString()
          },
          {
            id: 'pc-ai-6-3',
            severity: 'Low',
            category: 'Pattern Analysis',
            title: 'Prior Claim History Supports Authenticity — Prevention Compliance Verified',
            message: 'Insured completed all 4 prevention measures recommended after prior claim CLM-2024-012847.',
            description: 'Prior claim CLM-2024-012847 (January 2024, frozen pipe, $15,000) reviewed and cross-referenced. Post-claim adjuster recommended 4 prevention measures. All 4 independently verified: FloodStop Pro water sensor installed March 2024 (hardware registration confirmed), exposed basement pipes insulated (contractor invoice on file), Smart Business Monitoring enrollment active (telematics data accessible), winterization checklist completed and submitted October 2025. Proactive compliance behavior is statistically inconsistent with fraudulent intent and supports STP Criterion 4.',
            recommendation: 'Prior claim compliance strengthens authenticity. Pattern consistent with a responsible insured who took prevention seriously.',
            confidence: 98,
            timestamp: createdDate.toISOString()
          },
          {
            id: 'pc-ai-6-4',
            severity: 'Low',
            category: 'Agentic Validation',
            title: 'Holistic Risk Profile Complete — 5 Independent Sources Corroborate Loss',
            message: 'Digital agent assembled complete contextual picture from 5 data sources. Fraud score: 8/100.',
            description: 'Automated claims analysis assembled and cross-referenced 5 independent data sources: (1) NOAA Winter Storm Warning — freeze event confirmed for Chicago IL 60601; (2) FloodStop Pro IoT sensor logs — temperature, water leak, and humidity readings timestamped and geo-verified; (3) Mobile FNOL submission — geo-tagged damage photos submitted within hours of sensor alert; (4) Prior claim history and prevention compliance record — behavioral pattern consistent with a low-risk insured; (5) Comparable loss benchmarks — estimate validated against regional peer cohort. All 5 sources independently support the reported loss. Fraud control achieved through context, not suspicion.',
            recommendation: 'STP approved. Complete contextual picture assembled — no human adjuster review required. Approve and schedule ACH payment.',
            confidence: 94,
            timestamp: createdDate.toISOString()
          }
        ]
      },
      financial: {
        claimAmount: 19500, deductible: 5000, repairEstimate: 16500, salvageValue: 0,
        businessInterruptionEstimate: 3000, reserve: 0, amountPaid: 19500, currency: 'USD',
        payments: [{ id: 'pc-pay-6-1', paymentNumber: 'PAY-PC-000006', payeeName: "Kim's Flowers & Gifts", benefitAmount: 19500, paymentMethod: 'ACH', status: 'Completed', paymentDate: new Date(createdDate.getTime() + 2 * DAY).toISOString().split('T')[0] }]
      },
      routing: {
        type: RoutingType.STP, score: 94, eligible: true,
        evaluatedAt: new Date(createdDate.getTime() + 62 * 60000).toISOString(),
        criteria: { coverageActive: true, clearLiability: true, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: true },
        stpDetails: {
          iotValidated: true, weatherCorroborated: true, priorClaimCompliance: true,
          confidenceScore: 94, approvalDuration: '45 minutes',
          stpCriteria: [
            { criterion: 'Storm Alert Sent', met: true, details: 'Winter storm alert sent to insured 48 hours before incident' },
            { criterion: 'Risk Documentation', met: true, details: 'Property photos documented vulnerable pipe locations from prior claim', priorClaimRef: 'CLM-2024-012847' },
            { criterion: 'Smart Monitoring', met: true, details: 'FloodStop Pro water sensor detected leak at 3:45 AM', sensorVerified: true },
            { criterion: 'Prevention Compliance', met: true, details: 'All recommended measures followed post prior claim — insulation, sensor install, winterization checklist', complianceScore: 100 },
            { criterion: 'Rapid Response', met: true, details: 'Emergency mitigation began within 2 hours of detection', responseTime: '1 hour 45 minutes' }
          ]
        }
      },
      workflow: { fsoCase: 'FSO-PC-000006', currentTask: null, assignedTo: null, daysOpen: 0, sla: { dueDate: slaDate.toISOString(), daysRemaining: 0, atRisk: false } }
    };
    claim.sysId = 'pc-demo-sys-id-6'; claim.fnolNumber = 'FNOL-PC-0000006';
    claim.requirements = [
      {
        id: 'pc-claim-6-req-1', level: 'claim', type: PCRequirementType.CLAIMANT_STATEMENT,
        name: 'FNOL & Loss Statement',
        description: 'Mobile FNOL submitted with geo-tagged damage photos and signed loss statement within 2 hours of sensor alert',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 1 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 30 * 60000).toISOString(),
        documents: [
          { id: 'doc-pc6-1a', name: 'mobile_fnol_submission.pdf' },
          { id: 'doc-pc6-1b', name: 'geo_tagged_damage_photos.zip' }
        ],
        metadata: { confidenceScore: 0.98, channel: 'mobile_app' }
      },
      {
        id: 'pc-claim-6-req-2', level: 'claim', type: PCRequirementType.DAMAGE_PHOTOS,
        name: 'IoT Sensor Validation & Damage Documentation',
        description: 'FloodStop Pro sensor logs (TEMP-BPF-001 at -5°F, WATER-BPF-002 water alert at 03:45) independently corroborate loss event alongside mobile damage photos',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 2 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 1 * 3600000).toISOString(),
        documents: [
          { id: 'doc-pc6-2a', name: 'iot_sensor_log_TEMP-BPF-001.csv' },
          { id: 'doc-pc6-2b', name: 'iot_sensor_log_WATER-BPF-002.csv' },
          { id: 'doc-pc6-2c', name: 'damage_photos_interior.zip' }
        ],
        metadata: { confidenceScore: 0.99, sensorVerified: true, noaaCorroborated: true }
      },
      {
        id: 'pc-claim-6-req-3', level: 'claim', type: PCRequirementType.CONTRACTOR_ESTIMATE,
        name: 'Emergency Mitigation & Repair Estimate',
        description: 'Licensed contractor on-site estimate covering water remediation, pipe repair, walk-in cooler damage, and business interruption — validated against 127 comparable peer claims',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 3 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 2 * 3600000).toISOString(),
        documents: [
          { id: 'doc-pc6-3', name: 'emergency_mitigation_estimate.pdf' }
        ],
        metadata: { confidenceScore: 0.96, estimateAmount: 16500 }
      },
      {
        id: 'pc-claim-6-req-4', level: 'policy', type: PCRequirementType.COVERAGE_VERIFICATION,
        name: 'Coverage & Policy Verification',
        description: 'BOP-IL-789456 active at date of loss. Commercial property, business interruption, and inventory coverage confirmed in Policy Admin System',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 1 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 15 * 60000).toISOString(),
        documents: [],
        metadata: { verificationSource: 'Policy Admin System', policyNumber: 'BOP-IL-789456' }
      },
      {
        id: 'pc-claim-6-req-5', level: 'party', type: PCRequirementType.PROOF_OF_IDENTITY,
        name: 'Claimant Identity Verification',
        description: 'Kim Lee — Government-issued photo ID verified. Identity score 99/100. Pre-verified returning customer.',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 2 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 15 * 60000).toISOString(),
        documents: [
          { id: 'doc-pc6-5', name: 'identity_verification.pdf' }
        ],
        metadata: { confidenceScore: 0.99 }
      },
    ];
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = [
      { sys_id: 'wn-pc-claim-6-4', element: 'work_notes', element_id: 'pc-demo-sys-id-6', name: 'x_dxcis_claims_a_0_claims_fnol', value: 'STP completed. All 5 criteria validated — 94% confidence. Claim approved in 45 minutes. ACH payment of $19,500 scheduled. Post-settlement audit queued. Claim closed.', sys_created_on: new Date(createdDate.getTime() + 2.5 * 3600000).toISOString().replace('T', ' ').substring(0, 19), sys_created_by: 'digital.agent' },
      { sys_id: 'wn-pc-claim-6-3', element: 'work_notes', element_id: 'pc-demo-sys-id-6', name: 'x_dxcis_claims_a_0_claims_fnol', value: 'Fraud analysis complete. Claim aligns with freeze timing and severity. No inflation indicators detected.', sys_created_on: new Date(createdDate.getTime() + 2 * 3600000).toISOString().replace('T', ' ').substring(0, 19), sys_created_by: 'fraud.analysis' },
      { sys_id: 'wn-pc-claim-6-2', element: 'work_notes', element_id: 'pc-demo-sys-id-6', name: 'x_dxcis_claims_a_0_claims_fnol', value: 'Prior claim CLM-2024-012847 reviewed. Insured followed all prevention recommendations: FloodStop Pro sensor installed, exposed pipes insulated, winterization checklist completed. Prevention compliance 100%. STP criteria 2 and 4 confirmed.', sys_created_on: new Date(createdDate.getTime() + 1.5 * 3600000).toISOString().replace('T', ' ').substring(0, 19), sys_created_by: 'digital.agent' },
      { sys_id: 'wn-pc-claim-6-1', element: 'work_notes', element_id: 'pc-demo-sys-id-6', name: 'x_dxcis_claims_a_0_claims_fnol', value: 'FNOL received via mobile app with damage photos. IoT data: TEMP-BPF-001 recorded -5°F at 02:30, WATER-BPF-002 activated at 03:45 (water leak), HUMID-BPF-003 spike at 04:00. NOAA confirms Winter Storm Warning for Chicago IL. STP evaluation initiated.', sys_created_on: new Date(createdDate.getTime() + 0.5 * 3600000).toISOString().replace('T', ' ').substring(0, 19), sys_created_by: 'digital.agent' }
    ];
    claims.push(claim);
  }

  return claims;
};

// ============================================================
// Generate 10 seeded P&C claims
// ============================================================
const PC_TYPES = [PCClaimType.AUTO_COLLISION, PCClaimType.AUTO_COLLISION, PCClaimType.HOMEOWNERS, PCClaimType.AUTO_COMPREHENSIVE, PCClaimType.AUTO_LIABILITY, PCClaimType.COMMERCIAL_PROPERTY];
const CAUSE_MAP = {
  [PCClaimType.AUTO_COLLISION]: 'Vehicle collision',
  [PCClaimType.AUTO_COMPREHENSIVE]: 'Comprehensive loss (theft/weather)',
  [PCClaimType.HOMEOWNERS]: 'Property damage — wind/hail/water',
  [PCClaimType.COMMERCIAL_PROPERTY]: 'Commercial property loss',
  [PCClaimType.AUTO_LIABILITY]: 'Liability claim — third party',
  [PCClaimType.WORKERS_COMP]: 'Workplace injury'
};

const generateSeededPCClaim = (index, isFT) => {
  const createdDate = seededDate(new Date(NOW.getTime() - 28 * DAY), new Date(NOW.getTime() - 1 * DAY));
  const lossDate = seededDate(new Date(createdDate.getTime() - 5 * DAY), createdDate);
  const claimType = seededPick(PC_TYPES);
  const claimantName = seededName();
  const policyNumber = `PA-${seededPick(STATES)}-${Math.floor(seeded() * 900000 + 100000)}`;
  const claimNumber = `CLM-PC-${String(index).padStart(6, '0')}`;
  const claimAmount = claimType === PCClaimType.COMMERCIAL_PROPERTY
    ? Math.floor(seeded() * 200000 + 50000)
    : Math.floor(seeded() * 30000 + 2000);
  const state = seededPick(STATES);
  const vehicleMake = seededPick(VEHICLE_MAKES);

  const statusOptions = isFT
    ? [ClaimStatus.CLOSED, ClaimStatus.CLOSED, ClaimStatus.APPROVED]
    : [ClaimStatus.NEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.PENDING_REQUIREMENTS, ClaimStatus.APPROVED];
  const status = seededPick(statusOptions);
  const isClosed = status === ClaimStatus.CLOSED;
  const closedDate = isClosed ? new Date(createdDate.getTime() + (isFT ? 5 : 20) * DAY) : null;
  const daysOpen = Math.floor(((isClosed ? closedDate : NOW) - createdDate) / DAY);
  const slaDays = isFT ? 7 : (claimType === PCClaimType.COMMERCIAL_PROPERTY ? 30 : 14);
  const slaDate = new Date(createdDate.getTime() + slaDays * DAY);
  // STP claims are evaluated within minutes — use the STP evaluation time as the effective
  // completion date so daysRemaining is always positive (never negative) for processed STP claims.
  const stpCompletedAt = isFT ? new Date(createdDate.getTime() + 5 * 60000) : null;
  const effectiveCompletionDate = closedDate || stpCompletedAt;
  const daysToSla = effectiveCompletionDate
    ? Math.ceil((slaDate - effectiveCompletionDate) / DAY)
    : Math.ceil((slaDate - NOW) / DAY);

  const claim = {
    id: `pc-claim-${index}`, claimNumber, status, type: claimType,
    createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + seeded() * 12 * 3600000).toISOString(), closedAt: isClosed ? closedDate.toISOString() : null,
    lossEvent: {
      dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: CAUSE_MAP[claimType],
      lossLocation: `${seededPick(['Atlanta', 'Dallas', 'Denver', 'Seattle', 'Miami', 'Phoenix', 'Detroit', 'Portland'])}, ${state}`,
      lossDescription: `${CAUSE_MAP[claimType]} reported by policyholder.`,
      weatherConditions: seededPick(['Clear', 'Rain', 'Wind', 'Hail', 'N/A']),
      policeReportNumber: seeded() > 0.4 ? `RPT-${state}-${Math.floor(seeded() * 90000 + 10000)}` : null,
      faultDetermination: isFT ? 'Third-party at fault' : seededPick(['Under investigation', 'Disputed', 'No fault', 'Policyholder at fault'])
    },
    insured: { name: claimantName, dateOfBirth: seededDate(new Date(1965, 0, 1), new Date(1995, 11, 31)).toISOString().split('T')[0] },
    claimant: { name: claimantName, relationship: 'Policyholder', contactInfo: { email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}` } },
    vehicle: claimType === PCClaimType.AUTO_COLLISION || claimType === PCClaimType.AUTO_COMPREHENSIVE || claimType === PCClaimType.AUTO_LIABILITY
      ? { year: Math.floor(seeded() * 10 + 2014), make: vehicleMake, model: VEHICLE_MODELS[vehicleMake], vin: `1DEMO${Math.floor(seeded() * 9e10)}`, color: seededPick(['White', 'Black', 'Silver', 'Blue', 'Red']), mileage: Math.floor(seeded() * 80000 + 10000) }
      : null,
    policy: { policyNumber, type: claimType === PCClaimType.HOMEOWNERS ? 'Homeowners' : claimType === PCClaimType.COMMERCIAL_PROPERTY ? 'Commercial Property' : 'Personal Auto', status: 'Active', issueDate: seededDate(new Date(2018, 0, 1), new Date(2023, 11, 31)).toISOString().split('T')[0], coverageLimit: claimAmount * 8, deductible: seededPick([500, 1000, 2500]), owner: claimantName },
    parties: [
      { id: `pc-party-${index}-1`, name: claimantName, role: 'Policyholder', source: 'Policy Admin', resState: state, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, address: `${Math.floor(seeded() * 9999)} Main St, Anytown, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, verificationStatus: 'Verified', verificationScore: isFT ? 97 : 82 }
    ],
    aiInsights: { riskScore: isFT ? Math.floor(seeded() * 20 + 10) : Math.floor(seeded() * 35 + 30), alerts: isFT ? [] : (seeded() > 0.5 ? [{ id: `pc-alert-${index}-1`, severity: 'Medium', category: 'Review', title: 'Manual Review Required', message: 'Claim requires standard manual review', description: 'One or more claim criteria require adjuster review.', confidence: 75, recommendation: 'Assign to adjuster queue', timestamp: createdDate.toISOString() }] : []) },
    financial: {
      claimAmount, deductible: seededPick([500, 1000, 2500]),
      repairEstimate: claimAmount, salvageValue: isFT && isClosed ? Math.floor(claimAmount * 0.08) : 0,
      reserve: isClosed ? 0 : Math.floor(claimAmount * 0.9),
      amountPaid: isClosed ? claimAmount - seededPick([500, 1000, 2500]) : 0, currency: 'USD',
      payments: isClosed ? [{ id: `pc-pay-${index}-1`, paymentNumber: `PAY-PC-${String(index).padStart(6, '0')}`, payeeName: claimantName, benefitAmount: claimAmount - 1000, paymentMethod: seeded() > 0.5 ? 'ACH' : 'Check', status: 'Completed', paymentDate: closedDate?.toISOString().split('T')[0] }] : []
    },
    routing: isFT
      ? { type: RoutingType.STP, score: Math.floor(seeded() * 8 + 88), eligible: true, evaluatedAt: new Date(createdDate.getTime() + 5 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: true, minorDamage: true, establishedPolicyholder: true, noFraudIndicators: true } }
      : { type: seeded() > 0.9 ? RoutingType.SIU : RoutingType.STANDARD, score: Math.floor(seeded() * 20 + 50), eligible: false, evaluatedAt: new Date(createdDate.getTime() + 10 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: seeded() > 0.4, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: seeded() > 0.1 } },
    workflow: { fsoCase: `FSO-${claimNumber}`, currentTask: isClosed ? null : seededPick(['Adjuster Review', 'Estimate Review', 'Liability Review', 'SIU Review']), assignedTo: isClosed ? null : seededPick(['Maria Rodriguez', 'David Park', 'Lisa Chen', 'John Adjuster']), daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: !isClosed && daysToSla < 3 } }
  };
  claim.sysId = `pc-demo-sys-id-${index}`; claim.fnolNumber = `FNOL-PC-${String(index).padStart(7, '0')}`;
  claim.requirements = generatePCRequirements(claim);
  claim.timeline = generatePCTimeline(claim);
  claim.workNotes = generatePCWorkNotes(claim);
  return claim;
};

// ============================================================
// Export
// ============================================================
export const generatePCDemoClaims = () => {
  const showcaseClaims = createPCShowcaseClaims();
  const ftIndices = [7, 10, 13];
  const seededClaims = [];
  for (let i = 7; i <= 16; i++) {
    seededClaims.push(generateSeededPCClaim(i, ftIndices.includes(i)));
  }
  return [...showcaseClaims, ...seededClaims];
};

let cachedPCDemoData = null;

export const getPCDemoData = () => {
  if (!cachedPCDemoData) {
    cachedPCDemoData = { claims: generatePCDemoClaims() };
  }
  return cachedPCDemoData;
};

export default { claims: getPCDemoData().claims };
