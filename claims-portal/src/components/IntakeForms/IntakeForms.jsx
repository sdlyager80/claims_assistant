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
  DxcInset
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import './IntakeForms.css';

const IntakeForms = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    claimType: '',
    policyNumber: '',
    insuredName: '',
    dateOfDeath: '',
    claimantName: '',
    claimantEmail: '',
    claimantPhone: '',
    relationship: '',
    description: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fnolNumber, setFnolNumber] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Map form data to ServiceNow FNOL structure
      const fnolData = {
        shortDescription: `Death Claim - ${formData.insuredName}`,
        description: formData.description,

        // Insured Information
        insured: {
          fullName: formData.insuredName,
          dateOfDeath: formData.dateOfDeath
        },

        // Claimant Information
        claimant: {
          fullName: formData.claimantName,
          emailAddress: formData.claimantEmail,
          phoneNumber: formData.claimantPhone,
          relationshipToInsured: formData.relationship
        },

        // Policy Information
        policyNumbers: formData.policyNumber,

        // Priority/Category
        priority: '3', // Medium
        urgency: '3', // Medium
        impact: '3' // Medium
      };

      // Submit to ServiceNow
      console.log('[IntakeForms] Submitting FNOL to ServiceNow:', fnolData);
      const result = await serviceNowService.createFNOL(fnolData);

      console.log('[IntakeForms] FNOL created successfully:', result);

      // Show success message with FNOL number
      setFnolNumber(result.fnolNumber);
      setShowSuccess(true);

      // Stay on step 3 to show success message
      // Reset form after 8 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setFnolNumber(null);
        setStep(1);
        setFormData({
          claimType: '',
          policyNumber: '',
          insuredName: '',
          dateOfDeath: '',
          claimantName: '',
          claimantEmail: '',
          claimantPhone: '',
          relationship: '',
          description: ''
        });
      }, 8000);
    } catch (err) {
      console.error('[IntakeForms] Error submitting FNOL:', err);
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <DxcContainer
      padding="var(--spacing-padding-xl)"
      style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Page Header */}
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcHeading level={1} text="New Claim Submission" />
          <DxcTypography color="var(--color-fg-neutral-strong)">
            Submit a First Notice of Loss (FNOL) for life and annuity claims
          </DxcTypography>
        </DxcFlex>

        {/* Success Alert */}
        {showSuccess && fnolNumber && (
          <DxcAlert
            type="success"
            inlineText={`Claim submitted successfully to ServiceNow! Your FNOL number is ${fnolNumber}.`}
          />
        )}

        {/* Error Alert */}
        {error && (
          <DxcAlert
            type="error"
            inlineText={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Main Form Container */}
        <DxcContainer
          padding="var(--spacing-padding-xl)"
          style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-l)">
            {/* Progress Bar */}
            <DxcProgressBar
              label={`Step ${step} of 3`}
              value={progress}
              showValue
            />

            {/* Step 1: Claim Information */}
            {step === 1 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Claim Information" />

                <DxcRadioGroup
                  label="Claim Type"
                  options={[
                    { label: 'Death Claim', value: 'death' },
                    { label: 'Maturity Claim', value: 'maturity' },
                    { label: 'Surrender', value: 'surrender' }
                  ]}
                  value={formData.claimType}
                  onChange={(value) => handleInputChange('claimType', value)}
                />

                <DxcTextInput
                  label="Policy Number"
                  placeholder="Enter policy number"
                  value={formData.policyNumber}
                  onChange={({ value }) => handleInputChange('policyNumber', value)}
                />

                <DxcTextInput
                  label="Insured Name"
                  placeholder="Enter insured's full name"
                  value={formData.insuredName}
                  onChange={({ value }) => handleInputChange('insuredName', value)}
                />

                <DxcDateInput
                  label="Date of Death"
                  value={formData.dateOfDeath}
                  onChange={({ value }) => handleInputChange('dateOfDeath', value)}
                  placeholder="MM/DD/YYYY"
                />

                <DxcTextarea
                  label="Claim Description"
                  placeholder="Provide any additional details about the claim"
                  value={formData.description}
                  onChange={({ value }) => handleInputChange('description', value)}
                  rows={4}
                />
              </DxcFlex>
            )}

            {/* Step 2: Claimant Information */}
            {step === 2 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Claimant Information" />

                <DxcTextInput
                  label="Claimant Name"
                  placeholder="Enter claimant's full name"
                  value={formData.claimantName}
                  onChange={({ value }) => handleInputChange('claimantName', value)}
                />

                <DxcTextInput
                  label="Email Address"
                  placeholder="claimant@email.com"
                  value={formData.claimantEmail}
                  onChange={({ value }) => handleInputChange('claimantEmail', value)}
                />

                <DxcTextInput
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  value={formData.claimantPhone}
                  onChange={({ value }) => handleInputChange('claimantPhone', value)}
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
                    { label: 'Other', value: 'other' }
                  ]}
                />
              </DxcFlex>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Document Upload" />

                <DxcAlert
                  type="info"
                  inlineText="Please upload required documents. Accepted formats: PDF, JPG, PNG (Max 10MB per file)"
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

                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    Additional Documents (Optional)
                  </DxcTypography>
                  <DxcFileInput
                    accept=".pdf,.jpg,.jpeg,.png"
                    mode="filedrop"
                    buttonLabel="Drop files here or click to upload"
                  />
                </DxcFlex>

                <DxcAlert
                  type="warning"
                  inlineText="By submitting this claim, you certify that all information provided is accurate and complete."
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
                  onClick={() => setStep(1)}
                />
                {step < 3 ? (
                  <DxcButton
                    label="Next"
                    mode="primary"
                    onClick={handleNext}
                  />
                ) : (
                  <DxcButton
                    label={submitting ? "Submitting to ServiceNow..." : "Submit Claim"}
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
          style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
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
