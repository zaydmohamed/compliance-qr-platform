import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  MinusCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const ChatbotWidget = ({ mode = 'PUBLIC' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isPublic = mode === 'PUBLIC';

  // Initial welcome message based on mode
  useEffect(() => {
    if (messages.length === 0) {
      if (isPublic) {
        setMessages([
          {
            sender: 'bot',
            text: 'Ku soo dhowow Compliance QR! 👋 Waxaan ahay Kaaliyahaaga AI. Waxaan kaa caawin karaa su\'aalaha ku saabsan nidaamka QR-ka, qiimaha, sida loogu diiwaangeliyo xaruntaada, iyo adeegyadeena. Maxaan maanta kaa caawin karaa?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages([
          {
            sender: 'bot',
            text: 'Ku soo dhowow Kaaliyahaaga AI ee Xarunta! 🚀 Waxaan kaa caawin karaa falanqaynta cabashooyinka, qorista fariimo xallin ah oo xushmad leh oo loo diro macaamiisha, iyo adeegsiga Dashboard-ka.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [mode, isPublic]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const publicQuickPrompts = [
    'Sidee u shaqeeyaa Compliance QR?',
    'Immisa waaye qiimaha subscription-ka?',
    'Xarumaha noocee ah ayaa isticmaali kara?',
    'Ma qarsoodi baa cabashada (Anonymous)?',
  ];

  const orgQuickPrompts = [
    'Iga caawi qorista jawaab cabasho xushmad leh',
    'Sideen u soo dejiyaa QR Poster-ka xarunta?',
    'Sideen u cusboonaysiiyaa subscription-ka?',
    'Talooyin ku saabsan qancinta macaamiisha',
  ];

  const quickPrompts = isPublic ? publicQuickPrompts : orgQuickPrompts;

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const endpoint = isPublic ? '/public/chatbot' : '/organization/chatbot';
      const res = await api.post(endpoint, {
        message: text,
        history: newHistory,
      });

      if (res.data.success) {
        const botReply = {
          sender: 'bot',
          text: res.data.data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
      }
    } catch (err) {
      const errorReply = {
        sender: 'bot',
        text: 'Waan ka xumahay, khadadka ayaa mashquul ah. Fadlan isku day markale wax yar ka dib.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: isPublic
          ? 'Wadahadalka waa la nadiifiyay. Maxaan maanta kaa caawin karaa?'
          : 'Wadahadalka xarunta waa la nadiifiyay. Maxaan kaa caawin karaa?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl text-white font-bold text-xs transition-all duration-300 transform hover:scale-105 active:scale-95 group ${
            isPublic
              ? 'bg-gradient-to-r from-[#2C3925] to-[#1e2719] border-2 border-emerald-500/30'
              : 'bg-gradient-to-r from-[#0086FF] to-[#0065c2] border-2 border-blue-400/30'
          }`}
          title="Open AI Chat Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
            </div>
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#2C3925] rounded-full animate-ping" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#2C3925] rounded-full" />
          </div>

          <div className="text-left pr-1">
            <p className="text-[11px] font-extrabold leading-tight">
              {isPublic ? 'Compliance AI' : 'AI Copilot'}
            </p>
            <p className="text-[9px] text-white/80 font-medium">Kaaliyaha Online</p>
          </div>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div
            className={`p-4 text-white flex items-center justify-between ${
              isPublic
                ? 'bg-gradient-to-r from-[#2C3925] to-[#1c2417]'
                : 'bg-gradient-to-r from-[#0086FF] to-[#005bb0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                {isPublic ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5 leading-tight">
                  {isPublic ? 'Compliance QR AI' : 'Operations AI Copilot'}
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[9px] font-semibold text-emerald-200">
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-white/80 mt-0.5">
                  {isPublic ? 'Kaaliyaha Macmiilka & Xogta Guud' : 'Kaaliyaha Xallinta Cabashooyinka'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs ${
                      isPublic ? 'bg-[#2C3925]' : 'bg-[#0086FF]'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#2C3925] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/80 text-[#2F2E2D] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-white/60' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs ${
                    isPublic ? 'bg-[#2C3925]' : 'bg-[#0086FF]'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3 rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0086FF] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#0086FF] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0086FF] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel/Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors border border-slate-200/60 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Qor su'aashaada ama fariintaada..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className={`p-2.5 rounded-2xl text-white shadow-sm transition-all disabled:opacity-40 disabled:scale-100 active:scale-95 ${
                isPublic ? 'bg-[#2C3925] hover:bg-[#20291b]' : 'bg-[#0086FF] hover:bg-[#006ed6]'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
