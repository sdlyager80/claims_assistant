# ServiceNow Integration Setup Guide

## Overview

This guide walks you through setting up the ServiceNow integration for submitting FNOL (First Notice of Loss) data from the Claims Portal to ServiceNow.

**ServiceNow Instance:** https://nextgenbpmnp1.service-now.com
**FNOL Table:** `x_dxcis_claims_a_0_claims_fnol`

---

## Step 1: Configure ServiceNow Credentials

### Local Development

1. Open the `.env` file in the `claims-portal` directory
2. Add your ServiceNow credentials:

```env
VITE_SERVICENOW_URL=https://nextgenbpmnp1.service-now.com
VITE_SERVICENOW_USERNAME=your_username
VITE_SERVICENOW_PASSWORD=your_password
```

3. **Important:** The `.env` file is git-ignored and will NOT be committed to GitHub

### For AWS Deployment

When deploying to AWS, you'll need to set these environment variables in your deployment configuration:

- **AWS Amplify:** Add environment variables in the Amplify console
- **AWS EC2/ECS:** Set environment variables in task definitions or user data scripts
- **AWS Lambda:** Configure environment variables in Lambda function settings

**Recommendation:** Use AWS Secrets Manager for production credentials instead of plain text environment variables.

---

## Step 2: Set Up ServiceNow Application Registry (Optional for OAuth)

For production, you should use OAuth 2.0 instead of Basic Auth:

1. Log in to ServiceNow as an admin
2. Navigate to: **System OAuth** > **Application Registry**
3. Click **New** > **Create an OAuth API endpoint for external clients**
4. Fill in:
   - **Name:** Claims Portal
   - **Client ID:** (auto-generated or custom)
   - **Client Secret:** (auto-generated - save this!)
   - **Redirect URL:** Your portal URL (e.g., `https://yourdomain.com/callback`)
   - **Refresh Token Lifespan:** 8640000 seconds (100 days)
   - **Access Token Lifespan:** 1800 seconds (30 minutes)
5. Click **Submit**

### Update Environment Variables for OAuth

```env
VITE_SERVICENOW_URL=https://nextgenbpmnp1.service-now.com
VITE_SERVICENOW_CLIENT_ID=your_client_id
VITE_SERVICENOW_CLIENT_SECRET=your_client_secret
```

---

## Step 3: Test the Integration

### Test ServiceNow Connection

1. Start the development server:
   ```bash
   cd claims-portal
   npm run dev
   ```

2. Open browser console (F12)

3. Navigate to **New Claim (FNOL)** in the portal

4. The console will show connection test results

### Submit Test FNOL

1. Fill out the FNOL form with test data:
   - **Policy Number:** POL-12345
   - **Insured Name:** John Smith Test
   - **Date of Death:** (any date)
   - **Claimant Name:** Mary Smith Test
   - **Claimant Email:** test@example.com
   - **Claimant Phone:** 555-123-4567
   - **Relationship:** Spouse
   - **Description:** Test FNOL submission

2. Click **Submit Claim**

3. You should see:
   - Success message with FNOL number (e.g., `FNOL0001005`)
   - Console logs showing ServiceNow API response

4. Verify in ServiceNow:
   - Navigate to: **Claims FNOL** > **All**
   - Find your test FNOL record
   - Verify all fields populated correctly

---

## Step 4: Field Mapping Reference

The portal form fields map to ServiceNow table columns as follows:

| Portal Field | ServiceNow Column | Notes |
|-------------|------------------|-------|
| Insured Name | `insured_full_name` | Full name of deceased |
| Date of Death | `insured_date_of_death` | ISO date format |
| Claimant Name | `claimant_full_name` | Name of person filing claim |
| Claimant Email | `claimant_email_address` | Contact email |
| Claimant Phone | `claimant_phone_number` | Contact phone |
| Relationship | `claimant_relationship_to_insured` | Relationship to deceased |
| Policy Number | `policy_numbers` | Policy reference |
| Description | `description` | Incident details |
| Short Description | `short_description` | Auto-generated: "Death Claim - [Insured Name]" |

