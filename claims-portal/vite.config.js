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

  console.log('[Vite Config] ServiceNow auth configured:', authHeader ? 'Yes' : 'No');

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy ServiceNow API requests to avoid CORS issues
        '/servicenow-api': {
          target: 'https://nextgenbpmnp1.service-now.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/servicenow-api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('[Proxy] Request:', req.method, req.url, '→', options.target + req.url);

              // ONLY use proxy-level auth (ignore client auth header)
              if (authHeader) {
                proxyReq.setHeader('Authorization', authHeader);
                console.log('[Proxy] Added ServiceNow authentication for user:', username);
              } else {
                console.error('[Proxy] ERROR: No auth header configured!');
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
