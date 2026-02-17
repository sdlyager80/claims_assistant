# Beneficiary Analysis Integration Fix

## Problem Summary

The beneficiary analysis workflow was failing with error:
```
workflow run node [Get Policies] error: parse "https://dev-1.hub-1.sai-dev.assure.dxc.com/api/uds/v2/pnc/pncpolicies/{JSON_DATA}": net/url: invalid control character in URL
```

**Root Cause**: The workflow was attempting to embed JSON data directly into the URL path, which causes URL parsing errors due to special characters (newlines, quotes, etc.).

## Solution Overview

The fix involves:
1. **ServiceNow Workflow Changes**: Update the workflow to pass JSON as request body or subflow inputs
2. **Code Updates**: Added proper methods in `serviceNowService.js` to handle beneficiary analysis

---

## Part 1: ServiceNow Workflow Configuration Fix

### Current Incorrect Configuration

The "Get Policies" workflow node is currently configured like this:
```
URL: https://dev-1.hub-1.sai-dev.assure.dxc.com/api/uds/v2/pnc/pncpolicies/${beneficiary_json}
Method: GET
```

**This is WRONG** - it puts JSON data in the URL path.

### Correct Configuration Options

#### Option A: Use Subflow with Proper Inputs (Recommended)

1. **Configure Subflow Inputs**:
   - Open the "Bene Analyzer Data Pull" subflow (sysId: `3D680e66961d0bb25062a3fd68f681ce38`)
   - Ensure it has these input variables:
     - `fnol_sys_id` (String)
     - `beneficiary_data` (String or Object)

2. **Call Subflow from Main Workflow**:
   ```javascript
   // In the workflow action that calls the subflow
   Subflow: Bene Analyzer Data Pull
   Inputs:
     - fnol_sys_id: ${current.sys_id}
     - beneficiary_data: ${worknote_json_data}
   ```

3. **Within Subflow - REST API Call**:
   - **Node**: REST Message or HTTP Request
   - **Method**: POST (not GET)
   - **URL**: `https://dev-1.hub-1.sai-dev.assure.dxc.com/api/uds/v2/pnc/pncpolicies/${policy_id}`
     - Note: Policy ID as path parameter, NOT the full JSON
   - **Request Body**: `${input.beneficiary_data}`
   - **Headers**:
     ```
     Content-Type: application/json
     Accept: application/json
     ```

#### Option B: Use REST Message Directly

1. Create a REST Message in ServiceNow:
   - Name: "Beneficiary Policy API"
   - Endpoint: `https://dev-1.hub-1.sai-dev.assure.dxc.com/api/uds/v2/pnc/pncpolicies`
   - HTTP Method: POST

2. Configure HTTP Method:
   - **URL Path**: `/${policy_id}` (dynamic)
   - **HTTP Headers**:
     ```
     Content-Type: application/json
     Accept: application/json
     ```
   - **Content**: Use the request body field to pass JSON

3. In workflow, call the REST Message:
   ```javascript
   var restMessage = new sn_ws.RESTMessageV2('Beneficiary Policy API', 'POST');
   restMessage.setStringParameterNoEscape('policy_id', policyId);
   restMessage.setRequestBody(JSON.stringify(beneficiaryData));
   var response = restMessage.execute();
   ```

---

## Part 2: Frontend Code Integration

### New Methods Added to `serviceNowService.js`

#### 1. Parse Beneficiary Data from Worknote
```javascript
parseBeneficiaryAnalysisFromWorknote(worknoteText)
```
- Extracts JSON from worknote text
- Returns parsed beneficiary analysis object

#### 2. Get Analysis from Worknotes
```javascript
await getBeneficiaryAnalysisFromWorknotes(fnolSysId)
```
- Fetches all worknotes for an FNOL
- Finds the one containing beneficiary analysis
- Returns parsed data

#### 3. Trigger Analyzer Subflow
```javascript
await triggerBeneficiaryAnalyzerSubflow(fnolSysId, beneficiaryData)
```
- Properly invokes the subflow with correct inputs
- Sends `fnol_sys_id` and `beneficiary_data` as subflow inputs
- Returns subflow execution result

#### 4. Complete Analysis Flow
```javascript
await analyzeBeneficiaries(fnolSysId)
```
- End-to-end method that:
  1. Gets beneficiary data from worknotes
  2. Triggers the analyzer subflow
  3. Returns complete results

#### 5. Call External API Properly
```javascript
await callPolicyAPIWithBeneficiaryData(policyId, beneficiaryData, apiEndpoint)
```
- Demonstrates correct way to call external API
- Sends JSON as request body (not in URL)
- Policy ID goes in URL path only

### Usage Examples

#### Example 1: Analyze Beneficiaries for an FNOL
```javascript
import serviceNowService from './services/api/serviceNowService';

// Complete analysis workflow
async function analyzeBeneficiariesForFNOL(fnolSysId) {
  try {
    const result = await serviceNowService.analyzeBeneficiaries(fnolSysId);
    console.log('Analysis completed:', result);
    return result;
  } catch (error) {
    console.error('Analysis failed:', error.message);
    throw error;
  }
}

// Usage
analyzeBeneficiariesForFNOL('abc123xyz456');
```

