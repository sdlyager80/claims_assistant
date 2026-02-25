/**
 * DocumentUpload Component
 *
 * Drag-and-drop document upload with file validation and preview
 * Features:
 * - Drag-and-drop zone
 * - Multiple file upload
 * - File type validation (PDF, JPG, PNG, etc.)
 * - File size validation (10MB limit)
 * - Upload progress tracking
 * - Preview before submission
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcButton,
  DxcTypography,
  DxcProgressBar,
  DxcAlert,
  DxcInset
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import idpService from '../../services/api/idpService';
import './DocumentUpload.css';

const DocumentUpload = ({
  claimId,
  tableName = 'x_dxcis_claims_a_0_claims_fnol',
  tableSysId,
  requirementId,
  onUploadComplete,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFileSize = 10 * 1024 * 1024, // 10MB in bytes
  multiple = true
}) => {
  // Use claimId as fallback if tableSysId is not provided
  const actualTableSysId = tableSysId || claimId;

  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState({});
  const [viewerDoc, setViewerDoc] = useState(null);   // { fileName, blobUrl } | null
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState(null);
  const [idpResultsByDoc, setIdpResultsByDoc] = useState({});   // fileName → IDP result
  const [idpPendingDocs, setIdpPendingDocs] = useState({});     // fileName → submissionId
  const fileInputRef = useRef(null);
  const idpPollRef = useRef(null);
  const idpPendingRef = useRef({});  // mirror of idpPendingDocs for use inside interval

  const toggleDoc = (index) => {
    setExpandedDocs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const openViewer = async (attachment) => {
    const fileName = attachment.file_name?.display_value || attachment.file_name || 'Document';
    // Get content_type — may be a display_value object or plain string
    const rawType = attachment.content_type?.display_value || attachment.content_type || 'application/pdf';
    setViewerDoc({ fileName, blobUrl: null });
    setViewerLoading(true);
    setViewerError(null);
    try {
      const blobUrl = await serviceNowService.fetchAttachmentBlob(attachment.sys_id, rawType);
      setViewerDoc({ fileName, blobUrl });
    } catch (err) {
      setViewerError(err.message);
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    if (viewerDoc?.blobUrl) URL.revokeObjectURL(viewerDoc.blobUrl);
    setViewerDoc(null);
    setViewerError(null);
  };

  // Parse IDP extraction result from a work note string
  const parseIDPFromWorknote = (noteText) => {
    try {
      if (!noteText || (!noteText.includes('submission_id') && !noteText.includes('Claim form extraction'))) return null;
      const jsonMatch = noteText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      const data = JSON.parse(jsonMatch[0]);
      if (data.submission_id && data.intents) return data;
      return null;
    } catch {
      return null;
    }
  };

  // Scan work notes and update idpResultsByDoc for any matched pending docs
  const scanWorkNotesForIDP = useCallback(async (pendingMap) => {
    if (!actualTableSysId || Object.keys(pendingMap).length === 0) return pendingMap;
    try {
      const notes = await serviceNowService.getWorkNotes(actualTableSysId);
      const newResults = {};
      const stillPending = { ...pendingMap };

      for (const note of notes) {
        const idpData = parseIDPFromWorknote(note.value || '');
        if (!idpData) continue;

        for (const [fileName, submissionId] of Object.entries(pendingMap)) {
          // Match by submission_id
          if (idpData.submission_id === submissionId) {
            newResults[fileName] = idpData;
            delete stillPending[fileName];
            continue;
          }
          // Fallback: match by document name inside the IDP response
          if (idpData.documents?.some(d => d.name === fileName || d.name?.startsWith(fileName.replace(/\.[^.]+$/, '')))) {
            newResults[fileName] = idpData;
            delete stillPending[fileName];
          }
        }
      }

      if (Object.keys(newResults).length > 0) {
        setIdpResultsByDoc(prev => ({ ...prev, ...newResults }));
      }
      return stillPending;
    } catch (err) {
      console.error('[DocumentUpload] IDP work note scan error:', err);
      return pendingMap;
    }
  }, [actualTableSysId]);

  // Start polling work notes for IDP results
  const startIDPPolling = useCallback(() => {
    if (idpPollRef.current) return;
    let attempts = 0;
    const MAX_ATTEMPTS = 24; // 2 min at 5s intervals

    idpPollRef.current = setInterval(async () => {
      attempts++;
      const pending = idpPendingRef.current;

      if (Object.keys(pending).length === 0 || attempts > MAX_ATTEMPTS) {
        clearInterval(idpPollRef.current);
        idpPollRef.current = null;
        if (attempts > MAX_ATTEMPTS) {
          idpPendingRef.current = {};
          setIdpPendingDocs({});
        }
        return;
      }

      const stillPending = await scanWorkNotesForIDP(pending);
      idpPendingRef.current = stillPending;
      setIdpPendingDocs(stillPending);
    }, 5000);
  }, [scanWorkNotesForIDP]);

  // Confidence colour helper
  const confidenceColor = (val) => {
    const n = parseFloat(val);
    if (n >= 0.8) return '#1b7a4b';
    if (n >= 0.6) return '#b45309';
    return '#c0392b';
  };

  // Render IDP extracted fields — matches screenshot layout
  const renderIDPFields = (idpData) => {
    const fields = idpData.intents?.[0]?.data || {};
    const intent = idpData.intents?.[0]?.intent || '';
    const personal = [];
    const checklist = [];

    for (const [key, meta] of Object.entries(fields)) {
      if (key === 'headers') continue;
      if (typeof meta !== 'object' || meta === null) continue;
      const label = key.replace(/_/g, ' ');
      const conf = parseFloat(meta.confidence ?? '0');
      const entry = { key, label, value: meta.value ?? '', confidence: conf };
      if (key.startsWith('Checklist_')) checklist.push(entry);
      else personal.push(entry);
    }

    return (
      <div className="doc-idp-results">
        {/* Header bar */}
        <div className="doc-idp-header">
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="doc-idp-header-title">AI Extracted Fields</span>
          {intent && <span className="doc-idp-intent">{intent.replace(/_/g, ' ')}</span>}
          {idpData.documents?.[0]?.classification && (
            <span className="doc-idp-classification">{idpData.documents[0].classification}</span>
          )}
        </div>

        {/* Extracted information */}
        {personal.length > 0 && (
          <div className="doc-idp-section">
            <div className="doc-idp-section-title">Extracted Information</div>
            <div className="doc-idp-fields">
              {personal.map(f => (
                <div key={f.key} className="doc-idp-field">
                  <span className="doc-idp-field-label">{f.label}:</span>
                  <span className="doc-idp-field-value">{f.value || '—'}</span>
                  <span className="doc-idp-confidence" style={{ color: confidenceColor(f.confidence) }}>
                    {Math.round(f.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist items */}
        {checklist.length > 0 && (
          <div className="doc-idp-section">
            <div className="doc-idp-section-title">Checklist Items</div>
            <div className="doc-idp-checklist">
              {checklist.map(f => (
                <div key={f.key} className="doc-idp-checklist-item">
                  <span className={`doc-idp-check-icon ${f.value === 'True' ? 'doc-idp-check-icon--yes' : 'doc-idp-check-icon--no'}`}>
                    <span className="material-symbols-outlined">{f.value === 'True' ? 'check_circle' : 'cancel'}</span>
                  </span>
                  <span className="doc-idp-checklist-label">
                    {f.label.replace('Checklist ', '')}:
                  </span>
                  <span className="doc-idp-confidence" style={{ color: confidenceColor(f.confidence) }}>
                    {Math.round(f.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (idpPollRef.current) clearInterval(idpPollRef.current);
    };
  }, []);

  // Debug: Log props on mount and changes
  useEffect(() => {
    console.log('[DocumentUpload] Component mounted/updated');
    console.log('[DocumentUpload] Props:', { claimId, tableName, tableSysId, requirementId });
  }, [claimId, tableName, tableSysId, requirementId]);

  // Load existing attachments on mount
  useEffect(() => {
    console.log('[DocumentUpload] Checking if should load attachments:', { actualTableSysId, tableName });
    if (actualTableSysId && tableName) {
      console.log('[DocumentUpload] Loading attachments...');
      loadExistingAttachments();
    } else {
      console.warn('[DocumentUpload] Cannot load attachments - missing actualTableSysId or tableName');
    }
  }, [actualTableSysId, tableName]);

  // Load existing attachments from ServiceNow
  const loadExistingAttachments = async () => {
    try {
      setLoadingAttachments(true);
      const attachments = await serviceNowService.getAttachments(tableName, actualTableSysId);
      setExistingAttachments(attachments);

      // Scan work notes for any existing IDP results for these attachments
      if (attachments.length > 0 && actualTableSysId) {
        const fileNames = attachments.reduce((acc, a) => {
          const name = a.file_name?.display_value || a.file_name || '';
          if (name) acc[name] = name; // use file name as both key and placeholder submissionId
          return acc;
        }, {});
        await scanWorkNotesForIDP(fileNames);
      }
    } catch (err) {
      console.error('Error loading attachments:', err);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file type
  const isValidFileType = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return acceptedFileTypes.includes(fileExtension);
  };

  // Validate file size
  const isValidFileSize = (file) => {
    return file.size <= maxFileSize;
  };

  // Handle file validation
  const validateFiles = (fileList) => {
    const validFiles = [];
    const errors = [];

    Array.from(fileList).forEach(file => {
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
      } else if (!isValidFileSize(file)) {
        errors.push(`${file.name}: File size exceeds ${formatFileSize(maxFileSize)} limit`);
      } else {
        validFiles.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return [];
    }

    return validFiles;
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        if (multiple) {
          setFiles(prev => [...prev, ...validFiles]);
        } else {
          setFiles(validFiles);
        }
      }
    }
  };

  // Handle file input change
  const handleFileInput = (e) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length > 0) {
        if (multiple) {
          setFiles(prev => [...prev, ...validFiles]);
        } else {
          setFiles(validFiles);
        }
      }
    }
  };

  // Remove file from list
  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL if it exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Upload files to ServiceNow and trigger IDP processing
  const handleUpload = async () => {
    console.log('[DocumentUpload] handleUpload called');
    console.log('[DocumentUpload] actualTableSysId:', actualTableSysId);
    console.log('[DocumentUpload] tableName:', tableName);
    console.log('[DocumentUpload] files:', files);

    if (files.length === 0) {
      console.error('[DocumentUpload] No files selected');
      return;
    }
    if (!actualTableSysId || !tableName) {
      const errorMsg = `Missing required parameters: actualTableSysId=${actualTableSysId}, tableName=${tableName}`;
      console.error('[DocumentUpload]', errorMsg);
      setError(errorMsg);
      alert(errorMsg); // Show alert for immediate feedback
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadResults = [];
      const totalFiles = files.length;
      let completedServiceNowUploads = 0;
      let completedIDPUploads = 0;

      // Step 1: Upload all files to ServiceNow in parallel (faster!)
      // This triggers BOTH: ServiceNow attachment + docintel_attachment flag (old flow)
      console.log('[DocumentUpload] ========================================');
      console.log('[DocumentUpload] DUAL FLOW MODE: Running both DocIntel (old) + IDP (new)');
      console.log('[DocumentUpload] ========================================');
      console.log('[DocumentUpload] Step 1: Uploading', totalFiles, 'file(s) to ServiceNow in parallel...');
      console.log('[DocumentUpload] → This will set docintel_attachment flag (triggers old DocIntel flow)');
      const snowPromises = files.map(async (fileData) => {
        try {
          const result = await serviceNowService.uploadDocument(
            fileData.file,
            tableName,
            actualTableSysId
          );
          completedServiceNowUploads++;
          setUploadProgress(Math.round((completedServiceNowUploads / totalFiles) * 50)); // 0-50%
          return { success: true, fileName: fileData.name, result };
        } catch (error) {
          completedServiceNowUploads++;
          setUploadProgress(Math.round((completedServiceNowUploads / totalFiles) * 50));
          return { success: false, fileName: fileData.name, error: error.message };
        }
      });

      const snowResults = await Promise.all(snowPromises);
      console.log('[DocumentUpload] ServiceNow uploads complete:', snowResults);

      // Step 2 & 3: Send all files to IDP for processing in parallel (faster!)
      console.log('[DocumentUpload] Step 2 & 3: Sending', totalFiles, 'file(s) to IDP in parallel...');
      console.log('[DocumentUpload] → IDP will process and callback to ServiceNow (new IDP flow)');
      const idpFilesToUpload = files
        .map(f => f.file)
        .filter((file, index) => snowResults[index].success); // Only process files that uploaded to ServiceNow

      let idpResults = [];
      if (idpFilesToUpload.length > 0) {
        try {
          idpResults = await idpService.uploadAndProcessBatch(
            idpFilesToUpload,
            actualTableSysId,
            (completed, total) => {
              completedIDPUploads = completed;
              // Progress: 50-100% (50% for ServiceNow done, 50% for IDP)
              setUploadProgress(50 + Math.round((completed / total) * 50));
            }
          );
          console.log('[DocumentUpload] IDP batch processing complete:', idpResults);
        } catch (idpError) {
          console.warn('[DocumentUpload] IDP batch processing failed (non-fatal):', idpError);
          // Create failed results for all IDP uploads
          idpResults = idpFilesToUpload.map(file => ({
            success: false,
            fileName: file.name,
            error: idpError.message
          }));
        }
      }

      // Combine results
      let idpIndex = 0;
      for (let i = 0; i < snowResults.length; i++) {
        const snowResult = snowResults[i];

        if (snowResult.success) {
          const idpResult = idpResults[idpIndex++];

          uploadResults.push({
            success: true,
            fileName: snowResult.fileName,
            attachmentSysId: snowResult.result.attachmentSysId,
            idpProcessing: idpResult?.success ? {
              submissionId: idpResult.submissionId,
              status: 'processing'
            } : {
              status: 'failed',
              error: idpResult?.error || 'IDP processing not available'
            }
          });
        } else {
          uploadResults.push({
            success: false,
            fileName: snowResult.fileName,
            error: snowResult.error
          });
        }
      }

      // Check for any failed uploads
      const failedUploads = uploadResults.filter(r => !r.success);
      if (failedUploads.length > 0) {
        setError(`Failed to upload ${failedUploads.length} file(s): ${failedUploads.map(f => f.fileName).join(', ')}`);
      }

      // Call success callback
      if (onUploadComplete) {
        onUploadComplete({
          claimId,
          requirementId,
          tableSysId: actualTableSysId,
          results: uploadResults,
          totalFiles: totalFiles,
          successCount: uploadResults.filter(r => r.success).length
        });
      }

      // Reload existing attachments to show newly uploaded files
      await loadExistingAttachments();

      // Start polling work notes for IDP extraction results
      const newPending = {};
      uploadResults.forEach(r => {
        if (r.success && r.idpProcessing?.submissionId) {
          newPending[r.fileName] = r.idpProcessing.submissionId;
        }
      });
      if (Object.keys(newPending).length > 0) {
        idpPendingRef.current = { ...idpPendingRef.current, ...newPending };
        setIdpPendingDocs(prev => ({ ...prev, ...newPending }));
        startIDPPolling();
      }

      // Clear files after successful upload
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
      setUploadProgress(0);

      // Show success message if all uploaded successfully
      if (failedUploads.length === 0) {
        console.log(`Successfully uploaded ${totalFiles} file(s) to ServiceNow`);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Delete attachment from ServiceNow
  const handleDeleteAttachment = async (attachmentSysId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await serviceNowService.deleteAttachment(attachmentSysId);
      console.log('Attachment deleted:', fileName);

      // Reload attachments
      await loadExistingAttachments();
    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError(`Failed to delete ${fileName}: ${err.message}`);
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <DxcContainer
      padding="var(--spacing-padding-l)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Debug Info - Remove in production */}
        {(!actualTableSysId || !tableName) && (
          <DxcAlert
            type="warning"
            inlineText={`Configuration Issue: ${!actualTableSysId ? 'tableSysId is missing' : ''} ${!tableName ? 'tableName is missing' : ''}`}
          />
        )}

        {/* Upload Zone */}
        <div
          className={`document-upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '48px',
                color: dragActive ? 'var(--color-fg-secondary-medium)' : 'var(--color-fg-neutral-dark)'
              }}
            >
              cloud_upload
            </span>
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                {dragActive ? 'Drop files here' : 'Drag and drop files here'}
              </DxcTypography>
              <DxcTypography fontSize="12px" color="#000000">
                or
              </DxcTypography>
              <DxcButton
                label="Browse Files"
                mode="secondary"
                size="small"
                onClick={handleBrowseClick}
                disabled={uploading}
              />
            </DxcFlex>
            <DxcTypography fontSize="12px" color="#000000">
              Accepted: {acceptedFileTypes.join(', ')} • Max size: {formatFileSize(maxFileSize)}
            </DxcTypography>
          </DxcFlex>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes.join(',')}
            multiple={multiple}
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>

        {/* Error Display */}
        {error && (
          <DxcAlert
            type="error"
            inlineText={error}
            onClose={() => setError(null)}
          />
        )}

        {/* File List */}
        {files.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              Selected Files ({files.length})
            </DxcTypography>
            {files.map((file, index) => (
              <DxcContainer
                key={index}
                style={{
                  backgroundColor: 'var(--color-bg-neutral-lightest)',
                  border: '1px solid var(--border-color-neutral-lighter)'
                }}
              >
                <DxcInset space="var(--spacing-padding-s)">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                      {/* Preview thumbnail for images */}
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      ) : (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '48px', color: 'var(--color-fg-neutral-dark)' }}
                        >
                          description
                        </span>
                      )}
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                          {file.name}
                        </DxcTypography>
                        <DxcTypography fontSize="12px" color="#000000">
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcFlex>
                    {!uploading && (
                      <DxcButton
                        label="Remove"
                        mode="tertiary"
                        size="small"
                        onClick={() => removeFile(index)}
                      />
                    )}
                  </DxcFlex>
                </DxcInset>
              </DxcContainer>
            ))}
          </DxcFlex>
        )}

        {/* Upload Progress */}
        {uploading && (
          <DxcProgressBar
            label="Uploading files..."
            value={uploadProgress}
            showValue
          />
        )}

        {/* Action Buttons */}
        {files.length > 0 && !uploading && (
          <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-s)">
            <DxcButton
              label="Clear All"
              mode="secondary"
              onClick={() => {
                files.forEach(f => {
                  if (f.preview) URL.revokeObjectURL(f.preview);
                });
                setFiles([]);
                setError(null);
              }}
            />
            <DxcButton
              label={`Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
              mode="primary"
              onClick={handleUpload}
            />
          </DxcFlex>
        )}

        {/* Existing Attachments from ServiceNow */}
        {existingAttachments.length > 0 && (
          <div className="doc-list">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Uploaded Documents ({existingAttachments.length})
            </DxcTypography>
            {existingAttachments.map((attachment, index) => {
              const fileName = attachment.file_name?.display_value || attachment.file_name || 'Unknown';
              const fileSize = attachment.size_bytes ? formatFileSize(parseInt(attachment.size_bytes)) : 'Size unknown';
              const fileDate = attachment.sys_created_on ? new Date(attachment.sys_created_on).toLocaleDateString() : 'Date unknown';
              const fileType = attachment.content_type || attachment.file_name?.split('.').pop()?.toUpperCase() || 'FILE';
              const isExpanded = !!expandedDocs[index];

              return (
                <div key={index} className={`doc-row ${isExpanded ? 'doc-row--expanded' : ''}`}>
                  {/* Row Header */}
                  <div className="doc-row__header" onClick={() => toggleDoc(index)}>
                    <button className={`doc-row__chevron ${isExpanded ? 'doc-row__chevron--open' : ''}`}>
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <span className="material-symbols-outlined doc-row__icon">description</span>
                    <span className="doc-row__name">{fileName}</span>
                    <span className="doc-row__meta">{fileSize} • {fileDate}</span>
                    <button
                      className="doc-row__delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAttachment(attachment.sys_id, fileName);
                      }}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="doc-row__expanded">
                      {/* Horizontal meta bar — matches screenshot */}
                      <div className="doc-row__meta-bar">
                        <div className="doc-row__meta-col">
                          <span className="doc-row__meta-label">File Name</span>
                          <span className="doc-row__meta-val">{fileName}</span>
                        </div>
                        <div className="doc-row__meta-col">
                          <span className="doc-row__meta-label">File Type</span>
                          <span className="doc-row__meta-val">{fileType}</span>
                        </div>
                        <div className="doc-row__meta-col">
                          <span className="doc-row__meta-label">Size</span>
                          <span className="doc-row__meta-val">{fileSize}</span>
                        </div>
                        <div className="doc-row__meta-col">
                          <span className="doc-row__meta-label">Uploaded</span>
                          <span className="doc-row__meta-val">{fileDate}</span>
                        </div>
                        {attachment.sys_id && (
                          <div className="doc-row__meta-col doc-row__meta-col--wide">
                            <span className="doc-row__meta-label">System ID</span>
                            <span className="doc-row__meta-val doc-row__meta-val--mono">{attachment.sys_id}</span>
                          </div>
                        )}
                      </div>

                      {/* IDP extraction results */}
                      {idpPendingDocs[fileName] && !idpResultsByDoc[fileName] && (
                        <div className="doc-idp-loading">
                          <span className="material-symbols-outlined doc-idp-loading__icon">sync</span>
                          <span>Processing document with AI extraction…</span>
                        </div>
                      )}
                      {idpResultsByDoc[fileName] && renderIDPFields(idpResultsByDoc[fileName])}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {loadingAttachments && (
          <DxcFlex justifyContent="center">
            <DxcTypography fontSize="12px" color="#000000">
              Loading existing documents...
            </DxcTypography>
          </DxcFlex>
        )}
      </DxcFlex>

    </DxcContainer>
  );
};

export default DocumentUpload;
