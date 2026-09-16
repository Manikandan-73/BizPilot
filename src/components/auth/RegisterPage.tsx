import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, ArrowRight, AlertCircle, Languages, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface RegisterPageProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  onGoHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onSwitchToLogin,
  onGoHome,
}) => {
  const { register } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError(t('auth.nameRequired', 'Full name is required.'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError(t('auth.invalidEmail', 'Please enter a valid email address.'));
      return false;
    }

    if (!password || password.length < 6) {
      setError(t('auth.passwordLength', 'Password must be at least 6 characters long.'));
      return false;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch', 'Passwords do not match.'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register(fullName.trim(), email.trim(), password);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError(t('auth.emailInUse', 'An account with this email already exists.'));
      } else if (err.code === 'auth/weak-password') {
        setError(t('auth.weakPassword', 'Password is too weak. Please use at least 6 characters.'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('auth.invalidEmail', 'Please enter a valid email address.'));
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network connection failed. Please check your internet connection and try again.');
      } else {
        setError(err.message || t('auth.accountCreationFailed', 'Account creation failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
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
          {t('auth.createBizpilotAccount', 'Create your BizPilot account')}
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-[#A7B0C0] max-w-xs mx-auto">
          {t('auth.createBizpilotSubtitle', 'Set up your credentials to access MSME financial and funding intelligence.')}
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
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                {t('auth.fullName', 'Full Name')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#707A8C] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder', 'e.g. Ramesh Kumar')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0D1118] border border-[#222936] rounded-xl text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#707A8C] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                {t('auth.email', 'Email Address')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#707A8C] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'you@company.in')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0D1118] border border-[#222936] rounded-xl text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#707A8C] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                {t('auth.password', 'Password')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#707A8C] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder', 'At least 6 characters')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0D1118] border border-[#222936] rounded-xl text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#707A8C] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                {t('auth.confirmPassword', 'Confirm Password')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#707A8C] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter your password')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0D1118] border border-[#222936] rounded-xl text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#707A8C] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('auth.registering', 'Creating account...')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.createAccount', 'Create Account')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#222936] text-center">
            <p className="text-xs text-[#A7B0C0]">
              {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-bold text-violet-400 hover:text-violet-300 underline underline-offset-4 ml-1 transition-colors"
              >
                {t('auth.signIn', 'Sign In')}
              </button>
            </p>
          </div>
        </div>

        {/* Informative Micro-Notice */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-[#707A8C] flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Next: Complete your 4-step MSME business setup &amp; choose your plan.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
