import React, { useState, useRef, useEffect } from 'react';
import { MSMEProfile, LanguageCode, ChatMessage } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Globe, 
  RotateCcw, 
  ArrowRight, 
  User, 
  Info 
} from 'lucide-react';

interface AIAssistantViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onNavigate: (tab: any) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  profile,
  analysis,
  currentLanguage: _legacyLang,
  onSelectLanguage,
  onNavigate
}) => {
  const { t, language, setLanguage } = useLanguage();

  const businessName = analysis?.organizationName || profile.name;
  const hasData = Boolean(analysis && analysis.financials && analysis.financials.monthlyRevenue > 0);
  const revL = hasData ? (analysis!.financials.monthlyRevenue / 100000).toFixed(1) : '—';
  const expL = hasData ? (analysis!.financials.totalMonthlyExpenses / 100000).toFixed(1) : '—';
  const profitL = hasData ? (analysis!.financials.monthlyNetCashFlow / 100000).toFixed(1) : '—';
  const runwayMonths = hasData ? (analysis!.financials.runwayMonths ?? 0) : '—';
  const healthScore = analysis ? analysis.health.overallScore : '—';
  const fundingScore = analysis ? analysis.funding.overallScore : '—';
  const creditLimit = analysis ? analysis.funding.estimatedCreditLimit : 'Subject to underwriting';
  const dscrText = analysis?.financials.dscr ? `${analysis.financials.dscr}x` : (language === 'ta' ? 'கடன் இல்லை' : 'Debt-Free');
  const emiText = hasData ? `₹${(analysis!.financials.monthlyEmi / 1000).toFixed(0)}k/mo` : '₹0';

  const getInitialMessage = (): ChatMessage => {
    if (language === 'ta') {
      return {
        id: '1',
        sender: 'assistant',
        timestamp: 'இப்போது',
        text: hasData 
        ? `வணக்கம்! நான் ${businessName}-ன் நேரலை நிதித் தரவுகளைப் பெற்றுள்ளேன் (மாதாந்திர வருவாய்: ₹${revL} இலட்சம், நிதி ஆரோக்கியம்: ${healthScore}/100, கடன் வரம்பு: ${creditLimit}). உங்களுக்கு எவ்வாறு உதவ வேண்டும்?`
        : `வணக்கம்! ${businessName}-க்கான நேரலை பகுப்பாய்வை உருவாக்க, அமைப்புகள் பக்கத்தில் உங்கள் வணிக நிதித் தகவல்களைப் பதிவு செய்யவும்.`,
        language: 'ta',
        actionButtons: [
          { label: 'கடன் தகுதி மற்றும் வரம்பு', action: 'funding' },
          { label: 'பணப்புழக்க இருப்பு மற்றும் செலவு', action: 'cashflow' },
          { label: 'முக்கிய இடர்கள் & தீர்வுகள்', action: 'risks' }
        ]
      };
    }
    return {
      id: '1',
      sender: 'assistant',
      timestamp: 'Just now',
      text: hasData 
        ? `Hello! I have loaded ${businessName}'s verified live profile (Monthly Revenue: ₹${revL}L, Health Score: ${healthScore}/100, Borrowing Capacity: ${creditLimit}). How can I assist your business decisions today?`
        : `Hello! I am BizPilot AI. I am ready to assist ${businessName}. Please configure your business financials in Settings to unlock real-time financial intelligence and loan readiness.`,
      language: 'en',
      actionButtons: [
        { label: 'Check Funding & Loan Eligibility', action: 'funding' },
        { label: 'Analyze Cash Runway & Burn', action: 'cashflow' },
        { label: 'Show Biggest Risks & Fixes', action: 'risks' }
      ]
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Re-sync initial message when language changes if only 1 message exists
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [getInitialMessage()];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
      text: text,
      language: language
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Context-aware business financial response
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (!hasData) {
        reply = language === 'ta'
          ? "நான் நம்பகமான நிதிப் பதிலை வழங்க போதுமான வணிக நிதித் தரவுகள் இல்லை. தயவுசெய்து 'அமைப்புகள்' (Settings) பக்கத்தில் உங்கள் நிதி விவரங்களை உள்ளிடவும்."
          : "I don't have enough financial data to answer that reliably. Please update your financials in Settings to get real-time answers.";
      } else if (lower.includes('funding') || lower.includes('loan') || lower.includes('borrow') || lower.includes('cgtmse') || lower.includes('கடன்')) {
        reply = language === 'ta'
          ? `${businessName}-ன் கடன் தயார்நிலை மதிப்பெண் ${fundingScore}/100 (${analysis?.funding.eligibilityTier || 'Indicative Match'}). உங்கள் மாதாந்திர வருவாய் ₹${revL} இலட்சம் மற்றும் DSCR விகிதம் ${dscrText} ஆகியவற்றின் அடிப்படையில், உங்கள் மதிப்பிடப்பட்ட கடன் திறன் ${creditLimit} ஆகும். இறுதி கடன் அனுமதி வங்கி மதிப்பீட்டிற்கு உட்பட்டது.`
          : `Based on ${businessName}'s financials, your Funding Readiness Score is ${fundingScore}/100 (${analysis?.funding.eligibilityTier || 'Indicative Match'}). With monthly revenue of ₹${revL}L and DSCR at ${dscrText}, your estimated institutional borrowing capacity is ${creditLimit}. Indicative product matches include CGTMSE schemes and working capital overdrafts subject to formal lender underwriting.`;
      } else if (lower.includes('cash') || lower.includes('runway') || lower.includes('burn') || lower.includes('பணம்') || lower.includes('ரொக்கம்')) {
        reply = language === 'ta'
          ? `உங்களிடம் தற்போது ₹${(analysis!.normalized.currentCashBalance / 100000).toFixed(1)} இலட்சம் ரொக்க இருப்பு உள்ளது. மாதாந்திர செலவுகள் ₹${expL} இலட்சம் (தவணை EMI: ${emiText}) என்ற அளவில், உங்கள் பணப்புழக்க இருப்பு தோராயமாக ${runwayMonths} மாதங்கள் நீடிக்கும். மாதாந்திர நிகர பணப்புழக்கம் ₹${profitL} இலட்சம்.`
          : `Your verified cash balance is ₹${(analysis!.normalized.currentCashBalance / 100000).toFixed(1)} Lakhs. Against total monthly costs of ₹${expL}L (including EMI of ${emiText}), your cash runway is approximately ${runwayMonths} months. Net cash flow stands at ₹${profitL} Lakhs/month.`;
      } else if (lower.includes('profit') || lower.includes('revenue') || lower.includes('margin') || lower.includes('வருவாய்') || lower.includes('லாபம்')) {
        reply = language === 'ta'
          ? `${businessName} நிதி நிலவரம்: மாதாந்திர வருவாய் ₹${revL} இலட்சம் (வருடாந்திரம்: ₹${(analysis!.financials.annualRevenue / 100000).toFixed(1)} இலட்சம்). மொத்த மாதாந்திர செலவு ₹${expL} இலட்சம். EBITDA லாபம் ₹${(analysis!.financials.monthlyEbitda / 100000).toFixed(1)} இலட்சம் (${analysis!.financials.operatingMarginPercent}%), நிகர லாபம் ₹${profitL} இலட்சம் (${analysis!.financials.netMarginPercent}%).`
          : `For ${businessName}: Monthly Revenue is ₹${revL}L (Annualized: ₹${(analysis!.financials.annualRevenue / 100000).toFixed(1)}L). Total monthly costs are ₹${expL}L. Operating EBITDA is ₹${(analysis!.financials.monthlyEbitda / 100000).toFixed(1)}L (${analysis!.financials.operatingMarginPercent}% margin), yielding monthly net profit of ₹${profitL}L (${analysis!.financials.netMarginPercent}% net margin).`;
      } else if (lower.includes('risk') || lower.includes('danger') || lower.includes('warn') || lower.includes('இடர்') || lower.includes('ஆபத்து')) {
        const risks = analysis?.growth.keyRisks ?? [];
        reply = language === 'ta'
          ? (risks.length > 0
              ? `${businessName}-ன் முக்கிய வணிக இடர்கள்:\n` + risks.map((r, i) => `${i + 1}. ${r}`).join('\n')
              : `அபாயகரமான நிதி இழப்புகள் கண்டறியப்படவில்லை. ${businessName} சீரான நடைமுறை மூலதனத்தை (₹${(analysis!.financials.workingCapital / 100000).toFixed(1)} இலட்சம்) பராமரிக்கிறது.`)
          : (risks.length > 0
              ? `Identified business risks for ${businessName}:\n` + risks.map((r, i) => `${i + 1}. ${r}`).join('\n')
              : `No critical solvency risks detected. ${businessName} maintains positive working capital (₹${(analysis!.financials.workingCapital / 100000).toFixed(1)}L) and compliant status.`);
      } else {
        reply = language === 'ta'
          ? `உங்கள் வினவல் ${businessName}-ன் நேரலை எண்களுடன் மதிப்பாய்வு செய்யப்பட்டது:\n• மாதாந்திர வருவாய்: ₹${revL} இலட்சம்\n• மாதாந்திர நிகர லாபம்: ₹${profitL} இலட்சம்\n• நிதி ஆரோக்கியம்: ${healthScore}/100\n• பணப்புழக்க இருப்பு: ${runwayMonths} மாதங்கள்\n• கடன் வரம்பு: ${creditLimit}\nஅடுத்ததாக என்ன செய்ய விரும்புகிறீர்கள்? முடிவுகளை உருவகப்படுத்தலாம் அல்லது கடன் பாஸ்போர்ட்டை பார்க்கலாம்.`
          : `I have analyzed your query with ${businessName}'s real operational metrics:\n• Monthly Revenue: ₹${revL}L\n• Net Profit: ₹${profitL}L/mo\n• Health Score: ${healthScore}/100 (${analysis?.health.rating || 'Optimal'})\n• Cash Runway: ${runwayMonths} Months\n• Borrowing Capacity: ${creditLimit}\nHow would you like to proceed? You can simulate a financial scenario or view your Credit Passport.`;
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
        text: reply,
        language: language
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 500);
  };

  const handleActionButton = (action: string) => {
    if (action === 'funding') onNavigate('funding-readiness');
    else if (action === 'cashflow') onNavigate('cash-flow');
    else if (action === 'risks') {
      handleSend(language === 'ta' ? 'வணிகத்தின் முக்கிய இடர்கள் என்ன?' : 'What are my biggest business risks?');
    }
  };

  const resetChat = () => {
    setMessages([getInitialMessage()]);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>{t('assistant.bannerTag', 'AI BUSINESS ADVISOR & ASSISTANT')}</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            {t('assistant.title', 'Multilingual Financial Copilot')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ta' 
              ? `${businessName} நிறுவனத்தின் நேரலை நிதி மற்றும் கடன் எண்களைப் பயன்படுத்தி பதிலளிக்கும் AI ஆலோசகர்.`
              : `Context-aware business advisor answering queries using ${businessName}'s actual financials and credit metrics.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as 'en' | 'ta';
                setLanguage(newLang);
                onSelectLanguage(newLang);
              }}
              className="bg-transparent text-white outline-none font-semibold cursor-pointer"
            >
              <option value="en" className="text-slate-900">English (🇬🇧)</option>
              <option value="ta" className="text-slate-900">தமிழ் (🇮🇳)</option>
            </select>
          </div>

          <button
            onClick={resetChat}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title={t('assistant.resetConversation', 'Reset Conversation')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Local Engine Disclosure Pill */}
      <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Active Context: <strong className="text-white">{businessName}</strong> • Rev: ₹{revL}L/mo • Outflow: ₹{expL}L/mo • DSCR: {dscrText}</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {t('assistant.localEngine', 'Local Financial Engine')}
        </span>
      </div>

      {/* Chat Conversation Box */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.actionButtons && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                    {msg.actionButtons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleActionButton(btn.action)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-900/40 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition-all flex items-center gap-1"
                      >
                        {btn.label} <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 opacity-60 text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-purple-400 italic py-2">
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
              {t('assistant.analyzing', 'Analyzing business records...')}
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={language === 'ta' ? 'வருவாய், பண இருப்பு, கடன் அல்லது இடர்கள் குறித்து கேளுங்கள்...' : `Ask about ${businessName}'s revenue, runway, loans, or risks...`}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('assistant.send', 'Send')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
