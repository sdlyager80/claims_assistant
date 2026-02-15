/**
 * DocumentViewer Component
 *
 * Display uploaded documents with thumbnails, metadata, and IDP results
 * Features:
 * - Thumbnail grid view
 * - Document metadata display
 * - IDP classification results
 * - Confidence score display
 * - Document preview modal
 * - Filter by document type
 */

import React, { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcButton,
  DxcTypography,
  DxcBadge,
  DxcInset,
  DxcSelect,
  DxcProgressBar
} from '@dxc-technology/halstack-react';
import './DocumentViewer.css';

const DocumentViewer = ({
  documents = [],
  onDocumentClick,
  onDownload,
  showIDP = true,
  showActions = true
}) => {
  const [filterType, setFilterType] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Document type options for filter
  const documentTypes = [
    { label: 'All Documents', value: 'all' },
    { label: 'Death Certificate', value: 'death_certificate' },
    { label: 'ID Document', value: 'id_document' },
    { label: 'Claim Form', value: 'claim_form' },
    { label: 'Beneficiary Form', value: 'beneficiary_form' },
    { label: 'Other', value: 'other' }
  ];

  // Filter documents by type
  const filteredDocuments = filterType === 'all'
    ? documents
    : documents.filter(doc => doc.idp?.classification?.type === filterType);

  // Get document icon based on type
  const getDocumentIcon = (doc) => {
    if (doc.type?.startsWith('image/')) return 'image';
    if (doc.type?.includes('pdf')) return 'picture_as_pdf';
    if (doc.type?.includes('word')) return 'description';
    return 'insert_drive_file';
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'var(--color-fg-success-medium)';
    if (confidence >= 0.7) return 'var(--color-fg-warning-medium)';
    return 'var(--color-fg-error-medium)';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle document click
  const handleDocumentClick = (doc) => {
    setSelectedDoc(doc);
    if (onDocumentClick) {
      onDocumentClick(doc);
    }
  };

  // Handle download
  const handleDownload = (doc, e) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(doc);
    }
  };

  if (documents.length === 0) {
    return (
      <DxcContainer
        padding="var(--spacing-padding-l)"
        style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '64px', color: 'var(--color-fg-neutral-dark)' }}
          >
            folder_open
          </span>
          <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
            No documents uploaded yet
          </DxcTypography>
        </DxcFlex>
      </DxcContainer>
    );
  }

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      {/* Filter Bar */}
      <DxcFlex justifyContent="space-between" alignItems="center">
        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
          Documents ({filteredDocuments.length})
        </DxcTypography>
        <div style={{ width: '240px' }}>
          <DxcSelect
            label="Filter by type"
            options={documentTypes}
            value={filterType}
            onChange={(value) => setFilterType(value)}
            size="small"
          />
        </div>
      </DxcFlex>

      {/* Document Grid */}
      <div className="document-grid">
        {filteredDocuments.map((doc, index) => (
          <DxcContainer
            key={doc.id || index}
            style={{
              backgroundColor: 'var(--color-bg-neutral-lightest)',
              border: '1px solid var(--border-color-neutral-lighter)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleDocumentClick(doc)}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              {/* Thumbnail */}
              <div className="document-thumbnail">
                {doc.thumbnail ? (
                  <img
                    src={doc.thumbnail}
                    alt={doc.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <DxcFlex
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    style={{ height: '100%' }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '64px', color: 'var(--color-fg-neutral-dark)' }}
                    >
                      {getDocumentIcon(doc)}
                    </span>
                  </DxcFlex>
                )}
              </div>

              {/* Document Info */}
              <DxcInset space="var(--spacing-padding-s)">
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  {/* Name and Status */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography
                      fontSize="font-scale-02"
                      fontWeight="font-weight-semibold"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {doc.name || 'Untitled Document'}
                    </DxcTypography>
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                        {formatFileSize(doc.size)}
                      </DxcTypography>
                      {doc.status && (
                        <DxcBadge label={doc.status} />
                      )}
                    </DxcFlex>
                  </DxcFlex>

                  {/* IDP Results */}
                  {showIDP && doc.idp && (
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        IDP Classification
                      </DxcTypography>
                      <DxcFlex justifyContent="space-between" alignItems="center">
                        <DxcTypography fontSize="12px">
                          {doc.idp.classification?.label || 'Unknown'}
                        </DxcTypography>
                        {doc.idp.classification?.confidence !== undefined && (
                          <DxcTypography
                            fontSize="12px"
                            fontWeight="font-weight-semibold"
                            color={getConfidenceColor(doc.idp.classification.confidence)}
                          >
                            {Math.round(doc.idp.classification.confidence * 100)}%
                          </DxcTypography>
                        )}
                      </DxcFlex>
                      {doc.idp.classification?.confidence !== undefined && (
                        <DxcProgressBar
                          value={Math.round(doc.idp.classification.confidence * 100)}
                          showValue={false}
                        />
                      )}
                    </DxcFlex>
                  )}

                  {/* Metadata */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                      Uploaded: {formatDate(doc.uploadedAt)}
                    </DxcTypography>
                    {doc.uploadedBy && (
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                        By: {doc.uploadedBy}
                      </DxcTypography>
                    )}
                  </DxcFlex>

                  {/* Actions */}
                  {showActions && (
                    <DxcFlex gap="var(--spacing-gap-xs)">
                      <DxcButton
                        label="View"
                        mode="primary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentClick(doc);
                        }}
                      />
                      <DxcButton
                        label="Download"
                        mode="secondary"
                        size="small"
                        onClick={(e) => handleDownload(doc, e)}
                      />
                    </DxcFlex>
                  )}
                </DxcFlex>
              </DxcInset>
            </DxcFlex>
          </DxcContainer>
        ))}
      </div>

      {/* Selected Document Details (Optional Modal) */}
      {selectedDoc && (
        <DxcContainer
          padding="var(--spacing-padding-l)"
          style={{
            backgroundColor: 'var(--color-bg-secondary-lightest)',
            border: '2px solid var(--border-color-secondary-medium)'
          }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                Document Details
              </DxcTypography>
              <DxcButton
                label="Close"
                mode="tertiary"
                size="small"
                onClick={() => setSelectedDoc(null)}
              />
            </DxcFlex>

            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                  File Name
                </DxcTypography>
                <DxcTypography fontSize="font-scale-02">
                  {selectedDoc.name}
                </DxcTypography>
              </DxcFlex>

              <DxcFlex gap="var(--spacing-gap-l)">
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                    File Size
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {formatFileSize(selectedDoc.size)}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                    Upload Date
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {formatDate(selectedDoc.uploadedAt)}
                  </DxcTypography>
                </DxcFlex>

                {selectedDoc.status && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                      Status
                    </DxcTypography>
                    <DxcBadge label={selectedDoc.status} />
                  </DxcFlex>
                )}
              </DxcFlex>

              {showIDP && selectedDoc.idp && (
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    IDP Extraction Results
                  </DxcTypography>
                  {selectedDoc.idp.fields?.map((field, idx) => (
                    <DxcFlex key={idx} justifyContent="space-between" alignItems="center">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        {field.name}
                      </DxcTypography>
                      <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                        <DxcTypography fontSize="font-scale-02">
                          {field.value}
                        </DxcTypography>
                        {field.confidence !== undefined && (
                          <DxcTypography
                            fontSize="12px"
                            fontWeight="font-weight-semibold"
                            color={getConfidenceColor(field.confidence)}
                          >
                            {Math.round(field.confidence * 100)}%
                          </DxcTypography>
                        )}
                      </DxcFlex>
                    </DxcFlex>
                  ))}
                </DxcFlex>
              )}
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>
      )}
    </DxcFlex>
  );
};

export default DocumentViewer;
