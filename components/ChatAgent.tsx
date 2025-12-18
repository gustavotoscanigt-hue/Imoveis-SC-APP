
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Calendar, Phone, FileText } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToAgent } from '../services/geminiService';

export const ChatAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá! Sou o seu concierge digital ImobAR. Como posso otimizar sua busca por um novo imóvel hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessageToAgent(history, userMsg.text);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 p-5 rounded-[24px] shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 flex items-center gap-3 ${
          isOpen ? 'bg-slate-900 rotate-0' : 'bg-blue-600'
        }`}
      >
        {isOpen ? <X color="white" size={24} /> : (
          <>
            <MessageCircle color="white" size={24} />
            <span className="text-white font-black text-sm pr-2 hidden md:inline">Precisa de Ajuda?</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-8 z-40 w-[90vw] md:w-[420px] h-[600px] bg-white rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-slate-100 animate-fade-in-up">
          <div className="bg-slate-950 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-black leading-none mb-1">Concierge Digital</h3>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Inteligência Artificial Ativa</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-[24px] p-4 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-[24px] shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-slate-100 space-y-4">
            {/* Quick Actions */}
            {!isLoading && messages.length < 5 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <QuickAction icon={<Calendar size={14}/>} label="Agendar" onClick={() => handleSend("Gostaria de agendar uma visita.")} />
                <QuickAction icon={<FileText size={14}/>} label="Financiamento" onClick={() => handleSend("Como funciona o financiamento?")} />
                <QuickAction icon={<Phone size={14}/>} label="Corretor" onClick={() => handleSend("Quero falar com um corretor humano.")} />
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte sobre plantas, obra ou valores..."
                className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 whitespace-nowrap transition-all">
      {icon} {label}
    </button>
  );
}
