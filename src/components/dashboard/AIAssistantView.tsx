import React, { useState, useRef, useEffect } from 'react';
import { MSMEProfile, LanguageCode, ChatMessage } from '../../types';
import { MULTILINGUAL_GREETINGS } from '../../data/mockData';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Globe, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  User,
  Zap,
  HelpCircle
} from 'lucide-react';

interface AIAssistantViewProps {
  profile: MSMEProfile;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onNavigate: (tab: any) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  profile,
  currentLanguage,
  onSelectLanguage,
  onNavigate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      timestamp: 'Just now',
      text: MULTILINGUAL_GREETINGS[currentLanguage].welcome,
      language: currentLanguage,
      actionButtons: [
        { label: 'Improve Funding Score', action: 'funding' },
        { label: 'Check 45-Day Cash Warning', action: 'cashflow' },
        { label: 'CGTMSE Loan Eligibility', action: 'loan' }
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

    // Simulate AI response logic
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('funding') || lower.includes('score') || lower.includes('रेटिंग') || lower.includes('மதிப்பெண்')) {
        reply = currentLanguage === 'hi' 
          ? `आपके फंडिंग स्कोर (${profile.fundingReadinessScore}/100) को 85+ तक ले जाने के लिए: 1) अपने डेटर चक्र को 58 से घटाकर 40 दिन करें (TReDS का उपयोग करके), 2) अप्रयुक्त ओवरड्राफ्ट सीमा को बंद करें, और 3) अगले 3 महीनों के लिए निरंतर GSTR रिटर्न फाइलिंग बनाए रखें। इससे SBI और HDFC से ब्याज दर में 0.40% की छूट मिलेगी।`
          : currentLanguage === 'ta'
          ? `உங்கள் நிதி மதிப்பெண்ணை (${profile.fundingReadinessScore}/100) 85+ ஆக உயர்த்த: 1) TReDS மூலம் கடன் வசூலிப்பு காலத்தை 58லிருந்து 40 நாட்களாகக் குறைக்கவும், 2) தொடர்ந்து 3 மாதங்களுக்கு சரியான நேரத்தில் GST தாக்கல் செய்யவும். இதன் மூலம் வங்கிகளில் குறைந்த வட்டியில் கடன் பெறலாம்.`
          : `To improve your Funding Readiness score from ${profile.fundingReadinessScore} to 85+: 1) Shrink your receivable collection cycle from 58 days to 40 days using TReDS invoice discounting, 2) Close 1 inactive overdraft facility to reduce contingent liability, and 3) Maintain clean debt-servicing for 90 days. This unlocks interest rate discounts down to 8.75% under CGTMSE.`;
      } else if (lower.includes('cash') || lower.includes('shortage') || lower.includes('45') || lower.includes('कमी') || lower.includes('பற்றாக்குறை')) {
        reply = currentLanguage === 'hi'
          ? `45 दिनों में संभावित कैश कमी की चेतावनी इसलिए है क्योंकि मई के अंत में आपका मौसमी कच्चा माल खरीद चक्र ₹18.5L की लिक्विडिटी की मांग करेगा। हम अनुशंसा करते हैं कि आप तुरंत ₹10.5L के कॉर्पोरेट इनवॉइस को TReDS पर डिस्काउंट करवा लें।`
          : `The 45-day cash shortage warning triggers because your seasonal raw material procurement in late May demands ₹18.5L in upfront capital while customer payouts take 58 days. Recommendation: Pre-discount ₹10.5L verified B2B invoices on RXIL to maintain a safe ₹8L cash cushion.`;
      } else if (lower.includes('loan') || lower.includes('cgtmse') || lower.includes('लोन') || lower.includes('கடன்')) {
        reply = currentLanguage === 'hi'
          ? `हाँ! आपके DSCR अनुपात (1.84x) और CMR-3 क्रेडिट स्कोर के आधार पर, आप SBI, HDFC और SIDBI के माध्यम से ₹${profile.estimatedCreditLimit} तक के गारंटी-मुक्त (Collateral-Free) CGTMSE लोन के लिए 100% पात्र हैं।`
          : `Yes! With a verified DSCR of ${profile.dscrRatio}x and clean CMR-3 commercial repayment history, ${profile.name} is pre-qualified for up to ${profile.estimatedCreditLimit} in collateral-free credit under the CGTMSE credit guarantee scheme.`;
      } else if (lower.includes('price') || lower.includes('profit') || lower.includes('दाम') || lower.includes('விலை')) {
        reply = currentLanguage === 'hi'
          ? `बिज़पायलट AI सिम्युलेटर के अनुसार, कीमतों में 8% की वृद्धि करने से आपका मासिक शुद्ध लाभ ₹2.8 लाख बढ़ जाएगा, जबकि ग्राहकों का रिटेंशन 96.2% बना रहेगा।`
          : `According to our price-elasticity model for ${profile.sector}, an 8% increase in catalog pricing yields a +₹2.8 Lakhs monthly net profit surge with 96.2% customer retention.`;
      } else {
        reply = `I have analyzed your request against ${profile.name}'s verified financial records (Turnover: ${profile.turnover}, Health Score: ${profile.healthScore}/100). All telemetry indicates strong baseline solvency. Would you like me to generate a tailored report or simulate a scenario?`;
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
    }, 800);
  };

  const toggleMic = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        handleSend(MULTILINGUAL_GREETINGS[currentLanguage].sampleQuestions[0]);
      }, 2000);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>MULTILINGUAL PERSISTENT COPILOT</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            AI Business & Underwriting Assistant
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Conversational financial advisor supporting English, Hindi, Tamil, Telugu, and Marathi.
          </p>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          {(['en', 'hi', 'ta', 'te', 'mr'] as LanguageCode[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onSelectLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                currentLanguage === lang
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4 flex flex-col h-[560px]">
        
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-sky-400 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none shadow-lg'
                  : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
              }`}>
                <div>{msg.text}</div>

                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-purple-300">
                      <Sparkles className="w-3 h-3" /> BizPilot Neural Engine
                    </span>
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                      title="Listen audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Speak
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200 shrink-0 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300 shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span>BizPilot AI is reasoning across your balance sheet...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2">
          {MULTILINGUAL_GREETINGS[currentLanguage].sampleQuestions.map((q, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSend(q)}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-left flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate max-w-xs">{q}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse border-rose-500'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
            title="Voice input simulation"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              currentLanguage === 'hi' 
                ? 'मुझसे अपने बिज़नेस, लोन, या कैश फ्लो के बारे में पूछें...'
                : currentLanguage === 'ta'
                ? 'உங்கள் வணிக நிதி அல்லது கடன் தகுதி பற்றி கேளுங்கள்...'
                : 'Ask BizPilot AI about your funding score, runway, or loan options...'
            }
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all shadow-lg shadow-purple-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
