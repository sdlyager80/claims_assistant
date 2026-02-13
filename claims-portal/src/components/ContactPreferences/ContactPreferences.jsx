/**
 * Contact Preferences Component
 * Allows users to view and update their communication preferences
 */

import { useState, useEffect } from 'react';
import {
  DxcDialog,
  DxcFlex,
  DxcTypography,
  DxcButton,
  DxcTextInput,
  DxcCheckbox,
  DxcInset
} from '@dxc-technology/halstack-react';
import { useApp } from '../../contexts/AppContext';

const ContactPreferences = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, addNotification } = useApp();

  // Initialize preferences from user object or with empty defaults
  const [preferences, setPreferences] = useState({
    phone: user?.contactPreferences?.phone || '',
    mobile: user?.contactPreferences?.mobile || '',
    alternateEmail: user?.contactPreferences?.alternateEmail || '',
    preferredMethods: user?.contactPreferences?.preferredMethods || {
      email: true,
      phone: false,
      text: false,
      portal: true
    },
    availability: user?.contactPreferences?.availability || ''
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setPreferences({
        phone: user?.contactPreferences?.phone || '',
        mobile: user?.contactPreferences?.mobile || '',
        alternateEmail: user?.contactPreferences?.alternateEmail || '',
        preferredMethods: user?.contactPreferences?.preferredMethods || {
          email: true,
          phone: false,
          text: false,
          portal: true
        },
        availability: user?.contactPreferences?.availability || ''
      });
      setHasChanges(false);
      setValidationErrors({});
    }
  }, [isOpen, user]);

  const validatePhone = (phone) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMethodToggle = (method) => {
    setPreferences(prev => ({
      ...prev,
      preferredMethods: {
        ...prev.preferredMethods,
        [method]: !prev.preferredMethods[method]
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Validate inputs
    const errors = {};

    if (preferences.phone && !validatePhone(preferences.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (preferences.mobile && !validatePhone(preferences.mobile)) {
      errors.mobile = 'Invalid mobile number format';
    }

    if (preferences.alternateEmail && !validateEmail(preferences.alternateEmail)) {
      errors.alternateEmail = 'Invalid email format';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Update user profile with new contact preferences
    updateUserProfile({
      contactPreferences: preferences
    });

    addNotification({
      type: 'success',
      message: 'Contact preferences updated successfully',
      duration: 3000
    });

    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    onClose();
  };

  const isEmpty = !preferences.phone && !preferences.mobile && !preferences.alternateEmail;

  return (
    <DxcDialog
      isCloseVisible
      onCloseClick={handleCancel}
      overlay={true}
      padding="medium"
    >
      <DxcFlex direction="column" gap="16px" style={{ minWidth: '500px', maxWidth: '600px', padding: '0 8px' }}>
        {/* Header */}
        <DxcFlex direction="column" gap="4px">
          <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold">
            Contact Preferences
          </DxcTypography>
          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
            Update your contact information and communication preferences
          </DxcTypography>
        </DxcFlex>

        {/* Empty State Alert */}
        {isEmpty && (
          <DxcInset>
            <DxcFlex gap="8px" alignItems="flex-start">
              <span className="material-icons" style={{ color: 'var(--color-fg-warning-dark)', fontSize: '20px' }}>
                info
              </span>
              <DxcFlex direction="column" gap="4px">
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  No contact preferences set
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01">
                  Please add your contact information below to ensure we can reach you when needed.
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcInset>
        )}

        {/* Contact Information Section */}
        <DxcFlex direction="column" gap="12px">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
            Contact Information
          </DxcTypography>

          {/* Primary Email (read-only) */}
          <DxcFlex direction="column" gap="4px">
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
              Primary Email
            </DxcTypography>
            <DxcTextInput
              value={user?.email || ''}
              disabled
              size="fillParent"
            />
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
              Primary email cannot be changed here
            </DxcTypography>
          </DxcFlex>

          {/* Alternate Email */}
          <DxcFlex direction="column" gap="4px">
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
              Alternate Email
            </DxcTypography>
            <DxcTextInput
              value={preferences.alternateEmail}
              onChange={(value) => handleInputChange('alternateEmail', value)}
              placeholder="alternate.email@example.com"
              size="fillParent"
              error={validationErrors.alternateEmail}
            />
          </DxcFlex>

          {/* Phone */}
          <DxcFlex direction="column" gap="4px">
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
              Work Phone
            </DxcTypography>
            <DxcTextInput
              value={preferences.phone}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="(555) 123-4567"
              size="fillParent"
              error={validationErrors.phone}
            />
          </DxcFlex>

          {/* Mobile */}
          <DxcFlex direction="column" gap="4px">
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
              Mobile Phone
            </DxcTypography>
            <DxcTextInput
              value={preferences.mobile}
              onChange={(value) => handleInputChange('mobile', value)}
              placeholder="(555) 987-6543"
              size="fillParent"
              error={validationErrors.mobile}
            />
          </DxcFlex>

          {/* Availability */}
          <DxcFlex direction="column" gap="4px">
            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
              Availability Notes
            </DxcTypography>
            <DxcTextInput
              value={preferences.availability}
              onChange={(value) => handleInputChange('availability', value)}
              placeholder="e.g., Available Mon-Fri 9am-5pm EST"
              size="fillParent"
            />
          </DxcFlex>
        </DxcFlex>

        {/* Preferred Communication Methods */}
        <DxcFlex direction="column" gap="12px">
          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
            Preferred Communication Methods
          </DxcTypography>

          <DxcFlex direction="column" gap="8px">
            <DxcCheckbox
              label="Email"
              checked={preferences.preferredMethods.email}
              onChange={() => handleMethodToggle('email')}
            />
            <DxcCheckbox
              label="Phone Call"
              checked={preferences.preferredMethods.phone}
              onChange={() => handleMethodToggle('phone')}
            />
            <DxcCheckbox
              label="Text/SMS"
              checked={preferences.preferredMethods.text}
              onChange={() => handleMethodToggle('text')}
            />
            <DxcCheckbox
              label="Portal Notifications"
              checked={preferences.preferredMethods.portal}
              onChange={() => handleMethodToggle('portal')}
            />
          </DxcFlex>
        </DxcFlex>

        {/* Action Buttons */}
        <DxcFlex gap="12px" justifyContent="flex-end" style={{ marginTop: '8px' }}>
          <DxcButton
            label="Cancel"
            mode="tertiary"
            onClick={handleCancel}
          />
          <DxcButton
            label="Save Changes"
            mode="primary"
            onClick={handleSave}
            disabled={!hasChanges || Object.keys(validationErrors).length > 0}
          />
        </DxcFlex>
      </DxcFlex>
    </DxcDialog>
  );
};

export default ContactPreferences;
