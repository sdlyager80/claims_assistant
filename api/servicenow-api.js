export const config = {
  runtime: 'nodejs',
  api: {
    bodyParser: false // Disable body parser to handle raw binary data
  }
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
      'Accept': req.headers['accept'] || 'application/json'
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
      const contentType = req.headers['content-type'] || '';

      // Handle file uploads and binary data (multipart/form-data, binary, etc.)
      if (contentType.includes('multipart/form-data') ||
          contentType.includes('application/pdf') ||
          contentType.includes('application/octet-stream') ||
          contentType.includes('image/')) {

        // Read raw body as buffer for binary/form data
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const bodyBuffer = Buffer.concat(chunks);

        fetchOptions.body = bodyBuffer;
        console.log('[API] Upload body size:', bodyBuffer.length, 'bytes');
        console.log('[API] Content-Type:', contentType);
      } else if (req.body) {
        // Handle JSON body
        fetchOptions.body = typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body);
        console.log('[API] JSON body');
      }
    }

    // Make request to ServiceNow
    const snResponse = await fetch(fullURL, fetchOptions);

    console.log('[API] ServiceNow response status:', snResponse.status);

    // Read response as ArrayBuffer to preserve binary data (e.g. PDF attachments)
    const responseBuffer = await snResponse.arrayBuffer();

    // Set content type from ServiceNow response
    const contentType = snResponse.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);

    // Return the ServiceNow response as a binary-safe Buffer
    return res.status(snResponse.status).send(Buffer.from(responseBuffer));

  } catch (err) {
    console.error('[API] Error:', err);
    return res.status(500).json({
      error: err.message,
      details: 'Failed to proxy API request to ServiceNow'
    });
  }
}
