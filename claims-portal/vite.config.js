import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

  const SN_TARGET =
    env.VITE_SERVICENOW_URL || 'https://nextgenbpmnp1.service-now.com';

  // =============================
  // Basic Auth Header
  // =============================
  const username = env.VITE_SERVICENOW_USERNAME || '';
  const password = env.VITE_SERVICENOW_PASSWORD || '';

  const authHeader =
    username && password
      ? 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      : null;

  // OAuth mode detection
  const clientId = env.VITE_SERVICENOW_CLIENT_ID || '';
  const clientSecret = env.VITE_SERVICENOW_CLIENT_SECRET || '';
  const useOAuth = !!(clientId && clientSecret);

  console.log('[Vite Config] Target:', SN_TARGET);
  console.log('[Vite Config] Basic Auth:', authHeader ? 'Yes' : 'No');
  console.log('[Vite Config] OAuth Mode:', useOAuth ? 'Enabled' : 'Disabled');

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

          rewrite: (path) => path.replace(/^\/servicenow-oauth/, '/oauth_token.do'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('[OAuth Proxy] Token request →', options.target + '/oauth_token.do');
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('[OAuth Proxy] Token response:', proxyRes.statusCode);
            });
            proxy.on('error', (err, req, res) => {

          rewrite: () => '/oauth_token.do',

          configure(proxy) {

            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[OAuth Proxy] Forwarding token request');

              if (req.body) {
                const body = req.body.toString();
                proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
                proxyReq.write(body);
              }
            });

            proxy.on('proxyRes', (proxyRes) => {
              console.log('[OAuth Proxy] Response:', proxyRes.statusCode);
            });

            proxy.on('error', err => {
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

            proxy.on('proxyRes', (proxyRes, req) => {

              console.log('[API Proxy] Status:', proxyRes.statusCode);

              // Prevent browser auth popup
              if (proxyRes.statusCode === 401) {
                delete proxyRes.headers['www-authenticate'];
              }

            });

            proxy.on('error', err => {
              console.error('[API Proxy] Error:', err.message);
            });

          }
        }

      }
    }
  };

});