#### Example 2: Manual Step-by-Step
```javascript
// Step 1: Get data from worknotes
const beneficiaryData = await serviceNowService.getBeneficiaryAnalysisFromWorknotes(fnolSysId);

// Step 2: Trigger subflow
const subflowResult = await serviceNowService.triggerBeneficiaryAnalyzerSubflow(
  fnolSysId,
  beneficiaryData
);

console.log('Subflow result:', subflowResult);
```

#### Example 3: Call External Policy API
```javascript
const policyId = 'POL-12345';
const beneficiaryData = {
  Output: [
    {
      DMS: [...],
      PAS: [...],
      Summary: "...",
      BeneScoring: [...]
    }
  ]
};

const apiResult = await serviceNowService.callPolicyAPIWithBeneficiaryData(
  policyId,
  beneficiaryData
);
```

---

## Part 3: Data Structure Reference

### Expected Beneficiary Analysis JSON Format

```json
{
  "Output": [
    {
      "DMS": [
        {
          "documentID": "835377d3-0dc2-497b-8d60-fc691e8d02d3",
          "FirstBeneficiaryName": "Jennifer Lynn Mitchell",
          "beneficiaryDOB": "1982-11-30",
          "beneficiaryPercentage": "50%",
          "beneficiaryType": "Primary",
          "beneficiaryPhone": "",
          "beneficiaryEmail": ""
        }
      ]
    },
    {
      "PAS": [
        {
          "FirstBeneficiaryName": "Jennifer Lynn Mitchell",
          "beneficiaryDOB": "1982-11-30",
          "beneficiaryPercentage": "50%",
          "beneficiaryType": "Primary",
          "beneficiaryPhone": "",
          "beneficiaryEmail": ""
        }
      ]
    },
    {
      "Summary": "All beneficiaries match perfectly..."
    },
    {
      "BeneScoring": [
        {
          "FirstBeneficiaryName": "100%",
          "beneficiaryDOB": "100%",
          "beneficiaryPercentage": "100%",
          "beneficiaryType": "100%"
        }
      ]
    }
  ]
}
```

### Subflow Input Parameters

The "Bene Analyzer Data Pull" subflow expects:

| Parameter | Type | Description |
|-----------|------|-------------|
| `fnol_sys_id` | String | FNOL record sys_id |
| `beneficiary_data` | String/Object | Beneficiary analysis JSON (as string or object) |

---

## Part 4: Testing Checklist

### Frontend Testing

1. **Test worknote parsing**:
```javascript
const testWorknote = `Beneficiary Analysis Results:
{
  "Output": [...]
}`;
const parsed = serviceNowService.parseBeneficiaryAnalysisFromWorknote(testWorknote);
console.log(parsed);
```

2. **Test full analysis**:
```javascript
const result = await serviceNowService.analyzeBeneficiaries('your-fnol-sys-id');
```

3. **Test external API call**:
```javascript
const apiResult = await serviceNowService.callPolicyAPIWithBeneficiaryData(
  'POL-12345',
  parsedData
);
```

### ServiceNow Workflow Testing

1. Create a test FNOL record
2. Add a worknote with beneficiary analysis JSON
3. Trigger the workflow
4. Verify:
   - ✅ Subflow receives correct inputs
   - ✅ REST API call uses POST method
   - ✅ JSON is in request body, not URL
   - ✅ No URL parsing errors

---

## Key Differences: Before vs After

| Aspect | ❌ Before (Incorrect) | ✅ After (Correct) |
|--------|---------------------|-------------------|
| **HTTP Method** | GET | POST |
| **JSON Location** | In URL path | In request body |
| **URL Structure** | `.../pncpolicies/{JSON}` | `.../pncpolicies/{policy_id}` |
| **Content-Type** | Not set | `application/json` |
| **Data Encoding** | Unencoded in URL | Properly encoded in body |
| **Error** | URL parse error | ✅ Works correctly |

---

## Common Mistakes to Avoid

1. ❌ **Don't** put JSON data in URL paths
2. ❌ **Don't** use GET requests when sending JSON payloads
3. ❌ **Don't** forget Content-Type header
4. ❌ **Don't** try to encode JSON for URL (use request body instead)
5. ✅ **Do** use POST/PUT for sending JSON data
6. ✅ **Do** send JSON in request body
7. ✅ **Do** set proper headers
8. ✅ **Do** use URL path parameters for IDs only

---

## Support and Troubleshooting

### Issue: "invalid control character in URL"
- **Cause**: JSON in URL path
- **Fix**: Move JSON to request body, use POST method

### Issue: "Subflow inputs not found"
- **Cause**: Subflow input variables not configured
- **Fix**: Add `fnol_sys_id` and `beneficiary_data` input variables to subflow

### Issue: "400 Bad Request"
- **Cause**: Missing Content-Type header or malformed JSON
- **Fix**: Ensure `Content-Type: application/json` header is set

### Issue: "Cannot find beneficiary data in worknotes"
- **Cause**: Worknote doesn't contain expected JSON structure
- **Fix**: Verify worknote contains JSON with "Output", "DMS", or "BeneScoring" keys

---

## Additional Resources

- ServiceNow REST API Documentation
- ServiceNow Workflow Documentation
- [RFC 3986 - URL Specification](https://www.ietf.org/rfc/rfc3986.txt)

---

**Last Updated**: 2026-02-16
