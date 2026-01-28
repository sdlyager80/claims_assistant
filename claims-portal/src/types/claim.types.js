/**
 * Claim Status Enumeration
 */
export const ClaimStatus = {
  NEW: 'new',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  IN_REVIEW: 'in_review',
  PENDING_REQUIREMENTS: 'pending_requirements',
  REQUIREMENTS_COMPLETE: 'requirements_complete',
  IN_APPROVAL: 'in_approval',
  APPROVED: 'approved',
  PAYMENT_SCHEDULED: 'payment_scheduled',
  PAYMENT_COMPLETE: 'payment_complete',
  CLOSED: 'closed',
  DENIED: 'denied',
  SUSPENDED: 'suspended'
};

/**
 * Claim Type Enumeration
 */
export const ClaimType = {
  DEATH: 'death',
  MATURITY: 'maturity',
  SURRENDER: 'surrender',
  WITHDRAWAL: 'withdrawal',
  DISABILITY: 'disability'
};

/**
 * Routing Type for FastTrack eligibility
 */
export const RoutingType = {
  FASTTRACK: 'fasttrack',
  STANDARD: 'standard',
  EXPEDITED: 'expedited',
  SIU: 'siu'
};

/**
 * Requirement Status Enumeration
 */
export const RequirementStatus = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  SATISFIED: 'satisfied',
  REJECTED: 'rejected',
  WAIVED: 'waived',
  OVERRIDDEN: 'overridden'
};

/**
 * Requirement Type Enumeration
 */
export const RequirementType = {
  DEATH_CERTIFICATE: 'death_certificate',
  CLAIMANT_STATEMENT: 'claimant_statement',
  PROOF_OF_IDENTITY: 'proof_of_identity',
  ATTENDING_PHYSICIAN_STATEMENT: 'attending_physician_statement',
  MEDICAL_RECORDS: 'medical_records',
  BENEFICIARY_DESIGNATION: 'beneficiary_designation',
  POLICY_DOCUMENTS: 'policy_documents',
  AUTOPSY_REPORT: 'autopsy_report',
  TOXICOLOGY_REPORT: 'toxicology_report',
  POLICE_REPORT: 'police_report'
};

/**
 * Insured Person Data Structure
 * @typedef {Object} Insured
 * @property {string} name - Full name of insured
 * @property {string} ssn - Social Security Number
 * @property {string} dob - Date of birth (ISO format)
 * @property {string} dod - Date of death (ISO format)
 * @property {string} age - Age at death
 * @property {string} gender - Gender
 * @property {string} address - Full address
 */

/**
 * Policy Data Structure (from Policy Admin SOR)
 * @typedef {Object} Policy
 * @property {string} policyNumber - Policy number
 * @property {string} policyType - Type of policy (term, whole life, universal, annuity)
 * @property {number} coverage - Coverage amount
 * @property {string} issueDate - Policy issue date
 * @property {string} effectiveDate - Policy effective date
 * @property {string} status - Policy status (in-force, lapsed, suspended)
 * @property {Array<Beneficiary>} beneficiaries - List of beneficiaries
 * @property {string} premiumAmount - Premium amount
 * @property {string} premiumFrequency - Premium frequency
 */

/**
 * Beneficiary Data Structure
 * @typedef {Object} Beneficiary
 * @property {string} id - Beneficiary ID
 * @property {string} name - Full name
 * @property {string} relationship - Relationship to insured
 * @property {string} ssn - Social Security Number
 * @property {string} dob - Date of birth
 * @property {number} allocationPercent - Allocation percentage (0-100)
 * @property {string} beneficiaryType - Primary or contingent
 * @property {string} address - Full address
 * @property {string} phone - Phone number
 * @property {string} email - Email address
 */

/**
 * Financial Data Structure (cmA)
 * @typedef {Object} Financial
 * @property {number} claimAmount - Total claim amount
 * @property {number} deathBenefit - Death benefit amount
 * @property {number} interestAmount - Interest amount
 * @property {number} totalAmount - Total amount (death benefit + interest)
 * @property {Reserves} reserves - Reserve information
 * @property {Array<Payment>} payments - Payment history
 * @property {Array<PendingPayment>} pendingPayments - Pending payments
 */

/**
 * Reserves Data Structure
 * @typedef {Object} Reserves
 * @property {number} initial - Initial reserve amount
 * @property {number} current - Current reserve amount
 * @property {number} paid - Amount paid
 * @property {number} outstanding - Outstanding amount
 */

/**
 * Payment Data Structure
 * @typedef {Object} Payment
 * @property {string} id - Payment ID
 * @property {string} date - Payment date
 * @property {string} payee - Payee name
 * @property {string} type - Payment type
 * @property {number} amount - Payment amount
 * @property {string} status - Payment status
 * @property {string} method - Payment method (ACH, check)
 * @property {string} checkNumber - Check number (if applicable)
 */

/**
 * Workflow Data Structure (ServiceNow FSO)
 * @typedef {Object} Workflow
 * @property {string} fsoCase - FSO case ID
 * @property {string} caseNumber - FSO case number
 * @property {Task} currentTask - Current task
 * @property {string} routing - Routing type (fasttrack, standard)
 * @property {string} slaDate - SLA due date
 * @property {number} daysOpen - Days since claim opened
 * @property {number} daysToSla - Days remaining until SLA breach
 * @property {string} assignedTo - Assigned examiner/queue
 * @property {string} priority - Priority level
 */