**Additional fields available (not yet in form):**
- Insured address fields (`insured_street_address`, `insured_city`, `insured_state`, `insured_zip_code`)
- Claimant address fields (`claimant_street_address`, `claimant_city`, `claimant_state`, `claimant_zip_code`)
- Insured additional info (`insured_other_names`, `insured_place_of_birth`, `insured_marital_status`, `insured_cause_of_death`, `insured_manner_of_death`)
- Claimant additional info (`claimant_date_of_birth`, `claimant_sex`, `claimant_capacity`, `claimant_country_of_citizenship`)
- Police report details (`police_report_number`, `police_report_details`)
- Incident details (`date_and_time_of_incident`, `incident_location`, `nature_of_loss`)

---

## Step 5: AWS Deployment Considerations

### Update Base URL for Production

When deploying to AWS, you'll need to update the ServiceNow URL handling to use production URLs:

1. **Option A:** Environment-specific URLs
   ```env
   # Development
   VITE_SERVICENOW_URL=https://nextgenbpmnp1.service-now.com

   # Production
   VITE_SERVICENOW_URL=https://nextgenbpmnp1.service-now.com
   ```

2. **Option B:** Update Application Registry Redirect URLs
   - Add your AWS production URL to the ServiceNow Application Registry
   - Update redirect URLs for OAuth callback

### CORS Configuration

If you encounter CORS errors in production:

1. In ServiceNow, navigate to: **System Web Services** > **REST** > **Properties**
2. Add your production domain to allowed origins
3. Or set up a proxy/API Gateway to handle CORS

### Security Best Practices

- ✅ Use OAuth 2.0 instead of Basic Auth in production
- ✅ Store credentials in AWS Secrets Manager
- ✅ Enable HTTPS/TLS for all API calls
- ✅ Implement rate limiting on ServiceNow API calls
- ✅ Use environment-specific ServiceNow instances (dev, staging, prod)
- ✅ Audit log all ServiceNow API calls
- ✅ Implement retry logic with exponential backoff

---

## Troubleshooting

### Error: "ServiceNow authentication failed"

**Cause:** Invalid username/password or credentials not set

**Solution:**
1. Verify credentials in `.env` file
2. Test credentials by logging into ServiceNow manually
3. Check if account has necessary permissions

### Error: "ServiceNow access forbidden"

**Cause:** User lacks permissions to access FNOL table

**Solution:**
1. In ServiceNow, navigate to: **User Administration** > **Users**
2. Find your user account
3. Ensure user has role: `x_dxcis_claims_a_0.user` or admin role
4. Grant table access: **System Security** > **Access Control (ACL)**

### Error: "CORS policy blocked"

**Cause:** ServiceNow blocking requests from portal domain

**Solution:**
1. In ServiceNow: **System Web Services** > **REST** > **Properties**
2. Add your domain to CORS whitelist
3. Or use API Gateway/proxy to handle CORS

### FNOL not appearing in ServiceNow

**Cause:** Wrong table name or data not committed

**Solution:**
1. Check console logs for API response
2. Verify table name: `x_dxcis_claims_a_0_claims_fnol`
3. Check ServiceNow transaction logs: **System Logs** > **Transactions**

---

## Next Steps

Once FNOL integration is working:

1. **Add more form fields** - Expand IntakeForms to capture all FNOL data (addresses, police reports, etc.)
2. **Implement Case Management** - Create ServiceNow cases linked to FNOL records
3. **Add Task Creation** - Generate ServiceNow tasks for requirements
4. **Enable Workflow** - Trigger ServiceNow workflows on FNOL submission
5. **Implement Webhooks** - Set up ServiceNow to send updates back to portal
6. **Add Document Uploads** - Attach documents to ServiceNow FNOL records

---

## API Reference

### ServiceNow Service Methods

```javascript
import serviceNowService from './services/api/serviceNowService';

// Create FNOL
const result = await serviceNowService.createFNOL(fnolData);
// Returns: { success: true, fnolNumber: 'FNOL0001004', sysId: '...', data: {...} }

// Get FNOL by sys_id
const fnol = await serviceNowService.getFNOL(sysId);

// Get FNOL by number
const fnol = await serviceNowService.getFNOLByNumber('FNOL0001004');

// Update FNOL
await serviceNowService.updateFNOL(sysId, updates);

// Get all FNOLs with filters
const fnols = await serviceNowService.getFNOLs({
  state: '1',
  limit: 50,
  offset: 0
});

// Test connection
const isConnected = await serviceNowService.testConnection();
```

---

## Support

For issues or questions:
- **ServiceNow Documentation:** https://docs.servicenow.com/
- **Portal Repository:** https://github.com/sdlyager80/claims_halstack
- **Contact:** stephanie.lyons@dxc.com
