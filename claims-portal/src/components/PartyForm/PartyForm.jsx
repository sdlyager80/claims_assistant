import { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcTextInput,
  DxcSelect,
  DxcAlert,
  DxcInset
} from '@dxc-technology/halstack-react';
import './PartyForm.css';

/**
 * SA-015: Party Add/Edit Form
 *
 * Form for adding or editing party records (all 9 party types):
 * - Insured, Owner, Agent
 * - Primary/Contingent Beneficiary
 * - Notifier, Recipient, Assignee
 * - Funeral Home
 *
 * Features:
 * - CSLN search and verification
 * - Address validation (LexisNexis)
 * - Role-specific fields
 * - Data validation
 */
const PartyForm = ({ party, onSave, onCancel, onCSLNSearch }) => {
  const [formData, setFormData] = useState({
    id: party?.id || null,
    name: party?.name || '',
    role: party?.role || 'Primary Beneficiary',
    source: party?.source || 'Manual Entry',
    resState: party?.resState || '',
    dateOfBirth: party?.dateOfBirth || '',
    ssn: party?.ssn || '',
    phone: party?.phone || '',
    email: party?.email || '',
    address: party?.address || '',
    relationship: party?.relationship || '',
    percentage: party?.percentage || 100,
    verificationStatus: party?.verificationStatus || 'Pending',
    verificationScore: party?.verificationScore || null,
    cslnAction: party?.cslnAction || '',
    cslnResult: party?.cslnResult || ''
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Party role options (all 9 types)
  const partyRoles = [
    { label: 'Insured', value: 'Insured' },
    { label: 'Primary Beneficiary', value: 'Primary Beneficiary' },
    { label: 'Contingent Beneficiary', value: 'Contingent Beneficiary' },
    { label: 'Owner', value: 'Owner' },
    { label: 'Notifier', value: 'Notifier' },
    { label: 'Recipient', value: 'Recipient' },
    { label: 'Agent', value: 'Agent' },
    { label: 'Assignee', value: 'Assignee' },
    { label: 'Funeral Home', value: 'Funeral Home' }
  ];

  // US States
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ].map(state => ({ label: state, value: state }));

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [field]: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Role-specific validations
    if (['Primary Beneficiary', 'Contingent Beneficiary'].includes(formData.role)) {
      if (!formData.relationship || formData.relationship.trim() === '') {
        newErrors.relationship = 'Relationship is required for beneficiaries';
      }
      if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
        newErrors.percentage = 'Percentage must be between 1 and 100';
      }
    }

    // SSN validation (basic format check)
    if (formData.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn)) {
      newErrors.ssn = 'SSN must be in format XXX-XX-XXXX';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (basic)
    if (formData.phone && !/^\d{3}-\d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format XXX-XXX-XXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (onSave) {
        onSave(formData);
      }

      setSuccessMessage('Party saved successfully');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrors({ general: 'Failed to save party. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCSLNSearch = () => {
    if (onCSLNSearch) {
      onCSLNSearch(formData);
    }
  };

  const isEditMode = !!party?.id;

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '24px' }}>
              person_add
            </span>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
              {isEditMode ? 'Edit Party' : 'Add Party'}
            </DxcTypography>
          </DxcFlex>
          {onCancel && (
            <DxcButton
              mode="tertiary"
              icon="close"
              onClick={onCancel}
            />
          )}
        </DxcFlex>

        {/* Success Message */}
        {successMessage && (
          <DxcAlert
            type="success"
            inlineText={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {/* General Error */}
        {errors.general && (
          <DxcAlert
            type="error"
            inlineText={errors.general}
            onClose={() => setErrors(prev => ({ ...prev, general: null }))}
          />
        )}

        {/* Basic Information */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              Basic Information
            </DxcTypography>

            <div className="party-form-grid">
              <DxcTextInput
                label="Full Name *"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                error={errors.name}
                size="fillParent"
              />

              <DxcSelect
                label="Role *"
                value={formData.role}
                onChange={(value) => handleInputChange('role', value)}
                options={partyRoles}
                size="fillParent"
              />

              <DxcTextInput
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(value) => handleInputChange('dateOfBirth', value)}
                type="date"
                size="fillParent"
              />

              <DxcTextInput
                label="SSN"
                value={formData.ssn}
                onChange={(value) => handleInputChange('ssn', value)}
                placeholder="XXX-XX-XXXX"
                error={errors.ssn}
                size="fillParent"
              />
            </div>
          </DxcFlex>
        </DxcContainer>

        {/* Contact Information */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              Contact Information
            </DxcTypography>

            <div className="party-form-grid">
              <DxcTextInput
                label="Phone"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                placeholder="XXX-XXX-XXXX"
                error={errors.phone}
                size="fillParent"
              />

              <DxcTextInput
                label="Email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                type="email"
                error={errors.email}
                size="fillParent"
              />

              <DxcSelect
                label="Residence State"
                value={formData.resState}
                onChange={(value) => handleInputChange('resState', value)}
                options={states}
                size="fillParent"
              />
            </div>

            <DxcTextInput
              label="Address"
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              size="fillParent"
            />
          </DxcFlex>
        </DxcContainer>

        {/* Beneficiary-Specific Fields */}
        {['Primary Beneficiary', 'Contingent Beneficiary'].includes(formData.role) && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-info-lightest)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                Beneficiary Details
              </DxcTypography>

              <div className="party-form-grid">
                <DxcTextInput
                  label="Relationship to Insured *"
                  value={formData.relationship}
                  onChange={(value) => handleInputChange('relationship', value)}
                  placeholder="e.g., Spouse, Child, Sibling"
                  error={errors.relationship}
                  size="fillParent"
                />

                <DxcTextInput
                  label="Percentage *"
                  value={formData.percentage}
                  onChange={(value) => handleInputChange('percentage', parseFloat(value) || 0)}
                  type="number"
                  suffix="%"
                  error={errors.percentage}
                  size="fillParent"
                />
              </div>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* CSLN Verification */}
        {isEditMode && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  CSLN Verification
                </DxcTypography>
                {onCSLNSearch && (
                  <DxcButton
                    label="Run CSLN Search"
                    mode="secondary"
                    size="small"
                    icon="search"
                    onClick={handleCSLNSearch}
                  />
                )}
              </DxcFlex>

              <div className="party-form-grid">
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Verification Status
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    {formData.verificationStatus}
                  </DxcTypography>
                </DxcFlex>

                {formData.verificationScore !== null && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                      Verification Score
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                      {formData.verificationScore}%
                    </DxcTypography>
                  </DxcFlex>
                )}

                {formData.cslnResult && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                      CSLN Result
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                      {formData.cslnResult}
                    </DxcTypography>
                  </DxcFlex>
                )}
              </div>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Info Alert */}
        <DxcAlert
          type="info"
          inlineText="Party information will be verified against cmA and Policy Admin systems. CSLN search can be performed after initial save."
        />

        {/* Actions */}
        <DxcFlex gap="var(--spacing-gap-s)" justifyContent="flex-end">
          {onCancel && (
            <DxcButton
              label="Cancel"
              mode="tertiary"
              onClick={onCancel}
            />
          )}
          <DxcButton
            label={isEditMode ? 'Update Party' : 'Add Party'}
            mode="primary"
            icon={isEditMode ? 'save' : 'person_add'}
            onClick={handleSave}
            disabled={isSaving}
          />
        </DxcFlex>
      </DxcFlex>
    </DxcContainer>
  );
};

export default PartyForm;
