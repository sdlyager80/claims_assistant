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

import React, { useState, useRef, useEffect } from 'react';
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
  const fileInputRef = useRef(null);

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
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Uploaded Documents ({existingAttachments.length})
            </DxcTypography>
            {existingAttachments.map((attachment, index) => (
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
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '48px', color: 'var(--color-fg-success-medium)' }}
                      >
                        check_circle
                      </span>
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                          {attachment.file_name?.display_value || attachment.file_name || 'Unknown'}
                        </DxcTypography>
                        <DxcTypography fontSize="12px" color="#000000">
                          {attachment.size_bytes ? formatFileSize(parseInt(attachment.size_bytes)) : 'Size unknown'}
                          {' • '}
                          {attachment.sys_created_on ? new Date(attachment.sys_created_on).toLocaleDateString() : 'Date unknown'}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcFlex>
                    <DxcButton
                      label="Delete"
                      mode="tertiary"
                      size="small"
                      onClick={() => handleDeleteAttachment(
                        attachment.sys_id,
                        attachment.file_name?.display_value || attachment.file_name || 'file'
                      )}
                    />
                  </DxcFlex>
                </DxcInset>
              </DxcContainer>
            ))}
          </DxcFlex>
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
