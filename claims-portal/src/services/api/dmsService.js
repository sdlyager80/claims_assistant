/**
 * DMS (Document Management System) Service
 * Document Storage and Retrieval with IDP Integration
 *
 * DMS provides:
 * - Document upload and storage
 * - Document classification (via IDP)
 * - Metadata management
 * - Document versioning
 * - Search and retrieval
 */

import apiClient from './apiClient';
import cacheManager from '../utils/cacheManager';
import { handleAPIError } from '../utils/errorHandler';
import eventBus, { EventTypes } from '../sync/eventBus';

const DMS_BASE_PATH = '/dms';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Document Upload
 */

/**
 * Upload document
 * @param {File} file - File to upload
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Object>} Uploaded document info
 */
export const uploadDocument = async (file, metadata = {}) => {
  try {
    console.log(`[DMS] Uploading document: ${file.name}`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const document = await apiClient.post(`${DMS_BASE_PATH}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Publish event
    eventBus.publish(EventTypes.DOCUMENT_UPLOADED, { document });

    return document;
  } catch (error) {
    throw handleAPIError(error, 'DMS.uploadDocument');
  }
};

/**
 * Upload multiple documents
 * @param {Array<File>} files - Files to upload
 * @param {Object} sharedMetadata - Shared metadata for all files
 * @returns {Promise<Array>} Uploaded documents
 */
export const uploadMultipleDocuments = async (files, sharedMetadata = {}) => {
  try {
    console.log(`[DMS] Uploading ${files.length} documents`);

    const uploadPromises = files.map(file => uploadDocument(file, sharedMetadata));
    const documents = await Promise.all(uploadPromises);

    return documents;
  } catch (error) {
    throw handleAPIError(error, 'DMS.uploadMultipleDocuments');
  }
};

/**
 * Document Retrieval
 */

/**
 * Get document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document metadata
 */
export const getDocument = async (documentId) => {
  try {
    const cacheKey = cacheManager.generateKey('dms:document', { documentId });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[DMS] Getting document: ${documentId}`);

    const document = await apiClient.get(`${DMS_BASE_PATH}/documents/${documentId}`);

    cacheManager.set(cacheKey, document, CACHE_TTL);

    return document;
  } catch (error) {
    throw handleAPIError(error, 'DMS.getDocument');
  }
};

/**
 * Get document metadata only (without content)
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document metadata
 */
export const getDocumentMetadata = async (documentId) => {
  try {
    console.log(`[DMS] Getting document metadata: ${documentId}`);

    const metadata = await apiClient.get(`${DMS_BASE_PATH}/documents/${documentId}/metadata`);

    return metadata;
  } catch (error) {
    throw handleAPIError(error, 'DMS.getDocumentMetadata');
  }
};

/**
 * Download document content
 * @param {string} documentId - Document ID
 * @returns {Promise<Blob>} Document content
 */
export const downloadDocument = async (documentId) => {
  try {
    console.log(`[DMS] Downloading document: ${documentId}`);

    const response = await fetch(`${apiClient.getConfig().baseURL}${DMS_BASE_PATH}/documents/${documentId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    throw handleAPIError(error, 'DMS.downloadDocument');
  }
};

/**
 * Document Search
 */

/**
 * Search documents by claim ID
 * @param {string} claimId - Claim ID
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} List of documents
 */
export const searchDocuments = async (claimId, filters = {}) => {
  try {
    const cacheKey = cacheManager.generateKey('dms:search', { claimId, ...filters });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[DMS] Searching documents for claim: ${claimId}`);

    const documents = await apiClient.get(`${DMS_BASE_PATH}/documents/search`, {
      params: { claimId, ...filters }
    });

    cacheManager.set(cacheKey, documents, CACHE_TTL);

    return documents;
  } catch (error) {
    throw handleAPIError(error, 'DMS.searchDocuments');
  }
};

/**
 * Get all documents for claim
 * @param {string} claimId - Claim ID
 * @returns {Promise<Array>} List of documents
 */
export const getClaimDocuments = async (claimId) => {
  try {
    const cacheKey = cacheManager.generateKey('dms:claim-documents', { claimId });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[DMS] Getting documents for claim: ${claimId}`);

    const documents = await apiClient.get(`${DMS_BASE_PATH}/claims/${claimId}/documents`);

    cacheManager.set(cacheKey, documents, CACHE_TTL);

    return documents;
  } catch (error) {
    throw handleAPIError(error, 'DMS.getClaimDocuments');
  }
};

/**
 * IDP Integration
 */

/**
 * Trigger document classification
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Classification result
 */
export const classifyDocument = async (documentId) => {
  try {
    console.log(`[DMS] Classifying document: ${documentId}`);

    const classification = await apiClient.post(`${DMS_BASE_PATH}/documents/${documentId}/classify`);

    // Invalidate document cache
    const cacheKey = cacheManager.generateKey('dms:document', { documentId });
    cacheManager.delete(cacheKey);

    // Publish event
    eventBus.publish(EventTypes.DOCUMENT_CLASSIFIED, { documentId, classification });

    return classification;
  } catch (error) {
    throw handleAPIError(error, 'DMS.classifyDocument');
  }
};

/**
 * Get IDP extraction results
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Extraction results
 */
export const getExtractionResults = async (documentId) => {
  try {
    console.log(`[DMS] Getting extraction results for document: ${documentId}`);

    const extraction = await apiClient.get(`${DMS_BASE_PATH}/documents/${documentId}/extraction`);

    return extraction;
  } catch (error) {
    throw handleAPIError(error, 'DMS.getExtractionResults');
  }
};

/**
 * Document Linking
 */

/**
 * Link document to claim
 * @param {string} documentId - Document ID
 * @param {string} claimId - Claim ID
 * @returns {Promise<Object>} Link result
 */
export const linkDocumentToClaim = async (documentId, claimId) => {
  try {
    console.log(`[DMS] Linking document ${documentId} to claim ${claimId}`);

    const result = await apiClient.post(`${DMS_BASE_PATH}/documents/${documentId}/link`, {
      claimId
    });

    // Invalidate claim documents cache
    const cacheKey = cacheManager.generateKey('dms:claim-documents', { claimId });
    cacheManager.delete(cacheKey);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'DMS.linkDocumentToClaim');
  }
};

/**
 * Link document to requirement
 * @param {string} documentId - Document ID
 * @param {string} requirementId - Requirement ID
 * @returns {Promise<Object>} Link result
 */
export const linkDocumentToRequirement = async (documentId, requirementId) => {
  try {
    console.log(`[DMS] Linking document ${documentId} to requirement ${requirementId}`);

    const result = await apiClient.post(`${DMS_BASE_PATH}/documents/${documentId}/link-requirement`, {
      requirementId
    });

    return result;
  } catch (error) {
    throw handleAPIError(error, 'DMS.linkDocumentToRequirement');
  }
};

/**
 * Document Versioning
 */

/**
 * Get document versions
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} List of versions
 */
export const getDocumentVersions = async (documentId) => {
  try {
    console.log(`[DMS] Getting versions for document: ${documentId}`);

    const versions = await apiClient.get(`${DMS_BASE_PATH}/documents/${documentId}/versions`);

    return versions;
  } catch (error) {
    throw handleAPIError(error, 'DMS.getDocumentVersions');
  }
};

/**
 * Upload new version of document
 * @param {string} documentId - Document ID
 * @param {File} file - New version file
 * @returns {Promise<Object>} New version info
 */
export const uploadDocumentVersion = async (documentId, file) => {
  try {
    console.log(`[DMS] Uploading new version for document: ${documentId}`);

    const formData = new FormData();
    formData.append('file', file);

    const version = await apiClient.post(`${DMS_BASE_PATH}/documents/${documentId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Invalidate document cache
    const cacheKey = cacheManager.generateKey('dms:document', { documentId });
    cacheManager.delete(cacheKey);

    return version;
  } catch (error) {
    throw handleAPIError(error, 'DMS.uploadDocumentVersion');
  }
};

/**
 * Document Actions
 */

/**
 * Update document metadata
 * @param {string} documentId - Document ID
 * @param {Object} metadata - Updated metadata
 * @returns {Promise<Object>} Updated document
 */
export const updateDocumentMetadata = async (documentId, metadata) => {
  try {
    console.log(`[DMS] Updating metadata for document: ${documentId}`);

    const document = await apiClient.patch(`${DMS_BASE_PATH}/documents/${documentId}/metadata`, metadata);

    // Invalidate cache
    const cacheKey = cacheManager.generateKey('dms:document', { documentId });
    cacheManager.delete(cacheKey);

    return document;
  } catch (error) {
    throw handleAPIError(error, 'DMS.updateDocumentMetadata');
  }
};

/**
 * Delete document
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteDocument = async (documentId) => {
  try {
    console.log(`[DMS] Deleting document: ${documentId}`);

    const result = await apiClient.delete(`${DMS_BASE_PATH}/documents/${documentId}`);

    // Invalidate cache
    const cacheKey = cacheManager.generateKey('dms:document', { documentId });
    cacheManager.delete(cacheKey);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'DMS.deleteDocument');
  }
};

/**
 * Cache Invalidation
 */

/**
 * Invalidate document cache
 * @param {string} documentId - Document ID
 */
export const invalidateDocumentCache = (documentId) => {
  cacheManager.delete(cacheManager.generateKey('dms:document', { documentId }));
  console.log(`[DMS] Cache invalidated for document: ${documentId}`);
};

/**
 * Invalidate claim documents cache
 * @param {string} claimId - Claim ID
 */
export const invalidateClaimDocumentsCache = (claimId) => {
  cacheManager.delete(cacheManager.generateKey('dms:claim-documents', { claimId }));
  console.log(`[DMS] Cache invalidated for claim documents: ${claimId}`);
};

export default {
  // Document Upload
  uploadDocument,
  uploadMultipleDocuments,

  // Document Retrieval
  getDocument,
  getDocumentMetadata,
  downloadDocument,

  // Document Search
  searchDocuments,
  getClaimDocuments,

  // IDP Integration
  classifyDocument,
  getExtractionResults,

  // Document Linking
  linkDocumentToClaim,
  linkDocumentToRequirement,

  // Document Versioning
  getDocumentVersions,
  uploadDocumentVersion,

  // Document Actions
  updateDocumentMetadata,
  deleteDocument,

  // Cache
  invalidateDocumentCache,
  invalidateClaimDocumentsCache
};
