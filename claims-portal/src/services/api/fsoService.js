/**
 * ServiceNow FSO (Financial Services Operations) Service
 * Workflow Orchestration and Case Management
 *
 * FSO provides:
 * - Case management (FSO cases)
 * - Task assignment and tracking
 * - Workflow playbooks
 * - SLA monitoring
 * - Approval workflows
 */

import apiClient from './apiClient';
import cacheManager from '../utils/cacheManager';
import { handleAPIError } from '../utils/errorHandler';
import eventBus, { EventTypes } from '../sync/eventBus';
import demoData from '../../data/demoData';

const FSO_BASE_PATH = '/fso';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (workflow data changes frequently)
const USE_DEMO_DATA = true; // Toggle for demo mode

/**
 * Case Management
 */

/**
 * Create FSO case
 * @param {Object} caseData - Case data
 * @returns {Promise<Object>} Created case
 */
export const createCase = async (caseData) => {
  try {
    console.log('[FSO] Creating case:', caseData);

    const fsoCase = await apiClient.post(`${FSO_BASE_PATH}/cases`, caseData);

    // Publish event
    eventBus.publish(EventTypes.CASE_CREATED, { fsoCase });

    return fsoCase;
  } catch (error) {
    throw handleAPIError(error, 'FSO.createCase');
  }
};

/**
 * Get FSO case by ID
 * @param {string} caseId - Case ID
 * @param {boolean} bypassCache - Bypass cache
 * @returns {Promise<Object>} Case data
 */
export const getCase = async (caseId, bypassCache = false) => {
  try {
    // DEMO MODE: Return demo data
    if (USE_DEMO_DATA) {
      console.log(`[FSO] Getting demo case: ${caseId}`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const fsoCase = demoData.fsoCases.find(c => c.id === caseId);

      if (!fsoCase) {
        throw new Error(`Case not found: ${caseId}`);
      }

      return fsoCase;
    }

    const cacheKey = cacheManager.generateKey('fso:case', { caseId });

    if (!bypassCache) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    console.log(`[FSO] Getting case: ${caseId}`);

    const fsoCase = await apiClient.get(`${FSO_BASE_PATH}/cases/${caseId}`);

    cacheManager.set(cacheKey, fsoCase, CACHE_TTL);

    return fsoCase;
  } catch (error) {
    throw handleAPIError(error, 'FSO.getCase');
  }
};

/**
 * Update FSO case
 * @param {string} caseId - Case ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated case
 */
export const updateCase = async (caseId, updates) => {
  try {
    console.log(`[FSO] Updating case: ${caseId}`, updates);

    const fsoCase = await apiClient.patch(`${FSO_BASE_PATH}/cases/${caseId}`, updates);

    // Invalidate cache
    const cacheKey = cacheManager.generateKey('fso:case', { caseId });
    cacheManager.delete(cacheKey);

    // Publish event
    eventBus.publish(EventTypes.CASE_STATUS_CHANGED, { caseId, fsoCase });

    return fsoCase;
  } catch (error) {
    throw handleAPIError(error, 'FSO.updateCase');
  }
};

/**
 * Get cases with filters
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of cases
 */
export const getCases = async (filters = {}) => {
  try {
    console.log('[FSO] Getting cases with filters:', filters);

    const cases = await apiClient.get(`${FSO_BASE_PATH}/cases`, { params: filters });

    return cases;
  } catch (error) {
    throw handleAPIError(error, 'FSO.getCases');
  }
};

/**
 * Close case
 * @param {string} caseId - Case ID
 * @param {string} resolution - Resolution notes
 * @returns {Promise<Object>} Closed case
 */
export const closeCase = async (caseId, resolution) => {
  try {
    console.log(`[FSO] Closing case: ${caseId}`);

    const result = await apiClient.post(`${FSO_BASE_PATH}/cases/${caseId}/close`, { resolution });

    // Invalidate cache
    invalidateCaseCache(caseId);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'FSO.closeCase');
  }
};

/**
 * Task Management
 */

/**
 * Create task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  try {
    console.log('[FSO] Creating task:', taskData);

    const task = await apiClient.post(`${FSO_BASE_PATH}/tasks`, taskData);

    // Publish event
    eventBus.publish(EventTypes.TASK_CREATED, { task });

    return task;
  } catch (error) {
    throw handleAPIError(error, 'FSO.createTask');
  }
};

/**
 * Get task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task data
 */
