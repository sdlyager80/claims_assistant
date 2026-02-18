/**
 * Product Line Configuration
 * Controls demo data, terminology, and labels for each product line.
 * Toggle between L&A (Life & Annuity) and P&C (Personal & Commercial) in the Actions Menu.
 */

export const PRODUCT_LINES = {
  LA: 'la',
  PC: 'pc'
};

export const productLineConfig = {
  [PRODUCT_LINES.LA]: {
    id: 'la',
    label: 'Life & Annuity',
    shortLabel: 'L&A',
    icon: 'favorite',
    color: '#0F4470',
    terms: {
      insured: 'Insured',
      claimant: 'Beneficiary',
      dateOfLoss: 'Date of Death',
      causeOfLoss: 'Cause of Death',
      lossEvent: 'Death Event',
      coverageVerification: 'Death Verification',
      coverageLimit: 'Face Amount',
      primaryDocument: 'Death Certificate',
      stpLabel: 'STP',
      stpFull: 'Straight Through Processing',
      routingLabel: 'STP Routing',
      fastTrackMetric: 'STP Eligible',
      fastTrackPct: 'STP %',
      claimsLabel: 'Life Claims',
      workbenchTitle: 'Life Claims Workbench',
      partyRoles: ['Insured', 'Primary Beneficiary', 'Contingent Beneficiary', 'Notifier'],
      policyTypeLabel: 'Policy Type',
      interestLabel: 'Post-Mortem Interest (PMI)',
      reserveLabel: 'Reserve',
      deductibleLabel: 'Deductible'
    },
    claimTypeLabels: {
      death: 'Death',
      maturity: 'Maturity',
      disability: 'Disability',
      surrender: 'Surrender',
      withdrawal: 'Withdrawal'
    },
    dashboardSections: {
      inventory: 'Department Inventory',
      openClaims: 'Open Claims',
      closedClaims: 'Closed Claims'
    }
  },

  [PRODUCT_LINES.PC]: {
    id: 'pc',
    label: 'Personal & Commercial',
    shortLabel: 'P&C',
    icon: 'directions_car',
    color: '#1B75BB',
    terms: {
      insured: 'Policyholder',
      claimant: 'Claimant',
      dateOfLoss: 'Date of Loss',
      causeOfLoss: 'Cause of Loss',
      lossEvent: 'Loss Event',
      coverageVerification: 'Coverage Verification',
      coverageLimit: 'Coverage Limit',
      primaryDocument: 'Police Report / Damage Photos',
      stpLabel: 'Fast Track',
      stpFull: 'Fast Track Processing',
      routingLabel: 'Fast Track',
      fastTrackMetric: 'Fast Track',
      fastTrackPct: 'Fast Track %',
      claimsLabel: 'P&C Claims',
      workbenchTitle: 'P&C Claims Workbench',
      partyRoles: ['Policyholder', 'Claimant', 'Third Party', 'Adjuster'],
      policyTypeLabel: 'Coverage Type',
      interestLabel: 'Pre-Judgment Interest',
      reserveLabel: 'Reserve',
      deductibleLabel: 'Deductible'
    },
    claimTypeLabels: {
      auto_collision: 'Auto Collision',
      auto_comprehensive: 'Auto Comprehensive',
      homeowners: 'Homeowners',
      commercial_property: 'Commercial Property',
      auto_liability: 'Auto Liability',
      workers_comp: 'Workers Compensation'
    },
    dashboardSections: {
      inventory: 'Department Inventory',
      openClaims: 'Open Claims',
      closedClaims: 'Closed Claims'
    }
  }
};

/**
 * Get config for a product line
 */
export const getProductLineConfig = (productLine) =>
  productLineConfig[productLine] || productLineConfig[PRODUCT_LINES.LA];

/**
 * Get a terminology label for a product line
 */
export const getTerm = (productLine, key) => {
  const config = getProductLineConfig(productLine);
  return config.terms[key] || key;
};

/**
 * Get the display label for a claim type
 */
export const getClaimTypeLabel = (productLine, type) => {
  const config = getProductLineConfig(productLine);
  return config.claimTypeLabels[type] || type;
};

export default productLineConfig;
