import React, { useState } from 'react';
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle, Languages, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onGoHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onSwitchToRegister,
  onGoHome,
}) => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(t('auth.emailRequired', 'Valid email and password are required.'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError(t('auth.wrongPassword', 'Incorrect email or password. Please try again.'));
      } else if (err.code === 'auth/user-not-found') {
        setError(t('auth.userNotFound', 'No user found with this email.'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(t('auth.tooManyRequests', 'Too many failed attempts. Please try again later.'));
      } else {
        setError(err.message || t('auth.authFailed', 'Authentication failed. Please check your credentials.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Top Bar navigation */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7B0C0] hover:text-[#F8FAFC] bg-[#121722] border border-[#222936] hover:bg-[#161C27] transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('common.back', 'Back to Home')}
        </button>

        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#121722] text-[#A7B0C0] border border-[#222936] hover:border-violet-500 hover:text-[#F8FAFC] transition-all shadow-sm"
          title={t('header.changeLanguage', 'Change Language')}
        >
          <Languages className="w-3.5 h-3.5 text-violet-400" />
          <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mt-8 sm:mt-0">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/20">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
          {t('auth.loginTitle', 'Welcome back to BizPilot AI')}
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-[#A7B0C0] max-w-xs mx-auto">
          {t('auth.loginSubtitle', 'Log in to your MSME dashboard and manage your business finances.')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#121722] rounded-2xl p-6 sm:p-8 border border-[#222936] shadow-xl">
          
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs placeholder:text-[#707A8C] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#A7B0C0]">
                  {t('auth.password', 'Password')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
                >
                  {t('auth.forgotPassword', 'Forgot Password?')}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#707A8C]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs placeholder:text-[#707A8C] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span>{t('auth.loggingIn', 'Signing in...')}</span>
                ) : (
                  <>
                    <span>{t('auth.signIn', 'Sign In')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-5 border-t border-[#222936] text-center">
            <p className="text-xs text-[#A7B0C0]">
              {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                {t('auth.registerNow', 'Register now')}
              </button>
            </p>
          </div>

        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialEmail={email}
      />
    </div>
  );
};