export const getTask = async (taskId) => {
  try {
    const cacheKey = cacheManager.generateKey('fso:task', { taskId });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[FSO] Getting task: ${taskId}`);

    const task = await apiClient.get(`${FSO_BASE_PATH}/tasks/${taskId}`);

    cacheManager.set(cacheKey, task, CACHE_TTL);

    return task;
  } catch (error) {
    throw handleAPIError(error, 'FSO.getTask');
  }
};

/**
 * Update task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (taskId, updates) => {
  try {
    console.log(`[FSO] Updating task: ${taskId}`, updates);

    const task = await apiClient.patch(`${FSO_BASE_PATH}/tasks/${taskId}`, updates);

    // Invalidate cache
    const cacheKey = cacheManager.generateKey('fso:task', { taskId });
    cacheManager.delete(cacheKey);

    return task;
  } catch (error) {
    throw handleAPIError(error, 'FSO.updateTask');
  }
};

/**
 * Assign task to user
 * @param {string} taskId - Task ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Assignment result
 */
export const assignTask = async (taskId, userId) => {
  try {
    console.log(`[FSO] Assigning task ${taskId} to user ${userId}`);

    const result = await apiClient.post(`${FSO_BASE_PATH}/tasks/${taskId}/assign`, { userId });

    // Invalidate cache
    const cacheKey = cacheManager.generateKey('fso:task', { taskId });
    cacheManager.delete(cacheKey);

    // Publish event
    eventBus.publish(EventTypes.TASK_ASSIGNED, { taskId, userId });

    return result;
  } catch (error) {
    throw handleAPIError(error, 'FSO.assignTask');
  }
};

/**
 * Complete task
 * @param {string} taskId - Task ID
 * @param {Object} completionData - Completion data
 * @returns {Promise<Object>} Completion result
 */
export const completeTask = async (taskId, completionData = {}) => {
  try {
    console.log(`[FSO] Completing task: ${taskId}`);

    const result = await apiClient.post(`${FSO_BASE_PATH}/tasks/${taskId}/complete`, completionData);

    // Invalidate cache
    const cacheKey = cacheManager.generateKey('fso:task', { taskId });
    cacheManager.delete(cacheKey);

    // Publish event
    eventBus.publish(EventTypes.TASK_COMPLETED, { taskId, completionData });

    return result;
  } catch (error) {
    throw handleAPIError(error, 'FSO.completeTask');
  }
};

/**
 * Get tasks for case
 * @param {string} caseId - Case ID
 * @returns {Promise<Array>} List of tasks
 */
export const getCaseTasks = async (caseId) => {
  try {
    const cacheKey = cacheManager.generateKey('fso:case-tasks', { caseId });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[FSO] Getting tasks for case: ${caseId}`);

    const tasks = await apiClient.get(`${FSO_BASE_PATH}/cases/${caseId}/tasks`);

    cacheManager.set(cacheKey, tasks, CACHE_TTL);

    return tasks;
  } catch (error) {
    throw handleAPIError(error, 'FSO.getCaseTasks');
  }
};

/**
 * Get tasks assigned to user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of assigned tasks
 */
export const getUserTasks = async (userId) => {
  try {
    console.log(`[FSO] Getting tasks for user: ${userId}`);

    const tasks = await apiClient.get(`${FSO_BASE_PATH}/users/${userId}/tasks`);

    return tasks;
  } catch (error) {
    throw handleAPIError(error, 'FSO.getUserTasks');
  }
};

/**
 * Playbook Management
 */

/**
 * Execute playbook on case
 * @param {string} caseId - Case ID
 * @param {string} playbookName - Playbook name
 * @returns {Promise<Object>} Execution result
 */
export const executePlaybook = async (caseId, playbookName) => {
  try {
    console.log(`[FSO] Executing playbook ${playbookName} on case ${caseId}`);

    const result = await apiClient.post(`${FSO_BASE_PATH}/cases/${caseId}/playbooks/${playbookName}/execute`);

    // Invalidate case cache
    invalidateCaseCache(caseId);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'FSO.executePlaybook');
  }
};

/**
 * Get available playbooks
 * @returns {Promise<Array>} List of playbooks
 */
export const getPlaybooks = async () => {
  try {
    const cacheKey = 'fso:playbooks';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log('[FSO] Getting available playbooks');

    const playbooks = await apiClient.get(`${FSO_BASE_PATH}/playbooks`);

    cacheManager.set(cacheKey, playbooks, 60 * 60 * 1000); // 1 hour

    return playbooks;
  } catch (error) {
    throw handleAPIError(error, 'FSO.getPlaybooks');
  }
};

