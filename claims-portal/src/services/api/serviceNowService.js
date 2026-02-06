/**
 * ServiceNow Integration Service (FINAL STABLE VERSION)
 * -----------------------------------------------------
 * ✔ Uses proxy for OAuth token exchange (avoids CORS)
 * ✔ Works in deployed domain
 * ✔ OAuth + Basic Auth fallback
 * ✔ Stable redirect handling
 */

class ServiceNowService {

  constructor() {

    // ================= CONFIG =================

    this.serviceNowURL =
      import.meta.env.VITE_SERVICENOW_URL ||
      'https://nextgenbpmnp1.service-now.com';

    // Always use proxy endpoints
    this.baseURL = '/servicenow-api';
    this.oauthURL = '/servicenow-oauth';

    this.apiVersion = '/api/now/table';
    this.fnolTable = 'x_dxcis_claims_a_0_claims_fnol';

    // OAuth Config
    this.clientId = import.meta.env.VITE_SERVICENOW_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_SERVICENOW_CLIENT_SECRET || '';
    this.useOAuth = !!(this.clientId && this.clientSecret);

    // Redirect back to the app's actual URL (not a sub-path that won't exist on static hosting)
    // this.redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI || window.location.origin + window.location.pathname;
    this.redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI;

    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.tokenPromise = null;
    this._callbacks = [];

    // Restore session
    this._restoreToken();
    this._handleOAuthCallback();

    console.log('[ServiceNow] BaseURL:', this.baseURL);
    console.log('[ServiceNow] OAuth Mode:', this.useOAuth);
    console.log('[ServiceNow] Redirect:', this.redirectUri);
  }

  // =====================================================
  // AUTH STATE MANAGEMENT
  // =====================================================

  onAuthChange(cb) {
    this._callbacks.push(cb);
  }

  _notify() {
    const state = this.isAuthenticated();
    this._callbacks.forEach(cb => cb(state));
  }

  isAuthenticated() {
    if (!this.useOAuth) return true;
    return (
      this.accessToken &&
      this.tokenExpiry &&
      Date.now() < this.tokenExpiry
    );
  }

  _saveToken() {
    sessionStorage.setItem('snow_access_token', this.accessToken);
    sessionStorage.setItem('snow_expiry', this.tokenExpiry);
    sessionStorage.setItem('snow_refresh', this.refreshToken || '');
  }

  _restoreToken() {
    const token = sessionStorage.getItem('snow_access_token');
    const exp = sessionStorage.getItem('snow_expiry');
    const ref = sessionStorage.getItem('snow_refresh');

    if (token && exp && Date.now() < Number(exp)) {
      this.accessToken = token;
      this.tokenExpiry = Number(exp);
      this.refreshToken = ref;
    }
  }

  clearAuth() {
    sessionStorage.clear();
    this.accessToken = null;
    this.tokenExpiry = null;
    this.refreshToken = null;
    this._notify();
  }

  // =====================================================
  // OAUTH FLOW
  // =====================================================

  startOAuthLogin() {

    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('snow_state', state);

    const url =
      `${this.serviceNowURL}/oauth_auth.do?` +
      new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        state
      });

    window.location.href = url;
  }

  async _handleOAuthCallback() {

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (!code) return;

    console.log('[OAuth] Code received');

    // Clean URL
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState({}, '', url.pathname);

    try {

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      });

      const res = await fetch(this.oauthURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });

      const data = await res.json();

      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      this._saveToken();
      this._notify();

      console.log('[OAuth] Token OK');

    } catch (e) {
      console.error('[OAuth] Exchange Failed', e);
    }
  }

  async getAuthHeaders() {

    // OAuth
    if (this.useOAuth) {

      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      return {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };
    }

    // Basic Auth
    const u = import.meta.env.VITE_SERVICENOW_USERNAME;
    const p = import.meta.env.VITE_SERVICENOW_PASSWORD;

    if (!u || !p)
      return { 'Content-Type': 'application/json' };

    const encoded = btoa(`${u}:${p}`);

    return {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json'
    };
  }

  // =====================================================
  // FNOL CREATE (CORE API)
  // =====================================================

  async createFNOL(data) {

    const headers = await this.getAuthHeaders();

    const url =
      `${this.baseURL}${this.apiVersion}/${this.fnolTable}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!res.ok)
      throw new Error('ServiceNow error ' + res.status);

    const json = await res.json();

    return {
      sysId: json.result.sys_id,
      number: json.result.number
    };
  }

  // =====================================================
  // SIMPLE FETCH HELPERS
  // =====================================================

  async getFNOL(sysId) {

    const headers = await this.getAuthHeaders();

    const res = await fetch(
      `${this.baseURL}${this.apiVersion}/${this.fnolTable}/${sysId}`,
      { headers }
    );

    const json = await res.json();
    return json.result;
  }

}

export default new ServiceNowService();
