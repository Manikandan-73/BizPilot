import React, { useState, useRef, useEffect } from 'react';
import { MSMEProfile, LanguageCode, ChatMessage } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { MULTILINGUAL_GREETINGS } from '../../data/mockData';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Globe, 
  RotateCcw, 
  ArrowRight,
  User,
  Zap,
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
  currentLanguage,
  onSelectLanguage,
  onNavigate
}) => {
  const businessName = analysis?.organizationName || profile.name;
  const revL = analysis ? (analysis.financials.monthlyRevenue / 100000).toFixed(1) : '48.5';
  const expL = analysis ? (analysis.financials.totalMonthlyExpenses / 100000).toFixed(1) : '38.5';
  const profitL = analysis ? (analysis.financials.monthlyNetCashFlow / 100000).toFixed(1) : '10.0';
  const runwayMonths = analysis?.financials.runwayMonths ?? profile.runwayMonths;
  const healthScore = analysis ? analysis.health.overallScore : profile.healthScore;
  const fundingScore = analysis ? analysis.funding.overallScore : profile.fundingReadinessScore;
  const creditLimit = analysis ? analysis.funding.estimatedCreditLimit : profile.estimatedCreditLimit;
  const dscrText = analysis?.financials.dscr ? `${analysis.financials.dscr}x` : 'Debt-Free';
  const emiText = analysis ? `₹${(analysis.financials.monthlyEmi / 1000).toFixed(0)}k/mo` : '₹180k/mo';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `${MULTILINGUAL_GREETINGS[currentLanguage].welcome} I have loaded ${businessName}'s real profile (Monthly Revenue: ₹${revL}L, Health Score: ${healthScore}/100, Funding Limit: ${creditLimit}). How can I help you today?`,
      language: currentLanguage,
      actionButtons: [
        { label: 'Check Funding & Loan Eligibility', action: 'funding' },
        { label: 'Analyze Cash Runway & Burn', action: 'cashflow' },
        { label: 'Show Biggest Risks & Fixes', action: 'risks' }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: 'Just now',
      text: text,
      language: currentLanguage
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Business-context-aware local intelligence response
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('funding') || lower.includes('loan') || lower.includes('borrow') || lower.includes('cgtmse') || lower.includes('लोन') || lower.includes('கடன்')) {
        reply = currentLanguage === 'hi'
          ? `${businessName} का फंडिंग स्कोर ${fundingScore}/100 है। मासिक राजस्व (₹${revL}L) और DSCR (${dscrText}) के आधार पर, आपका अनुमानित ऋण कोटा ${creditLimit} है। यह CGTMSE के तहत कोलैटरल-फ्री सुविधा के लिए योग्य है।`
          : currentLanguage === 'ta'
          ? `${businessName}-ன் நிதி தகுதி மதிப்பெண் ${fundingScore}/100. உங்கள் மாத வருவாய் (₹${revL}L) மற்றும் DSCR (${dscrText}) அடிப்படையில், நீங்கள் ${creditLimit} வரை பிணையில்லா கடன் பெற தகுதியுடையவர்.`
          : `Based on ${businessName}'s financials, your Funding Readiness Score is ${fundingScore}/100 (${analysis?.funding.eligibilityTier || 'Pre-Qualified'}). With monthly revenue of ₹${revL}L and DSCR at ${dscrText}, your estimated institutional borrowing capacity is ${creditLimit}. Pre-qualified matches include SBI SME Gold (CGTMSE) and HDFC SmartUp OD.`;
      } else if (lower.includes('cash') || lower.includes('runway') || lower.includes('burn') || lower.includes('रुपये') || lower.includes('பணம்')) {
        reply = currentLanguage === 'hi'
          ? `आपके पास वर्तमान में ₹${analysis ? (analysis.normalized.currentCashBalance / 100000).toFixed(1) : '52.0'}L का कैश बैलेंस है, जो लगभग ${runwayMonths} महीने का रनवे प्रदान करता है। मासिक कुल खर्च ₹${expL}L और शुद्ध कैश फ्लो ₹${profitL}L/माह है।`
          : `Your verified cash balance is ₹${analysis ? (analysis.normalized.currentCashBalance / 100000).toFixed(1) : '52.0'} Lakhs. Against total monthly costs of ₹${expL}L (including EMI of ${emiText}), your cash runway is approximately ${runwayMonths} months. Net cash flow stands at ₹${profitL} Lakhs/month.`;
      } else if (lower.includes('profit') || lower.includes('revenue') || lower.includes('margin') || lower.includes('कमाई') || lower.includes('लाभांश')) {
        reply = `For ${businessName}: Monthly Revenue is ₹${revL}L (Annualized: ₹${analysis ? (analysis.financials.annualRevenue / 100000).toFixed(1) : '485.0'}L). Total monthly costs are ₹${expL}L. Operating EBITDA is ₹${analysis ? (analysis.financials.monthlyEbitda / 100000).toFixed(1) : '10.0'}L (${analysis?.financials.operatingMarginPercent ?? 16.8}% margin), yielding monthly net profit of ₹${profitL}L (${analysis?.financials.netMarginPercent ?? 9.4}% net margin).`;
      } else if (lower.includes('risk') || lower.includes('danger') || lower.includes('warn') || lower.includes('जोखिम') || lower.includes('ஆபத்து')) {
        const risks = analysis?.growth.keyRisks ?? [];
        reply = risks.length > 0
          ? `Identified business risks for ${businessName}:\n` + risks.map((r, i) => `${i + 1}. ${r}`).join('\n')
          : `No critical solvency risks detected. ${businessName} maintains positive working capital (₹${analysis ? (analysis.financials.workingCapital / 100000).toFixed(1) : '34.0'}L) and compliant status.`;
      } else if (lower.includes('debt') || lower.includes('emi') || lower.includes('कर्ज')) {
        reply = analysis?.normalized.hasLoans
          ? `Active debt details for ${businessName}: Outstanding loan of ₹${(analysis.normalized.outstandingLoanAmount / 100000).toFixed(1)}L with a monthly EMI of ₹${(analysis.normalized.monthlyEMI / 1000).toFixed(0)}k at ${analysis.normalized.interestRate}% interest. Debt Service Coverage Ratio (DSCR) is healthy at ${dscrText}.`
          : `${businessName} operates completely debt-free with ₹0 existing loans and ₹0 monthly EMI obligations.`;
      } else {
        reply = `I have analyzed your query with ${businessName}'s real operational metrics:\n• Monthly Revenue: ₹${revL}L\n• Net Profit: ₹${profitL}L/mo\n• Health Score: ${healthScore}/100 (${analysis?.health.rating || 'Optimal'})\n• Cash Runway: ${runwayMonths} Months\n• Borrowing Capacity: ${creditLimit}\nHow would you like to proceed? You can simulate a financial scenario or view your Credit Passport.`;
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        timestamp: 'Just now',
        text: reply,
        language: currentLanguage
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionButton = (action: string) => {
    if (action === 'funding') onNavigate('funding-readiness');
    else if (action === 'cashflow') onNavigate('cash-flow');
    else if (action === 'risks') handleSend('What are my biggest business risks?');
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        timestamp: 'Just now',
        text: `Chat reset. Ready to analyze ${businessName}'s financial and operational data.`,
        language: currentLanguage
      }
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>AI BUSINESS ADVISOR & ASSISTANT</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Multilingual Financial Copilot
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Context-aware business advisor answering queries using <strong>{businessName}</strong>'s actual financials and credit metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-white outline-none font-semibold cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          <button
            onClick={resetChat}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Local Engine Disclosure Pill */}
      <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Active Context: <strong>{businessName}</strong> • Rev: ₹{revL}L/mo • Outflow: ₹{expL}L/mo • DSCR: {dscrText}</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Local Financial Engine
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
              Analyzing {businessName}'s records...
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
            placeholder={`Ask about ${businessName}'s revenue, runway, loans, or risks...`}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

      </div>

    </div>
  );
};
