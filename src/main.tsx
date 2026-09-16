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
      <main className="min-h-screen bg-[#090B10] px-6 py-16 text-[#F8FAFC] flex items-center justify-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#303848] bg-[#121722] p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">BizPilot AI could not start</h1>
          <p className="mt-3 text-sm text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3">{message}</p>
          <p className="mt-5 text-sm text-[#A7B0C0]">
            Create <code className="text-[#A78BFA] font-semibold">.env.local</code> in the project root,
            add the Firebase web configuration values, then restart the Vite server.
          </p>
        </div>
      </main>,
    );
  });
