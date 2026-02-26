import { useState, useEffect } from 'react';
import './RequirementsEngine.css';
import { getRequirementsDemoData } from '../../data/demoData';

/* ─────────────────────────────────────────────────────────────
   Staged Document Previews
   Each returns a JSX block that looks like a real document.
───────────────────────────────────────────────────────────── */
const DocDeathCert = ({ claim }) => {
  const insured = claim.insured || {};
  const de      = claim.deathEvent || {};
  const state   = de.stateOfDeath || 'ILLINOIS';
  return (
    <div className="re-staged re-staged-cert">
      <div className="re-staged-cert-header">
        <div className="re-staged-cert-seal">⚖️</div>
        <div>
          <div className="re-staged-cert-state">STATE OF {state.toUpperCase()}</div>
          <div className="re-staged-cert-title">CERTIFICATE OF DEATH</div>
          <div className="re-staged-cert-sub">Issued by the Office of Vital Records</div>
        </div>
        <div className="re-staged-cert-seal">⚖️</div>
      </div>
      <div className="re-staged-cert-num">Certificate No. &nbsp;<strong>IL-{de.stateOfDeath || 'IL'}-2026-{Math.floor(Math.random()*90000+10000)}</strong></div>
      <div className="re-staged-fields">
        <div className="re-staged-field"><span>Full Legal Name</span><strong>{insured.name || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Date of Birth</span><strong>{insured.dateOfBirth || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Date of Death</span><strong>{insured.dateOfDeath || de.dateOfDeath || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Age at Death</span><strong>{insured.age || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Place of Death</span><strong>{de.stateOfDeath || 'N/A'}, USA</strong></div>
        <div className="re-staged-field"><span>Manner of Death</span><strong>{de.mannerOfDeath || 'Natural'}</strong></div>
        <div className="re-staged-field re-staged-field-full"><span>Cause of Death</span><strong>{de.causeOfDeath || 'Natural Causes'}</strong></div>
        <div className="re-staged-field"><span>Proof Received</span><strong>{de.proofOfDeathDate || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Verification Source</span><strong>{de.verificationSource || 'LexisNexis'}</strong></div>
      </div>
      <div className="re-staged-cert-footer">
        <div className="re-staged-cert-stamp">✅ CERTIFIED COPY</div>
        <div className="re-staged-cert-sig">
          <div className="re-staged-sig-line" />
          <div>State Registrar of Vital Records</div>
        </div>
      </div>
    </div>
  );
};

const DocClaimantStatement = ({ claim }) => {
  const claimant = claim.claimant || {};
  const insured  = claim.insured  || {};
  const policy   = claim.policy   || {};
  return (
    <div className="re-staged re-staged-form">
      <div className="re-staged-form-header">
        <div className="re-staged-form-logo">🌸 Bloom Insurance</div>
        <div>
          <div className="re-staged-form-title">STATEMENT OF CLAIM</div>
          <div className="re-staged-form-sub">Form BLM-1042 (Rev. 01/2026)</div>
        </div>
      </div>
      <div className="re-staged-section-label">SECTION A — POLICY INFORMATION</div>
      <div className="re-staged-fields">
        <div className="re-staged-field"><span>Policy Number</span><strong>{policy.policyNumber || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Insured Name</span><strong>{insured.name || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Date of Death</span><strong>{insured.dateOfDeath || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Policy Type</span><strong>{policy.type || 'Term Life'}</strong></div>
      </div>
      <div className="re-staged-section-label">SECTION B — CLAIMANT INFORMATION</div>
      <div className="re-staged-fields">
        <div className="re-staged-field"><span>Claimant Name</span><strong>{claimant.name || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Relationship</span><strong>{claimant.relationship || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Phone</span><strong>{claimant.contactInfo?.phone || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Email</span><strong>{claimant.contactInfo?.email || 'N/A'}</strong></div>
      </div>
      <div className="re-staged-section-label">SECTION C — CERTIFICATION</div>
      <div className="re-staged-cert-text">
        I hereby certify that all information provided in this claim is true and accurate to the best of my knowledge.
        I understand that any misrepresentation may result in denial of this claim.
      </div>
      <div className="re-staged-sig-row">
        <div><div className="re-staged-sig-line re-staged-sig-signed">{claimant.name}</div><div className="re-staged-sig-label">Claimant Signature</div></div>
        <div><div className="re-staged-sig-line" /><div className="re-staged-sig-label">Date</div></div>
      </div>
      <div className="re-staged-form-stamp">📋 IDP CONFIDENCE: 78% — UNDER REVIEW</div>
    </div>
  );
};

const DocGovernmentID = ({ claim }) => {
  const claimant = claim.claimant || {};
  return (
    <div className="re-staged re-staged-id">
      <div className="re-staged-id-header">
        <div className="re-staged-id-state">🇺🇸 ILLINOIS</div>
        <div className="re-staged-id-type">DRIVER LICENSE</div>
      </div>
      <div className="re-staged-id-body">
        <div className="re-staged-id-photo">👤</div>
        <div className="re-staged-id-fields">
          <div className="re-staged-id-field"><span>LN</span><strong>{(claimant.name || 'JONES').split(' ').pop()}</strong></div>
          <div className="re-staged-id-field"><span>FN</span><strong>{(claimant.name || 'ELIZABETH').split(' ')[0]}</strong></div>
          <div className="re-staged-id-field"><span>DOB</span><strong>03/22/1960</strong></div>
          <div className="re-staged-id-field"><span>EXP</span><strong>03/22/2028</strong></div>
          <div className="re-staged-id-field"><span>DLN</span><strong>J423-5718-9210</strong></div>
          <div className="re-staged-id-field"><span>CLASS</span><strong>D — Non-Commercial</strong></div>
        </div>
      </div>
      <div className="re-staged-id-address">742 Maple Drive, Springfield, IL 62704</div>
      <div className="re-staged-id-footer">✅ IDP Verified — 96% confidence · Name & DOB matched</div>
    </div>
  );
};

const DocW9 = ({ claim }) => {
  const claimant = claim.claimant || {};
  return (
    <div className="re-staged re-staged-irs">
      <div className="re-staged-irs-header">
        <div className="re-staged-irs-dept">Department of the Treasury — Internal Revenue Service</div>
        <div className="re-staged-irs-title">Form W-9</div>
        <div className="re-staged-irs-sub">Request for Taxpayer Identification Number and Certification</div>
      </div>
      <div className="re-staged-fields">
        <div className="re-staged-field re-staged-field-full"><span>1. Name (as shown on income tax return)</span><strong>{claimant.name || 'N/A'}</strong></div>
        <div className="re-staged-field re-staged-field-full"><span>2. Business name (if different)</span><strong>—</strong></div>
        <div className="re-staged-field"><span>3. Federal tax classification</span><strong>☑ Individual / Sole proprietor</strong></div>
        <div className="re-staged-field"><span>4. Exemptions</span><strong>None</strong></div>
        <div className="re-staged-field re-staged-field-full"><span>5. Address</span><strong>742 Maple Drive, Springfield, IL 62704</strong></div>
        <div className="re-staged-field"><span>Part I — SSN</span><strong>***–**–7193</strong></div>
      </div>
      <div className="re-staged-cert-text" style={{ marginTop: 8 }}>
        Under penalties of perjury, I certify that the taxpayer identification number on this form is correct.
      </div>
      <div className="re-staged-sig-row">
        <div><div className="re-staged-sig-line" /><div className="re-staged-sig-label">Signature</div></div>
        <div><div className="re-staged-sig-line" /><div className="re-staged-sig-label">Date</div></div>
      </div>
    </div>
  );
};

const DocAPS = ({ claim }) => {
  const insured = claim.insured || {};
  const de      = claim.deathEvent || {};
  return (
    <div className="re-staged re-staged-medical">
      <div className="re-staged-medical-header">
        <div className="re-staged-medical-title">ATTENDING PHYSICIAN STATEMENT</div>
        <div className="re-staged-medical-sub">Life Insurance Claim — Confidential Medical Information</div>
      </div>
      <div className="re-staged-section-label">PATIENT INFORMATION</div>
      <div className="re-staged-fields">
        <div className="re-staged-field"><span>Patient Name</span><strong>{insured.name || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Date of Birth</span><strong>{insured.dateOfBirth || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Date of Death</span><strong>{insured.dateOfDeath || de.dateOfDeath || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Date Last Seen</span><strong>{de.dateOfDeath || 'N/A'}</strong></div>
      </div>
      <div className="re-staged-section-label">CLINICAL INFORMATION</div>
      <div className="re-staged-fields">
        <div className="re-staged-field re-staged-field-full"><span>Primary Diagnosis</span><strong>{de.causeOfDeath || 'Natural Causes'}</strong></div>
        <div className="re-staged-field re-staged-field-full"><span>Manner of Death</span><strong>{de.mannerOfDeath || 'Natural'}</strong></div>
      </div>
      <div className="re-staged-nigo-banner">⚠️ NIGO — Document quality insufficient. Please resubmit at 300 dpi minimum.</div>
      <div className="re-staged-sig-row">
        <div><div className="re-staged-sig-line" /><div className="re-staged-sig-label">Physician Signature</div></div>
        <div><div className="re-staged-sig-line" /><div className="re-staged-sig-label">NPI Number</div></div>
      </div>
    </div>
  );
};

const DocPolicyExtract = ({ claim }) => {
  const policy = claim.policy || {};
  return (
    <div className="re-staged re-staged-form">
      <div className="re-staged-form-header">
        <div className="re-staged-form-logo">🌸 Bloom Insurance</div>
        <div>
          <div className="re-staged-form-title">POLICY ADMIN SYSTEM EXTRACT</div>
          <div className="re-staged-form-sub">Auto-verified · {new Date().toLocaleDateString()}</div>
        </div>
      </div>
      <div className="re-staged-section-label">POLICY DETAILS</div>
      <div className="re-staged-fields">
        <div className="re-staged-field"><span>Policy Number</span><strong>{policy.policyNumber || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Policy Type</span><strong>{policy.type || 'Term Life'}</strong></div>
        <div className="re-staged-field"><span>Status</span><strong style={{ color: '#1a8a3f' }}>✅ In Force</strong></div>
        <div className="re-staged-field"><span>Issue Date</span><strong>{policy.issueDate || 'N/A'}</strong></div>
        <div className="re-staged-field"><span>Face Amount</span><strong>${(policy.faceAmount || 0).toLocaleString()}</strong></div>
        <div className="re-staged-field"><span>Owner</span><strong>{policy.owner || 'N/A'}</strong></div>
      </div>
      <div className="re-staged-cert-text">
        This is a system-generated extract from the Bloom Insurance Policy Administration System.
        Verified automatically at claim intake.
      </div>
      <div className="re-staged-form-stamp">✅ AUTO-VERIFIED — IDP 99%</div>
    </div>
  );
};

const DocGeneric = ({ docName }) => (
  <div className="re-staged re-staged-form">
    <div className="re-staged-form-header">
      <div className="re-staged-form-logo">📄 Document</div>
      <div>
        <div className="re-staged-form-title">{docName}</div>
        <div className="re-staged-form-sub">Uploaded to claim</div>
      </div>
    </div>
    <div className="re-staged-cert-text">
      This document has been uploaded and is attached to this requirement.
      Switch to the Documents tab to manage or download the file.
    </div>
    <div className="re-staged-form-stamp">📎 Document on record</div>
  </div>
);

const renderStagedDoc = (docName, req, claim) => {
  const n = (docName || '').toLowerCase();
  if (n.includes('death_cert') || n.includes('death certificate')) return <DocDeathCert claim={claim} />;
  if (n.includes('claimant_statement') || n.includes('claim_form')) return <DocClaimantStatement claim={claim} />;
  if (n.includes('drivers_license') || n.includes('dl_') || n.includes('photo_id') || n.includes('govt_id')) return <DocGovernmentID claim={claim} />;
  if (n.includes('w9') || n.includes('w-9') || n.includes('w_9')) return <DocW9 claim={claim} />;
  if (n.includes('aps') || n.includes('physician') || n.includes('medical')) return <DocAPS claim={claim} />;
  if (n.includes('policy') || n.includes('admin_extract') || n.includes('admin extract')) return <DocPolicyExtract claim={claim} />;
  return <DocGeneric docName={docName} />;
};

/* ─────────────────────────────────────────────────────────────
   Requirement Generation — pure function, no state
   Called on mount when claim.requirements is empty (e.g. FNOL claims)
   and also from the manual Generate button.
───────────────────────────────────────────────────────────── */
const buildRequirements = (claim) => {
  const fmtDate  = (d) => new Date(Date.now() + d * 86400000).toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const allParties = claim.parties || [];
  const primaryBene = allParties.find(p => p.role?.toLowerCase().includes('primary'))
    || allParties.find(p => p.role?.toLowerCase().includes('beneficiar'))
    || (claim.claimant?.name ? {
        id: `${claim.id}-claimant`,
        name: claim.claimant.name,
        role: 'Primary Beneficiary',
        phone: claim.claimant.contactInfo?.phone || claim.claimant.phoneNumber || '',
        email: claim.claimant.contactInfo?.email || claim.claimant.emailAddress || '',
      } : null);

  const policy      = claim.policy || {};
  const deathEvent  = claim.deathEvent || {};
  const faceAmt     = policy.faceAmount || policy.coverageAmount || claim.financial?.claimAmount || 0;
  const manner      = (deathEvent.mannerOfDeath || '').toLowerCase();
  const needsAPS    = !manner.includes('accident') && faceAmt > 100000;
  const issueDate   = policy.issueDate ? new Date(policy.issueDate) : null;
  const contestable = issueDate ? issueDate > new Date(Date.now() - 2 * 365 * 86400000) : false;

  const partyReqs = (p, idx) => {
    const pt     = (p.partyType || '').toLowerCase();
    const pid    = p.id;
    const prefix = `gen-p${idx}`;

    if (pt === 'trust') return [
      { id: `${prefix}-1`, level: 'party', partyId: pid, name: 'Trust Agreement', description: 'Full trust agreement with all amendments and schedules', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: `${prefix}-2`, level: 'party', partyId: pid, name: 'Letters of Authority / Trustee Resolution', description: 'Trustee resolution authorizing claim receipt — notarized copy required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: `${prefix}-3`, level: 'party', partyId: pid, name: 'Trust Tax ID (EIN)', description: 'IRS-issued EIN for the trust — required for tax reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: `${prefix}-4`, level: 'party', partyId: pid, name: 'Trustee Government-Issued ID', description: "Authorized trustee's driver's license or passport", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: `${prefix}-5`, level: 'party', partyId: pid, name: 'Trustee IRS Form W-9', description: 'W-9 in trust name with trust EIN', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: `${prefix}-6`, level: 'party', partyId: pid, name: 'Payment Election Form (Trust)', description: 'Wire or check in trust name — bank letter required for ACH', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: { paymentMethod: 'Not selected' } },
      { id: `${prefix}-7`, level: 'party', partyId: pid, name: 'SOS Entity Verification', description: 'Secretary of State — trust registration and good standing', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(14), documents: [], metadata: {} },
    ];

    if (pt === 'estate') return [
      { id: `${prefix}-1`, level: 'party', partyId: pid, name: 'Letters Testamentary / Letters of Administration', description: 'Court-issued authorization for estate administrator — certified copy required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: `${prefix}-2`, level: 'party', partyId: pid, name: 'Estate EIN from IRS', description: 'Employer Identification Number for estate — required for tax reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: `${prefix}-3`, level: 'party', partyId: pid, name: 'Administrator Government-Issued ID', description: "Administrator's driver's license or passport — identity verification", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: `${prefix}-4`, level: 'party', partyId: pid, name: 'Administrator IRS Form W-9', description: 'W-9 in estate name with estate EIN', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(16), documents: [], metadata: {} },
      { id: `${prefix}-5`, level: 'party', partyId: pid, name: 'Payment Election Form (Estate)', description: 'Wire or check in estate name — court authorization may be required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(18), documents: [], metadata: { paymentMethod: 'Not selected' } },
    ];

    if (pt === 'corporate' || pt === 'corp') return [
      { id: `${prefix}-1`, level: 'party', partyId: pid, name: 'Corporate Resolution', description: 'Board resolution authorizing receipt of life insurance proceeds', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: `${prefix}-2`, level: 'party', partyId: pid, name: 'Articles of Incorporation', description: 'Certificate of formation or articles of organization', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: `${prefix}-3`, level: 'party', partyId: pid, name: 'SOS Business Entity Verification', description: 'Secretary of State — entity active, good standing, not dissolved', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: `${prefix}-4`, level: 'party', partyId: pid, name: 'Authorized Signatory Government ID', description: "Authorized officer's driver's license or passport", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: `${prefix}-5`, level: 'party', partyId: pid, name: 'Corporate W-9 (EIN)', description: 'W-9 in corporate name with business EIN — required for 1099-MISC', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: `${prefix}-6`, level: 'party', partyId: pid, name: 'Payment Election Form (Corporate)', description: 'Wire transfer — corporate banking letter with authorized officer signature', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: { paymentMethod: 'Not selected' } },
    ];

    // Individual beneficiary (~10 requirements)
    return [
      { id: `${prefix}-1`,  level: 'party', partyId: pid, name: 'Claimant Statement of Claim',       description: 'Signed Form BLM-1042 — all pages required',                                                   status: idx === 0 ? 'in_review' : 'pending',   isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(7),  documents: idx === 0 ? [{ id: `doc-${prefix}-1`, name: 'claimant_statement_draft.pdf' }] : [], metadata: idx === 0 ? { confidenceScore: 0.78, reason: 'Signature verification in progress — IDP flagged signature area on page 3' } : {} },
      { id: `${prefix}-2`,  level: 'party', partyId: pid, name: 'Government-Issued Photo ID',         description: "Driver's license, passport, or state-issued ID — IDP document scan required",                 status: idx === 0 ? 'in_review' : 'pending',   isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(7),  documents: idx === 0 ? [{ id: `doc-${prefix}-2`, name: 'drivers_license.pdf' }] : [], metadata: idx === 0 ? { confidenceScore: 0.82 } : {} },
      { id: `${prefix}-3`,  level: 'party', partyId: pid, name: 'Identity Verification (SSN Match)', description: '3-point match: name, DOB, address — via LexisNexis',                                          status: idx === 0 ? 'satisfied' : 'pending',   isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(5),  documents: [], metadata: idx === 0 ? { confidenceScore: 0.94 } : {} , satisfiedDate: idx === 0 ? todayStr : null },
      { id: `${prefix}-4`,  level: 'party', partyId: pid, name: 'OFAC Individual Screening',         description: 'Individual SDN and state sanctions search — no adverse matches',                               status: idx === 0 ? 'satisfied' : 'pending',   isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(3),  documents: [], metadata: idx === 0 ? { confidenceScore: 1.0 } : {}, satisfiedDate: idx === 0 ? todayStr : null },
      { id: `${prefix}-5`,  level: 'party', partyId: pid, name: 'Proof of Relationship to Insured',  description: 'Documentation confirming relationship stated on claim — policy records or supporting docs',    status: idx === 0 ? 'satisfied' : 'pending',   isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(5),  documents: [], metadata: idx === 0 ? { confidenceScore: 0.95 } : {}, satisfiedDate: idx === 0 ? todayStr : null },
      { id: `${prefix}-6`,  level: 'party', partyId: pid, name: 'Certified Death Certificate Copy',  description: 'Certified copy submitted by this claimant — cross-matched with claim-level EDRS record',      status: idx === 0 ? 'satisfied' : 'pending',   isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(5),  documents: idx === 0 ? [{ id: `doc-${prefix}-6`, name: 'death_cert_certified.pdf' }] : [], metadata: idx === 0 ? { confidenceScore: 0.97 } : {}, satisfiedDate: idx === 0 ? todayStr : null },
      { id: `${prefix}-7`,  level: 'party', partyId: pid, name: 'IRS Form W-9',                      description: 'W-9 required for 1099-INT reporting on post-mortem interest (PMI) earned during processing',  status: 'pending',                             isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: `${prefix}-8`,  level: 'party', partyId: pid, name: 'Payment Election Form',              description: 'Lump sum vs. settlement option and ACH direct deposit or check selection',                    status: 'pending',                             isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(10), documents: [], metadata: { paymentMethod: 'Not selected' } },
      { id: `${prefix}-9`,  level: 'party', partyId: pid, name: 'Right to Claim / Capacity Check',   description: 'Confirm claimant has legal capacity to receive proceeds — no guardianship or minority issues',  status: 'pending',                             isMandatory: false, pri: 'conditional', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: `${prefix}-10`, level: 'party', partyId: pid, name: 'Address Verification',               description: 'Current mailing address confirmed — required for check issuance and 1099 reporting',          status: idx === 0 ? 'satisfied' : 'pending',   isMandatory: true,  pri: 'mandatory',   dueDate: fmtDate(5),  documents: [], metadata: idx === 0 ? { confidenceScore: 0.91 } : {}, satisfiedDate: idx === 0 ? todayStr : null },
    ];
  };

  const allBenes   = allParties.filter(p => p.role?.toLowerCase().includes('beneficiar'));
  const benesToGen = allBenes.length > 0 ? allBenes : (primaryBene ? [primaryBene] : []);

  return [
    // ─── Claim Level (~10 requirements) ───
    { id: 'gen-1',  level: 'claim', name: 'EDRS / Death Verification',          description: 'Electronic Death Registration System lookup — confirmed via state vital records registry',  status: 'satisfied',  isMandatory: true,  pri: 'mandatory',    satisfiedDate: todayStr, dueDate: fmtDate(-1), documents: [{ id: 'doc-gen-1', name: 'death_cert_edrs.pdf' }], metadata: { confidenceScore: 0.99, verificationSource: 'EDRS / LexisNexis' } },
    { id: 'gen-2',  level: 'claim', name: 'OFAC / Sanctions Screening',          description: 'All parties screened against OFAC SDN list and state sanctions databases — no matches',     status: 'satisfied',  isMandatory: true,  pri: 'mandatory',    satisfiedDate: todayStr, dueDate: fmtDate(-1), documents: [], metadata: { confidenceScore: 1.0, verificationSource: 'OFAC API' } },
    { id: 'gen-3',  level: 'claim', name: 'Duplicate Claim Detection',           description: 'Cross-system check for duplicate claim submissions on this policy and insured',              status: 'satisfied',  isMandatory: true,  pri: 'mandatory',    satisfiedDate: todayStr, dueDate: fmtDate(-1), documents: [], metadata: { confidenceScore: 1.0, verificationSource: 'Claims System' } },
    { id: 'gen-4',  level: 'claim', name: 'SIU Fraud Risk Assessment',           description: 'Automated fraud indicator scoring — claim routed based on risk threshold',                  status: 'satisfied',  isMandatory: true,  pri: 'mandatory',    satisfiedDate: todayStr, dueDate: fmtDate(-1), documents: [], metadata: { confidenceScore: 0.97, verificationSource: 'SIU Engine' } },
    { id: 'gen-5',  level: 'claim', name: 'Death Certificate (Claim Receipt)',   description: 'Certified copy from state vital records — received and logged at claim intake',             status: 'in_review',  isMandatory: true,  pri: 'mandatory',    dueDate: fmtDate(5),  documents: [{ id: 'doc-gen-5', name: 'death_cert_certified.pdf' }], metadata: { confidenceScore: 0.91 } },
    { id: 'gen-6',  level: 'claim', name: 'Claimant Eligibility Review',         description: 'Verify claimant has legal right to file — capacity, standing, and relationship confirmed',  status: 'in_review',  isMandatory: true,  pri: 'mandatory',    dueDate: fmtDate(5),  documents: [], metadata: {} },
    { id: 'gen-7',  level: 'claim', name: 'Claim Form Completeness Check',       description: 'All mandatory fields on FNOL and claim form verified complete and consistent',              status: 'satisfied',  isMandatory: true,  pri: 'mandatory',    satisfiedDate: todayStr, dueDate: fmtDate(-1), documents: [], metadata: { confidenceScore: 0.98 } },
    { id: 'gen-8',  level: 'claim', name: 'Multi-Policy Search',                 description: 'Search all product lines for additional policies insuring the deceased',                     status: 'satisfied',  isMandatory: false, pri: 'conditional',  satisfiedDate: todayStr, dueDate: fmtDate(-1), documents: [], metadata: { confidenceScore: 1.0, verificationSource: 'Policy Admin System' } },
    ...(needsAPS ? [{ id: 'gen-9', level: 'claim', name: 'Attending Physician Statement (APS)', description: `APS required — non-accidental death, face amount ${faceAmt > 0 ? '$' + faceAmt.toLocaleString() : 'over $100K'}`, status: 'nigo', isMandatory: false, pri: 'conditional', dueDate: fmtDate(7), documents: [{ id: 'doc-gen-9', name: 'aps_form_scan.pdf' }], metadata: { confidenceScore: 0.44, reason: '❌ NIGO: Document is illegible — please resubmit at 300 dpi minimum.' } }] : []),

    // ─── Policy Level (~8 requirements) ───
    { id: 'gen-p1', level: 'policy', name: 'Policy In-Force Verification',       description: `${policy.policyType || 'Policy'} confirmed in force at date of death — no lapse or surrender`, status: 'satisfied',  isMandatory: true,  pri: 'mandatory',    satisfiedDate: todayStr, dueDate: fmtDate(3),  documents: [{ id: 'doc-gen-p1', name: 'policy_admin_extract.pdf' }], metadata: { confidenceScore: 0.99, verificationSource: 'Policy Admin System' } },
    { id: 'gen-p2', level: 'policy', name: 'Contestability Period Check',        description: contestable ? '⚠️ Policy may be within 2-year contestability window — investigation required' : 'Policy is past the 2-year contestability window — no further review required', status: contestable ? 'in_review' : 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: contestable ? null : todayStr, dueDate: fmtDate(3), documents: [], metadata: { confidenceScore: 0.99, verificationSource: 'Policy Admin System' } },
    { id: 'gen-p3', level: 'policy', name: 'Beneficiary Designation on File',    description: 'Named beneficiaries confirmed with percentages against current policy records',            status: 'satisfied',  isMandatory: true,  pri: 'mandatory',    satisfiedDate: todayStr, dueDate: fmtDate(3),  documents: [], metadata: { confidenceScore: 0.99, verificationSource: 'Bene Designation Extract' } },
    { id: 'gen-p4', level: 'policy', name: 'Premium Status at Date of Death',    description: 'Confirm premiums were current at date of death — no grace period lapse',                   status: 'satisfied',  isMandatory: true,  pri: 'mandatory',    satisfiedDate: todayStr, dueDate: fmtDate(3),  documents: [], metadata: { confidenceScore: 0.99, verificationSource: 'Policy Admin System' } },
    { id: 'gen-p5', level: 'policy', name: 'Outstanding Policy Loan Check',      description: `Loan balance check — ${policy.loanBalance > 0 ? '$' + Number(policy.loanBalance).toLocaleString() + ' outstanding, will be deducted from benefit' : 'no outstanding loans'}`, status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: todayStr, dueDate: fmtDate(3), documents: [], metadata: { confidenceScore: 0.99 } },
    { id: 'gen-p6', level: 'policy', name: 'Riders & Exclusions Review',         description: 'Review all policy riders and exclusions for applicability to this claim',                   status: 'in_review',  isMandatory: true,  pri: 'mandatory',    dueDate: fmtDate(5),  documents: [], metadata: {} },
    { id: 'gen-p7', level: 'policy', name: 'Coverage Amount Confirmation',       description: `Face amount ${faceAmt > 0 ? '$' + faceAmt.toLocaleString() : ''} confirmed — net benefit calculation pending payment election`, status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: todayStr, dueDate: fmtDate(3), documents: [], metadata: { confidenceScore: 0.99 } },
    { id: 'gen-p8', level: 'policy', name: 'Policy Ownership Verification',      description: 'Confirm owner of record at time of death and any ownership transfer history',              status: 'satisfied',  isMandatory: false, pri: 'conditional',  satisfiedDate: todayStr, dueDate: fmtDate(3),  documents: [], metadata: { confidenceScore: 0.99 } },

    // ─── Per-beneficiary requirements (party-type aware, ~10 per individual) ───
    ...benesToGen.flatMap((p, i) => partyReqs(p, i)),
  ];
};

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
/**
 * For FNOL claims: map EC demo requirements onto the real primary beneficiaries only.
 * - Only primary beneficiaries are shown (insured is deceased, contingent benes excluded)
 * - Remaps EC requirement partyIds → real primary bene IDs by slot index
 * - Drops requirements for the insured, provider, and any EC slot with no real counterpart
 * - Falls back to EC data unchanged if claim has no real parties
 */
const buildFNOLDemoData = (ecData, realParties) => {
  const realNamed = (realParties || []).filter(p =>
    p.role && !p.role.toLowerCase().includes('notifier')
  );
  if (realNamed.length === 0) {
    return { parties: ecData.parties, requirements: ecData.requirements };
  }

  // Only primary beneficiaries — insured is deceased, contingent benes are not active payees
  const realPrimaryBenes = realNamed.filter(p =>
    p.role?.toLowerCase() === 'primary beneficiary'
  );

  const ecInsured  = ecData.parties.find(p => p.role?.toLowerCase() === 'insured');
  const ecBenes    = ecData.parties.filter(p => p.role?.toLowerCase().includes('beneficiar'));
  const ecProvider = ecData.parties.find(p => p.partyType === 'provider');

  // Map EC party ID → real party (null = drop those requirements entirely)
  const idMap = {};
  if (ecInsured)  idMap[ecInsured.id]  = null; // insured is deceased — nothing to collect
  if (ecProvider) idMap[ecProvider.id] = null; // provider not shown in this panel
  ecBenes.forEach((ecBene, i) => {
    idMap[ecBene.id] = i < realPrimaryBenes.length ? realPrimaryBenes[i] : null;
  });

  // Display: only primary benes
  const displayParties = realPrimaryBenes.filter(Boolean);

  // Remap / filter requirements
  const remappedReqs = ecData.requirements
    .filter(r => {
      if (!r.partyId || !(r.partyId in idMap)) return true; // claim-level: always keep
      return idMap[r.partyId] !== null;
    })
    .map(r => {
      if (!r.partyId || !(r.partyId in idMap)) return r;
      const target = idMap[r.partyId];
      return target ? { ...r, partyId: target.id } : r;
    });

  return { parties: displayParties, requirements: remappedReqs };
};

const RequirementsEngine = ({ claim, onGenerateRequirements, onGenerateLetter, onUploadDocument, onWaive }) => {
  const [selectedParty, setSelectedParty] = useState('ALL');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [localReqs, setLocalReqs]         = useState([]);
  const [demoParties, setDemoParties]     = useState(null); // EC parties injected for FNOL claims
  const [toast, setToast]                 = useState(null);
  const [nigoModal, setNigoModal]         = useState(null);
  const [viewDoc, setViewDoc]             = useState(null);  // { docName, reqName, req }
  const [requestedSet, setRequestedSet]   = useState(new Set());
  const [generating, setGenerating]       = useState(false);

  const norm = (s) => {
    const low = (s || 'pending').toLowerCase();
    if (low === 'not_satisfied') return 'nigo';
    return low;
  };

  useEffect(() => {
    if (claim?.requirements?.length) {
      // Pre-populated requirements (mock/showcase claims like CLM-000147)
      setLocalReqs(claim.requirements.map(r => ({
        ...r,
        status: norm(r.status),
        pri: r.isMandatory ? 'mandatory' : 'conditional',
      })));
      setDemoParties(null);
    } else if (claim) {
      // No pre-populated requirements (FNOL/ServiceNow claims) — inject the Ethan Carter demo data
      // mapped onto the real insured + bene parties from this FNOL record
      const ecData = getRequirementsDemoData();
      const { parties: fnolParties, requirements: fnolReqs } = buildFNOLDemoData(ecData, claim.parties || []);
      setLocalReqs(fnolReqs.map(r => ({
        ...r,
        status: norm(r.status),
        pri: r.isMandatory ? 'mandatory' : 'conditional',
      })));
      setDemoParties(fnolParties);
    } else {
      setLocalReqs([]);
      setDemoParties(null);
    }
  }, [claim?.id]);

  if (!claim) return null;

  const reqs = localReqs;

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateReq = (id, patch) =>
    setLocalReqs(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  /* ── Build parties list ── */
  const parties = [
    { id: 'ALL', name: 'All Parties', role: 'Overview', initials: '👥', avCls: 'av-system', rlCls: 'rl-system' }
  ];

  const roleAv = (role = '', partyType = '') => {
    const pt = (partyType || '').toLowerCase();
    if (pt === 'trust')                          return { av: 'av-trust',    rl: 'rl-trust' };
    if (pt === 'estate')                         return { av: 'av-estate',   rl: 'rl-estate' };
    if (pt === 'corporate' || pt === 'corp')     return { av: 'av-corp',     rl: 'rl-corp' };
    const r = role.toLowerCase();
    if (r.includes('beneficiar')) return { av: 'av-bene',     rl: 'rl-bene' };
    if (r.includes('physician') || r.includes('provider')) return { av: 'av-provider', rl: 'rl-provider' };
    if (r.includes('employer'))  return { av: 'av-employer',  rl: 'rl-employer' };
    if (r.includes('insured'))   return { av: 'av-insured',   rl: 'rl-system' };
    return { av: 'av-system', rl: 'rl-system' };
  };

  const partyDotColor = { 'av-bene': '#1B75BB', 'av-insured': '#1a8a3f', 'av-provider': '#0c8a8a', 'av-employer': '#c2610c', 'av-system': '#8c939e', 'av-trust': '#7b3fa0', 'av-estate': '#946b0e', 'av-corp': '#0c7b8a' };

  // Use EC demo parties for FNOL claims (when demoParties is set), otherwise use real claim parties
  // Exclude insured (deceased — nothing to collect) and notifiers
  const namedParties = (demoParties || claim.parties || []).filter(p =>
    p.role &&
    !p.role.toLowerCase().includes('notifier') &&
    p.role.toLowerCase() !== 'insured'
  );

  if (namedParties.length > 0) {
    namedParties.forEach((p, i) => {
      const { av, rl } = roleAv(p.role, p.partyType);
      const initials = (p.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
      parties.push({
        id: p.id || `P${i}`, name: p.name, role: p.role || 'Party', initials,
        avCls: av, rlCls: rl, _partyId: p.id || `P${i}`,
        phone: p.phone, email: p.email,
        partyType: p.partyType,
        allocation: p.allocation,
        authorizedSigner: p.authorizedSigner,
      });
    });
  } else {
    const claimReqs  = reqs.filter(r => r.level === 'claim'  || !r.level);
    const policyReqs = reqs.filter(r => r.level === 'policy');
    const partyReqs  = reqs.filter(r => r.level === 'party');
    if (claimReqs.length)  parties.push({ id: 'CLAIM',  name: 'Claim Level',  role: 'Claim Requirements',  initials: '📋', avCls: 'av-system', rlCls: 'rl-system', _reqs: claimReqs });
    if (policyReqs.length) parties.push({ id: 'POLICY', name: 'Policy Level', role: 'Policy Requirements', initials: '🏛',  avCls: 'av-system', rlCls: 'rl-system', _reqs: policyReqs });
    if (partyReqs.length)  parties.push({ id: 'PARTY',  name: 'Party Level',  role: 'Party Requirements',  initials: '👤', avCls: 'av-bene',   rlCls: 'rl-bene',   _reqs: partyReqs });
  }

  /* ── Per-party requirement resolver ── */
  const getPartyReqs = (partyId) => {
    if (partyId === 'ALL') return reqs;
    const p = parties.find(x => x.id === partyId);
    if (p?._reqs)    return p._reqs;
    if (p?._partyId) return reqs.filter(r => r.partyId === p._partyId || !r.partyId);
    return reqs.filter(r => r.partyId === partyId || !r.partyId);
  };

  /* ── Global stats ── */
  const totalReqs   = reqs.length;
  const satCount    = reqs.filter(r => r.status === 'satisfied').length;
  const pendCount   = reqs.filter(r => r.status === 'pending' || r.status === 'in_review').length;
  const nigoCount   = reqs.filter(r => r.status === 'nigo').length;
  const waivedCount = reqs.filter(r => r.status === 'waived').length;
  const globalPct   = totalReqs ? Math.round(satCount / totalReqs * 100) : 0;

  /* ── Selected party ── */
  const selParty = parties.find(p => p.id === selectedParty);
  const selPr    = getPartyReqs(selectedParty);
  const selSat   = selPr.filter(r => r.status === 'satisfied').length;
  const selPend  = selPr.filter(r => r.status === 'pending' || r.status === 'in_review').length;
  const selNigo  = selPr.filter(r => r.status === 'nigo').length;

  let displayReqs = selPr;
  if (statusFilter !== 'all') displayReqs = displayReqs.filter(r => r.status === statusFilter);

  const grouped = {
    party:  displayReqs.filter(r => r.level === 'party'),
    claim:  displayReqs.filter(r => r.level === 'claim' || !r.level),
    policy: displayReqs.filter(r => r.level === 'policy'),
  };

  const fc = {
    all:       selPr.length,
    pending:   selPr.filter(r => r.status === 'pending').length,
    in_review: selPr.filter(r => r.status === 'in_review').length,
    satisfied: selPr.filter(r => r.status === 'satisfied').length,
    nigo:      selPr.filter(r => r.status === 'nigo').length,
    waived:    selPr.filter(r => r.status === 'waived').length,
  };

  const partyStats = (partyId) => {
    const pr     = getPartyReqs(partyId);
    const sat    = pr.filter(r => r.status === 'satisfied').length;
    const pend   = pr.filter(r => r.status === 'pending' || r.status === 'in_review').length;
    const nigo   = pr.filter(r => r.status === 'nigo').length;
    const waived = pr.filter(r => r.status === 'waived').length;
    const pct    = pr.length ? Math.round(sat / pr.length * 100) : 0;
    const fill   = pct === 100 ? 'var(--re-green)' : nigo > 0 ? 'var(--re-red)' : 'var(--re-blue)';
    return { sat, pend, nigo, waived, pct, total: pr.length, fill };
  };

  /* ── Helpers ── */
  const sIcon  = s => ({ pending: '⏳', in_review: '🔍', satisfied: '✅', nigo: '❌', waived: '➖' }[s] || '');
  const sLabel = s => ({ pending: 'Pending', in_review: 'In Review', satisfied: 'Satisfied', nigo: 'NIGO', waived: 'Waived' }[s] || s);

  const dueTag = (req) => {
    if (!req.dueDate) return null;
    const raw = req.dueDate.includes('T') ? req.dueDate : req.dueDate + 'T00:00:00';
    const d   = Math.ceil((new Date(raw) - new Date()) / 86400000);
    if (req.status === 'satisfied' || req.status === 'waived')
      return <span className="rc-meta-item">📅 {req.dueDate.split('T')[0]}</span>;
    if (d < 0)  return <span className="rc-meta-item overdue">🚨 {Math.abs(d)}d overdue</span>;
    if (d <= 3) return <span className="rc-meta-item soon">⚠️ {d}d left</span>;
    return <span className="rc-meta-item">📅 {req.dueDate.split('T')[0]} · {d}d</span>;
  };

  const confTag = (req) => {
    const conf = req.metadata?.confidenceScore;
    if (!conf) return null;
    const p   = Math.round(conf * 100);
    const cls = p >= 90 ? 'rc-conf-high' : p >= 70 ? 'rc-conf-med' : 'rc-conf-low';
    return (
      <span className={`rc-conf ${cls}`}>
        IDP <span className="rc-conf-bar"><span className="rc-conf-fill" style={{ width: `${p}%` }} /></span> {p}%
      </span>
    );
  };

  /* ── Actions ── */
  const handleApprove = (req) => {
    updateReq(req.id, { status: 'satisfied', satisfiedDate: new Date().toISOString().split('T')[0] });
    showToast(`✅ "${req.name}" approved`, 'success');
    if (statusFilter === 'in_review') setStatusFilter('all');
  };

  const handleNIGO = (req) => setNigoModal({ reqId: req.id, reqName: req.name, reason: '' });

  const confirmNIGO = () => {
    const existing = reqs.find(r => r.id === nigoModal.reqId);
    updateReq(nigoModal.reqId, {
      status: 'nigo',
      metadata: { ...(existing?.metadata || {}), reason: nigoModal.reason || 'Does not meet requirements — please resubmit' },
    });
    showToast(`❌ "${nigoModal.reqName}" marked NIGO`, 'error');
    setNigoModal(null);
    if (statusFilter === 'in_review') setStatusFilter('all');
  };

  const handleWaive = (req) => {
    updateReq(req.id, { status: 'waived' });
    showToast(`➖ "${req.name}" waived`, 'info');
    if (onWaive) onWaive(req);
  };

  const handleRequest = (req) => {
    setRequestedSet(prev => new Set([...prev, req.id]));
    showToast(`📧 Request sent for "${req.name}"`, 'success');
  };

  const handleView = (doc, req) => setViewDoc({ docName: doc.name, reqName: req.name, req });

  const handleUpload = (req) => {
    if (onUploadDocument) onUploadDocument(req);
    showToast(`📤 Opening upload for "${req.name}"`, 'info');
  };

  const handleGenerateLetter = () => {
    showToast('📧 NIGO deficiency letter queued for generation', 'info');
    if (onGenerateLetter) onGenerateLetter();
  };

  /* ── Generate requirements (manual button — adds animation + toast) ── */
  const handleGenerate = async () => {
    if (reqs.length > 0) {
      showToast('Requirements already generated', 'info');
      return;
    }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1400));
    const ecData = getRequirementsDemoData();
    const { parties: fnolParties, requirements: fnolReqs } = buildFNOLDemoData(ecData, claim.parties || []);
    const generated = fnolReqs.map(r => ({
      ...r, status: norm(r.status), pri: r.isMandatory ? 'mandatory' : 'conditional',
    }));
    setLocalReqs(generated);
    setDemoParties(fnolParties);
    setGenerating(false);
    setStatusFilter('all');
    showToast(`✨ ${generated.length} requirements generated by Decision Table Engine`, 'success');
    if (onGenerateRequirements) onGenerateRequirements();
  };

  /* ── Render card ── */
  const renderCard = (req, idx, showPartyTag = false) => {
    const docs        = req.documents || [];
    const wasRequested = requestedSet.has(req.id);
    const tagParty    = showPartyTag ? parties.find(p => p._partyId === req.partyId) : null;

    return (
      <div key={req.id || idx} className={`req-card rc-${req.status}`} style={{ animationDelay: `${idx * 0.04}s` }}>
        <div className="rc-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="rc-name">{req.name}</div>
            {req.description && <div className="rc-desc">{req.description}</div>}
          </div>
          <span className={`rc-badge b-${req.status}`}>{sIcon(req.status)} {sLabel(req.status)}</span>
        </div>

        <div className="rc-meta">
          {tagParty && (
            <span className="rc-party-tag">
              <span className="rc-party-dot" style={{ background: partyDotColor[tagParty.avCls] || '#8c939e' }} />
              {tagParty.name}
            </span>
          )}
          <span className={`rc-priority ${req.pri === 'mandatory' ? 'pri-m' : 'pri-c'}`}>{req.pri}</span>
          {dueTag(req)}
          {docs.length > 0
            ? <span className="rc-source" onClick={() => handleView(docs[0], req)}>📎 {docs[0].name}</span>
            : <span style={{ fontSize: '11px', color: 'var(--re-text-3)', fontStyle: 'italic' }}>No document attached</span>}
          {confTag(req)}
          {req.satisfiedDate && <span className="rc-meta-item">✅ {req.satisfiedDate}</span>}
        </div>

        {req.metadata?.reason && <div className="rc-note">{req.metadata.reason}</div>}

        <div className="rc-actions">
          {req.status !== 'satisfied' && req.status !== 'waived' && (
            <button className="rc-btn primary" onClick={() => handleUpload(req)}>📤 Upload</button>
          )}
          {req.status !== 'satisfied' && req.status !== 'waived' && (
            <button className={`rc-btn${wasRequested ? ' success' : ''}`} onClick={() => handleRequest(req)} disabled={wasRequested}>
              {wasRequested ? '✅ Requested' : '📧 Request'}
            </button>
          )}
          {docs.length > 0 && (
            <button className="rc-btn" onClick={() => handleView(docs[0], req)}>👁 View</button>
          )}
          {req.status === 'in_review' && (
            <>
              <button className="rc-btn success" onClick={() => handleApprove(req)}>✅ Approve</button>
              <button className="rc-btn danger"  onClick={() => handleNIGO(req)}>❌ NIGO</button>
            </>
          )}
          {!req.isMandatory && req.status !== 'satisfied' && req.status !== 'waived' && (
            <button className="rc-btn" onClick={() => handleWaive(req)}>➖ Waive</button>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (icon, label, sReqs, showPartyTags = false) => {
    if (!sReqs.length) return null;
    const sat = sReqs.filter(r => r.status === 'satisfied').length;
    return (
      <div className="req-section">
        <div className="req-section-header">
          <span className="rsh-icon">{icon}</span>
          <span className="rsh-label">{label}</span>
          <span className="rsh-count">{sat}/{sReqs.length}</span>
          <div className="rsh-line" />
        </div>
        {sReqs.map((r, i) => renderCard(r, i, showPartyTags))}
      </div>
    );
  };

  const isAllView   = selectedParty === 'ALL';
  const hasContent  = displayReqs.length > 0;

  /* ── Render ── */
  return (
    <div className="re-split">

      {/* LEFT: PARTY PANEL */}
      <div className="re-party-panel">
        <div className="re-pp-header">
          <div>
            <div className="re-pp-title">👥 Claim Parties</div>
            <div className="re-pp-subtitle">Click a party to filter requirements</div>
          </div>
          <button className="re-gen-sm" onClick={handleGenerate} disabled={generating || reqs.length > 0}
            title={reqs.length > 0 ? 'Already generated' : 'Run Decision Table Engine'}>
            {generating ? '⏳' : '✨'} {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        <div className="re-pp-progress">
          <div className="re-pp-prog-track">
            <div className="re-pp-prog-fill" style={{ width: `${globalPct}%` }} />
          </div>
          <div className="re-pp-prog-stats">
            {satCount    > 0 && <span className="re-pp-stat re-stat-sat">✅ {satCount}</span>}
            {pendCount   > 0 && <span className="re-pp-stat re-stat-pend">⏳ {pendCount}</span>}
            {nigoCount   > 0 && <span className="re-pp-stat re-stat-nigo">❌ {nigoCount}</span>}
            {waivedCount > 0 && <span className="re-pp-stat re-stat-waived">➖ {waivedCount}</span>}
            {totalReqs === 0  && <span className="re-pp-stat re-stat-pend">No requirements yet</span>}
          </div>
        </div>

        <div className="re-pp-list">
          {parties.map(p => {
            const s      = partyStats(p.id);
            const active = selectedParty === p.id;
            return (
              <div key={p.id} className={`re-pp-card${active ? ' active' : ''}`}
                onClick={() => { setSelectedParty(p.id); setStatusFilter('all'); }}>
                <div className="re-pp-card-top">
                  <div className={`re-pp-avatar ${p.avCls}`}>{p.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <div className="re-pp-name">{p.name}</div>
                      {p.allocation != null && (
                        <span className="re-pp-alloc">{p.allocation}%</span>
                      )}
                    </div>
                    <span className={`re-pp-role ${p.rlCls}`}>{p.role}</span>
                    {p.authorizedSigner && (
                      <div className="re-pp-auth-signer">✍ {p.authorizedSigner}</div>
                    )}
                  </div>
                </div>
                {s.total > 0 && (
                  <>
                    <div className="re-pp-card-bottom">
                      <div className="re-pp-mini-bar">
                        <div className="re-pp-mini-fill" style={{ width: `${s.pct}%`, background: s.fill }} />
                      </div>
                      <div className="re-pp-mini-pct">{s.sat}/{s.total}</div>
                    </div>
                    <div className="re-pp-mini-counts">
                      {s.sat    > 0 && <span className="re-pp-mc re-stat-sat">✅{s.sat}</span>}
                      {s.pend   > 0 && <span className="re-pp-mc re-stat-pend">⏳{s.pend}</span>}
                      {s.nigo   > 0 && <span className="re-pp-mc re-stat-nigo">❌{s.nigo}</span>}
                      {s.waived > 0 && <span className="re-pp-mc re-stat-waived">➖{s.waived}</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: REQUIREMENTS PANEL */}
      <div className="re-req-panel">

        {/* Header */}
        <div className="re-rp-header">
          <div className={`re-rp-avatar ${selParty?.avCls || 'av-system'}`}>{selParty?.initials || '👥'}</div>
          <div className="re-rp-info">
            <div className="re-rp-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selParty?.name || 'All Parties'}
              {selParty?.allocation != null && (
                <span className="re-pp-alloc">{selParty.allocation}%</span>
              )}
            </div>
            <div className="re-rp-role">
              {selParty?.role}
              {selParty?.authorizedSigner && <> · ✍ {selParty.authorizedSigner}</>}
              {selParty?.phone && <> · {selParty.phone}</>}
              {selParty?.email && <> · {selParty.email}</>}
              {!selParty?.phone && !selParty?.email && !selParty?.authorizedSigner && <> · {selPr.length} requirement{selPr.length !== 1 ? 's' : ''}</>}
            </div>
          </div>
          <div className="re-rp-stats">
            <div className="re-rp-stat">
              <div className="re-rp-stat-v" style={{ color: 'var(--re-green)' }}>{selSat}</div>
              <div className="re-rp-stat-l">Satisfied</div>
            </div>
            <div className="re-rp-stat">
              <div className="re-rp-stat-v" style={{ color: 'var(--re-yellow)' }}>{selPend}</div>
              <div className="re-rp-stat-l">Pending</div>
            </div>
            {selNigo > 0 && (
              <div className="re-rp-stat re-stat-nigo-border">
                <div className="re-rp-stat-v" style={{ color: 'var(--re-red)' }}>{selNigo}</div>
                <div className="re-rp-stat-l">NIGO</div>
              </div>
            )}
          </div>
          {nigoCount > 0 && (
            <button className="rc-btn" style={{ marginLeft: 8, flexShrink: 0 }} onClick={handleGenerateLetter}>
              📧 Generate Letter
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="re-rp-filter-bar">
          {[
            { key: 'all',       label: 'All',          count: fc.all },
            { key: 'pending',   label: '⏳ Pending',    count: fc.pending },
            { key: 'in_review', label: '🔍 In Review',  count: fc.in_review },
            { key: 'satisfied', label: '✅ Satisfied',  count: fc.satisfied },
            ...(fc.nigo   > 0 ? [{ key: 'nigo',   label: '❌ NIGO',   count: fc.nigo }]   : []),
            ...(fc.waived > 0 ? [{ key: 'waived', label: '➖ Waived', count: fc.waived }] : []),
          ].map(f => (
            <button key={f.key} className={`rf-btn${statusFilter === f.key ? ' active' : ''}`}
              onClick={() => setStatusFilter(f.key)}>
              {f.label} <span className="ct">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="re-rp-body">
          {!hasContent ? (
            totalReqs === 0 ? (
              <div className="re-empty">
                <div className="re-empty-icon">{generating ? '⏳' : '📋'}</div>
                <p>{generating ? 'Running Decision Table Engine…' : 'No requirements generated yet'}</p>
                {!generating && (
                  <button className="re-gen-lg" onClick={handleGenerate}>✨ Generate Requirements</button>
                )}
              </div>
            ) : (
              <div className="re-empty">
                <div className="re-empty-icon">🔍</div>
                <p>No requirements match this filter</p>
                <button className="re-gen-lg" onClick={() => setStatusFilter('all')}>Show all</button>
              </div>
            )
          ) : (
            <>
              {renderSection('👤', 'Party Level Requirements',  grouped.party,  isAllView)}
              {renderSection('📋', 'Claim Level Requirements',  grouped.claim,  isAllView)}
              {renderSection('🏛',  'Policy Level Requirements', grouped.policy, isAllView)}
            </>
          )}
        </div>
      </div>

      {/* NIGO REASON MODAL */}
      {nigoModal && (
        <div className="re-overlay" onClick={() => setNigoModal(null)}>
          <div className="re-modal" onClick={e => e.stopPropagation()}>
            <div className="re-modal-header">
              <span>❌ Mark as NIGO</span>
              <button className="re-modal-close" onClick={() => setNigoModal(null)}>✕</button>
            </div>
            <div className="re-modal-body">
              <p className="re-modal-req-name">"{nigoModal.reqName}"</p>
              <label className="re-modal-label">Reason for NIGO</label>
              <textarea className="re-modal-textarea" rows={3} autoFocus
                placeholder="e.g. Missing signature, illegible scan, wrong form version…"
                value={nigoModal.reason}
                onChange={e => setNigoModal(prev => ({ ...prev, reason: e.target.value }))} />
            </div>
            <div className="re-modal-footer">
              <button className="rc-btn" onClick={() => setNigoModal(null)}>Cancel</button>
              <button className="rc-btn danger" onClick={confirmNIGO}>❌ Confirm NIGO</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DOCUMENT MODAL */}
      {viewDoc && (
        <div className="re-overlay" onClick={() => setViewDoc(null)}>
          <div className="re-modal re-modal-doc" onClick={e => e.stopPropagation()}>
            <div className="re-modal-header">
              <span>📎 {viewDoc.docName}</span>
              <button className="re-modal-close" onClick={() => setViewDoc(null)}>✕</button>
            </div>
            <div className="re-modal-doc-body">
              {renderStagedDoc(viewDoc.docName, viewDoc.req, claim)}
            </div>
            <div className="re-modal-footer">
              <span style={{ fontSize: 11, color: 'var(--re-text-3)', flex: 1 }}>
                Requirement: {viewDoc.reqName}
              </span>
              <button className="rc-btn" onClick={() => setViewDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={`re-toast re-toast-${toast.type}`}>{toast.msg}</div>}

    </div>
  );
};

export default RequirementsEngine;
