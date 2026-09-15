import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import createOrderHandler from './api/payments/create-order';
import verifyPaymentHandler from './api/payments/verify-payment';
import webhookHandler from './api/payments/webhook';

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
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), paymentApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
