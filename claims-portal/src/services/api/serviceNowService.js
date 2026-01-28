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
    this.baseURL = isDevelopment
      ? '/servicenow-api'  // Vite proxy path
      : (import.meta.env.VITE_SERVICENOW_URL || 'https://nextgenbpmnp1.service-now.com');
    this.apiVersion = '/api/now/table';
    this.fnolTable = 'x_dxcis_claims_a_0_claims_fnol';

    console.log('[ServiceNow] Base URL:', this.baseURL, '(Development mode:', isDevelopment, ')');
  }

  /**
   * Create authentication headers for ServiceNow API
   */
  getAuthHeaders() {
    // In development, proxy handles auth - don't send duplicate headers
    const isDevelopment = import.meta.env.DEV;

    if (isDevelopment) {
      console.log('[ServiceNow] Development mode - proxy will handle authentication');
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }

    // Production: send auth header directly
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
    console.log('[ServiceNow] Auth header created for user:', username);

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

      const url = `${this.baseURL}${this.apiVersion}/${this.fnolTable}`;
      console.log('[ServiceNow] Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
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
      const url = `${this.baseURL}${this.apiVersion}/${this.fnolTable}/${sysId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
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
      const url = `${this.baseURL}${this.apiVersion}/${this.fnolTable}?${params}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
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

      const response = await apiClient.patch(
        `${this.baseURL}${this.apiVersion}/${this.fnolTable}/${sysId}`,
        mappedUpdates,
        {
          headers: this.getAuthHeaders()
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

      const response = await apiClient.get(
        `${this.baseURL}${this.apiVersion}/${this.fnolTable}`,
        {
          headers: this.getAuthHeaders(),
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
   * Test ServiceNow connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const response = await apiClient.get(
        `${this.baseURL}${this.apiVersion}/${this.fnolTable}`,
        {
          headers: this.getAuthHeaders(),
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
