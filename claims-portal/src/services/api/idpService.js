/**
 * IDP (Intelligent Document Processing) Service
 *
 * Handles document upload and processing through the IDP API:
 * 1. Authenticate with AWS Cognito (OAuth2 client credentials)
 * 2. Upload document to ingestion endpoint
 * 3. Trigger document extraction process
 */

class IDPService {
  constructor() {
    // API Configuration from environment variables
    this.authURL = import.meta.env.VITE_IDP_AUTH_URL;
    this.clientId = import.meta.env.VITE_IDP_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_IDP_CLIENT_SECRET;
    this.apiKey = import.meta.env.VITE_IDP_API_KEY;
    this.submissionKey = import.meta.env.VITE_IDP_SUBMISSION_KEY;
    this.env = import.meta.env.VITE_IDP_ENV;

    // Use proxy in development to avoid CORS issues
    const isDevelopment = import.meta.env.DEV;
    this.apiBaseURL = isDevelopment
      ? '/idp-api'  // Vite proxy in development
      : import.meta.env.VITE_IDP_API_BASE_URL;  // Direct URL in production

    // Token management
    this.accessToken = null;
    this.tokenExpiry = null;
    this.tokenPromise = null; // Prevent concurrent token requests

    // Restore token from sessionStorage if available
    this._restoreToken();

    console.log('[IDP Service] Initialized');
    console.log('[IDP Service] Environment:', isDevelopment ? 'Development' : 'Production');
    console.log('[IDP Service] API Base URL:', this.apiBaseURL);
    console.log('[IDP Service] Token cached:', !!this.accessToken);
  }

  /**
   * Save token to sessionStorage for persistence across page refreshes
   */
  _saveToken() {
    if (this.accessToken) {
      sessionStorage.setItem('idp_access_token', this.accessToken);
      sessionStorage.setItem('idp_token_expiry', String(this.tokenExpiry));
      console.log('[IDP Service] Token saved to sessionStorage');
    }
  }

  /**
   * Restore token from sessionStorage
   */
  _restoreToken() {
    const token = sessionStorage.getItem('idp_access_token');
    const expiry = sessionStorage.getItem('idp_token_expiry');

    if (token && expiry && Date.now() < Number(expiry)) {
      this.accessToken = token;
      this.tokenExpiry = Number(expiry);
      console.log('[IDP Service] Token restored from session, expires in', Math.round((this.tokenExpiry - Date.now()) / 1000), 'seconds');
    } else if (token) {
      // Clear expired token
      this.clearToken();
    }
  }

