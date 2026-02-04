import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');

  // Create Basic Auth header at proxy level
  const username = env.VITE_SERVICENOW_USERNAME || '';
  const password = env.VITE_SERVICENOW_PASSWORD || '';
  const authHeader = username && password
    ? 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
    : null;

  // OAuth configuration
  const clientId = env.VITE_SERVICENOW_CLIENT_ID || '';
  const clientSecret = env.VITE_SERVICENOW_CLIENT_SECRET || '';
  const useOAuth = !!(clientId && clientSecret);

  console.log('[Vite Config] ServiceNow auth configured:', authHeader ? 'Yes' : 'No');
  console.log('[Vite Config] OAuth configured:', useOAuth ? 'Yes (will use OAuth)' : 'No (will use Basic Auth)');

  return {
    plugins: [react()],
    base: './',
    server: {
      proxy: {
        // Proxy for OAuth token requests
        '/servicenow-oauth': {
          target: 'https://nextgenbpmnp1.service-now.com',
          changeOrigin: true,
          secure: true,
          rewrite: path => path.replace(/^\/servicenow-oauth/, '/oauth_token.do'),

          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[OAuth Proxy] Forwarding token request');

              if (req.body) {
                const bodyData = req.body.toString();
                console.log('[OAuth Proxy] Body:', bodyData);
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
              }
            });

            proxy.on('proxyRes', (proxyRes) => {
              console.log('[OAuth Proxy] ServiceNow status:', proxyRes.statusCode);
            });

            proxy.on('error', (err) => {
              console.error('[OAuth Proxy] Error:', err.message);
            });
          }
        },
        // Proxy ServiceNow API requests to avoid CORS issues
        '/servicenow-api': {
          target: 'https://nextgenbpmnp1.service-now.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/servicenow-api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('[Proxy] Request:', req.method, req.url, '→', options.target + req.url);

              // If NOT using OAuth, inject Basic Auth at proxy level
              if (!useOAuth) {
                if (authHeader) {
                  proxyReq.setHeader('Authorization', authHeader);
                  console.log('[Proxy] Added Basic Auth for user:', username);
                } else {
                  console.error('[Proxy] ERROR: No auth header configured!');
                }
              } else {
                // Log whether client sent Bearer token
                const clientAuth = proxyReq.getHeader('Authorization') || req.headers['authorization'];
                console.log('[Proxy] OAuth mode - Authorization header forwarded:', clientAuth ? 'Yes (' + clientAuth.substring(0, 20) + '...)' : 'NO - MISSING!');
              }

              // Log request body for PATCH requests
              if (req.method === 'PATCH') {
                let body = '';
                req.on('data', (chunk) => { body += chunk; });
                req.on('end', () => {
                  console.log('[Proxy] PATCH body:', body);
                });
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('[Proxy] Response:', proxyRes.statusCode, req.url);

              // Remove WWW-Authenticate header to prevent browser popup
              if (proxyRes.statusCode === 401) {
                delete proxyRes.headers['www-authenticate'];
                console.log('[Proxy] Removed WWW-Authenticate header');
              }
            });
            proxy.on('error', (err, req, res) => {
              console.error('[Proxy] Error:', err.message);
            });
          }
        }
      }
    }
  };
})
