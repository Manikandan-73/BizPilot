import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Sparkles, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Col 1 */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-sky-400 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-white">
              BizPilot <span className="text-purple-400">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'ta'
              ? 'இந்தியாவின் முதன்மையான AI-ஆல் இயக்கப்படும் MSME நிதி தயார்நிலை மற்றும் வளர்ச்சி நுண்ணறிவு தளம். 63M+ நிறுவனங்களின் நிதி ஆரோக்கியத்தை மேம்படுத்துகிறது.'
              : "India's premier AI-powered MSME Funding Readiness & Growth Intelligence Platform. Empowering 63M+ enterprises to achieve creditworthiness and financial visibility."}
          </p>
          <div className="flex items-center gap-3 text-slate-400 pt-2">
            <span className="text-xs flex items-center gap-1 text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" /> ISO 27001 Certified & RBI AA Compliant
            </span>
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-2 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
            {language === 'ta' ? 'தளத்தின் முக்கிய வசதிகள்' : 'Platform Capabilities'}
          </h4>
          <ul className="space-y-1.5 text-slate-400">
            <li className="hover:text-purple-300 cursor-pointer transition-colors">
              {language === 'ta' ? 'நிதி ஆரோக்கிய அளவீடு' : 'Financial Health Score Gauge'}
            </li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">
              {language === 'ta' ? 'பணப்புழக்க முன்கணிப்பு' : 'Predictive Cash Flow Runway'}
            </li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">
              {language === 'ta' ? 'கடன் தயார்நிலை பகுப்பாய்வு' : 'Funding Readiness Analyzer'}
            </li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">
              {language === 'ta' ? 'MSME கடன் பாஸ்போர்ட்' : 'MSME Credit Passport (Bankable)'}
            </li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">
              {language === 'ta' ? 'முடிவு உருவகப்படுத்தி (What-If)' : 'What-If Decision Simulator'}
            </li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">
              {language === 'ta' ? 'பன்மொழி AI உதவியாளர்' : 'Multilingual AI Copilot'}
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-2 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
            {language === 'ta' ? 'இணைப்புகள் & கூட்டமைப்புகள்' : 'Ecosystem & Integrations'}
          </h4>
          <ul className="space-y-1.5 text-slate-400">
            <li className="hover:text-purple-300 cursor-pointer transition-colors">GSTN & e-Invoicing Portal</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">TReDS (RXIL, Invoicemart, M1xchange)</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">Account Aggregator (Setu / Sahamati)</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">PSB59 & CGTMSE Scheme Matcher</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">Tally, Zoho Books, Busy ERP Connectors</li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-3 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
            {language === 'ta' ? 'தேசிய தாக்கம்' : 'National Impact'}
          </h4>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-purple-400 font-bold text-sm">63 Million+ MSMEs</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {language === 'ta'
                ? 'தரவு அடிப்படையிலான கடன் அனுமதிகள் மூலம் ₹40 இலட்சம் கோடி கடன் இடைவெளியைக் குறைக்கிறது.'
                : 'Bridging the $530 Billion credit gap through explainable financial intelligence and data-backed lending.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <span>{language === 'ta' ? 'இந்திய தொழில்முனைவோருக்காக உருவாக்கப்பட்டது' : 'Built with'}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>{language === 'ta' ? 'அன்புடன்' : 'for Indian Innovators & Founders'}</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          © {new Date().getFullYear()} BizPilot AI Technologies Pvt Ltd. {language === 'ta' ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' : 'All rights reserved.'}
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hover:text-slate-300 cursor-pointer">
            {language === 'ta' ? 'தனியுரிமைக் கொள்கை' : 'Privacy Policy'}
          </span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">
            {language === 'ta' ? 'விதிமுறைகள்' : 'Terms of Service'}
          </span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">
            {language === 'ta' ? 'பாதுகாப்பு & குறியாக்கம்' : 'Security & Encryption'}
          </span>
        </div>
      </div>
    </footer>
  );
};
