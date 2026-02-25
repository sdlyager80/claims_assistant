import { useState } from 'react';
import './PartyForm.css';

/**
 * SA-015: Party Add/Edit Form
 * Renders as a full-screen custom overlay modal (same design as Update Death Details).
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
    percentage: party?.percentage !== undefined ? party.percentage : 100,
    verificationStatus: party?.verificationStatus || 'Pending',
    verificationScore: party?.verificationScore || null,
    cslnAction: party?.cslnAction || '',
    cslnResult: party?.cslnResult || ''
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const partyRoles = [
    'Insured', 'Primary Beneficiary', 'Contingent Beneficiary',
    'Owner', 'Notifier', 'Recipient', 'Agent', 'Assignee', 'Funeral Home'
  ];

  const states = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
  ];

  const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandchild', 'Grandparent', 'Other'];

  const set = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.role) e.role = 'Role is required';
    if (['Primary Beneficiary', 'Contingent Beneficiary'].includes(formData.role)) {
      if (!formData.relationship) e.relationship = 'Relationship is required';
      if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100)
        e.percentage = 'Must be between 1–100';
    }
    if (formData.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn))
      e.ssn = 'Format: XXX-XX-XXXX';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Invalid email';
    if (formData.phone && !/^\d{3}-\d{3}-\d{4}$/.test(formData.phone))
      e.phone = 'Format: XXX-XXX-XXXX';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      if (onSave) onSave(formData);
    } catch {
      setSaveError('Failed to save party. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const close = () => { if (!isSaving && onCancel) onCancel(); };
  const isEditMode = !!party?.id;
  const isBeneficiary = ['Primary Beneficiary', 'Contingent Beneficiary'].includes(formData.role);

  return (
    <div
      className="party-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="party-modal">

        {/* Header */}
        <div className="party-modal__header">
          <div className="party-modal__header-icon">
            <span className="material-icons">{isEditMode ? 'edit' : 'person_add'}</span>
          </div>
          <div>
            <div className="party-modal__header-title">
              {isEditMode ? 'Edit Party' : 'Add Party'}
            </div>
            <div className="party-modal__header-sub">
              {isEditMode
                ? `Editing ${party.role || 'party'} record`
                : 'Add a new party to this claim'}
            </div>
          </div>
          <button className="party-modal__close" onClick={close} disabled={isSaving} type="button">
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="party-modal__body">

          {/* Error Banner */}
          {saveError && (
            <div className="party-modal__alert">
              <span className="material-icons" style={{ fontSize: '16px' }}>error</span>
              {saveError}
              <button
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', display: 'flex' }}
                onClick={() => setSaveError(null)}
                type="button"
              >
                <span className="material-icons" style={{ fontSize: '14px' }}>close</span>
              </button>
            </div>
          )}

          {/* Section: Identity */}
          <div className="party-modal__section">
            <div className="party-modal__section-label">
              <span className="material-icons">badge</span> Identity
            </div>
            <div className="party-modal__grid-2">

              <div className="party-modal__field party-modal__field--full">
                <label className="party-modal__label">
                  Full Name <span className="party-modal__required">*</span>
                </label>
                <div className="party-modal__input-wrap">
                  <span className="material-icons party-modal__input-icon">person</span>
                  <input
                    type="text"
                    className={`party-modal__input${errors.name ? ' party-modal__input--error' : ''}`}
                    placeholder="First and Last Name"
                    value={formData.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </div>
                {errors.name && <span className="party-modal__field-error">{errors.name}</span>}
              </div>

              <div className="party-modal__field">
                <label className="party-modal__label">
                  Role <span className="party-modal__required">*</span>
                </label>
                <div className="party-modal__input-wrap">
                  <span className="material-icons party-modal__input-icon">manage_accounts</span>
                  <select
                    className={`party-modal__select${errors.role ? ' party-modal__input--error' : ''}`}
                    value={formData.role}
                    onChange={e => set('role', e.target.value)}
                  >
                    {partyRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {errors.role && <span className="party-modal__field-error">{errors.role}</span>}
              </div>

              <div className="party-modal__field">
                <label className="party-modal__label">
                  Date of Birth <span className="party-modal__optional">(optional)</span>
                </label>
                <div className="party-modal__input-wrap">
                  <span className="material-icons party-modal__input-icon">cake</span>
                  <input
                    type="date"
                    className="party-modal__input"
                    value={formData.dateOfBirth}
                    onChange={e => set('dateOfBirth', e.target.value)}
                  />
                </div>
              </div>

              <div className="party-modal__field">
                <label className="party-modal__label">
                  SSN <span className="party-modal__optional">(optional)</span>
                </label>
                <div className="party-modal__input-wrap">
                  <span className="material-icons party-modal__input-icon">lock</span>
                  <input
                    type="text"
                    className={`party-modal__input${errors.ssn ? ' party-modal__input--error' : ''}`}
                    placeholder="XXX-XX-XXXX"
                    value={formData.ssn}
                    onChange={e => set('ssn', e.target.value)}
                  />
                </div>
                {errors.ssn && <span className="party-modal__field-error">{errors.ssn}</span>}
              </div>

            </div>
          </div>

          {/* Section: Contact */}
          <div className="party-modal__section">
            <div className="party-modal__section-label">
              <span className="material-icons">contact_phone</span> Contact Information
            </div>
            <div className="party-modal__grid-2">

              <div className="party-modal__field">
                <label className="party-modal__label">Phone</label>
                <div className="party-modal__input-wrap">
                  <span className="material-icons party-modal__input-icon">phone</span>
                  <input
                    type="text"
                    className={`party-modal__input${errors.phone ? ' party-modal__input--error' : ''}`}
                    placeholder="XXX-XXX-XXXX"
                    value={formData.phone}
                    onChange={e => set('phone', e.target.value)}
                  />
                </div>
                {errors.phone && <span className="party-modal__field-error">{errors.phone}</span>}
              </div>

              <div className="party-modal__field">
                <label className="party-modal__label">Email</label>
                <div className="party-modal__input-wrap">
                  <span className="material-icons party-modal__input-icon">email</span>
                  <input
                    type="email"
                    className={`party-modal__input${errors.email ? ' party-modal__input--error' : ''}`}
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
                {errors.email && <span className="party-modal__field-error">{errors.email}</span>}
              </div>

              <div className="party-modal__field">
                <label className="party-modal__label">Residence State</label>
                <div className="party-modal__input-wrap">
                  <span className="material-icons party-modal__input-icon">location_on</span>
                  <select
                    className="party-modal__select"
                    value={formData.resState}
                    onChange={e => set('resState', e.target.value)}
                  >
                    <option value="">Select state...</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="party-modal__field party-modal__field--full">
                <label className="party-modal__label">Address</label>
                <div className="party-modal__input-wrap">
                  <span className="material-icons party-modal__input-icon">home</span>
                  <input
                    type="text"
                    className="party-modal__input"
                    placeholder="Street, City, State, ZIP"
                    value={formData.address}
                    onChange={e => set('address', e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section: Beneficiary Details (conditional) */}
          {isBeneficiary && (
            <div className="party-modal__section party-modal__section--info">
              <div className="party-modal__section-label party-modal__section-label--info">
                <span className="material-icons">family_restroom</span> Beneficiary Details
              </div>
              <div className="party-modal__grid-2">

                <div className="party-modal__field">
                  <label className="party-modal__label">
                    Relationship to Insured <span className="party-modal__required">*</span>
                  </label>
                  <div className="party-modal__input-wrap">
                    <span className="material-icons party-modal__input-icon">people</span>
                    <select
                      className={`party-modal__select${errors.relationship ? ' party-modal__input--error' : ''}`}
                      value={formData.relationship}
                      onChange={e => set('relationship', e.target.value)}
                    >
                      <option value="">Select relationship...</option>
                      {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {errors.relationship && <span className="party-modal__field-error">{errors.relationship}</span>}
                </div>

                <div className="party-modal__field">
                  <label className="party-modal__label">
                    Percentage <span className="party-modal__required">*</span>
                  </label>
                  <div className="party-modal__input-wrap">
                    <span className="material-icons party-modal__input-icon">percent</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className={`party-modal__input${errors.percentage ? ' party-modal__input--error' : ''}`}
                      placeholder="100"
                      value={formData.percentage}
                      onChange={e => set('percentage', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  {errors.percentage && <span className="party-modal__field-error">{errors.percentage}</span>}
                </div>

              </div>
            </div>
          )}

          {/* Section: CSLN Verification (edit mode only) */}
          {isEditMode && (
            <div className="party-modal__section">
              <div className="party-modal__section-label party-modal__section-label--between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-icons">verified_user</span> CSLN Verification
                </div>
                {onCSLNSearch && (
                  <button
                    type="button"
                    className="party-modal__csln-btn"
                    onClick={() => onCSLNSearch(formData)}
                  >
                    <span className="material-icons">search</span>
                    Run CSLN Search
                  </button>
                )}
              </div>
              <div className="party-modal__grid-3">
                <div className="party-modal__stat">
                  <span className="party-modal__stat-label">Status</span>
                  <span className="party-modal__stat-val">{formData.verificationStatus}</span>
                </div>
                {formData.verificationScore !== null && (
                  <div className="party-modal__stat">
                    <span className="party-modal__stat-label">Score</span>
                    <span className="party-modal__stat-val">{formData.verificationScore}%</span>
                  </div>
                )}
                {formData.cslnResult && (
                  <div className="party-modal__stat">
                    <span className="party-modal__stat-label">Result</span>
                    <span className="party-modal__stat-val">{formData.cslnResult}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="party-modal__footer">
          <button
            type="button"
            className="party-modal__btn party-modal__btn--cancel"
            onClick={close}
            disabled={isSaving}
          >Cancel</button>
          <button
            type="button"
            className={`party-modal__btn party-modal__btn--save${isSaving ? ' party-modal__btn--saving' : ''}`}
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? (
              <>
                <span className="material-icons party-modal__spin">sync</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons">{isEditMode ? 'save' : 'person_add'}</span>
                {isEditMode ? 'Update Party' : 'Add Party'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PartyForm;