/**
 * Task Data Structure
 * @typedef {Object} Task
 * @property {string} id - Task ID
 * @property {string} name - Task name
 * @property {string} type - Task type
 * @property {string} status - Task status
 * @property {string} assignedTo - Assigned user
 * @property {string} dueDate - Due date
 * @property {string} description - Task description
 */

/**
 * Requirement Data Structure
 * @typedef {Object} Requirement
 * @property {string} id - Requirement ID
 * @property {string} name - Requirement name
 * @property {string} level - Level (claim, policy, party)
 * @property {string} status - Status (pending, received, igo, nigo, waived)
 * @property {string} description - Description
 * @property {Array<string>} documents - Associated document IDs
 * @property {string} receivedDate - Date received
 * @property {string} satisfiedDate - Date satisfied
 * @property {string} nigoReason - NIGO reason
 * @property {number} nigoCount - Number of NIGO occurrences
 * @property {DeltaStatus} deltaStatus - Delta tracking
 */

/**
 * Delta Status for Letter Generation
 * @typedef {Object} DeltaStatus
 * @property {boolean} hasChanges - Has changes since last letter
 * @property {string} lastVersion - Last letter version
 * @property {string} currentVersion - Current version
 */

/**
 * Document Data Structure
 * @typedef {Object} Document
 * @property {string} id - Document ID
 * @property {string} name - Document name
 * @property {string} type - Document type
 * @property {string} classification - IDP classification
 * @property {number} classificationConfidence - Classification confidence (0-1)
 * @property {string} uploadDate - Upload date
 * @property {string} status - Document status
 * @property {string} uploadedBy - Uploaded by user
 * @property {Array<ExtractedField>} extractedFields - IDP extracted fields
 * @property {string} requirementId - Associated requirement ID
 */

/**
 * Extracted Field from IDP
 * @typedef {Object} ExtractedField
 * @property {string} name - Field name
 * @property {string} value - Extracted value
 * @property {number} confidence - Confidence score (0-1)
 * @property {Object} location - Location in document (page, bbox)
 */

/**
 * Timeline Event Data Structure
 * @typedef {Object} TimelineEvent
 * @property {string} timestamp - Event timestamp (ISO format)
 * @property {string} source - Source system (cma, policy, fso, dms, ai, correspondence)
 * @property {string} eventType - Event type
 * @property {User} user - User who triggered event
 * @property {string} description - Event description
 * @property {Object} metadata - Additional metadata
 */

/**
 * User Data Structure
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} role - User role
 * @property {string} email - Email address
 */

/**
 * AI Insights Data Structure
 * @typedef {Object} AIInsights
 * @property {number} riskScore - Risk score (0-100)
 * @property {Array<Anomaly>} anomalies - Detected anomalies
 * @property {PolicyFileAnalysis} policyFileAnalysis - Policy file analyzer results
 * @property {number} verificationConfidence - Beneficiary verification confidence (0-100)
 */

/**
 * Anomaly Data Structure
 * @typedef {Object} Anomaly
 * @property {string} id - Anomaly ID
 * @property {string} type - Anomaly type
 * @property {string} severity - Severity (high, medium, low)
 * @property {string} description - Description
 * @property {string} recommendation - Recommended action
 * @property {number} confidence - Confidence score (0-100)
 * @property {string} detectedAt - Detection timestamp
 */

/**
 * Policy File Analysis Result
 * @typedef {Object} PolicyFileAnalysis
 * @property {number} confidence - Overall confidence score (0-100)
 * @property {Array<FieldComparison>} fieldComparisons - Field-level comparisons
 * @property {string} recommendation - Recommendation (approve, review, reject)
 * @property {string} analyzedAt - Analysis timestamp
 */

/**
 * Field Comparison from Policy File Analyzer
 * @typedef {Object} FieldComparison
 * @property {string} field - Field name
 * @property {boolean} match - Whether fields match
 * @property {number} confidence - Confidence in match (0-100)
 * @property {string} extracted - Extracted value from document
 * @property {string} policy - Value from Policy Admin SOR
 */

/**
 * Sync Status for External Systems
 * @typedef {Object} SyncStatus
 * @property {SystemSync} cma - cmA sync status
 * @property {SystemSync} policyAdmin - Policy Admin sync status
 * @property {SystemSync} fso - FSO sync status
 * @property {SystemSync} dms - DMS sync status
 */

/**
 * Individual System Sync Status
 * @typedef {Object} SystemSync
 * @property {boolean} synced - Is synced
 * @property {string} lastSync - Last sync timestamp
 * @property {string} status - Sync status (synced, pending, error)
 * @property {string} error - Error message (if applicable)
 */

/**
 * Complete Claim Data Structure
 * @typedef {Object} Claim
 * @property {string} id - Claim ID
 * @property {string} claimNumber - Claim number
 * @property {string} status - Claim status
 * @property {string} claimType - Claim type
 * @property {Insured} insured - Insured person data
 * @property {Policy} policy - Policy data
 * @property {Financial} financial - Financial data
 * @property {Workflow} workflow - Workflow data
 * @property {Array<Requirement>} requirements - Requirements list
 * @property {Array<Document>} documents - Documents list
 * @property {Array<TimelineEvent>} timeline - Timeline events
 * @property {AIInsights} aiInsights - AI insights
 * @property {SyncStatus} syncStatus - Sync status with external systems
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {string} createdBy - Created by user
 * @property {string} assignedTo - Assigned examiner
 */

/**
 * Export default object with all types
 */
export default {
  ClaimStatus,
  ClaimType,
  RoutingType,
  RequirementStatus,
  RequirementType
};
