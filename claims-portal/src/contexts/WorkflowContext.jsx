/**
 * Workflow Context
 * ServiceNow FSO orchestration state management
 * - FSO cases and tasks
 * - Task assignment and completion
 * - SLA tracking
 * - Playbook execution
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import fsoService from '../services/api/fsoService';
import { handleAPIError } from '../services/utils/errorHandler';
import eventBus, { EventTypes } from '../services/sync/eventBus';

const WorkflowContext = createContext(null);

export const WorkflowProvider = ({ children }) => {
  // Current Case State
  const [currentCase, setCurrentCase] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseError, setCaseError] = useState(null);

  // Cases List State
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);

  // Tasks State
  const [caseTasks, setCaseTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // User Tasks State
  const [userTasks, setUserTasks] = useState([]);
  const [userTasksLoading, setUserTasksLoading] = useState(false);

  // SLA State
  const [slaStatus, setSlaStatus] = useState(null);
  const [slaAtRiskCases, setSlaAtRiskCases] = useState([]);

  // Playbooks State
  const [availablePlaybooks, setAvailablePlaybooks] = useState([]);

  /**
   * Case Management
   */

  /**
   * Create FSO Case
   */
  const createCase = useCallback(async (caseData) => {
    try {
      setCaseLoading(true);
      setCaseError(null);

      const newCase = await fsoService.createCase(caseData);

      setCurrentCase(newCase);
      setCases(prev => [newCase, ...prev]);

      return newCase;

    } catch (error) {
      const apiError = handleAPIError(error, 'WorkflowContext.createCase');
      setCaseError(apiError);
      throw error;
    } finally {
      setCaseLoading(false);
    }
  }, []);

  /**
   * Get FSO Case
   */
  const fetchCase = useCallback(async (caseId, bypassCache = false) => {
    try {
      setCaseLoading(true);
      setCaseError(null);

      const fsoCase = await fsoService.getCase(caseId, bypassCache);

      setCurrentCase(fsoCase);

      return fsoCase;

    } catch (error) {
      const apiError = handleAPIError(error, 'WorkflowContext.fetchCase');
      setCaseError(apiError);
      throw error;
    } finally {
      setCaseLoading(false);
    }
  }, []);

  /**
   * Update FSO Case
   */
  const updateCase = useCallback(async (caseId, updates) => {
    try {
      setCaseLoading(true);

      const updatedCase = await fsoService.updateCase(caseId, updates);

      // Update in cases list
      setCases(prev =>
        prev.map(c => (c.id === caseId ? updatedCase : c))
      );

      // Update current case if it's the same
      if (currentCase?.id === caseId) {
        setCurrentCase(updatedCase);
      }

      return updatedCase;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.updateCase');
      throw error;
    } finally {
      setCaseLoading(false);
    }
  }, [currentCase]);

  /**
   * Get Cases with Filters
   */
  const fetchCases = useCallback(async (filters = {}) => {
    try {
      setCasesLoading(true);

      const casesList = await fsoService.getCases(filters);

      setCases(casesList);

      return casesList;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.fetchCases');
      throw error;
    } finally {
      setCasesLoading(false);
    }
  }, []);

  /**
   * Close Case
   */
  const closeCase = useCallback(async (caseId, resolution) => {
    try {
      const result = await fsoService.closeCase(caseId, resolution);

      // Update in cases list
      setCases(prev =>
        prev.map(c => (c.id === caseId ? { ...c, status: 'closed' } : c))
      );

      // Update current case if it's the same
      if (currentCase?.id === caseId) {
        setCurrentCase(prev => ({ ...prev, status: 'closed' }));
      }

      return result;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.closeCase');
      throw error;
    }
  }, [currentCase]);

  /**
   * Task Management
   */

  /**
   * Create Task
   */
  const createTask = useCallback(async (taskData) => {
    try {
      const task = await fsoService.createTask(taskData);

      // Add to case tasks if it belongs to current case
      if (task.caseId === currentCase?.id) {
        setCaseTasks(prev => [task, ...prev]);
      }

      return task;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.createTask');
      throw error;
    }
  }, [currentCase]);

  /**
   * Get Task
   */
  const fetchTask = useCallback(async (taskId) => {
    try {
      const task = await fsoService.getTask(taskId);

      return task;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.fetchTask');
      throw error;
    }
  }, []);

  /**
   * Update Task
   */
  const updateTask = useCallback(async (taskId, updates) => {
    try {
      const updatedTask = await fsoService.updateTask(taskId, updates);

      // Update in case tasks
      setCaseTasks(prev =>
        prev.map(t => (t.id === taskId ? updatedTask : t))
      );

      // Update in user tasks
      setUserTasks(prev =>
        prev.map(t => (t.id === taskId ? updatedTask : t))
      );

      return updatedTask;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.updateTask');
      throw error;
    }
  }, []);

  /**
   * Assign Task
   */
  const assignTask = useCallback(async (taskId, userId) => {
    try {
      const result = await fsoService.assignTask(taskId, userId);

      // Update in case tasks
      setCaseTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, assignedTo: userId } : t))
      );

      return result;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.assignTask');
      throw error;
    }
  }, []);

  /**
   * Complete Task
   */
  const completeTask = useCallback(async (taskId, completionData = {}) => {
    try {
      const result = await fsoService.completeTask(taskId, completionData);

      // Update in case tasks
      setCaseTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: 'completed' } : t))
      );

      // Remove from user tasks
      setUserTasks(prev => prev.filter(t => t.id !== taskId));

      return result;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.completeTask');
      throw error;
    }
  }, []);

  /**
   * Get Tasks for Case
   */
  const fetchCaseTasks = useCallback(async (caseId) => {
    try {
      setTasksLoading(true);

      const tasks = await fsoService.getCaseTasks(caseId);

      setCaseTasks(tasks);

      return tasks;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.fetchCaseTasks');
      throw error;
    } finally {
      setTasksLoading(false);
    }
  }, []);

  /**
   * Get Tasks for User
   */
  const fetchUserTasks = useCallback(async (userId) => {
    try {
      setUserTasksLoading(true);

      const tasks = await fsoService.getUserTasks(userId);

      setUserTasks(tasks);

      return tasks;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.fetchUserTasks');
      throw error;
    } finally {
      setUserTasksLoading(false);
    }
  }, []);

  /**
   * Playbook Management
   */

  /**
   * Execute Playbook
   */
  const executePlaybook = useCallback(async (caseId, playbookName) => {
    try {
      const result = await fsoService.executePlaybook(caseId, playbookName);

      // Refresh case and tasks
      await fetchCase(caseId, true);
      await fetchCaseTasks(caseId);

      return result;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.executePlaybook');
      throw error;
    }
  }, [fetchCase, fetchCaseTasks]);

  /**
   * Get Available Playbooks
   */
  const fetchPlaybooks = useCallback(async () => {
    try {
      const playbooks = await fsoService.getPlaybooks();

      setAvailablePlaybooks(playbooks);

      return playbooks;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.fetchPlaybooks');
      throw error;
    }
  }, []);

  /**
   * SLA Management
   */

  /**
   * Get SLA Status
   */
  const fetchSLAStatus = useCallback(async (caseId) => {
    try {
      const status = await fsoService.getSLAStatus(caseId);

      setSlaStatus(status);

      return status;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.fetchSLAStatus');
      throw error;
    }
  }, []);

  /**
   * Get SLA At-Risk Cases
   */
  const fetchSLAAtRiskCases = useCallback(async (daysThreshold = 3) => {
    try {
      const atRiskCases = await fsoService.getSLAAtRiskCases(daysThreshold);

      setSlaAtRiskCases(atRiskCases);

      return atRiskCases;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.fetchSLAAtRiskCases');
      throw error;
    }
  }, []);

  /**
   * Approval Workflows
   */

  /**
   * Submit for Approval
   */
  const submitForApproval = useCallback(async (caseId, approvalData) => {
    try {
      const result = await fsoService.submitForApproval(caseId, approvalData);

      return result;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.submitForApproval');
      throw error;
    }
  }, []);

  /**
   * Approve Case
   */
  const approveCase = useCallback(async (caseId, approverNotes = '') => {
    try {
      const result = await fsoService.approveCase(caseId, approverNotes);

      // Update case status
      if (currentCase?.id === caseId) {
        setCurrentCase(prev => ({ ...prev, status: 'approved' }));
      }

      return result;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.approveCase');
      throw error;
    }
  }, [currentCase]);

  /**
   * Reject Case
   */
  const rejectCase = useCallback(async (caseId, rejectionReason) => {
    try {
      const result = await fsoService.rejectCase(caseId, rejectionReason);

      // Update case status
      if (currentCase?.id === caseId) {
        setCurrentCase(prev => ({ ...prev, status: 'rejected' }));
      }

      return result;

    } catch (error) {
      handleAPIError(error, 'WorkflowContext.rejectCase');
      throw error;
    }
  }, [currentCase]);

  /**
   * Utility Functions
   */

  const refreshCase = useCallback(async (caseId) => {
    return fetchCase(caseId, true);
  }, [fetchCase]);

  const clearWorkflowState = useCallback(() => {
    setCurrentCase(null);
    setCaseTasks([]);
    setSlaStatus(null);
    setCaseError(null);
  }, []);

  /**
   * Subscribe to Workflow Events
   */
  useEffect(() => {
    // Subscribe to case created events
    const unsubscribeCaseCreated = eventBus.subscribe(EventTypes.CASE_CREATED, (event) => {
      console.log('[WorkflowContext] Case created event:', event);
    });

    // Subscribe to case status changed events
    const unsubscribeCaseStatusChanged = eventBus.subscribe(EventTypes.CASE_STATUS_CHANGED, (event) => {
      console.log('[WorkflowContext] Case status changed event:', event);
    });

    // Subscribe to task created events
    const unsubscribeTaskCreated = eventBus.subscribe(EventTypes.TASK_CREATED, (event) => {
      console.log('[WorkflowContext] Task created event:', event);
    });

    // Subscribe to task assigned events
    const unsubscribeTaskAssigned = eventBus.subscribe(EventTypes.TASK_ASSIGNED, (event) => {
      console.log('[WorkflowContext] Task assigned event:', event);
    });

    // Subscribe to task completed events
    const unsubscribeTaskCompleted = eventBus.subscribe(EventTypes.TASK_COMPLETED, (event) => {
      console.log('[WorkflowContext] Task completed event:', event);
    });

    return () => {
      unsubscribeCaseCreated();
      unsubscribeCaseStatusChanged();
      unsubscribeTaskCreated();
      unsubscribeTaskAssigned();
      unsubscribeTaskCompleted();
    };
  }, []);

  /**
   * Context Value
   */
  const value = {
    // Current Case
    currentCase,
    caseLoading,
    caseError,

    // Cases List
    cases,
    casesLoading,

    // Tasks
    caseTasks,
    tasksLoading,
    userTasks,
    userTasksLoading,

    // SLA
    slaStatus,
    slaAtRiskCases,

    // Playbooks
    availablePlaybooks,

    // Case Actions
    createCase,
    fetchCase,
    updateCase,
    fetchCases,
    closeCase,
    refreshCase,

    // Task Actions
    createTask,
    fetchTask,
    updateTask,
    assignTask,
    completeTask,
    fetchCaseTasks,
    fetchUserTasks,

    // Playbook Actions
    executePlaybook,
    fetchPlaybooks,

    // SLA Actions
    fetchSLAStatus,
    fetchSLAAtRiskCases,

    // Approval Actions
    submitForApproval,
    approveCase,
    rejectCase,

    // Utility
    clearWorkflowState
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
};

/**
 * Hook to use Workflow Context
 */
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};

export default WorkflowContext;
