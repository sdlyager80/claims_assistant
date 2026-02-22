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
          // Let http-proxy-middleware handle the body automatically
          selfHandleResponse: false,

          configure(proxy) {
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
        },

        // =====================================================
        // IDP (DOCUMENT PROCESSING) API PROXY
        // =====================================================
        '/idp-api': {
          target: 'https://api.sandbox-500.hub-52.ai-product-dev.assure.dxc.com',
          changeOrigin: true,
          secure: true,
          rewrite: path => path.replace(/^\/idp-api/, ''),

          configure(proxy) {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[IDP Proxy]', req.method, req.url);
            });

            proxy.on('proxyRes', (proxyRes) => {
              console.log('[IDP Proxy] Status:', proxyRes.statusCode);
            });

            proxy.on('error', (err) => {
              console.error('[IDP Proxy] Error:', err.message);
            });
          }
        }

      }
    }
  };

});
