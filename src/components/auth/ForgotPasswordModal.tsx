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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-[#121722] border border-[#222936] shadow-2xl p-4 sm:p-6 lg:p-8 my-auto min-w-0">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-lg text-[#707A8C] hover:text-[#F8FAFC] hover:bg-[#161C27] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 pr-6 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] truncate">
              {t('auth.forgotPasswordTitle', 'Reset Password')}
            </h3>
            <p className="text-xs text-[#A7B0C0] line-clamp-2">
              {t('auth.forgotPasswordSubtitle', 'Enter your registered email and we will send you a reset link.')}
            </p>
          </div>
        </div>

        {/* Content */}
        {success ? (
          <div className="my-5 sm:my-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-3 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              <div className="font-semibold text-emerald-200">
                {t('auth.resetLinkSent', 'Password reset link sent! Check your inbox.')}
              </div>
              <p className="text-emerald-400/80 truncate">
                {email}
              </p>
              <button
                onClick={onClose}
                className="mt-3 w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors text-center"
              >
                {t('common.continue', 'Continue')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-5 min-w-0">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#707A8C]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'you@company.in')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs placeholder:text-[#707A8C] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-[#A7B0C0] hover:text-[#F8FAFC] hover:bg-[#161C27] transition-colors text-center"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50 text-center"
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
