/**
 * Policy Types and Status Enumerations
 */

export const PolicyType = {
  TERM_LIFE: 'term',
  WHOLE_LIFE: 'whole',
  UNIVERSAL_LIFE: 'universal',
  VARIABLE_LIFE: 'variable',
  ANNUITY: 'annuity',
  FIXED_ANNUITY: 'fixed_annuity',
  VARIABLE_ANNUITY: 'variable_annuity'
};

export const PolicyStatus = {
  IN_FORCE: 'in_force',
  LAPSED: 'lapsed',
  SUSPENDED: 'suspended',
  MATURED: 'matured',
  SURRENDERED: 'surrendered',
  TERMINATED: 'terminated'
};

export const BeneficiaryType = {
  PRIMARY: 'primary',
  CONTINGENT: 'contingent',
  TERTIARY: 'tertiary'
};

export const Relationship = {
  SPOUSE: 'spouse',
  CHILD: 'child',
  PARENT: 'parent',
  SIBLING: 'sibling',
  TRUST: 'trust',
  ESTATE: 'estate',
  OTHER: 'other'
};

export default {
  PolicyType,
  PolicyStatus,
  BeneficiaryType,
  Relationship
};
