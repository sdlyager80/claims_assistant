export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  console.log('[API] ServiceNow API Proxy - Incoming:', req.method, req.url);

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the path from query parameter
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // Construct the full ServiceNow URL
    const serviceNowURL = 'https://nextgenbpmnp1.service-now.com';
    const fullURL = `${serviceNowURL}${path}`;

    console.log('[API] Proxying to:', fullURL);
    console.log('[API] Method:', req.method);
    console.log('[API] Headers:', JSON.stringify(req.headers));

    // Prepare headers for ServiceNow
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': 'application/json'
    };

    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
      console.log('[API] Auth header present');
    }

    // Prepare request options
    const fetchOptions = {
      method: req.method,
      headers
    };

    // Add body for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body) {
        fetchOptions.body = typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body);
        console.log('[API] Request body:', fetchOptions.body);
      }
    }

    // Make request to ServiceNow
    const snResponse = await fetch(fullURL, fetchOptions);

    console.log('[API] ServiceNow response status:', snResponse.status);

    // Get response body
    const responseText = await snResponse.text();

    // Set content type from ServiceNow response
    const contentType = snResponse.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);

    // Return the ServiceNow response
    return res.status(snResponse.status).send(responseText);

  } catch (err) {
    console.error('[API] Error:', err);
    return res.status(500).json({
      error: err.message,
      details: 'Failed to proxy API request to ServiceNow'
    });
  }
}
