/**
 * FNOL Party Portal — Life Insurance Claim Submission
 * Developer Requirements Specification v1.0 — February 2026
 *
 * 10-step wizard:
 *  1. Claim Type & Welcome
 *  2. Beneficiary Information
 *  3. Your Contact Information
 *  4. SSN & Taxpayer Certification
 *  5. About Your Loved One
 *  6. Upload Documentation
 *  7. About Your Loss
 *  8. Claim Payment Preferences
 *  9. Review & Electronic Signature
 * 10. Submission Confirmation
 */

import { useState, useEffect, useRef } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcTextInput,
  DxcSelect,
  DxcDateInput,
  DxcTextarea,
  DxcButton,
  DxcRadioGroup,
  DxcFileInput,
  DxcAlert,
  DxcProgressBar,
  DxcInset,
  DxcBadge,
  DxcCheckbox,
  DxcDialog,
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import { useApp } from '../../contexts/AppContext';
import './IntakeForms.css';

// ─── Configuration ────────────────────────────────────────────────────────────

const STEP_TITLES = [
  'Claim Type & Welcome',
  'Beneficiary Information',
  'Your Contact Information',
  'SSN & Taxpayer Certification',
  'About Your Loved One',
  'Upload Documentation',
  'About Your Loss',
  'Payment Preferences',
  'Review & Sign',
  'Confirmation',
];

const STEP_ICONS = [
  'home', 'person', 'contact_mail', 'assignment', 'favorite',
  'upload_file', 'description', 'payment', 'rate_review', 'check_circle',
];

const TOTAL_STEPS = 10;
const DRAFT_KEY = 'fnol_draft_v2';
const SESSION_WARN_MS = 13 * 60 * 1000;  // warn at 13 min
const SESSION_EXPIRE_MS = 15 * 60 * 1000; // expire at 15 min

const SYMPATHY_MESSAGE =
  "We understand that losing someone you love is one of the most difficult experiences " +
  "you and your family will face. We are here to help make this process as simple and as " +
  "painless as possible. Our goal is to ensure that you receive all benefits to which you " +
  "are entitled, as quickly as we can.";

const TAXPAYER_CERT_TEXT =
  "Under Penalties of Perjury, I certify that: (1) My Social Security Number shown on " +
  "this form is correct, (2) My Backup Tax Withholding status shown on this form is " +
  "correct, and (3) I am exempt from Foreign Account Tax Compliance Act (FATCA) reporting.";

const STATE_DISCLOSURES = {
  IL: 'Under Illinois law, interest accrues on death benefits from the date of death. Claims are typically adjudicated within 30 days of receipt of all required documentation. Delays may occur when additional information is required for policy verification, death investigation, or when the claim is contested.',
  CA: 'Under California law, insurers must pay or deny a death claim within 30 days of receiving proof of death and all documentation required by the insurer. If a claim is not paid within this period, interest accrues from the date of death.',
  NY: 'New York Insurance Law requires that all life insurance death claims be paid or denied within 30 days after receipt of due proof of death. Interest is payable from the date of death if payment is delayed beyond 30 days.',
  TX: 'Texas Insurance Code requires insurers to accept or reject a life insurance claim within 15 business days of receiving a complete claim. If accepted, payment must follow within 5 business days.',
  FL: 'Under Florida law, claims must be paid within 30 days of receipt of satisfactory proof of death. Interest at 10% per year accrues on unpaid amounts after this period.',
};

const FRAUD_WARNINGS = {
  IL: 'Any person who knowingly presents a false or fraudulent claim for payment of a loss or benefit or who knowingly presents false information in an application for insurance is guilty of a crime and may be subject to fines and confinement in prison.',
  CA: 'For your protection, California law requires the following to appear on this form: Any person who knowingly presents a false or fraudulent claim for the payment of a loss is guilty of a crime and may be subject to fines and confinement in state prison.',
  NY: 'Any person who knowingly and with intent to defraud any insurance company or other person files an application for insurance or statement of claim containing any materially false information, or conceals for the purpose of misleading information concerning any fact material thereto, commits a fraudulent insurance act, which is a crime and shall also be subject to a civil penalty.',
  TX: 'Any person who knowingly presents a false or fraudulent claim for the payment of a loss is guilty of a crime and may be subject to fines and confinement in state prison.',
  FL: 'Any person who knowingly and with intent to injure, defraud, or deceive any insurer files a statement of claim or an application containing any false, incomplete, or misleading information is guilty of a felony of the third degree.',
  default: 'Any person who knowingly and with intent to injure, defraud, or deceive any insurer files a statement of claim containing any false, incomplete, or misleading information is guilty of insurance fraud, which is a crime, and may also be subject to civil penalties.',
};

