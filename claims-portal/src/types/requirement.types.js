/**
 * Requirement Types and Decision Table Definitions
 */

export const RequirementStatus = {
  PENDING: 'pending',
  RECEIVED: 'received',
  IGO: 'igo',
  NIGO: 'nigo',
  WAIVED: 'waived',
  NOT_APPLICABLE: 'not_applicable'
};

export const RequirementLevel = {
  CLAIM: 'claim',
  POLICY: 'policy',
  PARTY: 'party'
};

export const RequirementType = {
  DEATH_CERTIFICATE: 'death_certificate',
  CLAIMANT_STATEMENT: 'claimant_statement',
  BENEFICIARY_ID: 'beneficiary_id',
  PROOF_OF_RELATIONSHIP: 'proof_of_relationship',
  COURT_ORDER: 'court_order',
  TRUST_DOCUMENT: 'trust_document',
  MEDICAL_RECORDS: 'medical_records',
  POLICE_REPORT: 'police_report',
  AUTOPSY_REPORT: 'autopsy_report',
  SSN_CARD: 'ssn_card',
  TAX_FORMS: 'tax_forms',
  DIRECT_DEPOSIT_FORM: 'direct_deposit_form',
  OTHER: 'other'
};

export const DecisionOperator = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  IN: 'in',
  NOT_IN: 'not_in',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_THAN_OR_EQUAL: 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL: 'less_than_or_equal',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains'
};

export const DecisionActionType = {
  ADD_REQUIREMENT: 'addRequirement',
  REMOVE_REQUIREMENT: 'removeRequirement',
  WAIVE_REQUIREMENT: 'waiveRequirement',
  GENERATE_LETTER: 'generateLetter',
  ROUTE_TO_QUEUE: 'routeToQueue',
  ESCALATE: 'escalate',
  SET_PRIORITY: 'setPriority'
};

export const LetterType = {
  INITIAL_REQUIREMENTS: 'initial_requirements',
  NIGO_NOTIFICATION: 'nigo_notification',
  FOLLOW_UP: 'follow_up',
  APPROVAL_NOTIFICATION: 'approval_notification',
  DENIAL_NOTIFICATION: 'denial_notification',
  PAYMENT_NOTIFICATION: 'payment_notification'
};

export default {
  RequirementStatus,
  RequirementLevel,
  RequirementType,
  DecisionOperator,
  DecisionActionType,
  LetterType
};