  /**
   * Step 1: Get OAuth2 access token from AWS Cognito
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      console.log('[IDP Service] Using cached access token');
      return this.accessToken;
    }

    // If a token request is already in progress, wait for it
    if (this.tokenPromise) {
      console.log('[IDP Service] Token request already in progress, waiting...');
      return this.tokenPromise;
    }

    console.log('[IDP Service] Fetching new access token from Cognito...');

    // Create promise for concurrent request prevention
    this.tokenPromise = this._fetchNewToken();

    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  /**
   * Internal method to fetch new token from Cognito
   * @private
   */
  async _fetchNewToken() {
    try {
      const response = await fetch(`${this.authURL}?grant_type=client_credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[IDP Service] Auth error:', errorText);
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      // AWS Cognito returns expires_in in seconds
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      // Save to sessionStorage for persistence
      this._saveToken();

      console.log('[IDP Service] Access token obtained, expires in', data.expires_in, 'seconds');
      return this.accessToken;
    } catch (error) {
      console.error('[IDP Service] Failed to get access token:', error);
      throw new Error(`Failed to authenticate with IDP: ${error.message}`);
    }
  }

  /**
   * Step 2: Upload document to ingestion endpoint
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} Response containing submission_id
   */
  async uploadDocument(file) {
    console.log('[IDP Service] Uploading document:', file.name);

    try {
      // Get valid access token
      const accessToken = await this.getAccessToken();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.apiBaseURL}/idp/core/v1/ingestion/data/claim`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'x-api-key': this.apiKey,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[IDP Service] Upload error:', errorText);
        throw new Error(`Document upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[IDP Service] Document uploaded successfully:', data);

      // Extract submissionId from the response (note: camelCase, not snake_case)
      // Response structure: { submission_request: { submissionId: "..." }, processed_files: [...], ... }
      const submissionId = data.submission_request?.submissionId || data.submissionId || data.submission_id;

      if (!submissionId) {
        console.error('[IDP Service] Response structure:', JSON.stringify(data, null, 2));
        throw new Error('Upload response missing submissionId');
      }

      return {
        ...data,
        submission_id: submissionId  // Normalize the response
      };
    } catch (error) {
      console.error('[IDP Service] Failed to upload document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Step 3: Trigger document processing/extraction
   * @param {string} submissionId - The submission ID from upload response
   * @param {string} integrationSysId - ServiceNow sys_id for the claim/FNOL
   * @returns {Promise<Object>} Processing response
   */
  async processDocument(submissionId, integrationSysId) {
    console.log('[IDP Service] Triggering document processing for submission:', submissionId);

    try {
      // Get valid access token
      const accessToken = await this.getAccessToken();

      const payload = {
        payload: {
          submission_id: submissionId,
          submission_key: this.submissionKey,
          caller_metadata: [
            {
              name: 'integration_sys_id',
              value: integrationSysId,
            },
            {
              name: 'env',
              value: this.env,
            },
          ],
        },
      };

      const response = await fetch(`${this.apiBaseURL}/idp/core/v1/ingestion/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'text/plain',
          'x-api-key': this.apiKey,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[IDP Service] Process error:', errorText);
        throw new Error(`Document processing failed: ${response.status}`);
      }

      const data = await response.text(); // Response is text/plain
      console.log('[IDP Service] Document processing triggered successfully:', data);

      return { success: true, message: data };
    } catch (error) {
      console.error('[IDP Service] Failed to process document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  /**
   * Complete workflow: Upload and process a document
   * @param {File} file - The file to upload
   * @param {string} integrationSysId - ServiceNow sys_id for the claim/FNOL
   * @returns {Promise<Object>} Result with submission_id and processing status
   */
  async uploadAndProcess(file, integrationSysId) {
    console.log('[IDP Service] Starting upload and process workflow for:', file.name);
    console.log('[IDP Service] Integration sys_id:', integrationSysId);

    try {
      // Step 1: Already handled by getAccessToken() inside upload

      // Step 2: Upload document
      const uploadResult = await this.uploadDocument(file);

      if (!uploadResult.submission_id) {
        throw new Error('Upload response missing submission_id');
      }

      console.log('[IDP Service] Received submission_id:', uploadResult.submission_id);

      // Step 3: Trigger processing
      const processResult = await this.processDocument(uploadResult.submission_id, integrationSysId);

      return {
        success: true,
        submissionId: uploadResult.submission_id,
        uploadResult: uploadResult,
        processResult: processResult,
      };
    } catch (error) {
      console.error('[IDP Service] Upload and process workflow failed:', error);
      throw error;
    }
  }

  /**
   * Batch upload and process multiple documents in parallel
   * More efficient than sequential uploads - reuses the same auth token
   * @param {Array<File>} files - Array of File objects to upload
   * @param {string} integrationSysId - ServiceNow sys_id for the claim/FNOL
   * @param {Function} onProgress - Optional callback(index, total, result) for progress tracking
   * @returns {Promise<Array>} Array of results with success/failure status for each file
   */
  async uploadAndProcessBatch(files, integrationSysId, onProgress) {
    console.log('[IDP Service] Starting batch upload for', files.length, 'files');
    console.log('[IDP Service] Integration sys_id:', integrationSysId);

    // Pre-fetch auth token once for all uploads (optimization)
    try {
      await this.getAccessToken();
      console.log('[IDP Service] Auth token ready for batch upload');
    } catch (error) {
      console.error('[IDP Service] Failed to get auth token for batch:', error);
      throw error;
    }

    // Process all files in parallel
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`[IDP Service] [${index + 1}/${files.length}] Starting upload for:`, file.name);

        const result = await this.uploadAndProcess(file, integrationSysId);

        console.log(`[IDP Service] [${index + 1}/${files.length}] Upload successful:`, file.name);

        // Call progress callback if provided
        if (onProgress) {
          onProgress(index + 1, files.length, { success: true, fileName: file.name, ...result });
        }

        return {
          success: true,
          fileName: file.name,
          submissionId: result.submissionId,
          uploadResult: result.uploadResult,
          processResult: result.processResult
        };
      } catch (error) {
        console.error(`[IDP Service] [${index + 1}/${files.length}] Upload failed for ${file.name}:`, error);

        // Call progress callback if provided
        if (onProgress) {
          onProgress(index + 1, files.length, { success: false, fileName: file.name, error: error.message });
        }

        return {
          success: false,
          fileName: file.name,
          error: error.message
        };
      }
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log('[IDP Service] Batch upload complete:', {
      total: files.length,
      successful: successCount,
      failed: failureCount
    });

    return results;
  }

  /**
   * Clear cached token (useful for testing or error recovery)
   */
  clearToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.tokenPromise = null;
    sessionStorage.removeItem('idp_access_token');
    sessionStorage.removeItem('idp_token_expiry');
    console.log('[IDP Service] Token cleared from memory and sessionStorage');
  }
}

export default new IDPService();
