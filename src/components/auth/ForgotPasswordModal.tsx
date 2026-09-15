import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('auth.emailRequired', 'Valid email is required.'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError(t('auth.userNotFound', 'No user found with this email.'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('auth.emailRequired', 'Valid email is required.'));
      } else {
        setError(err.message || t('auth.authFailed', 'Failed to send reset email.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t('auth.forgotPasswordTitle', 'Reset Password')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('auth.forgotPasswordSubtitle', 'Enter your registered email and we will send you a reset link.')}
            </p>
          </div>
        </div>

        {/* Content */}
        {success ? (
          <div className="my-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-emerald-300">
                {t('auth.resetLinkSent', 'Password reset link sent! Check your inbox.')}
              </div>
              <p className="text-emerald-300/80">
                {email}
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
              >
                {t('common.continue', 'Continue')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'you@company.in')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
              >
                {loading ? t('common.saving', 'Sending...') : t('auth.sendResetLink', 'Send Reset Link')}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
