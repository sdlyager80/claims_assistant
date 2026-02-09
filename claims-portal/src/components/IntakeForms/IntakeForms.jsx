import { useState } from 'react';
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
  DxcTabs
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import './IntakeForms.css';

/**
 * FNOL Party Portal - Public-facing portal
 * Features:
 * - Simulated user registration/login flow
 * - Product selection (Life, Annuity, Health)
 * - Dynamic claim form based on product
 * - Document upload
 * - ServiceNow submission
 */
const IntakeForms = () => {
  // Auth state (simulated registration gate)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [authError, setAuthError] = useState(null);

  // Product selection
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form wizard
  const [step, setStep] = useState(1);
  const totalSteps = 4; // Product Selection, Claim Info, Claimant Info, Documents
  const [formData, setFormData] = useState({
    // Common fields
    claimType: '',
    policyNumber: '',
    insuredName: '',
    insuredSSN: '',
    insuredDOB: '',
    dateOfDeath: '',
    causeOfDeath: '',
    description: '',
    // Claimant fields
    claimantName: '',
    claimantEmail: '',
    claimantPhone: '',
    claimantSSN: '',
    claimantDOB: '',
    claimantAddress: '',
    relationship: '',
    // Life-specific
    lifeSettlementIndicator: '',
    contestabilityPeriod: '',
    // Annuity-specific
    annuityContractNumber: '',
    annuityType: '',
    surrenderValue: '',
    deathBenefitOption: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fnolNumber, setFnolNumber] = useState(null);

  // Auth handlers
  const handleAuthChange = (field, value) => {
    setAuthData(prev => ({ ...prev, [field]: value }));
    setAuthError(null);
  };

  const handleLogin = () => {
    if (!authData.email || !authData.password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    // Simulated login
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    if (!authData.email || !authData.password || !authData.firstName || !authData.lastName) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (authData.password !== authData.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    // Simulated registration
    setIsAuthenticated(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      claimType: product === 'life' ? 'death' : product === 'annuity' ? 'annuity_death' : 'health'
    }));
    setStep(2);
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (step === 2 && !selectedProduct) {
      setStep(1);
    } else {
      setStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const fnolData = {
        shortDescription: `${selectedProduct === 'life' ? 'Life' : 'Annuity'} Claim - ${formData.insuredName}`,
        description: formData.description,
        insured: {
          fullName: formData.insuredName,
          dateOfDeath: formData.dateOfDeath
        },
        claimant: {
          fullName: formData.claimantName,
          emailAddress: formData.claimantEmail,
          phoneNumber: formData.claimantPhone,
          relationshipToInsured: formData.relationship
        },
        policyNumbers: formData.policyNumber,
        priority: '3',
        urgency: '3',
        impact: '3'
      };

      console.log('[IntakeForms] Submitting FNOL to ServiceNow:', fnolData);
      const result = await serviceNowService.createFNOL(fnolData);
      console.log('[IntakeForms] FNOL created successfully:', result);

      setFnolNumber(result.fnolNumber);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setFnolNumber(null);
        setStep(1);
        setSelectedProduct(null);
        setFormData({
          claimType: '', policyNumber: '', insuredName: '', insuredSSN: '', insuredDOB: '',
          dateOfDeath: '', causeOfDeath: '', description: '', claimantName: '', claimantEmail: '',
          claimantPhone: '', claimantSSN: '', claimantDOB: '', claimantAddress: '', relationship: '',
          lifeSettlementIndicator: '', contestabilityPeriod: '', annuityContractNumber: '',
          annuityType: '', surrenderValue: '', deathBenefitOption: ''
        });
      }, 8000);
    } catch (err) {
      console.error('[IntakeForms] Error submitting FNOL:', err);
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / totalSteps) * 100;

  // =================== REGISTRATION/LOGIN GATE ===================
  if (!isAuthenticated) {
    return (
      <DxcContainer
        padding="var(--spacing-padding-xl)"
        style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-l)" alignItems="center">
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
            <DxcHeading level={1} text="FNOL Party Portal" />
            <DxcTypography color="var(--color-fg-neutral-strong)">
              Submit a First Notice of Loss for life and annuity claims
            </DxcTypography>
            <DxcBadge label="Demo Portal" mode="contextual" color="info" />
          </DxcFlex>

          <DxcContainer
            padding="var(--spacing-padding-xl)"
            style={{
              backgroundColor: "var(--color-bg-neutral-lightest)",
              maxWidth: "480px",
              width: "100%",
              borderRadius: "var(--border-radius-m)",
              boxShadow: "var(--shadow-mid-04)"
            }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTabs>
                <DxcTabs.Tab
                  label="Sign In"
                  active={authMode === 'login'}
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Register"
                  active={authMode === 'register'}
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                >
                  <div />
                </DxcTabs.Tab>
              </DxcTabs>

              {authError && (
                <DxcAlert
                  semantic="error"
                  message={{ text: authError }}
                />
              )}

              {authMode === 'login' ? (
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcTextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    value={authData.email}
                    onChange={({ value }) => handleAuthChange('email', value)}
                    size="fillParent"
                  />
                  <DxcTextInput
                    label="Password"
                    placeholder="Enter password"
                    value={authData.password}
                    onChange={({ value }) => handleAuthChange('password', value)}
                    size="fillParent"
                  />
                  <DxcButton
                    label="Sign In"
                    onClick={handleLogin}
                    size="fillParent"
                  />
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                    For demo purposes, enter any email and password to proceed.
                  </DxcTypography>
                </DxcFlex>
              ) : (
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcFlex gap="var(--spacing-gap-s)">
                    <DxcTextInput
                      label="First Name"
                      placeholder="First"
                      value={authData.firstName}
                      onChange={({ value }) => handleAuthChange('firstName', value)}
                      size="fillParent"
                    />
                    <DxcTextInput
                      label="Last Name"
                      placeholder="Last"
                      value={authData.lastName}
                      onChange={({ value }) => handleAuthChange('lastName', value)}
                      size="fillParent"
                    />
                  </DxcFlex>
                  <DxcTextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    value={authData.email}
                    onChange={({ value }) => handleAuthChange('email', value)}
                    size="fillParent"
                  />
                  <DxcTextInput
                    label="Phone Number"
                    placeholder="(555) 123-4567"
                    value={authData.phone}
                    onChange={({ value }) => handleAuthChange('phone', value)}
                    size="fillParent"
                  />
                  <DxcTextInput
                    label="Password"
                    placeholder="Create a password"
                    value={authData.password}
                    onChange={({ value }) => handleAuthChange('password', value)}
                    size="fillParent"
                  />
                  <DxcTextInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={authData.confirmPassword}
                    onChange={({ value }) => handleAuthChange('confirmPassword', value)}
                    size="fillParent"
                  />
                  <DxcButton
                    label="Create Account"
                    onClick={handleRegister}
                    size="fillParent"
                  />
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                    For demo purposes, fill required fields and click Create Account.
                  </DxcTypography>
                </DxcFlex>
              )}
            </DxcFlex>
          </DxcContainer>
        </DxcFlex>
      </DxcContainer>
    );
  }

  // =================== MAIN PORTAL (AUTHENTICATED) ===================
  return (
    <DxcContainer
      padding="var(--spacing-padding-xl)"
      style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Page Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcHeading level={1} text="FNOL Party Portal" />
            <DxcTypography color="var(--color-fg-neutral-strong)">
              Submit a First Notice of Loss for life and annuity claims
            </DxcTypography>
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
            <DxcBadge label="Demo Portal" mode="contextual" color="info" />
            <DxcButton
              label="Sign Out"
              mode="tertiary"
              icon="logout"
              onClick={() => setIsAuthenticated(false)}
            />
          </DxcFlex>
        </DxcFlex>

        {/* Success Alert */}
        {showSuccess && fnolNumber && (
          <DxcAlert
            semantic="success"
            message={{ text: `Claim submitted successfully! Your FNOL number is ${fnolNumber}.` }}
          />
        )}

        {/* Error Alert */}
        {error && (
          <DxcAlert
            semantic="error"
            message={{ text: error }}
          />
        )}

        {/* Main Form Container */}
        <DxcContainer
          padding="var(--spacing-padding-xl)"
          style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-04)"
          }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-l)">
            {/* Progress Bar */}
            <DxcProgressBar
              label={step === 1 ? 'Step 1: Product Selection' : `Step ${step} of ${totalSteps}`}
              value={progress}
              showValue
            />

            {/* =================== STEP 1: PRODUCT SELECTION =================== */}
            {step === 1 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Select Product Type" />
                <DxcTypography color="var(--color-fg-neutral-strong)">
                  Choose the type of claim you would like to submit. The form will be tailored to the selected product.
                </DxcTypography>

                <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                  {/* Life Insurance */}
                  <div
                    onClick={() => handleProductSelect('life')}
                    style={{
                      flex: "1 1 250px",
                      padding: "var(--spacing-padding-l)",
                      borderRadius: "var(--border-radius-m)",
                      border: selectedProduct === 'life'
                        ? "2px solid #000000"
                        : "1px solid var(--border-color-neutral-lighter)",
                      backgroundColor: "var(--color-bg-neutral-lighter)",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: "48px", color: "#000000" }}>favorite</span>
                      <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04">
                        Life Insurance
                      </DxcTypography>
                      <DxcBadge label="Connect Event" mode="contextual" color="success" />
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                        Death claim for whole life, term life, or universal life policies
                      </DxcTypography>
                    </DxcFlex>
                  </div>

                  {/* Annuity */}
                  <div
                    onClick={() => handleProductSelect('annuity')}
                    style={{
                      flex: "1 1 250px",
                      padding: "var(--spacing-padding-l)",
                      borderRadius: "var(--border-radius-m)",
                      border: selectedProduct === 'annuity'
                        ? "2px solid #000000"
                        : "1px solid var(--border-color-neutral-lighter)",
                      backgroundColor: "var(--color-bg-neutral-lighter)",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: "48px", color: "#000000" }}>account_balance</span>
                      <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04">
                        Annuity
                      </DxcTypography>
                      <DxcBadge label="Connect Event" mode="contextual" color="success" />
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                        Death claim for fixed, variable, or indexed annuity contracts
                      </DxcTypography>
                    </DxcFlex>
                  </div>

                  {/* Health (Future Phase) */}
                  <div
                    style={{
                      flex: "1 1 250px",
                      padding: "var(--spacing-padding-l)",
                      borderRadius: "var(--border-radius-m)",
                      border: "1px solid var(--border-color-neutral-lighter)",
                      backgroundColor: "var(--color-bg-neutral-lighter)",
                      opacity: 0.5,
                      cursor: "not-allowed"
                    }}
                  >
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: "48px", color: "var(--color-fg-neutral-dark)" }}>local_hospital</span>
                      <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04" color="var(--color-fg-neutral-dark)">
                        Health
                      </DxcTypography>
                      <DxcBadge label="Future Phase" mode="contextual" color="neutral" />
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                        Health insurance claims (coming soon)
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </DxcFlex>
              </DxcFlex>
            )}

            {/* =================== STEP 2: CLAIM INFORMATION (Product-Specific) =================== */}
            {step === 2 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                  <DxcHeading level={3} text="Claim Information" />
                  <DxcBadge
                    label={selectedProduct === 'life' ? 'Life Insurance' : 'Annuity'}
                    mode="contextual"
                    color="info"
                  />
                </DxcFlex>
                <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                  Form fields will match standard Wilton forms when specs are provided. Placeholder fields shown below.
                </DxcTypography>

                {/* Common Fields */}
                <DxcTextInput
                  label="Policy Number"
                  placeholder="Enter policy number"
                  value={formData.policyNumber}
                  onChange={({ value }) => handleInputChange('policyNumber', value)}
                  size="fillParent"
                />

                <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                  <div style={{ flex: "1 1 250px" }}>
                    <DxcTextInput
                      label="Insured Full Name"
                      placeholder="First Middle Last"
                      value={formData.insuredName}
                      onChange={({ value }) => handleInputChange('insuredName', value)}
                      size="fillParent"
                    />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <DxcTextInput
                      label="Insured SSN"
                      placeholder="XXX-XX-XXXX"
                      value={formData.insuredSSN}
                      onChange={({ value }) => handleInputChange('insuredSSN', value)}
                      size="fillParent"
                    />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <DxcDateInput
                      label="Insured Date of Birth"
                      value={formData.insuredDOB}
                      onChange={({ value }) => handleInputChange('insuredDOB', value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                </DxcFlex>

                <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                  <div style={{ flex: "1 1 200px" }}>
                    <DxcDateInput
                      label="Date of Death"
                      value={formData.dateOfDeath}
                      onChange={({ value }) => handleInputChange('dateOfDeath', value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  <div style={{ flex: "1 1 250px" }}>
                    <DxcTextInput
                      label="Cause of Death"
                      placeholder="Enter cause of death"
                      value={formData.causeOfDeath}
                      onChange={({ value }) => handleInputChange('causeOfDeath', value)}
                      size="fillParent"
                    />
                  </div>
                </DxcFlex>

                {/* Life-Specific Fields */}
                {selectedProduct === 'life' && (
                  <>
                    <DxcHeading level={4} text="Life Insurance Details" />
                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcSelect
                          label="Policy Type"
                          placeholder="Select policy type"
                          value={formData.lifeSettlementIndicator}
                          onChange={({ value }) => handleInputChange('lifeSettlementIndicator', value)}
                          options={[
                            { label: 'Whole Life', value: 'whole_life' },
                            { label: 'Term Life', value: 'term_life' },
                            { label: 'Universal Life', value: 'universal_life' },
                            { label: 'Variable Life', value: 'variable_life' }
                          ]}
                          size="fillParent"
                        />
                      </div>
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcSelect
                          label="Contestability Status"
                          placeholder="Select status"
                          value={formData.contestabilityPeriod}
                          onChange={({ value }) => handleInputChange('contestabilityPeriod', value)}
                          options={[
                            { label: 'Within Contestability (0-2 years)', value: 'within' },
                            { label: 'Past Contestability (2+ years)', value: 'past' },
                            { label: 'Unknown', value: 'unknown' }
                          ]}
                          size="fillParent"
                        />
                      </div>
                    </DxcFlex>
                  </>
                )}

                {/* Annuity-Specific Fields */}
                {selectedProduct === 'annuity' && (
                  <>
                    <DxcHeading level={4} text="Annuity Contract Details" />
                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcTextInput
                          label="Contract Number"
                          placeholder="Enter annuity contract number"
                          value={formData.annuityContractNumber}
                          onChange={({ value }) => handleInputChange('annuityContractNumber', value)}
                          size="fillParent"
                        />
                      </div>
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcSelect
                          label="Annuity Type"
                          placeholder="Select annuity type"
                          value={formData.annuityType}
                          onChange={({ value }) => handleInputChange('annuityType', value)}
                          options={[
                            { label: 'Fixed Annuity', value: 'fixed' },
                            { label: 'Variable Annuity', value: 'variable' },
                            { label: 'Indexed Annuity', value: 'indexed' },
                            { label: 'Immediate Annuity', value: 'immediate' }
                          ]}
                          size="fillParent"
                        />
                      </div>
                    </DxcFlex>
                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcSelect
                          label="Death Benefit Option"
                          placeholder="Select benefit option"
                          value={formData.deathBenefitOption}
                          onChange={({ value }) => handleInputChange('deathBenefitOption', value)}
                          options={[
                            { label: 'Return of Premium', value: 'return_premium' },
                            { label: 'Account Value', value: 'account_value' },
                            { label: 'Greater of Premium or Account Value', value: 'greater' },
                            { label: 'Stepped-Up Value', value: 'stepped_up' }
                          ]}
                          size="fillParent"
                        />
                      </div>
                    </DxcFlex>
                  </>
                )}

                <DxcTextarea
                  label="Additional Details"
                  placeholder="Provide any additional details about the claim"
                  value={formData.description}
                  onChange={({ value }) => handleInputChange('description', value)}
                  rows={4}
                />
              </DxcFlex>
            )}

            {/* =================== STEP 3: CLAIMANT INFORMATION =================== */}
            {step === 3 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Claimant / Beneficiary Information" />

                <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                  <div style={{ flex: "1 1 250px" }}>
                    <DxcTextInput
                      label="Claimant Full Name"
                      placeholder="First Middle Last"
                      value={formData.claimantName}
                      onChange={({ value }) => handleInputChange('claimantName', value)}
                      size="fillParent"
                    />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <DxcTextInput
                      label="Claimant SSN"
                      placeholder="XXX-XX-XXXX"
                      value={formData.claimantSSN}
                      onChange={({ value }) => handleInputChange('claimantSSN', value)}
                      size="fillParent"
                    />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <DxcDateInput
                      label="Date of Birth"
                      value={formData.claimantDOB}
                      onChange={({ value }) => handleInputChange('claimantDOB', value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                </DxcFlex>

                <DxcTextInput
                  label="Email Address"
                  placeholder="claimant@email.com"
                  value={formData.claimantEmail}
                  onChange={({ value }) => handleInputChange('claimantEmail', value)}
                  size="fillParent"
                />

                <DxcTextInput
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  value={formData.claimantPhone}
                  onChange={({ value }) => handleInputChange('claimantPhone', value)}
                  size="fillParent"
                />

                <DxcTextInput
                  label="Mailing Address"
                  placeholder="Street, City, State, ZIP"
                  value={formData.claimantAddress}
                  onChange={({ value }) => handleInputChange('claimantAddress', value)}
                  size="fillParent"
                />

                <DxcSelect
                  label="Relationship to Insured"
                  placeholder="Select relationship"
                  value={formData.relationship}
                  onChange={({ value }) => handleInputChange('relationship', value)}
                  options={[
                    { label: 'Spouse', value: 'spouse' },
                    { label: 'Child', value: 'child' },
                    { label: 'Parent', value: 'parent' },
                    { label: 'Sibling', value: 'sibling' },
                    { label: 'Trust/Estate', value: 'trust' },
                    { label: 'Other', value: 'other' }
                  ]}
                  size="fillParent"
                />
              </DxcFlex>
            )}

            {/* =================== STEP 4: DOCUMENT UPLOAD =================== */}
            {step === 4 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Document Upload" />

                <DxcAlert
                  semantic="info"
                  message={{ text: "Please upload required documents. Accepted formats: PDF, JPG, PNG (Max 10MB per file)" }}
                />

                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    Death Certificate *
                  </DxcTypography>
                  <DxcFileInput
                    accept=".pdf,.jpg,.jpeg,.png"
                    mode="file"
                    buttonLabel="Choose File"
                  />
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    Claimant ID Document *
                  </DxcTypography>
                  <DxcFileInput
                    accept=".pdf,.jpg,.jpeg,.png"
                    mode="file"
                    buttonLabel="Choose File"
                  />
                </DxcFlex>

                {selectedProduct === 'life' && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcTypography fontWeight="font-weight-semibold">
                      Completed Claim Form *
                    </DxcTypography>
                    <DxcFileInput
                      accept=".pdf"
                      mode="file"
                      buttonLabel="Choose File"
                    />
                  </DxcFlex>
                )}

                {selectedProduct === 'annuity' && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcTypography fontWeight="font-weight-semibold">
                      Annuity Claim Form *
                    </DxcTypography>
                    <DxcFileInput
                      accept=".pdf"
                      mode="file"
                      buttonLabel="Choose File"
                    />
                  </DxcFlex>
                )}

                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    Additional Documents (Optional)
                  </DxcTypography>
                  <DxcFileInput
                    accept=".pdf,.jpg,.jpeg,.png"
                    mode="filedrop"
                    buttonLabel="Drop files here or click to upload"
                    multiple
                  />
                </DxcFlex>

                <DxcAlert
                  semantic="warning"
                  message={{ text: "By submitting this claim, you certify that all information provided is accurate and complete." }}
                />
              </DxcFlex>
            )}

            {/* Navigation Buttons */}
            <DxcFlex justifyContent="space-between" gap="var(--spacing-gap-m)">
              <DxcButton
                label="Back"
                mode="secondary"
                onClick={handleBack}
                disabled={step === 1}
              />
              <DxcFlex gap="var(--spacing-gap-s)">
                <DxcButton
                  label="Cancel"
                  mode="tertiary"
                  onClick={() => { setStep(1); setSelectedProduct(null); }}
                />
                {step < totalSteps ? (
                  <DxcButton
                    label="Next"
                    mode="primary"
                    onClick={handleNext}
                    disabled={step === 1 && !selectedProduct}
                  />
                ) : (
                  <DxcButton
                    label={submitting ? "Submitting..." : "Submit Claim"}
                    mode="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  />
                )}
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* What Happens Next Section */}
        <DxcContainer
          padding="var(--spacing-padding-xl)"
          style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)"
          }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={3} text="What happens next?" />

            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcTypography fontWeight="font-weight-semibold">
                  1. Automatic Verification
                </DxcTypography>
                <DxcTypography color="var(--color-fg-neutral-strong)">
                  Your claim will be automatically verified through LexisNexis death verification
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcTypography fontWeight="font-weight-semibold">
                  2. Requirements Generation
                </DxcTypography>
                <DxcTypography color="var(--color-fg-neutral-strong)">
                  Our rules engine will determine any additional requirements based on policy and state regulations
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcTypography fontWeight="font-weight-semibold">
                  3. FastTrack Processing
                </DxcTypography>
                <DxcTypography color="var(--color-fg-neutral-strong)">
                  Eligible claims will be processed through our FastTrack system with a 10-day target
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcTypography fontWeight="font-weight-semibold">
                  4. Examiner Review
                </DxcTypography>
                <DxcTypography color="var(--color-fg-neutral-strong)">
                  A claims examiner will review your submission and contact you if additional information is needed
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>
      </DxcFlex>
    </DxcContainer>
  );
};

export default IntakeForms;
