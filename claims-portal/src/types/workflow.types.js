/**
 * Workflow and Task Type Definitions for ServiceNow FSO Integration
 */

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled'
};

export const TaskType = {
  FNOL_REVIEW: 'fnol_review',
  POLICY_VERIFICATION: 'policy_verification',
  DEATH_VERIFICATION: 'death_verification',
  BENEFICIARY_VERIFICATION: 'beneficiary_verification',
  REQUIREMENTS_REVIEW: 'requirements_review',
  DOCUMENT_REVIEW: 'document_review',
  SETTLEMENT_CALCULATION: 'settlement_calculation',
  PAYMENT_APPROVAL: 'payment_approval',
  PAYMENT_EXECUTION: 'payment_execution',
  SIU_INVESTIGATION: 'siu_investigation',
  MANUAL_REVIEW: 'manual_review'
};

export const Priority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const CaseStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING_INFO: 'pending_info',
  PENDING_APPROVAL: 'pending_approval',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

export const PlaybookType = {
  FASTTRACK_CLAIM: 'fasttrack_claim',
  STANDARD_CLAIM: 'standard_claim',
  SIU_INVESTIGATION: 'siu_investigation',
  CONTESTABILITY_REVIEW: 'contestability_review',
  LARGE_CLAIM_REVIEW: 'large_claim_review'
};

export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ESCALATED: 'escalated'
};

export default {
  TaskStatus,
  TaskType,
  Priority,
  CaseStatus,
  PlaybookType,
  ApprovalStatus
};
