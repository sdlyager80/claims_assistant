export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  console.log('[API] ServiceNow OAuth - Incoming method:', req.method);
  console.log('[API] Request headers:', req.headers);

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the request body
    let bodyParams;

    if (typeof req.body === 'string') {
      // Body is already a string (form-urlencoded)
      bodyParams = req.body;
      console.log('[API] Body is string:', bodyParams);
    } else if (req.body && typeof req.body === 'object') {
      // Body is parsed as JSON, convert to URLSearchParams
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(req.body)) {
        params.append(key, value);
      }
      bodyParams = params.toString();
      console.log('[API] Body converted from object:', bodyParams);
    } else {
      throw new Error('Invalid request body');
    }

    console.log('[API] Forwarding OAuth request to ServiceNow...');

    // Forward request to ServiceNow
    const snResponse = await fetch(
      'https://nextgenbpmnp1.service-now.com/oauth_token.do',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      }
    );

    console.log('[API] ServiceNow response status:', snResponse.status);

    // Get response text
    const responseText = await snResponse.text();
    console.log('[API] ServiceNow response:', responseText);

    // Set content type based on response
    const contentType = snResponse.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);

    // Return the ServiceNow response
    return res.status(snResponse.status).send(responseText);

  } catch (err) {
    console.error('[API] Error:', err);
    return res.status(500).json({
      error: err.message,
      details: 'Failed to proxy OAuth request to ServiceNow'
    });
  }
}