/**
 * SLA Management
 */

/**
 * Get SLA status for case
 * @param {string} caseId - Case ID
 * @returns {Promise<Object>} SLA status
 */
export const getSLAStatus = async (caseId) => {
  try {
    console.log(`[FSO] Getting SLA status for case: ${caseId}`);

    const slaStatus = await apiClient.get(`${FSO_BASE_PATH}/cases/${caseId}/sla`);

    return slaStatus;
  } catch (error) {
    throw handleAPIError(error, 'FSO.getSLAStatus');
  }
};

/**
 * Get cases at risk of SLA breach
 * @param {number} daysThreshold - Days threshold (default: 3)
 * @returns {Promise<Array>} At-risk cases
 */
export const getSLAAtRiskCases = async (daysThreshold = 3) => {
  try {
    // DEMO MODE: Return demo data
    if (USE_DEMO_DATA) {
      console.log(`[FSO] Getting demo SLA at-risk cases (threshold: ${daysThreshold} days)`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Filter cases where sla.atRisk is true and daysRemaining < threshold
      const atRiskCases = demoData.fsoCases.filter(c =>
        c.sla?.atRisk === true &&
        c.sla?.daysRemaining < daysThreshold &&
        c.status !== 'Closed'
      );

      return atRiskCases;
    }

    console.log(`[FSO] Getting SLA at-risk cases (threshold: ${daysThreshold} days)`);

    const cases = await apiClient.get(`${FSO_BASE_PATH}/cases/sla-at-risk`, {
      params: { daysThreshold }
    });

    return cases;
  } catch (error) {
    throw handleAPIError(error, 'FSO.getSLAAtRiskCases');
  }
};

/**
 * Approval Workflows
 */

/**
 * Submit for approval
 * @param {string} caseId - Case ID
 * @param {Object} approvalData - Approval data
 * @returns {Promise<Object>} Approval request
 */
export const submitForApproval = async (caseId, approvalData) => {
  try {
    console.log(`[FSO] Submitting case ${caseId} for approval`);

    const result = await apiClient.post(`${FSO_BASE_PATH}/cases/${caseId}/approve`, approvalData);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'FSO.submitForApproval');
  }
};

/**
 * Approve case
 * @param {string} caseId - Case ID
 * @param {string} approverNotes - Approver notes
 * @returns {Promise<Object>} Approval result
 */
export const approveCase = async (caseId, approverNotes = '') => {
  try {
    console.log(`[FSO] Approving case: ${caseId}`);

    const result = await apiClient.post(`${FSO_BASE_PATH}/cases/${caseId}/approve/confirm`, {
      approved: true,
      notes: approverNotes
    });

    // Invalidate cache
    invalidateCaseCache(caseId);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'FSO.approveCase');
  }
};

/**
 * Reject case
 * @param {string} caseId - Case ID
 * @param {string} rejectionReason - Rejection reason
 * @returns {Promise<Object>} Rejection result
 */
export const rejectCase = async (caseId, rejectionReason) => {
  try {
    console.log(`[FSO] Rejecting case: ${caseId}`);

    const result = await apiClient.post(`${FSO_BASE_PATH}/cases/${caseId}/approve/confirm`, {
      approved: false,
      notes: rejectionReason
    });

    // Invalidate cache
    invalidateCaseCache(caseId);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'FSO.rejectCase');
  }
};

/**
 * Cache Invalidation
 */

/**
 * Invalidate all case-related cache
 * @param {string} caseId - Case ID
 */
export const invalidateCaseCache = (caseId) => {
  cacheManager.delete(cacheManager.generateKey('fso:case', { caseId }));
  cacheManager.delete(cacheManager.generateKey('fso:case-tasks', { caseId }));
  console.log(`[FSO] Cache invalidated for case: ${caseId}`);
};

export default {
  // Case Management
  createCase,
  getCase,
  updateCase,
  getCases,
  closeCase,

  // Task Management
  createTask,
  getTask,
  updateTask,
  assignTask,
  completeTask,
  getCaseTasks,
  getUserTasks,

  // Playbook Management
  executePlaybook,
  getPlaybooks,

  // SLA Management
  getSLAStatus,
  getSLAAtRiskCases,

  // Approval Workflows
  submitForApproval,
  approveCase,
  rejectCase,

  // Cache
  invalidateCaseCache
};
