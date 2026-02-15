/**
 * ServiceNow Integration Service
 *
 * Integrates with ServiceNow instance at https://nextgenbpmnp1.service-now.com
 * Handles FNOL (First Notice of Loss) submission to custom Claims FNOL table
 */

// Note: Not using apiClient for ServiceNow to avoid baseURL conflicts
// ServiceNow requires direct external API calls

class ServiceNowService {
  constructor() {
    // Use proxy in development to avoid CORS issues
    const isDevelopment = import.meta.env.DEV;
    this.isDevelopment = isDevelopment;
    this.serviceNowURL = import.meta.env.VITE_SERVICENOW_URL || 'https://nextgenbpmnp1.service-now.com';

    // ALWAYS use backend API proxy to avoid CORS issues
    this.useProxy = true; // Always use proxy for both dev and prod
    this.proxyURL = isDevelopment
      ? '/servicenow-api'  // Vite proxy in development
      : '/api/servicenow-api';  // Vercel API in production

    // ALWAYS use backend API for OAuth to avoid CORS issues
    this.oauthURL = isDevelopment
      ? '/servicenow-oauth'  // Vite proxy path for OAuth
      : '/api/servicenow-oauth';  // Backend API endpoint in production

    this.apiVersion = '/api/now/table';
    this.fnolTable = 'x_dxcis_claims_a_0_claims_fnol';

    // OAuth state
    this.clientId = import.meta.env.VITE_SERVICENOW_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_SERVICENOW_CLIENT_SECRET || '';
    this.useOAuth = !!(this.clientId && this.clientSecret);
    // Redirect back to the app's actual URL (not a sub-path that won't exist on static hosting)
    this.redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI || window.location.origin + window.location.pathname;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.refreshToken = null;
    this.tokenPromise = null;
    this._onAuthChangeCallbacks = [];

    // Try to restore token from sessionStorage
    this._restoreToken();

    // Check for OAuth callback code in URL
    this._handleOAuthCallback();

    console.log('[ServiceNow] Proxy URL:', this.proxyURL, '(Development mode:', isDevelopment, ')');
    console.log('[ServiceNow] Auth mode:', this.useOAuth ? 'OAuth (Authorization Code)' : 'Basic Auth');
    console.log('[ServiceNow] Authenticated:', this.isAuthenticated());
  }

  /**
   * Register a callback for auth state changes
   */
  onAuthChange(callback) {
    this._onAuthChangeCallbacks.push(callback);
    return () => {
      this._onAuthChangeCallbacks = this._onAuthChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  _notifyAuthChange() {
    const authenticated = this.isAuthenticated();
    this._onAuthChangeCallbacks.forEach(cb => cb(authenticated));
  }

  /**
   * Check if we have a valid OAuth token
   */
  isAuthenticated() {
    if (!this.useOAuth) return true; // Basic auth is always "authenticated"
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }

  /**
   * Build API URL using proxy to avoid CORS
   * @param {string} path - ServiceNow API path (e.g., '/api/now/table/tablename')
   * @returns {string} Proxied URL
   */
  buildProxyURL(path) {
    // In production, use Vercel API proxy with path as query parameter
    if (!this.isDevelopment) {
      return `${this.proxyURL}?path=${encodeURIComponent(path)}`;
    }
    // In development, Vite proxy handles path rewriting
    return `${this.proxyURL}${path}`;
  }

  /**
   * Save token to sessionStorage for persistence across page refreshes
   */
  _saveToken() {
    if (this.accessToken) {
      sessionStorage.setItem('snow_access_token', this.accessToken);
      sessionStorage.setItem('snow_token_expiry', String(this.tokenExpiry));
      if (this.refreshToken) {
        sessionStorage.setItem('snow_refresh_token', this.refreshToken);
      }
    }
  }

  /**
   * Restore token from sessionStorage
   */
  _restoreToken() {
    const token = sessionStorage.getItem('snow_access_token');
    const expiry = sessionStorage.getItem('snow_token_expiry');
    const refresh = sessionStorage.getItem('snow_refresh_token');

    if (token && expiry && Date.now() < Number(expiry)) {
      this.accessToken = token;
      this.tokenExpiry = Number(expiry);
      this.refreshToken = refresh || null;
      console.log('[ServiceNow] Token restored from session, expires in', Math.round((this.tokenExpiry - Date.now()) / 1000), 'seconds');
    }
  }

  /**
   * Clear stored tokens (logout)
   */
  clearAuth() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.refreshToken = null;
    sessionStorage.removeItem('snow_access_token');
    sessionStorage.removeItem('snow_token_expiry');
    sessionStorage.removeItem('snow_refresh_token');
    this._notifyAuthChange();
    console.log('[ServiceNow] Auth cleared');
  }

  /**
   * Start OAuth flow - uses Authorization Code with PKCE-style server exchange,
   * falling back to token exchange via POST if needed.
   * For static hosting (no backend), we first try Authorization Code flow.
   * If CORS blocks the token exchange, the user should add a CORS rule for oauth_token.do.
   */
  startOAuthLogin() {
    if (!this.clientId) {
      console.error('[ServiceNow] Cannot start OAuth: no client ID configured');
      return;
    }

    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('snow_oauth_state', state);

    const authUrl = `${this.serviceNowURL}/oauth_auth.do?` + new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state
    }).toString();

