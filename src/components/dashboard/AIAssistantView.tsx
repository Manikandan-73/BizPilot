import React, { useState, useRef, useEffect } from 'react';
import { MSMEProfile, LanguageCode, ChatMessage } from '../../types';
import { BusinessAnalysis, Organization } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
import { askAIAssistant } from '../../services/aiService';
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
  organization?: Organization | null;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onNavigate: (tab: any) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  profile,
  analysis,
  organization,
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

  const handleSend = async (textToSend?: string) => {
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

    try {
      const aiReply = await askAIAssistant(text, {
        organizationId: organization?.id || profile.id,
        language: language as 'en' | 'ta',
        context: organization || { organization: { ...profile, financials: analysis?.financials, normalized: analysis?.normalized, health: analysis?.health, funding: analysis?.funding } },
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
        text: aiReply,
        language: language
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('[AI Assistant Error]:', err?.message);
      let replyText = '';

      if (err?.message?.includes('signed in')) {
        replyText = language === 'ta'
          ? 'நேரலை Google Gemini AI உதவியாளரைப் பயன்படுத்த தயவுசெய்து உள்நுழையவும் அல்லது புதிய கணக்கை உருவாக்கவும்.'
          : 'Please sign in or create an account to chat with the live Google Gemini AI Assistant.';
      } else if (err?.message?.includes('subscription') || err?.message?.includes('Access denied')) {
        replyText = language === 'ta'
          ? 'நேரலை AI உதவியாளரைப் பயன்படுத்த செயலில் உள்ள தொடக்க (Starter) அல்லது தொழில்முறை (Professional) சந்தா தேவை. அமைப்புகள்/கட்டணப் பக்கத்தில் உங்கள் திட்டத்தைச் செயல்படுத்தவும்.'
          : (err.message || 'An active subscription is required to access the live Google Gemini AI Assistant. Please select a plan in Billing.');
      } else {
        replyText = err?.message || (language === 'ta'
          ? 'AI சேவை தற்காலிகமாக கிடைக்கவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'AI service is temporarily unavailable. Please try again.');
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
        text: replyText,
        language: language
      };

      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
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
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#14B8A6]">
            <Bot className="w-4 h-4 text-[#14B8A6]" />
            <span>{t('assistant.bannerTag', 'AI BUSINESS ADVISOR & ASSISTANT')}</span>
          </div>
          <h2 className="text-2xl font-black text-[#F8FAFC] mt-1 tracking-tight">
            {t('assistant.title', 'Multilingual Financial Copilot')}
          </h2>
          <p className="text-xs text-[#A7B0C0] mt-0.5">
            {language === 'ta' 
              ? `${businessName} நிறுவனத்தின் நேரலை நிதி மற்றும் கடன் எண்களைப் பயன்படுத்தி பதிலளிக்கும் AI ஆலோசகர்.`
              : `Context-aware business advisor answering queries using ${businessName}'s actual financials and credit metrics.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#161C27] px-3 py-1.5 rounded-xl border border-[#303848] text-xs">
            <Globe className="w-3.5 h-3.5 text-[#14B8A6]" />
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as 'en' | 'ta';
                setLanguage(newLang);
                onSelectLanguage(newLang);
              }}
              className="bg-transparent text-[#F8FAFC] outline-none font-semibold cursor-pointer"
            >
              <option value="en" className="bg-[#121722] text-[#F8FAFC]">English (🇬🇧)</option>
              <option value="ta" className="bg-[#121722] text-[#F8FAFC]">தமிழ் (🇮🇳)</option>
            </select>
          </div>

          <button
            onClick={resetChat}
            className="p-2 rounded-xl bg-[#161C27] hover:bg-[#1E2536] text-[#A7B0C0] hover:text-[#F8FAFC] border border-[#303848] shadow-sm transition-all"
            title={t('assistant.resetConversation', 'Reset Conversation')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Local Engine Disclosure Pill */}
      <div className="px-4 py-2.5 rounded-xl bg-[#0F1219] border border-[#222936] flex items-center justify-between text-xs text-[#A7B0C0] shadow-sm">
        <div className="flex items-center gap-2 truncate pr-2">
          <Info className="w-4 h-4 text-[#14B8A6] shrink-0" />
          <span className="truncate">Active Context: <strong className="text-[#F8FAFC]">{businessName}</strong> • Rev: ₹{revL}L/mo • Outflow: ₹{expL}L/mo • DSCR: {dscrText}</span>
        </div>
        <span className="text-[10px] text-[#14B8A6] font-semibold bg-[#14B8A6]/15 px-2.5 py-0.5 rounded-full border border-[#14B8A6]/30 shrink-0">
          Gemini 2.5 Flash-Lite
        </span>
      </div>

      {/* Chat Conversation Box */}
      <div className="rounded-2xl bg-[#121722] border border-[#222936] shadow-lg shadow-black/20 flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#090B10]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-[#8B5CF6] text-white shadow-sm' 
                  : 'bg-[#14B8A6] text-white shadow-sm'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                msg.sender === 'user'
                  ? 'bg-[#8B5CF6] text-white rounded-tr-none shadow-md shadow-[#8B5CF6]/20'
                  : 'bg-[#161C27] border border-[#222936] text-[#F8FAFC] rounded-tl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-line font-medium">{msg.text}</div>

                {msg.actionButtons && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#222936]">
                    {msg.actionButtons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleActionButton(btn.action)}
                        className="px-2.5 py-1 rounded-lg bg-[#0F1219] hover:bg-[#121722] text-[#14B8A6] border border-[#14B8A6]/40 text-[11px] font-semibold transition-all flex items-center gap-1 shadow-sm"
                      >
                        {btn.label} <ArrowRight className="w-3 h-3 text-[#14B8A6]" />
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-right ${msg.sender === 'user' ? 'text-violet-200' : 'text-[#707A8C]'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#14B8A6] font-medium italic py-2">
              <Sparkles className="w-4 h-4 animate-spin text-[#14B8A6]" />
              {t('assistant.analyzing', 'Analyzing business records...')}
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#222936] bg-[#121722] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={language === 'ta' ? 'வருவாய், பண இருப்பு, கடன் அல்லது இடர்கள் குறித்து கேளுங்கள்...' : `Ask about ${businessName}'s revenue, runway, loans, or risks...`}
            className="flex-1 bg-[#0D1118] border border-[#222936] rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#707A8C] outline-none focus:bg-[#161C27] focus:border-[#8B5CF6] transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#8B5CF6]/20 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('assistant.send', 'Send')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
