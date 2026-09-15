import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import('./App')
  .then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        <LanguageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LanguageProvider>
      </React.StrictMode>,
    );
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'The application could not start.';
    root.render(
      <main className="min-h-screen bg-[#0F172A] px-6 py-16 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-500/30 bg-slate-900 p-8">
          <h1 className="text-2xl font-black text-white">BizPilot AI could not start</h1>
          <p className="mt-3 text-sm text-rose-200">{message}</p>
          <p className="mt-5 text-sm text-slate-300">
            Create <code className="text-purple-300">.env.local</code> in the project root,
            add the Firebase web configuration values, then restart the Vite server.
          </p>
        </div>
      </main>,
    );
  });