    console.log('[ServiceNow] Redirecting to ServiceNow login...');
    console.log('[ServiceNow] Redirect URI:', this.redirectUri);
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback - exchange authorization code for tokens
   * This runs on page load and checks for an auth code in the URL query params.
   */
  async _handleOAuthCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) return;

    console.log('[ServiceNow] OAuth callback detected, code present');

    const savedState = sessionStorage.getItem('snow_oauth_state');
    if (state && savedState && state !== savedState) {
      console.error('[ServiceNow] OAuth state mismatch - possible CSRF attack');
      return;
    }

    sessionStorage.removeItem('snow_oauth_state');

    // Clean the URL (remove code/state params) immediately
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState({}, '', url.pathname + url.search);

    console.log('[ServiceNow] Exchanging authorization code for token...');
    console.log('[ServiceNow] Token endpoint:', this.oauthURL);
    console.log('[ServiceNow] Redirect URI for exchange:', this.redirectUri);

    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      });

      const response = await fetch(this.oauthURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ServiceNow] Token exchange error:', response.status, errorText);
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || null;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      this._saveToken();
      this._notifyAuthChange();

      console.log('[ServiceNow] OAuth token obtained successfully, expires in', data.expires_in, 'seconds');
    } catch (error) {
      console.error('[ServiceNow] OAuth callback error:', error);
      console.error('[ServiceNow] If this is a CORS error, you need to add a CORS rule in ServiceNow for the oauth_token.do endpoint');
      console.error('[ServiceNow] Or ensure your existing CORS rule domain matches:', window.location.origin);

      // Surface the error to the user via auth change notification
      this._notifyAuthChange();
    }
  }

  /**
   * Get OAuth access token - uses cached token or refreshes if expired
   */
  async getOAuthToken() {
    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    // Try refresh token if available
    if (this.refreshToken) {
      if (this.tokenPromise) return this.tokenPromise;

      this.tokenPromise = this._refreshOAuthToken();
      try {
        const token = await this.tokenPromise;
        return token;
      } finally {
        this.tokenPromise = null;
      }
    }

    // No token and no refresh token - user needs to login
    throw new Error('Not authenticated. Please connect to ServiceNow.');
  }

  async _refreshOAuthToken() {
    console.log('[ServiceNow] Refreshing OAuth token...');

    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken
      });

      const response = await fetch(this.oauthURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ServiceNow] Token refresh error:', response.status, errorText);
        this.clearAuth();
        throw new Error('Token refresh failed. Please reconnect to ServiceNow.');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || this.refreshToken;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      this._saveToken();
      console.log('[ServiceNow] Token refreshed, expires in', data.expires_in, 'seconds');
      return this.accessToken;
    } catch (error) {
      console.error('[ServiceNow] Token refresh error:', error);
      this.accessToken = null;
      this.tokenExpiry = null;
      throw error;
    }
  }

  /**
   * Create authentication headers for ServiceNow API
   * Uses OAuth Bearer token if configured, otherwise falls back to Basic Auth
   */
  async getAuthHeaders() {
    const isDevelopment = this.isDevelopment;

    // OAuth mode: get Bearer token
    if (this.useOAuth) {
      try {
        const token = await this.getOAuthToken();
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
      } catch (error) {
        console.error('[ServiceNow] OAuth failed:', error.message);
        throw error; // Re-throw so callers know auth failed
      }
    }

    // Basic Auth mode - in dev, proxy handles auth
    if (isDevelopment) {
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }

    // Production: send Basic Auth header directly
    const username = import.meta.env.VITE_SERVICENOW_USERNAME;
    const password = import.meta.env.VITE_SERVICENOW_PASSWORD;

    if (!username || !password) {
      console.warn('[ServiceNow] Credentials not configured');
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }

    const credentials = btoa(unescape(encodeURIComponent(`${username}:${password}`)));

    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Map FNOL form data to ServiceNow table structure
   */
  mapFNOLToServiceNow(fnolData) {
    return {
      // Basic Case Information
      short_description: fnolData.shortDescription || `Death Claim - ${fnolData.insured?.fullName || 'Unknown'}`,
      description: fnolData.description || '',
      contact_type: 'web',
      state: '1', // New
      active: true,

      // Insured Information
      insured_full_name: fnolData.insured?.fullName || '',
      insured_other_names: fnolData.insured?.otherNames || '',
      insured_date_of_birth: fnolData.insured?.dateOfBirth || '',
      insured_date_of_death: fnolData.insured?.dateOfDeath || '',
      insured_place_of_birth: fnolData.insured?.placeOfBirth || '',
      insured_marital_status: fnolData.insured?.maritalStatus || '',
      insured_cause_of_death: fnolData.insured?.causeOfDeath || '',
      insured_manner_of_death: fnolData.insured?.mannerOfDeath || '',

      // Insured Address
      insured_street_address: fnolData.insured?.address?.street || '',
      insured_city: fnolData.insured?.address?.city || '',
      insured_state: fnolData.insured?.address?.state || '',
      insured_zip_code: fnolData.insured?.address?.zipCode || '',

      // Claimant Information
      claimant_full_name: fnolData.claimant?.fullName || '',
      claimant_other_names: fnolData.claimant?.otherNames || '',
      claimant_relationship_to_insured: fnolData.claimant?.relationshipToInsured || '',
      claimant_date_of_birth: fnolData.claimant?.dateOfBirth || '',
      claimant_sex: fnolData.claimant?.sex || '',
      claimant_capacity: fnolData.claimant?.capacity || '',
      claimant_country_of_citizenship: fnolData.claimant?.countryOfCitizenship || '',

      // Claimant Contact Information
      claimant_email_address: fnolData.claimant?.emailAddress || '',
      claimant_phone_number: fnolData.claimant?.phoneNumber || '',
      claimant_communication_method: fnolData.claimant?.communicationMethod || '',

      // Claimant Address
      claimant_street_address: fnolData.claimant?.address?.street || '',
      claimant_city: fnolData.claimant?.address?.city || '',
      claimant_state: fnolData.claimant?.address?.state || '',
      claimant_zip_code: fnolData.claimant?.address?.zipCode || '',

      // Policy Information
      policy_numbers: fnolData.policyNumbers || '',
      total_claim_amount: fnolData.totalClaimAmount || 0,

      // Incident Details
      date_and_time_of_incident: fnolData.incidentDateTime || '',
      incident_location: fnolData.incidentLocation || '',
      describe_the_incident: fnolData.incidentDescription || '',
      nature_of_loss: fnolData.natureOfLoss || '',

      // Police Report (if applicable)
      police_report_number: fnolData.policeReportNumber || '',
      police_report_details: fnolData.policeReportDetails || '',

      // Payment Options
      payment_option_selected: fnolData.paymentOption || '',

      // System Fields
      priority: fnolData.priority || '4', // Default: Low
      urgency: fnolData.urgency || '3', // Default: Low
      impact: fnolData.impact || '3', // Default: Low
      category: fnolData.category || '1',
      subcategory: fnolData.subcategory || '0'
    };
  }

  /**
   * Create FNOL record in ServiceNow
   * @param {Object} fnolData - FNOL form data from portal
   * @returns {Promise<Object>} Created ServiceNow record
   */
  async createFNOL(fnolData) {
    try {
      console.log('[ServiceNow] Input fnolData:', fnolData);

      const mappedData = this.mapFNOLToServiceNow(fnolData);

      console.log('[ServiceNow] Mapped data being sent to ServiceNow:', mappedData);
      console.log('[ServiceNow] Mapped data (stringified):', JSON.stringify(mappedData, null, 2));

      const path = `${this.apiVersion}/${this.fnolTable}`;
      const url = this.buildProxyURL(path);
      console.log('[ServiceNow] Request URL:', url);

      const authHeaders = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mappedData)
      });

      console.log('[ServiceNow] HTTP Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ServiceNow] Error response:', errorText);
        throw new Error(`ServiceNow API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[ServiceNow] Full API response:', responseData);
      console.log('[ServiceNow] FNOL created successfully:', responseData);

      return {
        success: true,
        fnolNumber: responseData.result.number,
        sysId: responseData.result.sys_id,
        data: responseData.result
      };
    } catch (error) {
      console.error('[ServiceNow] Error creating FNOL:', error);

      // Handle specific ServiceNow errors
      if (error.response?.status === 401) {
        throw new Error('ServiceNow authentication failed. Please check credentials.');
      } else if (error.response?.status === 403) {
        throw new Error('ServiceNow access forbidden. Please check user permissions.');
      } else if (error.response?.data?.error) {
        throw new Error(`ServiceNow error: ${error.response.data.error.message}`);
      }

      throw new Error(`Failed to create FNOL in ServiceNow: ${error.message}`);
    }
  }

  /**
   * Get FNOL record from ServiceNow by sys_id
   * @param {string} sysId - ServiceNow sys_id
   * @returns {Promise<Object>} FNOL record
   */
  async getFNOL(sysId) {
    try {
      const path = `${this.apiVersion}/${this.fnolTable}/${sysId}`;
      const url = this.buildProxyURL(path);
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`ServiceNow API error: ${response.status}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('[ServiceNow] Error fetching FNOL:', error);
      throw new Error(`Failed to fetch FNOL from ServiceNow: ${error.message}`);
    }
  }

  /**
   * Get FNOL record by FNOL number
   * @param {string} fnolNumber - FNOL number (e.g., FNOL0001004)
   * @returns {Promise<Object>} FNOL record
   */
  async getFNOLByNumber(fnolNumber) {
    try {
      const params = new URLSearchParams({
        sysparm_query: `number=${fnolNumber}`,
        sysparm_limit: '1'
      });
      const path = `${this.apiVersion}/${this.fnolTable}?${params}`;
      const url = this.buildProxyURL(path);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`ServiceNow API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result && data.result.length > 0) {
        return data.result[0];
      }

      throw new Error(`FNOL not found: ${fnolNumber}`);
    } catch (error) {
      console.error('[ServiceNow] Error fetching FNOL by number:', error);
      throw new Error(`Failed to fetch FNOL from ServiceNow: ${error.message}`);
    }
  }

  /**
   * Update FNOL record in ServiceNow
   * @param {string} sysId - ServiceNow sys_id
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated record
   */
  async updateFNOL(sysId, updates) {
    try {
      const mappedUpdates = this.mapFNOLToServiceNow(updates);
      const headers = await this.getAuthHeaders();

      const response = await apiClient.patch(
        `${this.baseURL}${this.apiVersion}/${this.fnolTable}/${sysId}`,
        mappedUpdates,
        {
          headers
        }
      );

      return response.data.result;
    } catch (error) {
      console.error('[ServiceNow] Error updating FNOL:', error);
      throw new Error(`Failed to update FNOL in ServiceNow: ${error.message}`);
    }
  }

  /**
   * Get all FNOL records (with optional filters)
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Array of FNOL records
   */
  async getFNOLs(filters = {}) {
    try {
      const params = {
        sysparm_limit: filters.limit || 100,
        sysparm_offset: filters.offset || 0,
        sysparm_display_value: 'true'
      };

      // Build query string
      const queryParts = [];
      if (filters.state) {
        queryParts.push(`state=${filters.state}`);
      }
      if (filters.assignedTo) {
        queryParts.push(`assigned_to=${filters.assignedTo}`);
      }
      if (filters.claimantName) {
        queryParts.push(`claimant_full_nameLIKE${filters.claimantName}`);
      }

      if (queryParts.length > 0) {
        params.sysparm_query = queryParts.join('^');
      }

      const headers = await this.getAuthHeaders();
      const response = await apiClient.get(
        `${this.baseURL}${this.apiVersion}/${this.fnolTable}`,
        {
          headers,
          params
        }
      );

      return response.data.result;
    } catch (error) {
      console.error('[ServiceNow] Error fetching FNOLs:', error);
      throw new Error(`Failed to fetch FNOLs from ServiceNow: ${error.message}`);
    }
  }

  /**
   * Get work notes for an FNOL record from sys_journal_field
   * @param {string} sysId - ServiceNow sys_id of the FNOL record
   * @returns {Promise<Array>} Array of work note journal entries
   */
  async getWorkNotes(sysId) {
    try {
      const params = new URLSearchParams({
        sysparm_query: `element=work_notes^name=${this.fnolTable}^element_id=${sysId}^ORDERBYDESCsys_created_on`,
        sysparm_display_value: 'true'
      });
      const path = `${this.apiVersion}/sys_journal_field?${params}`;
      const url = this.buildProxyURL(path);
      console.log('[ServiceNow] Fetching work notes for sys_id:', sysId);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`ServiceNow API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ServiceNow] Work notes fetched:', data.result?.length || 0, 'entries');
      return data.result || [];
    } catch (error) {
      console.error('[ServiceNow] Error fetching work notes:', error);
      throw new Error(`Failed to fetch work notes from ServiceNow: ${error.message}`);
    }
  }

  /**
   * Add a work note to an FNOL record
   * @param {string} sysId - ServiceNow sys_id of the FNOL record
   * @param {string} noteText - The work note text to add
   * @returns {Promise<Object>} Updated FNOL record
   */
  async addWorkNote(sysId, noteText) {
    try {
      const path = `${this.apiVersion}/${this.fnolTable}/${sysId}`;
      const url = this.buildProxyURL(path);
      console.log('[ServiceNow] Adding work note to sys_id:', sysId);

      const authHeaders = await this.getAuthHeaders();
      const requestBody = JSON.stringify({ work_notes: noteText });
      console.log('[ServiceNow] PATCH URL:', url);
      console.log('[ServiceNow] PATCH body:', requestBody);
      console.log('[ServiceNow] PATCH headers:', JSON.stringify(authHeaders));

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      console.log('[ServiceNow] PATCH response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ServiceNow] Error response:', errorText);
        throw new Error(`ServiceNow API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ServiceNow] Work note PATCH full response:', JSON.stringify(data.result, null, 2));
      console.log('[ServiceNow] Work note field in response:', data.result?.work_notes);
      console.log('[ServiceNow] Comments_and_work_notes field:', data.result?.comments_and_work_notes);
      console.log('[ServiceNow] Work note added successfully, response sys_id:', data.result?.sys_id);
      return data.result;
    } catch (error) {
      console.error('[ServiceNow] Error adding work note:', error);
      throw new Error(`Failed to add work note in ServiceNow: ${error.message}`);
    }
  }

  /**
   * Get policy details by sys_id
   * @param {string} policySysId - ServiceNow sys_id of the policy record
   * @param {string} policyTable - Policy table name (default: 'x_dxcis_claims_a_0_policy')
   * @returns {Promise<Object>} Policy record
   */
  async getPolicyBySysId(policySysId, policyTable = 'x_dxcis_claims_a_0_policy') {
    try {
      const path = `${this.apiVersion}/${policyTable}/${policySysId}`;
      const url = this.buildProxyURL(path);
      console.log('[ServiceNow] Fetching policy for sys_id:', policySysId);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`ServiceNow API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ServiceNow] Policy fetched successfully');
      return data.result;
    } catch (error) {
      console.error('[ServiceNow] Error fetching policy:', error);
      throw new Error(`Failed to fetch policy from ServiceNow: ${error.message}`);
    }
  }

  /**
   * Get policy details by policy number
   * @param {string} policyNumber - Policy number
   * @param {string} policyTable - Policy table name (default: 'x_dxcis_claims_a_0_policy')
   * @returns {Promise<Object>} Policy record
   */
  async getPolicyByNumber(policyNumber, policyTable = 'x_dxcis_claims_a_0_policy') {
    try {
      const params = new URLSearchParams({
        sysparm_query: `policy_number=${policyNumber}`,
        sysparm_limit: '1',
        sysparm_display_value: 'true'
      });
      const path = `${this.apiVersion}/${policyTable}?${params}`;
      const url = this.buildProxyURL(path);
      console.log('[ServiceNow] Fetching policy by number:', policyNumber);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`ServiceNow API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result && data.result.length > 0) {
        console.log('[ServiceNow] Policy found:', data.result[0]);
        return data.result[0];
      }

      throw new Error(`Policy not found: ${policyNumber}`);
    } catch (error) {
      console.error('[ServiceNow] Error fetching policy by number:', error);
      throw new Error(`Failed to fetch policy from ServiceNow: ${error.message}`);
    }
  }

  /**
   * Enrich FNOL with full policy details
   * Fetches policy data if FNOL contains policy sys_id reference
   * @param {Object} fnol - FNOL record from ServiceNow
   * @param {string} policyTable - Policy table name
   * @returns {Promise<Object>} FNOL with enriched policy data
   */
  async enrichFNOLWithPolicy(fnol, policyTable = 'x_dxcis_claims_a_0_policy') {
    try {
      // Check if FNOL has policy reference (could be named differently)
      const policySysId = fnol.policy?.value || fnol.policy_sys_id?.value || fnol.policy;

      if (!policySysId || typeof policySysId !== 'string') {
        console.log('[ServiceNow] No policy sys_id found in FNOL, using policy number only');
        return fnol;
      }

      console.log('[ServiceNow] Enriching FNOL with policy details for sys_id:', policySysId);
      const policyDetails = await this.getPolicyBySysId(policySysId, policyTable);

      // Attach full policy details to FNOL
      return {
        ...fnol,
        policy_details: policyDetails
      };
    } catch (error) {
      console.warn('[ServiceNow] Could not enrich FNOL with policy details:', error.message);
      // Return original FNOL if policy fetch fails
      return fnol;
    }
  }

  /**
   * Get all FNOL records from global domain
   * @param {Object} filters - Optional query filters
   * @param {boolean} filters.enrichWithPolicy - Whether to enrich FNOLs with full policy details
   * @returns {Promise<Array>} Array of FNOL records
   */
  async getFNOLsGlobal(filters = {}) {
    try {
      const queryParts = ['ORDERBYDESCsys_created_on'];
      if (filters.state) {
        queryParts.unshift(`state=${filters.state}`);
      }
      if (filters.active !== undefined) {
        queryParts.unshift(`active=${filters.active}`);
      }

      const params = new URLSearchParams({
        sysparm_query: queryParts.join('^'),
        sysparm_limit: String(filters.limit || 50),
        sysparm_offset: String(filters.offset || 0),
        sysparm_display_value: 'true'
      });

      const path = `${this.apiVersion}/${this.fnolTable}?${params}`;
      const url = this.buildProxyURL(path);
      console.log('[ServiceNow] Fetching global FNOL records');

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`ServiceNow API error: ${response.status}`);
      }

      const data = await response.json();
      let fnols = data.result || [];
      console.log('[ServiceNow] Global FNOLs fetched:', fnols.length, 'records');

      // Optionally enrich with policy details
      if (filters.enrichWithPolicy && fnols.length > 0) {
        console.log('[ServiceNow] Enriching FNOLs with policy details...');
        fnols = await Promise.all(
          fnols.map(fnol => this.enrichFNOLWithPolicy(fnol, filters.policyTable))
        );
        console.log('[ServiceNow] FNOLs enriched with policy details');
      }

      return fnols;
    } catch (error) {
      console.error('[ServiceNow] Error fetching global FNOLs:', error);
      throw new Error(`Failed to fetch global FNOLs from ServiceNow: ${error.message}`);
    }
  }

  /**
   * Map a ServiceNow FNOL record to the portal's claim data model
   * @param {Object} fnol - Raw ServiceNow FNOL record
   * @returns {Object} Claim object matching portal data model
   */
  mapFNOLToClaim(fnol) {
    const stateMap = {
      '1': 'new',
      '2': 'submitted',
      '3': 'under_review',
      '4': 'in_review',
      '5': 'pending_requirements',
      '6': 'approved',
      '7': 'closed',
      '8': 'denied'
    };

    return {
      id: fnol.sys_id,
      sysId: fnol.sys_id,
      fnolNumber: fnol.number || '',
      claimNumber: fnol.number || fnol.case || '',
      status: stateMap[fnol.state] || 'new',
      claimType: 'death',
      source: 'servicenow',
      createdAt: fnol.opened_at || fnol.sys_created_on || '',
      updatedAt: fnol.sys_updated_on || '',
      insured: {
        name: fnol.insured_full_name || 'N/A',
        otherNames: fnol.insured_other_names || '',
        dateOfBirth: fnol.insured_date_of_birth || '',
        dateOfDeath: fnol.insured_date_of_death || '',
        placeOfBirth: fnol.insured_place_of_birth || '',
        maritalStatus: fnol.insured_marital_status || '',
        causeOfDeath: fnol.insured_cause_of_death || '',
        mannerOfDeath: fnol.insured_manner_of_death || '',
        address: {
          street: fnol.insured_street_address || '',
          city: fnol.insured_city || '',
          state: fnol.insured_state || '',
          zipCode: fnol.insured_zip_code || ''
        }
      },
      claimant: {
        name: fnol.claimant_full_name || 'N/A',
        otherNames: fnol.claimant_other_names || '',
        relationship: fnol.claimant_relationship_to_insured || '',
        dateOfBirth: fnol.claimant_date_of_birth || '',
        sex: fnol.claimant_sex || '',
        capacity: fnol.claimant_capacity || '',
        countryOfCitizenship: fnol.claimant_country_of_citizenship || '',
        emailAddress: fnol.claimant_email_address || '',
        phoneNumber: fnol.claimant_phone_number || '',
        communicationMethod: fnol.claimant_communication_method || '',
        address: {
          street: fnol.claimant_street_address || '',
          city: fnol.claimant_city || '',
          state: fnol.claimant_state || '',
          zipCode: fnol.claimant_zip_code || ''
        }
      },
      policy: fnol.policy_details ? {
        // Full policy details from enriched data
        policyNumber: fnol.policy_details.policy_number || fnol.policy_numbers || 'N/A',
        policyType: fnol.policy_details.policy_type || 'Term Life Insurance',
        policyStatus: fnol.policy_details.policy_status || '',
        coverageAmount: fnol.policy_details.coverage_amount || fnol.policy_details.face_amount || 0,
        effectiveDate: fnol.policy_details.effective_date || '',
        issueDate: fnol.policy_details.issue_date || '',
        expirationDate: fnol.policy_details.expiration_date || '',
        premiumAmount: fnol.policy_details.premium_amount || 0,
        beneficiaries: fnol.policy_details.beneficiaries || [],
        riders: fnol.policy_details.riders || [],
        // Include full raw policy data for reference
        details: fnol.policy_details
      } : {
        // Fallback to basic policy info if not enriched
        policyNumber: fnol.policy_numbers || 'N/A',
        policyType: 'Term Life Insurance'
      },
      financial: {
        claimAmount: parseFloat(fnol.total_claim_amount) || 0,
        totalClaimed: parseFloat(fnol.total_claim_amount) || 0
      },
      deathEvent: {
        dateOfDeath: fnol.insured_date_of_death || '',
        mannerOfDeath: fnol.insured_manner_of_death || 'Natural',
        causeOfDeath: fnol.insured_cause_of_death || ''
      },
      description: fnol.description || fnol.short_description || '',
      incidentLocation: fnol.incident_location || '',
      incidentDescription: fnol.describe_the_incident || '',
      priority: fnol.priority || '4',
      company: fnol.company || '',
      openedBy: fnol.opened_by || '',
      assignedTo: fnol.assigned_to || '',
      timeline: [],
      requirements: [],
      documents: [],
      workNotes: [],
      parties: [],
      routing: { type: 'STANDARD' },
      workflow: {}
    };
  }

  /**
   * Test ServiceNow connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await apiClient.get(
        `${this.baseURL}${this.apiVersion}/${this.fnolTable}`,
        {
          headers,
          params: {
            sysparm_limit: 1
          }
        }
      );

      console.log('[ServiceNow] Connection test successful');
      return true;
    } catch (error) {
      console.error('[ServiceNow] Connection test failed:', error);
      return false;
    }
  }
}

export default new ServiceNowService();
