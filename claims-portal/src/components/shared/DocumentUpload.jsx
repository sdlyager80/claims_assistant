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

import React, { useState, useRef } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcButton,
  DxcTypography,
  DxcProgressBar,
  DxcAlert,
  DxcInset
} from '@dxc-technology/halstack-react';
import './DocumentUpload.css';

const DocumentUpload = ({
  claimId,
  requirementId,
  onUploadComplete,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFileSize = 10 * 1024 * 1024, // 10MB in bytes
  multiple = true
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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

  // Simulate upload (replace with actual API call)
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      // TODO: Replace with actual API call
      console.log('Uploading files for claim:', claimId, 'requirement:', requirementId);
      console.log('Files:', files.map(f => f.name));

      // Call success callback
      if (onUploadComplete) {
        onUploadComplete({
          claimId,
          requirementId,
          files: files.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type
          }))
        });
      }

      // Clear files after successful upload
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
      setUploadProgress(0);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
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
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
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
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
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
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
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
      </DxcFlex>
    </DxcContainer>
  );
};

export default DocumentUpload;
