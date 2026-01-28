/**
 * Document Context
 * DMS integration state management
 * - Document upload and retrieval
 * - IDP classification and extraction
 * - Document linking
 * - Document search
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import dmsService from '../services/api/dmsService';
import { handleAPIError } from '../services/utils/errorHandler';
import eventBus, { EventTypes } from '../services/sync/eventBus';

const DocumentContext = createContext(null);

export const DocumentProvider = ({ children }) => {
  // Documents List State
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  // Current Document State
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  // Upload State
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);

  // IDP State
  const [extractionResults, setExtractionResults] = useState(null);
  const [classificationLoading, setClassificationLoading] = useState(false);

  /**
   * Document Upload
   */

  /**
   * Upload Single Document
   */
  const uploadDocument = useCallback(async (file, metadata = {}) => {
    try {
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      const document = await dmsService.uploadDocument(file, metadata);

      // Add to documents list
      setDocuments(prev => [document, ...prev]);

      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

      return document;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.uploadDocument');
      throw error;
    } finally {
      setUploading(false);
      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }, 2000);
    }
  }, []);

  /**
   * Upload Multiple Documents
   */
  const uploadMultipleDocuments = useCallback(async (files, sharedMetadata = {}) => {
    try {
      setUploading(true);

      // Initialize progress for all files
      files.forEach(file => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      });

      const uploadedDocuments = await dmsService.uploadMultipleDocuments(files, sharedMetadata);

      // Add all documents to list
      setDocuments(prev => [...uploadedDocuments, ...prev]);

      // Set progress to 100 for all files
      files.forEach(file => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      });

      return uploadedDocuments;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.uploadMultipleDocuments');
      throw error;
    } finally {
      setUploading(false);
      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);
    }
  }, []);

  /**
   * Document Retrieval
   */

  /**
   * Get Document
   */
  const fetchDocument = useCallback(async (documentId) => {
    try {
      setDocumentLoading(true);

      const document = await dmsService.getDocument(documentId);

      setCurrentDocument(document);

      return document;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.fetchDocument');
      throw error;
    } finally {
      setDocumentLoading(false);
    }
  }, []);

  /**
   * Get Document Metadata
   */
  const fetchDocumentMetadata = useCallback(async (documentId) => {
    try {
      const metadata = await dmsService.getDocumentMetadata(documentId);

      return metadata;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.fetchDocumentMetadata');
      throw error;
    }
  }, []);

  /**
   * Download Document
   */
  const downloadDocument = useCallback(async (documentId, filename) => {
    try {
      const blob = await dmsService.downloadDocument(documentId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `document-${documentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      handleAPIError(error, 'DocumentContext.downloadDocument');
      throw error;
    }
  }, []);

  /**
   * Document Search
   */

  /**
   * Search Documents
   */
  const searchDocuments = useCallback(async (claimId, filters = {}) => {
    try {
      setDocumentsLoading(true);

      const results = await dmsService.searchDocuments(claimId, filters);

      setDocuments(results);

      return results;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.searchDocuments');
      throw error;
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  /**
   * Get Claim Documents
   */
  const fetchClaimDocuments = useCallback(async (claimId) => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);

      const claimDocuments = await dmsService.getClaimDocuments(claimId);

      setDocuments(claimDocuments);

      return claimDocuments;

    } catch (error) {
      const apiError = handleAPIError(error, 'DocumentContext.fetchClaimDocuments');
      setDocumentsError(apiError);
      throw error;
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  /**
   * IDP Integration
   */

  /**
   * Classify Document
   */
  const classifyDocument = useCallback(async (documentId) => {
    try {
      setClassificationLoading(true);

      const classification = await dmsService.classifyDocument(documentId);

      // Update document in list
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, classification: classification.type, classificationConfidence: classification.confidence }
            : doc
        )
      );

      // Update current document
      if (currentDocument?.id === documentId) {
        setCurrentDocument(prev => ({
          ...prev,
          classification: classification.type,
          classificationConfidence: classification.confidence
        }));
      }

      return classification;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.classifyDocument');
      throw error;
    } finally {
      setClassificationLoading(false);
    }
  }, [currentDocument]);

  /**
   * Get Extraction Results
   */
  const fetchExtractionResults = useCallback(async (documentId) => {
    try {
      const extraction = await dmsService.getExtractionResults(documentId);

      setExtractionResults(extraction);

      return extraction;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.fetchExtractionResults');
      throw error;
    }
  }, []);

  /**
   * Document Linking
   */

  /**
   * Link Document to Claim
   */
  const linkDocumentToClaim = useCallback(async (documentId, claimId) => {
    try {
      const result = await dmsService.linkDocumentToClaim(documentId, claimId);

      // Update document in list
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId ? { ...doc, claimId } : doc
        )
      );

      return result;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.linkDocumentToClaim');
      throw error;
    }
  }, []);

  /**
   * Link Document to Requirement
   */
  const linkDocumentToRequirement = useCallback(async (documentId, requirementId) => {
    try {
      const result = await dmsService.linkDocumentToRequirement(documentId, requirementId);

      // Update document in list
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId ? { ...doc, requirementId } : doc
        )
      );

      return result;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.linkDocumentToRequirement');
      throw error;
    }
  }, []);

  /**
   * Document Versioning
   */

  /**
   * Get Document Versions
   */
  const fetchDocumentVersions = useCallback(async (documentId) => {
    try {
      const versions = await dmsService.getDocumentVersions(documentId);

      return versions;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.fetchDocumentVersions');
      throw error;
    }
  }, []);

  /**
   * Upload Document Version
   */
  const uploadDocumentVersion = useCallback(async (documentId, file) => {
    try {
      setUploading(true);

      const version = await dmsService.uploadDocumentVersion(documentId, file);

      // Update current document
      if (currentDocument?.id === documentId) {
        setCurrentDocument(prev => ({ ...prev, version: version.version }));
      }

      return version;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.uploadDocumentVersion');
      throw error;
    } finally {
      setUploading(false);
    }
  }, [currentDocument]);

  /**
   * Document Actions
   */

  /**
   * Update Document Metadata
   */
  const updateDocumentMetadata = useCallback(async (documentId, metadata) => {
    try {
      const updatedDocument = await dmsService.updateDocumentMetadata(documentId, metadata);

      // Update in documents list
      setDocuments(prev =>
        prev.map(doc => (doc.id === documentId ? updatedDocument : doc))
      );

      // Update current document
      if (currentDocument?.id === documentId) {
        setCurrentDocument(updatedDocument);
      }

      return updatedDocument;

    } catch (error) {
      handleAPIError(error, 'DocumentContext.updateDocumentMetadata');
      throw error;
    }
  }, [currentDocument]);

  /**
   * Delete Document
   */
  const deleteDocument = useCallback(async (documentId) => {
    try {
      await dmsService.deleteDocument(documentId);

      // Remove from documents list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      // Clear current document if it's the same
      if (currentDocument?.id === documentId) {
        setCurrentDocument(null);
      }

    } catch (error) {
      handleAPIError(error, 'DocumentContext.deleteDocument');
      throw error;
    }
  }, [currentDocument]);

  /**
   * Utility Functions
   */

  const clearDocuments = useCallback(() => {
    setDocuments([]);
    setCurrentDocument(null);
    setExtractionResults(null);
    setDocumentsError(null);
  }, []);

  const refreshDocuments = useCallback(async (claimId) => {
    return fetchClaimDocuments(claimId);
  }, [fetchClaimDocuments]);

  /**
   * Subscribe to Document Events
   */
  useEffect(() => {
    // Subscribe to document uploaded events
    const unsubscribeUploaded = eventBus.subscribe(EventTypes.DOCUMENT_UPLOADED, (event) => {
      console.log('[DocumentContext] Document uploaded event:', event);
    });

    // Subscribe to document classified events
    const unsubscribeClassified = eventBus.subscribe(EventTypes.DOCUMENT_CLASSIFIED, (event) => {
      console.log('[DocumentContext] Document classified event:', event);

      const { documentId, classification } = event.data;

      // Update document in list
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, classification: classification.type, classificationConfidence: classification.confidence }
            : doc
        )
      );
    });

    // Subscribe to document extracted events
    const unsubscribeExtracted = eventBus.subscribe(EventTypes.DOCUMENT_EXTRACTED, (event) => {
      console.log('[DocumentContext] Document extracted event:', event);
    });

    return () => {
      unsubscribeUploaded();
      unsubscribeClassified();
      unsubscribeExtracted();
    };
  }, []);

  /**
   * Context Value
   */
  const value = {
    // Documents List
    documents,
    documentsLoading,
    documentsError,

    // Current Document
    currentDocument,
    documentLoading,

    // Upload State
    uploadProgress,
    uploading,

    // IDP State
    extractionResults,
    classificationLoading,

    // Upload Actions
    uploadDocument,
    uploadMultipleDocuments,

    // Retrieval Actions
    fetchDocument,
    fetchDocumentMetadata,
    downloadDocument,

    // Search Actions
    searchDocuments,
    fetchClaimDocuments,

    // IDP Actions
    classifyDocument,
    fetchExtractionResults,

    // Linking Actions
    linkDocumentToClaim,
    linkDocumentToRequirement,

    // Versioning Actions
    fetchDocumentVersions,
    uploadDocumentVersion,

    // Document Actions
    updateDocumentMetadata,
    deleteDocument,

    // Utility
    clearDocuments,
    refreshDocuments
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};

/**
 * Hook to use Document Context
 */
export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider');
  }
  return context;
};

export default DocumentContext;