const US_STATES = [
  { label: 'Alabama', value: 'AL' }, { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' }, { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' }, { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' }, { label: 'Delaware', value: 'DE' },
  { label: 'District of Columbia', value: 'DC' }, { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' }, { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' }, { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' }, { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' }, { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' }, { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' }, { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' }, { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' }, { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' }, { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' }, { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' }, { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' }, { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' }, { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' }, { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' }, { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' }, { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' }, { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' }, { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' }, { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' }, { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** ABA checksum for 9-digit routing numbers */
const validateABA = (r) => {
  if (!/^\d{9}$/.test(r)) return false;
  const d = r.split('').map(Number);
  return (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10 === 0;
};

/** Show •••-••-XXXX for a 9-char raw SSN string */
const displaySSN = (raw) => {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return `•••-••-${digits.slice(-4)}`;
};

/** Format a raw digit string as xxx-xx-xxxx */
const formatSSNInput = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

const today = () => new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

// ─── Progress Sidebar ─────────────────────────────────────────────────────────

const ProgressSidebar = ({ currentStep, completedSteps, formData, onEditStep }) => {
  const getBeneSummary = () => {
    const parts = [formData.beneficiaryFirstName, formData.beneficiaryLastName].filter(Boolean);
    return parts.length ? parts.join(' ') : null;
  };
  const getContactSummary = () => formData.contactEmail || null;
  const getDeceasedSummary = () => {
    const parts = [formData.deceasedFirstName, formData.deceasedLastName].filter(Boolean);
    return parts.length ? parts.join(' ') : null;
  };
  const getLossSummary = () => {
    const map = { illness_natural: 'Illness/Natural', accident_injury: 'Accident/Injury', other: 'Other', unknown: "Don't Know" };
    return formData.causeOfDeathCategory ? map[formData.causeOfDeathCategory] : null;
  };
  const getPaymentSummary = () => {
    if (!formData.paymentMethod) return null;
    return formData.paymentMethod === 'direct_deposit' ? 'Direct Deposit' : 'Check by Mail';
  };

  const summaries = [
    null,
    getBeneSummary(),
    getContactSummary(),
    formData.beneficiarySSN ? `SSN ending ${formData.beneficiarySSN.slice(-4)}` : formData.nonUSResident ? 'Non-US Resident' : null,
    getDeceasedSummary(),
    completedSteps.has(6) ? 'Documents uploaded' : null,
    getLossSummary(),
    getPaymentSummary(),
    completedSteps.has(9) ? 'Signed' : null,
    null,
  ];

  return (
    <div style={{ position: 'sticky', top: '24px' }}>
      <DxcContainer
        padding="var(--spacing-padding-m)"
        style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
            YOUR PROGRESS
          </DxcTypography>
          <DxcProgressBar
            value={Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100)}
            showValue={false}
          />
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
            Step {currentStep} of {TOTAL_STEPS}
          </DxcTypography>
        </DxcFlex>

        <div style={{ marginTop: '16px' }}>
          {STEP_TITLES.map((title, idx) => {
            const stepNum = idx + 1;
            const isDone = completedSteps.has(stepNum);
            const isActive = stepNum === currentStep;
            const isPending = !isDone && !isActive;

            return (
              <div
                key={stepNum}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '8px 6px', borderRadius: '4px',
                  backgroundColor: isActive ? 'var(--color-bg-primary-lightest)' : 'transparent',
                  borderLeft: isActive ? '3px solid #1B75BB' : '3px solid transparent',
                  marginBottom: '2px',
                }}
              >
                {/* Step indicator */}
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {isDone ? (
                    <span className="material-icons" style={{ fontSize: '16px', color: '#37A526' }}>check_circle</span>
                  ) : isActive ? (
                    <span className="material-icons" style={{ fontSize: '16px', color: '#1B75BB' }}>radio_button_checked</span>
                  ) : (
                    <span className="material-icons" style={{ fontSize: '16px', color: '#BDBDBD' }}>radio_button_unchecked</span>
                  )}
                </div>

                {/* Step info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <DxcTypography
                    fontSize="font-scale-01"
                    fontWeight={isActive ? 'font-weight-semibold' : 'font-weight-regular'}
                    color={isPending ? 'var(--color-fg-neutral-stronger)' : isActive ? 'var(--color-fg-primary-stronger)' : 'var(--color-fg-neutral-dark)'}
                  >
                    {title}
                  </DxcTypography>
                  {isDone && summaries[idx] && (
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                      {summaries[idx]}
                    </DxcTypography>
                  )}
                </div>

                {/* Edit link for completed steps */}
                {isDone && currentStep < TOTAL_STEPS && (
                  <button
                    onClick={() => onEditStep(stepNum)}
                    title={`Edit ${title}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', flexShrink: 0 }}
                  >
                    <span className="material-icons" style={{ fontSize: '14px', color: '#1B75BB' }}>edit</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </DxcContainer>

      {/* Help Panel */}
      <DxcContainer
        padding="var(--spacing-padding-m)"
        style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: '8px', marginTop: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ fontSize: '16px', color: '#1B75BB' }}>help_outline</span>
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
              NEED HELP?
            </DxcTypography>
          </DxcFlex>
          <DxcTypography fontSize="font-scale-01">
            Call us: <strong>1-800-555-0100</strong>
          </DxcTypography>
          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-strong)">
            Mon – Fri, 8:00 AM – 5:00 PM ET
          </DxcTypography>
          <a href="#faq" style={{ fontSize: '13px', color: '#1B75BB', textDecoration: 'underline' }}>
            Frequently Asked Questions
          </a>
        </DxcFlex>
      </DxcContainer>
    </div>
  );
};

// ─── Inline field row helper ───────────────────────────────────────────────────

const FieldRow = ({ label, value }) => (
  <DxcFlex gap="var(--spacing-gap-s)" style={{ padding: '4px 0', borderBottom: '1px solid var(--color-border-neutral-medium)' }}>
    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)" style={{ minWidth: '160px' }}>{label}</DxcTypography>
    <DxcTypography fontSize="font-scale-01">{value || '—'}</DxcTypography>
  </DxcFlex>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const IntakeForms = () => {
  const { productLine } = useApp();
  const isPC = productLine === 'pc';

  // ── Auth gate (preserved, out of scope per spec) ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '' });
  const [authError, setAuthError] = useState(null);

  // ── Wizard state ──
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [validationErrors, setValidationErrors] = useState({});

  // ── Form data ──
  const [formData, setFormData] = useState({
    // Step 1
    claimReason: '',
    // Step 2
    beneficiaryFirstName: '', beneficiaryMiddleName: '', beneficiaryLastName: '',
    beneficiaryNameChanged: false, beneficiaryDOB: '', relationship: '',
    // Step 3
    contactEmail: '', contactPhone: '', contactCountry: 'United States of America',
    contactStreet: '', contactCity: '', contactState: '', contactZip: '',
    // Step 4
    beneficiarySSN: '', nonUSResident: false, backupWithholding: '',
    taxSignatureName: '', taxSignatureDate: today(),
    // Step 5
    deceasedFirstName: '', deceasedMiddleName: '', deceasedLastName: '',
    deceasedDOB: '', dateOfDeath: '', deceasedSSN: '', deceasedPolicyNumber: '',
    // Step 6 (file arrays — stored as names for display, actual uploads via DxcFileInput)
    deathCertUploaded: false, govtIdUploaded: false, nameChangeUploaded: false,
    // Step 7
    causeOfDeathCategory: '', deathOutsideUSA: '',
    // Step 8
    settlementType: '', paymentMethod: '',
    routingNumber: '', confirmRoutingNumber: '',
    accountNumber: '', confirmAccountNumber: '',
    // Step 9
    fraudWarningAgreed: false, certificationAgreed: false,
    signatureDate: today(),
  });

  // ── Submission ──
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fnolNumber, setFnolNumber] = useState(null);

  // ── Session timeout ──
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const warnTimer = useRef(null);
  const expireTimer = useRef(null);

  // ── Draft resume ──
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // ── Detect saved draft on mount ──
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      setDraftAvailable(true);
      setShowDraftDialog(true);
    }
  }, []);

  // ── Reset session timers on any keypress/click ──
  const resetTimers = () => {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (expireTimer.current) clearTimeout(expireTimer.current);
    setShowTimeoutWarning(false);
    warnTimer.current = setTimeout(() => setShowTimeoutWarning(true), SESSION_WARN_MS);
    expireTimer.current = setTimeout(() => { handleSaveForLater(true); setShowTimeoutWarning(false); }, SESSION_EXPIRE_MS);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    resetTimers();
    const events = ['keydown', 'click', 'mousemove', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimers, { passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimers));
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (expireTimer.current) clearTimeout(expireTimer.current);
    };
  }, [isAuthenticated]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validateStep = (s) => {
    const e = {};
    const d = formData;

    if (s === 1) {
      if (!d.claimReason) e.claimReason = 'Please select a claim type.';
    }
    if (s === 2) {
      if (!d.beneficiaryFirstName?.trim()) e.beneficiaryFirstName = 'First name is required.';
      if (!d.beneficiaryLastName?.trim()) e.beneficiaryLastName = 'Last name is required.';
      if (!d.beneficiaryDOB) e.beneficiaryDOB = 'Date of birth is required.';
      if (!d.relationship) e.relationship = 'Please select your relationship.';
      if (d.beneficiaryDOB) {
        const age = (new Date() - new Date(d.beneficiaryDOB)) / (365.25 * 24 * 3600 * 1000);
        if (isNaN(age) || age < 18) e.beneficiaryDOB = 'You must be at least 18 years old.';
      }
    }
    if (s === 3) {
      if (!d.contactEmail?.trim()) e.contactEmail = 'Email address is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contactEmail)) e.contactEmail = 'Enter a valid email address.';
      if (!d.contactPhone?.trim()) e.contactPhone = 'Phone number is required.';
      if (!d.contactStreet?.trim()) e.contactStreet = 'Street address is required.';
      if (!d.contactCity?.trim()) e.contactCity = 'City is required.';
      if (d.contactCountry === 'United States of America' && !d.contactState) e.contactState = 'State is required.';
      if (!d.contactZip?.trim()) e.contactZip = 'ZIP / Postal code is required.';
      else if (d.contactCountry === 'United States of America' && !/^\d{5}(-\d{4})?$/.test(d.contactZip)) e.contactZip = 'Enter a valid ZIP code (12345 or 12345-6789).';
    }
    if (s === 4) {
      if (!d.nonUSResident && !d.beneficiarySSN?.replace(/\D/g, '').length) e.beneficiarySSN = 'SSN is required. Check the box below if you are not a U.S. resident.';
      else if (!d.nonUSResident && d.beneficiarySSN?.replace(/\D/g, '').length !== 9) e.beneficiarySSN = 'Enter all 9 digits of your SSN.';
      if (!d.backupWithholding) e.backupWithholding = 'Please select your backup withholding status.';
      if (!d.taxSignatureName?.trim()) e.taxSignatureName = 'Your electronic signature is required.';
    }
    if (s === 5) {
      if (!d.deceasedFirstName?.trim()) e.deceasedFirstName = 'First name is required.';
      if (!d.deceasedLastName?.trim()) e.deceasedLastName = 'Last name is required.';
      if (!d.deceasedDOB) e.deceasedDOB = 'Date of birth is required.';
      if (!d.dateOfDeath) e.dateOfDeath = 'Date of death is required.';
      if (d.deceasedDOB && d.dateOfDeath && new Date(d.dateOfDeath) < new Date(d.deceasedDOB)) e.dateOfDeath = 'Date of death cannot be before date of birth.';
      if (d.dateOfDeath && new Date(d.dateOfDeath) > new Date()) e.dateOfDeath = 'Date of death cannot be in the future.';
    }
    // Step 6: documents not required
    if (s === 7) {
      if (!d.causeOfDeathCategory) e.causeOfDeathCategory = 'Please select a cause of death.';
      if (!d.deathOutsideUSA) e.deathOutsideUSA = 'Please answer this question.';
    }
    if (s === 8) {
      if (!d.settlementType) e.settlementType = 'Please select a settlement type.';
      if (!d.paymentMethod) e.paymentMethod = 'Please select a payment method.';
      if (d.paymentMethod === 'direct_deposit') {
        if (!d.routingNumber) e.routingNumber = 'Routing number is required.';
        else if (!validateABA(d.routingNumber)) e.routingNumber = 'Enter a valid 9-digit ABA routing number.';
        if (d.routingNumber !== d.confirmRoutingNumber) e.confirmRoutingNumber = 'Routing numbers do not match.';
        if (!d.accountNumber?.trim()) e.accountNumber = 'Account number is required.';
        else if (d.accountNumber.replace(/\D/g, '').length > 17) e.accountNumber = 'Account number must be 17 digits or fewer.';
        if (d.accountNumber !== d.confirmAccountNumber) e.confirmAccountNumber = 'Account numbers do not match.';
      }
    }
    if (s === 9) {
      if (!d.fraudWarningAgreed) e.fraudWarningAgreed = 'You must acknowledge the fraud warning to continue.';
      if (!d.certificationAgreed) e.certificationAgreed = 'You must confirm the certification to continue.';
    }
    return e;
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleContinue = () => {
    // Skip past non-life paths at step 1
    if (step === 1 && formData.claimReason !== 'life') {
      const e = validateStep(1);
      if (Object.keys(e).length) { setValidationErrors(e); return; }
      // Non-life paths: show informational — no step advance
      return;
    }

    const e = validateStep(step);
    if (Object.keys(e).length) {
      setValidationErrors(e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationErrors({});
    setCompletedSteps(prev => new Set([...prev, step]));
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setValidationErrors({});
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditStep = (targetStep) => {
    setValidationErrors({});
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveForLater = (silent = false) => {
    const draft = { step, formData, completedSteps: [...completedSteps], savedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    if (!silent) {
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    }
  };

  const handleLoadDraft = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
      if (saved) {
        setFormData(prev => ({ ...prev, ...saved.formData }));
        setStep(saved.step || 1);
        setCompletedSteps(new Set(saved.completedSteps || []));
      }
    } catch {}
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftDialog(false);
    setDraftAvailable(false);
  };

  // ── Submission ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const e = validateStep(9);
    if (Object.keys(e).length) { setValidationErrors(e); return; }

    setSubmitting(true);
    setError(null);
    try {
      const fnolData = {
        shortDescription: `Life Claim — ${formData.deceasedFirstName} ${formData.deceasedLastName}`,
        description: `Cause of death: ${formData.causeOfDeathCategory}. Death outside USA: ${formData.deathOutsideUSA}.`,
        insured: {
          fullName: `${formData.deceasedFirstName} ${formData.deceasedMiddleName} ${formData.deceasedLastName}`.replace(/\s+/g, ' ').trim(),
          dateOfBirth: formData.deceasedDOB,
          dateOfDeath: formData.dateOfDeath,
          ssn: formData.deceasedSSN,
          causeOfDeath: formData.causeOfDeathCategory,
        },
        claimant: {
          fullName: `${formData.beneficiaryFirstName} ${formData.beneficiaryMiddleName} ${formData.beneficiaryLastName}`.replace(/\s+/g, ' ').trim(),
          dateOfBirth: formData.beneficiaryDOB,
          ssn: formData.beneficiarySSN,
          emailAddress: formData.contactEmail,
          phoneNumber: formData.contactPhone,
          relationshipToInsured: formData.relationship,
          streetAddress: formData.contactStreet,
          city: formData.contactCity,
          state: formData.contactState,
          zipCode: formData.contactZip,
          country: formData.contactCountry,
        },
        policyNumbers: formData.deceasedPolicyNumber || '',
        paymentOptionSelected: formData.paymentMethod,
        settlementType: formData.settlementType,
        backupWithholding: formData.backupWithholding,
        priority: '3', urgency: '3', impact: '3',
      };

      const result = await serviceNowService.createFNOL(fnolData);
      setFnolNumber(result.fnolNumber);
      localStorage.removeItem(DRAFT_KEY);
      setCompletedSteps(prev => new Set([...prev, 9]));
      setStep(10);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auth handlers (preserved) ─────────────────────────────────────────────

  const handleLogin = () => {
    if (!authData.email || !authData.password) { setAuthError('Please enter both email and password.'); return; }
    setIsAuthenticated(true);
  };
  const handleRegister = () => {
    if (!authData.email || !authData.password || !authData.firstName || !authData.lastName) { setAuthError('Please fill in all required fields.'); return; }
    if (authData.password !== authData.confirmPassword) { setAuthError('Passwords do not match.'); return; }
    setIsAuthenticated(true);
  };

  // ─── Step Renderers ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-l)">
      {/* Sympathy message */}
      <DxcContainer
        padding="var(--spacing-padding-l)"
        style={{ backgroundColor: '#EBF5FB', borderLeft: '4px solid #1B75BB', borderRadius: '4px' }}
      >
        <DxcFlex gap="var(--spacing-gap-m)" alignItems="flex-start">
          <span className="material-icons" style={{ color: '#1B75BB', fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>favorite</span>
          <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">{SYMPATHY_MESSAGE}</DxcTypography>
        </DxcFlex>
      </DxcContainer>

      {/* Claim Reason */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">Why are you filing this claim?</DxcTypography>
        <DxcRadioGroup
          options={[
            { label: 'Insured person passed away (Life Claim)', value: 'life' },
            { label: 'Me or someone else was injured and not able to work (Disability Income)', value: 'disability' },
            { label: 'Me or someone else has a serious illness condition (Health Claim)', value: 'health' },
          ]}
          value={formData.claimReason}
          onChange={v => updateField('claimReason', v)}
        />
        {validationErrors.claimReason && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.claimReason}</DxcTypography>
        )}
        {formData.claimReason && formData.claimReason !== 'life' && (
          <DxcAlert semantic="info" message={{ text: 'The online portal currently supports Life Insurance claims only. For Disability Income or Health claims, please call us at 1-800-555-0100 or download a paper claim form below.' }} />
        )}
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
          Not sure? Call us at <strong>1-800-555-0100</strong> (Mon–Fri, 8 AM–5 PM ET) and we'll help you identify the right claim type.
        </DxcTypography>
      </DxcFlex>

      {/* What You Will Need */}
      <DxcContainer
        padding="var(--spacing-padding-m)"
        style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: '8px', border: '1px solid var(--color-border-neutral-medium)' }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: '#1B75BB', fontSize: '18px' }}>checklist</span>
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">What You Will Need</DxcTypography>
          </DxcFlex>
          {[
            'Your contact information (email address and phone number)',
            'Your full legal name, date of birth, and relationship to the deceased',
            'Your Social Security Number (for tax reporting purposes)',
            'Deceased\'s full legal name, date of birth, date of death, and SSN',
            'Policy or contract number (if available — found on your policy document)',
            'Copy of the death certificate (can be uploaded later through your dashboard)',
          ].map((item, i) => (
            <DxcFlex key={i} gap="var(--spacing-gap-xs)" alignItems="flex-start">
              <span className="material-icons" style={{ fontSize: '14px', color: '#37A526', flexShrink: 0, marginTop: '2px' }}>check</span>
              <DxcTypography fontSize="font-scale-01">{item}</DxcTypography>
            </DxcFlex>
          ))}
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)" style={{ marginTop: '4px' }}>
            <em>Note: The death certificate can be uploaded after submission through your claims dashboard. It will be required before the claim can be fully processed.</em>
          </DxcTypography>
        </DxcFlex>
      </DxcContainer>
    </DxcFlex>
  );

  const renderStep2 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
        Please provide your legal name exactly as it appears on your identification.
      </DxcTypography>

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
        <div style={{ flex: '1 1 200px' }}>
          <DxcTextInput
            label="First Name *"
            value={formData.beneficiaryFirstName}
            onChange={({ value }) => updateField('beneficiaryFirstName', value)}
            error={validationErrors.beneficiaryFirstName}
            size="fillParent"
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <DxcTextInput
            label="Middle Name (Optional)"
            value={formData.beneficiaryMiddleName}
            onChange={({ value }) => updateField('beneficiaryMiddleName', value)}
            size="fillParent"
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <DxcTextInput
            label="Last Name *"
            value={formData.beneficiaryLastName}
            onChange={({ value }) => updateField('beneficiaryLastName', value)}
            error={validationErrors.beneficiaryLastName}
            size="fillParent"
          />
        </div>
      </DxcFlex>

      <DxcCheckbox
        label="My name may have changed since the policy was taken out (e.g., due to marriage or divorce)"
        checked={formData.beneficiaryNameChanged}
        onChange={v => updateField('beneficiaryNameChanged', v)}
      />

      <div style={{ maxWidth: '280px' }}>
        <DxcDateInput
          label="Your Date of Birth *"
          value={formData.beneficiaryDOB}
          onChange={({ value }) => updateField('beneficiaryDOB', value)}
          placeholder="MM/DD/YYYY"
          error={validationErrors.beneficiaryDOB}
        />
      </div>

      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
        <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">Your Relationship to the Deceased *</DxcTypography>
        <DxcRadioGroup
          options={[
            { label: 'Spouse', value: 'spouse' },
            { label: 'Ex-Spouse', value: 'ex_spouse' },
            { label: 'Direct Family Member (parent, child, sibling, grandchild)', value: 'direct_family' },
          ]}
          value={formData.relationship}
          onChange={v => updateField('relationship', v)}
        />
        {validationErrors.relationship && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.relationship}</DxcTypography>
        )}
        {/* Non-listed relationship callout */}
        <DxcContainer
          padding="var(--spacing-padding-s)"
          style={{ backgroundColor: '#EBF5FB', borderRadius: '4px', border: '1px solid #90CAF9' }}
        >
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="flex-start">
            <span className="material-icons" style={{ fontSize: '16px', color: '#1B75BB', flexShrink: 0 }}>info</span>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-dark)">
              The online portal currently supports claims from the relationships listed above. If your relationship is not listed, you may still proceed by selecting the closest applicable option, or contact us at 1-800-555-0100 to file by phone. A{' '}
              <a href="#" style={{ color: '#1B75BB' }}>downloadable claim form</a> is also available.
            </DxcTypography>
          </DxcFlex>
        </DxcContainer>
      </DxcFlex>
    </DxcFlex>
  );

  const renderStep3 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
        We will use this information to contact you about your claim status and to send correspondence.
      </DxcTypography>

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
        <div style={{ flex: '1 1 260px' }}>
          <DxcTextInput
            label="Email Address *"
            value={formData.contactEmail}
            onChange={({ value }) => updateField('contactEmail', value)}
            error={validationErrors.contactEmail}
            size="fillParent"
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <DxcTextInput
            label="Phone Number *"
            placeholder="+1 (555) 000-0000"
            value={formData.contactPhone}
            onChange={({ value }) => updateField('contactPhone', value)}
            error={validationErrors.contactPhone}
            size="fillParent"
          />
        </div>
      </DxcFlex>

      <div style={{ maxWidth: '320px' }}>
        <DxcSelect
          label="Country *"
          options={[
            { label: 'United States of America', value: 'United States of America' },
            { label: 'Canada', value: 'Canada' },
            { label: 'United Kingdom', value: 'United Kingdom' },
            { label: 'Other', value: 'Other' },
          ]}
          value={formData.contactCountry}
          onChange={v => updateField('contactCountry', v)}
          size="fillParent"
        />
      </div>

      <DxcTextInput
        label="Street Address *"
        placeholder="123 Main Street, Apt 4B"
        value={formData.contactStreet}
        onChange={({ value }) => updateField('contactStreet', value)}
        error={validationErrors.contactStreet}
        size="fillParent"
      />

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
        <div style={{ flex: '1 1 200px' }}>
          <DxcTextInput
            label="City *"
            value={formData.contactCity}
            onChange={({ value }) => updateField('contactCity', value)}
            error={validationErrors.contactCity}
            size="fillParent"
          />
        </div>
        {formData.contactCountry === 'United States of America' && (
          <div style={{ flex: '1 1 180px' }}>
            <DxcSelect
              label="State *"
              options={US_STATES}
              value={formData.contactState}
              onChange={v => updateField('contactState', v)}
              size="fillParent"
            />
            {validationErrors.contactState && (
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.contactState}</DxcTypography>
            )}
          </div>
        )}
        <div style={{ flex: '0 1 140px' }}>
          <DxcTextInput
            label="ZIP / Postal Code *"
            placeholder="12345"
            value={formData.contactZip}
            onChange={({ value }) => updateField('contactZip', value)}
            error={validationErrors.contactZip}
            size="fillParent"
          />
        </div>
      </DxcFlex>
    </DxcFlex>
  );

  const renderStep4 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-l)">
      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
        Your Social Security Number is required for federal tax reporting on life insurance death benefits (IRS W-9 equivalent certification).
      </DxcTypography>

      {/* SSN */}
      {!formData.nonUSResident && (
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <div style={{ maxWidth: '260px' }}>
            <DxcTextInput
              label="Social Security Number *"
              placeholder="•••-••-XXXX"
              value={formData.beneficiarySSN ? displaySSN(formData.beneficiarySSN) : ''}
              onChange={({ value }) => {
                // Accept new digits being typed
                const digits = value.replace(/\D/g, '').slice(0, 9);
                updateField('beneficiarySSN', digits);
              }}
              error={validationErrors.beneficiarySSN}
              size="fillParent"
            />
          </div>
          {formData.beneficiarySSN && formData.beneficiarySSN.replace(/\D/g, '').length === 9 && (
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-success-darker)">
              SSN recorded: •••-••-{formData.beneficiarySSN.slice(-4)}
            </DxcTypography>
          )}
        </DxcFlex>
      )}

      <DxcCheckbox
        label="I am not a U.S. citizen or permanent resident"
        checked={formData.nonUSResident}
        onChange={v => {
          updateField('nonUSResident', v);
          if (v) updateField('beneficiarySSN', '');
        }}
      />
      {formData.nonUSResident && (
        <DxcAlert semantic="info" message={{ text: 'As a non-U.S. resident, you may be required to provide a W-8BEN form for tax withholding purposes. Our processing team will contact you with further guidance after submission.' }} />
      )}

      {/* Backup Withholding */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">Backup Tax Withholding Status *</DxcTypography>
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
          Per IRS W-9 requirements, please certify your backup withholding status:
        </DxcTypography>
        <DxcRadioGroup
          options={[
            { label: 'I am exempt from backup withholding', value: 'exempt' },
            { label: 'I have not been notified by the IRS that I am subject to backup withholding', value: 'not_notified' },
            { label: 'The IRS has notified me that I am no longer subject to backup withholding', value: 'no_longer_subject' },
            { label: 'I am subject to backup withholding', value: 'subject' },
          ]}
          value={formData.backupWithholding}
          onChange={v => updateField('backupWithholding', v)}
        />
        {validationErrors.backupWithholding && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.backupWithholding}</DxcTypography>
        )}
      </DxcFlex>

      {/* Taxpayer Certification */}
      <DxcContainer
        padding="var(--spacing-padding-m)"
        style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', border: '1px solid var(--color-border-neutral-medium)', borderRadius: '4px' }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">Taxpayer Certification</DxcTypography>
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-dark)">{TAXPAYER_CERT_TEXT}</DxcTypography>
        </DxcFlex>
      </DxcContainer>

      {/* Electronic Signature */}
      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
        <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
          Electronic Signature — Type your full legal name to sign *
        </DxcTypography>
        <div style={{ maxWidth: '360px' }}>
          <DxcTextInput
            label="Full Name"
            placeholder="Your full legal name"
            value={formData.taxSignatureName}
            onChange={({ value }) => updateField('taxSignatureName', value)}
            error={validationErrors.taxSignatureName}
            size="fillParent"
          />
        </div>
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
          Date signed: <strong>{formData.taxSignatureDate}</strong>
        </DxcTypography>
      </DxcFlex>
    </DxcFlex>
  );

  const renderStep5 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
        Please enter information exactly as it appears on the death certificate or official records.
      </DxcTypography>

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
        <div style={{ flex: '1 1 200px' }}>
          <DxcTextInput
            label="First Name *"
            value={formData.deceasedFirstName}
            onChange={({ value }) => updateField('deceasedFirstName', value)}
            error={validationErrors.deceasedFirstName}
            size="fillParent"
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <DxcTextInput
            label="Middle Name (Optional)"
            value={formData.deceasedMiddleName}
            onChange={({ value }) => updateField('deceasedMiddleName', value)}
            size="fillParent"
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <DxcTextInput
            label="Last Name *"
            value={formData.deceasedLastName}
            onChange={({ value }) => updateField('deceasedLastName', value)}
            error={validationErrors.deceasedLastName}
            size="fillParent"
          />
        </div>
      </DxcFlex>

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
        <div style={{ flex: '1 1 200px' }}>
          <DxcDateInput
            label="Date of Birth *"
            value={formData.deceasedDOB}
            onChange={({ value }) => updateField('deceasedDOB', value)}
            placeholder="MM/DD/YYYY"
            error={validationErrors.deceasedDOB}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <DxcDateInput
            label="Date of Death *"
            value={formData.dateOfDeath}
            onChange={({ value }) => updateField('dateOfDeath', value)}
            placeholder="MM/DD/YYYY"
            error={validationErrors.dateOfDeath}
          />
        </div>
      </DxcFlex>

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
        <div style={{ flex: '1 1 220px' }}>
          <DxcTextInput
            label="Social Security Number"
            placeholder="•••-••-XXXX"
            value={formData.deceasedSSN ? displaySSN(formData.deceasedSSN) : ''}
            onChange={({ value }) => {
              const digits = value.replace(/\D/g, '').slice(0, 9);
              updateField('deceasedSSN', digits);
            }}
            size="fillParent"
          />
        </div>
        <div style={{ flex: '1 1 220px' }}>
          <DxcTextInput
            label="Policy / Contract Number (Optional)"
            placeholder="Found on your policy document"
            value={formData.deceasedPolicyNumber}
            onChange={({ value }) => updateField('deceasedPolicyNumber', value)}
            size="fillParent"
          />
          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-strong)" style={{ marginTop: '4px' }}>
            If you don't have it, the system will attempt to match using name, SSN, and date of birth.
          </DxcTypography>
        </div>
      </DxcFlex>
    </DxcFlex>
  );

  const renderStep6 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-l)">
      <DxcAlert
        semantic="info"
        message={{ text: 'You can continue filing your claim now and upload documents later through your Claims Dashboard. Documents may be required before the claim can be fully processed, but are not required for submission.' }}
      />

      {/* Death Certificate */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
          Death Certificate
          <span style={{ color: '#1B75BB', fontSize: '13px', fontWeight: 400, marginLeft: '8px' }}>(Recommended — required before final processing)</span>
        </DxcTypography>
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
          Please upload a copy of the original government or state-issued death certificate. The official seal (watermark) must be visible and legible.
        </DxcTypography>
        <DxcFileInput
          accept=".pdf,.jpg,.jpeg,.png"
          mode="filedrop"
          buttonLabel="Drop file here or click to upload"
          onFilesChange={files => {
            if (files && files.length > 0) updateField('deathCertUploaded', true);
          }}
        />
      </DxcFlex>

      {/* Government-Issued ID */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
          Government-Issued ID <span style={{ color: '#666', fontWeight: 400 }}>(Optional)</span>
        </DxcTypography>
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
          Driver's license, passport, or state-issued ID.
        </DxcTypography>
        <DxcFileInput
          accept=".pdf,.jpg,.jpeg,.png"
          mode="filedrop"
          buttonLabel="Drop file here or click to upload"
          onFilesChange={files => {
            if (files && files.length > 0) updateField('govtIdUploaded', true);
          }}
        />
      </DxcFlex>

      {/* Name Change Documentation — conditional */}
      {formData.beneficiaryNameChanged && (
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
            Name Change Documentation <span style={{ color: '#666', fontWeight: 400 }}>(Required — you indicated a name change)</span>
          </DxcTypography>
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
            Accepted: marriage certificate, court order, or other official name change documentation.
          </DxcTypography>
          <DxcFileInput
            accept=".pdf,.jpg,.jpeg,.png"
            mode="filedrop"
            buttonLabel="Drop file here or click to upload"
            onFilesChange={files => {
              if (files && files.length > 0) updateField('nameChangeUploaded', true);
            }}
          />
        </DxcFlex>
      )}

      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
        Accepted formats: PDF, JPEG, PNG · Maximum file size: 10 MB per file
      </DxcTypography>
    </DxcFlex>
  );

  const renderStep7 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-l)">
      <DxcContainer
        padding="var(--spacing-padding-m)"
        style={{ backgroundColor: '#EBF5FB', borderRadius: '4px', borderLeft: '4px solid #1B75BB' }}
      >
        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
          We understand that these questions may be difficult during this time. You are welcome to save your progress and return later at any point using the "Save for Later" button.
        </DxcTypography>
      </DxcContainer>

      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
          Cause of Death *
        </DxcTypography>
        <DxcRadioGroup
          options={[
            { label: 'Illness / Natural Causes', value: 'illness_natural' },
            { label: 'Accident / Injury', value: 'accident_injury' },
            { label: 'Other', value: 'other' },
            { label: "I Don't Know", value: 'unknown' },
          ]}
          value={formData.causeOfDeathCategory}
          onChange={v => updateField('causeOfDeathCategory', v)}
        />
        {validationErrors.causeOfDeathCategory && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.causeOfDeathCategory}</DxcTypography>
        )}
      </DxcFlex>

      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
          Did your loved one pass away outside the USA, including any US territories? *
        </DxcTypography>
        <DxcRadioGroup
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          value={formData.deathOutsideUSA}
          onChange={v => updateField('deathOutsideUSA', v)}
        />
        {validationErrors.deathOutsideUSA && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.deathOutsideUSA}</DxcTypography>
        )}
        {formData.deathOutsideUSA === 'yes' && (
          <DxcAlert semantic="info" message={{ text: 'Additional documentation may be required for deaths that occurred outside the United States. Our claims team will contact you to provide guidance after submission.' }} />
        )}
      </DxcFlex>
    </DxcFlex>
  );

  const renderStep8 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-l)">
      {/* Settlement Type */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">Settlement Option *</DxcTypography>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B75BB', fontSize: '13px', textDecoration: 'underline' }}
            onClick={() => alert("A lump sum payment pays the full death benefit in a single payment. Other settlement options may include installment payments, retained asset accounts, or other structured payout arrangements. Contact us for details on available options.")}
          >
            What's a Settlement Option?
          </button>
        </DxcFlex>
        <DxcRadioGroup
          options={[
            { label: 'Lump Sum Payment — receive the full benefit in one payment', value: 'lump_sum' },
            { label: 'Other Settlement Option — contact us to discuss alternatives', value: 'other' },
          ]}
          value={formData.settlementType}
          onChange={v => updateField('settlementType', v)}
        />
        {validationErrors.settlementType && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.settlementType}</DxcTypography>
        )}
      </DxcFlex>

      {/* Payment Method */}
      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">Payment Method *</DxcTypography>
        <DxcRadioGroup
          options={[
            { label: 'Direct Deposit to Bank Account (fastest)', value: 'direct_deposit' },
            { label: 'Check mailed to address on file', value: 'check' },
          ]}
          value={formData.paymentMethod}
          onChange={v => updateField('paymentMethod', v)}
        />
        {validationErrors.paymentMethod && (
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.paymentMethod}</DxcTypography>
        )}
      </DxcFlex>

      {/* Direct Deposit fields */}
      {formData.paymentMethod === 'direct_deposit' && (
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: '8px', border: '1px solid var(--color-border-neutral-medium)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={4} text="Bank Account Information" />
            <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
              <div style={{ flex: '1 1 200px' }}>
                <DxcTextInput
                  label="Routing Number *"
                  placeholder="9-digit ABA number"
                  value={formData.routingNumber}
                  onChange={({ value }) => updateField('routingNumber', value.replace(/\D/g, '').slice(0, 9))}
                  error={validationErrors.routingNumber}
                  size="fillParent"
                />
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B75BB', fontSize: '12px', textDecoration: 'underline', padding: 0, marginTop: '4px' }}
                  onClick={() => alert("The 9-digit routing number (also called ABA number) is the first set of numbers in the bottom-left of your check, before your account number.")}
                >
                  Where do I find my routing number?
                </button>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <DxcTextInput
                  label="Confirm Routing Number *"
                  placeholder="Re-enter routing number"
                  value={formData.confirmRoutingNumber}
                  onChange={({ value }) => updateField('confirmRoutingNumber', value.replace(/\D/g, '').slice(0, 9))}
                  error={validationErrors.confirmRoutingNumber}
                  size="fillParent"
                />
              </div>
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
              <div style={{ flex: '1 1 200px' }}>
                <DxcTextInput
                  label="Account Number *"
                  placeholder="Up to 17 digits"
                  value={formData.accountNumber}
                  onChange={({ value }) => updateField('accountNumber', value.replace(/\D/g, '').slice(0, 17))}
                  error={validationErrors.accountNumber}
                  size="fillParent"
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <DxcTextInput
                  label="Confirm Account Number *"
                  placeholder="Re-enter account number"
                  value={formData.confirmAccountNumber}
                  onChange={({ value }) => updateField('confirmAccountNumber', value.replace(/\D/g, '').slice(0, 17))}
                  error={validationErrors.confirmAccountNumber}
                  size="fillParent"
                />
              </div>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>
      )}

      {/* Check note */}
      {formData.paymentMethod === 'check' && (
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: '#EBF5FB', borderRadius: '4px', border: '1px solid #90CAF9' }}
        >
          <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start">
            <span className="material-icons" style={{ fontSize: '16px', color: '#1B75BB', flexShrink: 0 }}>info</span>
            <DxcTypography fontSize="font-scale-01">
              A check will be mailed to: <strong>{[formData.contactStreet, formData.contactCity, formData.contactState, formData.contactZip].filter(Boolean).join(', ')}</strong>
              {' '}
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B75BB', textDecoration: 'underline', fontSize: '13px' }}
                onClick={() => handleEditStep(3)}
              >
                Edit address
              </button>
            </DxcTypography>
          </DxcFlex>
        </DxcContainer>
      )}
    </DxcFlex>
  );

  const renderStep9 = () => {
    const stateDisclosure = STATE_DISCLOSURES[formData.contactState];
    const fraudWarning = FRAUD_WARNINGS[formData.contactState] || FRAUD_WARNINGS.default;
    const beneName = [formData.beneficiaryFirstName, formData.beneficiaryMiddleName, formData.beneficiaryLastName].filter(Boolean).join(' ');
    const deceasedName = [formData.deceasedFirstName, formData.deceasedMiddleName, formData.deceasedLastName].filter(Boolean).join(' ');
    const address = [formData.contactStreet, formData.contactCity, formData.contactState, formData.contactZip, formData.contactCountry !== 'United States of America' ? formData.contactCountry : ''].filter(Boolean).join(', ');
    const SECTIONS = [
      { title: 'Beneficiary Information', editStep: 2, fields: [{ label: 'Name', value: beneName }, { label: 'Date of Birth', value: formData.beneficiaryDOB }, { label: 'Relationship', value: formData.relationship?.replace(/_/g, ' ') }, { label: 'Name Changed', value: formData.beneficiaryNameChanged ? 'Yes' : 'No' }] },
      { title: 'Your Contact Information', editStep: 3, fields: [{ label: 'Email', value: formData.contactEmail }, { label: 'Phone', value: formData.contactPhone }, { label: 'Address', value: address }] },
      { title: 'SSN & Tax Certification', editStep: 4, fields: [{ label: 'SSN', value: formData.nonUSResident ? 'Non-US Resident' : formData.beneficiarySSN ? `•••-••-${formData.beneficiarySSN.slice(-4)}` : '—' }, { label: 'Backup Withholding', value: formData.backupWithholding?.replace(/_/g, ' ') }, { label: 'Signed By', value: formData.taxSignatureName }] },
      { title: 'About Your Loved One', editStep: 5, fields: [{ label: 'Name', value: deceasedName }, { label: 'Date of Birth', value: formData.deceasedDOB }, { label: 'Date of Death', value: formData.dateOfDeath }, { label: 'Policy Number', value: formData.deceasedPolicyNumber || 'Not provided' }] },
      { title: 'Uploaded Documentation', editStep: 6, fields: [{ label: 'Death Certificate', value: formData.deathCertUploaded ? 'Uploaded' : 'Not uploaded (can be added later)' }, { label: 'Government ID', value: formData.govtIdUploaded ? 'Uploaded' : 'Not uploaded' }] },
      { title: 'About Your Loss', editStep: 7, fields: [{ label: 'Cause of Death', value: { illness_natural: 'Illness / Natural', accident_injury: 'Accident / Injury', other: 'Other', unknown: "Don't Know" }[formData.causeOfDeathCategory] }, { label: 'Death Outside USA', value: formData.deathOutsideUSA === 'yes' ? 'Yes' : 'No' }] },
      { title: 'Payment Preferences', editStep: 8, fields: [{ label: 'Settlement Type', value: formData.settlementType?.replace(/_/g, ' ') }, { label: 'Payment Method', value: formData.paymentMethod === 'direct_deposit' ? 'Direct Deposit' : 'Check by Mail' }, formData.paymentMethod === 'direct_deposit' ? { label: 'Account', value: formData.accountNumber ? `•••••${formData.accountNumber.slice(-4)}` : '—' } : null].filter(Boolean) },
    ];

    return (
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
          Please review all information before signing and submitting. Click the edit icon on any section to make changes.
        </DxcTypography>

        {/* Summary sections */}
        {SECTIONS.map((section, si) => (
          <DxcContainer
            key={si}
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: '8px', border: '1px solid var(--color-border-neutral-medium)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">{section.title}</DxcTypography>
                <button
                  onClick={() => handleEditStep(section.editStep)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#1B75BB' }}
                >
                  <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                  <span style={{ fontSize: '13px' }}>Edit</span>
                </button>
              </DxcFlex>
              {section.fields.map((f, fi) => <FieldRow key={fi} label={f.label} value={f.value} />)}
            </DxcFlex>
          </DxcContainer>
        ))}

        {/* State-specific disclosure */}
        {stateDisclosure && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFD740', borderRadius: '4px' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
              <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                {formData.contactState} State Disclosure
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-dark)">{stateDisclosure}</DxcTypography>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Fraud warning */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: '#FBE9E7', border: '1px solid #FF7043', borderRadius: '4px' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="#BF360C">
              Fraud Warning {formData.contactState ? `— ${formData.contactState}` : ''}
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-dark)">{fraudWarning}</DxcTypography>
          </DxcFlex>
        </DxcContainer>

        {/* Consent checkboxes */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcCheckbox
            label="I have read the required fraud warning notice and agree with the statements."
            checked={formData.fraudWarningAgreed}
            onChange={v => updateField('fraudWarningAgreed', v)}
          />
          {validationErrors.fraudWarningAgreed && (
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.fraudWarningAgreed}</DxcTypography>
          )}

          <DxcCheckbox
            label="I hereby confirm that all the provided information is true and complete. I agree to sign this submission electronically and acknowledge that my electronic signature carries the same legal force and effect as a handwritten signature."
            checked={formData.certificationAgreed}
            onChange={v => updateField('certificationAgreed', v)}
          />
          {validationErrors.certificationAgreed && (
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">{validationErrors.certificationAgreed}</DxcTypography>
          )}

          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
            Date signed: <strong>{formData.signatureDate}</strong>
          </DxcTypography>
        </DxcFlex>

        {error && <DxcAlert semantic="error" message={{ text: error }} />}
      </DxcFlex>
    );
  };

  const renderStep10 = () => (
    <DxcFlex direction="column" gap="var(--spacing-gap-l)" alignItems="center" style={{ textAlign: 'center', paddingTop: '24px' }}>
      <span className="material-icons" style={{ fontSize: '72px', color: '#37A526' }}>check_circle</span>

      <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
        <DxcHeading level={2} text="Claim Submitted Successfully" />
        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
          Your life insurance claim has been received and is under review.
        </DxcTypography>
      </DxcFlex>

      {fnolNumber && (
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: '8px', border: '1px solid #37A526', textAlign: 'center' }}
        >
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">YOUR CLAIM REFERENCE NUMBER</DxcTypography>
          <DxcTypography fontSize="32px" fontWeight="font-weight-bold" color="#37A526">{fnolNumber}</DxcTypography>
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">Please save this number for your records.</DxcTypography>
        </DxcContainer>
      )}

      <DxcContainer
        padding="var(--spacing-padding-m)"
        style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: '8px', maxWidth: '480px', textAlign: 'left' }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">What Happens Next</DxcTypography>
          {[
            'A claims examiner will review your submission within 1–3 business days.',
            'You will receive an email confirmation with your reference number.',
            'We may contact you if additional documentation or information is needed.',
            'Track your claim status anytime from your Claims Dashboard.',
          ].map((item, i) => (
            <DxcFlex key={i} gap="var(--spacing-gap-xs)" alignItems="flex-start">
              <span style={{ color: '#37A526', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              <DxcTypography fontSize="font-scale-01">{item}</DxcTypography>
            </DxcFlex>
          ))}
        </DxcFlex>
      </DxcContainer>

      {!formData.deathCertUploaded && (
        <DxcAlert
          semantic="warning"
          message={{ text: 'Reminder: A death certificate has not been uploaded. Your claim cannot be fully processed until it is received. You can upload it from your Claims Dashboard.' }}
        />
      )}

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap" justifyContent="center">
        <DxcButton
          label="Go to Claims Dashboard"
          mode="primary"
          icon="dashboard"
          onClick={() => window.location.reload()}
          style={{ minHeight: 44 }}
        />
        <DxcButton
          label="Print Confirmation"
          mode="secondary"
          icon="print"
          onClick={() => window.print()}
          style={{ minHeight: 44 }}
        />
      </DxcFlex>
    </DxcFlex>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      case 9: return renderStep9();
      case 10: return renderStep10();
      default: return null;
    }
  };

  const showSaveForLater = step > 1 && step < TOTAL_STEPS;
  const showContinue = step < 9 || (step === 9 && false); // Step 9 has Submit button
  const showSubmit = step === 9;
  const canSubmit = step === 9 && formData.fraudWarningAgreed && formData.certificationAgreed;

  // ─── Auth Gate (preserved) ─────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <DxcContainer padding="var(--spacing-padding-xl)" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <DxcFlex direction="column" gap="var(--spacing-gap-l)">
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ fontSize: '40px', color: '#1B75BB' }}>account_circle</span>
            <DxcHeading level={2} text="File a Life Insurance Claim" />
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)" style={{ textAlign: 'center' }}>
              Sign in or create an account to begin your claim submission securely.
            </DxcTypography>
          </DxcFlex>

          {/* Tab selector */}
          <DxcFlex style={{ borderBottom: '2px solid #E0E0E0' }}>
            {['login', 'register'].map(mode => (
              <button
                key={mode}
                onClick={() => setAuthMode(mode)}
                style={{
                  flex: 1, padding: '12px', background: 'none', cursor: 'pointer',
                  border: 'none', borderBottom: authMode === mode ? '2px solid #1B75BB' : '2px solid transparent',
                  color: authMode === mode ? '#1B75BB' : '#666', fontWeight: authMode === mode ? 700 : 400,
                  fontSize: '14px', textTransform: 'capitalize',
                }}
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </DxcFlex>

          {authError && <DxcAlert semantic="error" message={{ text: authError }} />}

          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            {authMode === 'register' && (
              <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                <div style={{ flex: '1 1 180px' }}>
                  <DxcTextInput label="First Name *" value={authData.firstName} onChange={({ value }) => setAuthData(p => ({ ...p, firstName: value }))} size="fillParent" />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <DxcTextInput label="Last Name *" value={authData.lastName} onChange={({ value }) => setAuthData(p => ({ ...p, lastName: value }))} size="fillParent" />
                </div>
              </DxcFlex>
            )}
            <DxcTextInput label="Email Address *" value={authData.email} onChange={({ value }) => setAuthData(p => ({ ...p, email: value }))} size="fillParent" />
            <DxcTextInput label="Password *" type="password" value={authData.password} onChange={({ value }) => setAuthData(p => ({ ...p, password: value }))} size="fillParent" />
            {authMode === 'register' && (
              <DxcTextInput label="Confirm Password *" type="password" value={authData.confirmPassword} onChange={({ value }) => setAuthData(p => ({ ...p, confirmPassword: value }))} size="fillParent" />
            )}
            <DxcButton
              label={authMode === 'login' ? 'Sign In' : 'Create Account & Continue'}
              mode="primary"
              onClick={authMode === 'login' ? handleLogin : handleRegister}
              style={{ minHeight: 44 }}
            />
          </DxcFlex>
        </DxcFlex>
      </DxcContainer>
    );
  }

  // ─── Main Wizard ───────────────────────────────────────────────────────────

  return (
    <DxcContainer padding="var(--spacing-padding-l)" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Draft Resume Dialog */}
      {showDraftDialog && draftAvailable && (
        <DxcDialog isCloseVisible onCloseClick={() => setShowDraftDialog(false)}>
          <DxcInset space="var(--spacing-padding-l)">
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={3} text="Resume Your Saved Claim?" />
              <DxcTypography fontSize="font-scale-02">
                You have a claim in progress that was saved earlier. Would you like to resume where you left off?
              </DxcTypography>
              <DxcFlex gap="var(--spacing-gap-s)">
                <DxcButton label="Resume Saved Claim" mode="primary" onClick={handleLoadDraft} style={{ minHeight: 44 }} />
                <DxcButton label="Start Fresh" mode="secondary" onClick={handleDiscardDraft} style={{ minHeight: 44 }} />
              </DxcFlex>
            </DxcFlex>
          </DxcInset>
        </DxcDialog>
      )}

      {/* Session Timeout Warning */}
      {showTimeoutWarning && (
        <DxcDialog isCloseVisible onCloseClick={() => { setShowTimeoutWarning(false); resetTimers(); }}>
          <DxcInset space="var(--spacing-padding-l)">
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                <span className="material-icons" style={{ color: '#F6921E', fontSize: '28px' }}>access_time</span>
                <DxcHeading level={3} text="Your session is about to expire" />
              </DxcFlex>
              <DxcTypography fontSize="font-scale-02">
                For your security, your session will expire in 2 minutes. Your progress will be saved automatically.
              </DxcTypography>
              <DxcFlex gap="var(--spacing-gap-s)">
                <DxcButton label="Continue Working" mode="primary" onClick={() => { setShowTimeoutWarning(false); resetTimers(); }} style={{ minHeight: 44 }} />
                <DxcButton label="Save & Exit" mode="secondary" onClick={() => handleSaveForLater()} style={{ minHeight: 44 }} />
              </DxcFlex>
            </DxcFlex>
          </DxcInset>
        </DxcDialog>
      )}

      {/* Mobile stepper (shows on small screens via CSS) */}
      <div className="fnol-mobile-stepper">
        <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold" color="var(--color-fg-primary-stronger)">
          Step {step} of {TOTAL_STEPS} — {STEP_TITLES[step - 1]}
        </DxcTypography>
        <DxcProgressBar value={Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100)} showValue={false} />
      </div>

      {/* Two-column layout */}
      <div className="fnol-layout">
        {/* ── Left Column: Form ── */}
        <div className="fnol-form-column">
          <DxcContainer
            padding="var(--spacing-padding-l)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              {/* Step Header */}
              {step < TOTAL_STEPS && (
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#1B75BB', fontSize: '14px', padding: 0, marginBottom: '8px' }}
                    >
                      <span className="material-icons" style={{ fontSize: '18px' }}>arrow_back</span>
                      Back
                    </button>
                  )}
                  <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                    <span className="material-icons" style={{ fontSize: '24px', color: '#1B75BB' }}>{STEP_ICONS[step - 1]}</span>
                    <DxcHeading level={3} text={STEP_TITLES[step - 1]} />
                    <DxcBadge label={`${step} / ${TOTAL_STEPS}`} mode="contextual" color="info" />
                  </DxcFlex>
                </DxcFlex>
              )}

              {/* Validation error summary */}
              {Object.keys(validationErrors).length > 0 && (
                <DxcAlert semantic="error" message={{ text: 'Please correct the highlighted fields before continuing.' }} />
              )}

              {/* Save success message */}
              {saveSuccessMsg && (
                <DxcAlert semantic="success" message={{ text: 'Your progress has been saved. You can resume this claim from your dashboard.' }} />
              )}

              {/* Step content */}
              {renderCurrentStep()}

              {/* Navigation buttons */}
              {step < TOTAL_STEPS && (
                <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap" style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--color-border-neutral-medium)' }}>
                  {showSubmit ? (
                    <DxcButton
                      label={submitting ? 'Submitting...' : 'Submit Claim'}
                      mode="primary"
                      icon="send"
                      disabled={!canSubmit || submitting}
                      onClick={handleSubmit}
                      style={{ minHeight: 44 }}
                    />
                  ) : (
                    <DxcButton
                      label={step === 1 && formData.claimReason && formData.claimReason !== 'life' ? 'Life Claim Only — Call 1-800-555-0100' : 'Continue'}
                      mode="primary"
                      icon="arrow_forward"
                      disabled={step === 1 && formData.claimReason !== 'life' && !!formData.claimReason}
                      onClick={handleContinue}
                      style={{ minHeight: 44 }}
                    />
                  )}

                  {showSaveForLater && (
                    <DxcButton
                      label="Save for Later"
                      mode="secondary"
                      icon="save"
                      onClick={() => handleSaveForLater(false)}
                      style={{ minHeight: 44 }}
                    />
                  )}
                </DxcFlex>
              )}
            </DxcFlex>
          </DxcContainer>
        </div>

        {/* ── Right Column: Progress Sidebar ── */}
        <div className="fnol-sidebar-column">
          {step < TOTAL_STEPS && (
            <ProgressSidebar
              currentStep={step}
              completedSteps={completedSteps}
              formData={formData}
              onEditStep={handleEditStep}
            />
          )}
        </div>
      </div>
    </DxcContainer>
  );
};

export default IntakeForms;
