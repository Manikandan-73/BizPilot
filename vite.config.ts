import { defineConfig, Plugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import createOrderHandler from './api/payments/create-order';
import verifyPaymentHandler from './api/payments/verify-payment';
import webhookHandler from './api/payments/webhook';
import aiAssistantHandler from './api/ai/assistant';
import aiAdvisorHandler from './api/ai/advisor';

function paymentApiPlugin(): Plugin {
  return {
    name: 'payment-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/payments/create-order') {
          void createOrderHandler(req, res);
          return;
        }
        if (url === '/api/payments/verify-payment') {
          void verifyPaymentHandler(req, res);
          return;
        }
        if (url === '/api/payments/webhook') {
          void webhookHandler(req, res);
          return;
        }
        if (url === '/api/ai/assistant') {
          void aiAssistantHandler(req, res);
          return;
        }
        if (url === '/api/ai/advisor') {
          void aiAdvisorHandler(req, res);
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), paymentApiPlugin()],
    server: {
      port: 5173,
      host: true,
    },
  };
});
