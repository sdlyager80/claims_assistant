import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

  const SN_TARGET =
    env.VITE_SERVICENOW_URL || 'https://nextgenbpmnp1.service-now.com';

  // =============================
  // BASIC AUTH HEADER (DEV ONLY)
  // =============================
  const username = env.VITE_SERVICENOW_USERNAME || '';
  const password = env.VITE_SERVICENOW_PASSWORD || '';

  const authHeader =
    username && password
      ? 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      : null;

  // OAuth detection
  const clientId = env.VITE_SERVICENOW_CLIENT_ID || '';
  const clientSecret = env.VITE_SERVICENOW_CLIENT_SECRET || '';
  const useOAuth = Boolean(clientId && clientSecret);

  console.log('[Vite Config] Target:', SN_TARGET);
  console.log('[Vite Config] Basic Auth Enabled:', !!authHeader);
  console.log('[Vite Config] OAuth Mode:', useOAuth);

  return {
    plugins: [react()],
    base: './',

    server: {
      proxy: {

        // =====================================================
        // OAUTH TOKEN EXCHANGE
        // =====================================================
        '/servicenow-oauth': {
          target: SN_TARGET,
          changeOrigin: true,
          secure: true,
          rewrite: () => '/oauth_token.do',
        
          configure(proxy) {
        
            proxy.on('proxyReq', (proxyReq, req) => {
        
              console.log('[OAuth Proxy] Forwarding token request');
        
              // ⭐ Properly forward form-urlencoded body
              if (req.method === 'POST') {
        
                let body = '';
        
                req.on('data', chunk => {
                  body += chunk;
                });
        
                req.on('end', () => {
                  if (body) {
                    proxyReq.setHeader(
                      'Content-Length',
                      Buffer.byteLength(body)
                    );
                    proxyReq.write(body);
                  }
                });
              }
            });
        
            proxy.on('proxyRes', (proxyRes) => {
              console.log('[OAuth Proxy] Status:', proxyRes.statusCode);
            });
        
            proxy.on('error', (err) => {
              console.error('[OAuth Proxy] Error:', err.message);
            });
          }
        },

        // =====================================================
        // SERVICENOW TABLE / API CALLS
        // =====================================================
        '/servicenow-api': {
          target: SN_TARGET,
          changeOrigin: true,
          secure: true,

          rewrite: path => path.replace(/^\/servicenow-api/, ''),

          configure(proxy) {

            proxy.on('proxyReq', (proxyReq, req) => {

              console.log('[API Proxy]', req.method, req.url);

              // Inject Basic Auth ONLY if OAuth disabled
              if (!useOAuth && authHeader) {
                proxyReq.setHeader('Authorization', authHeader);
              }
            });

            proxy.on('proxyRes', (proxyRes) => {

              console.log('[API Proxy] Status:', proxyRes.statusCode);

              // Prevent browser auth popup
              if (proxyRes.statusCode === 401) {
                delete proxyRes.headers['www-authenticate'];
              }
            });

            proxy.on('error', (err) => {
              console.error('[API Proxy] Error:', err.message);
            });
          }
        }

      }
    }
  };

});
