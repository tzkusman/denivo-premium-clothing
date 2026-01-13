
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { Message, Product } from '../types';
import { getFashionAdvice } from '../services/gemini';

interface AIAssistantProps {
  products: Product[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Denivo Personal Stylist. Looking for something special today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const advice = await getFashionAdvice(userMsg, products);
    
    setMessages(prev => [...prev, { role: 'assistant', content: advice }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70]">
      {isOpen ? (
        <div className="w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-zinc-100 overflow-hidden transform animate-in slide-in-from-bottom-4">
          <div className="bg-zinc-900 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white">
              <Sparkles size={18} className="text-yellow-400" />
              <span className="font-semibold text-sm">Denivo Stylist AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                  ? 'bg-zinc-900 text-white rounded-br-none' 
                  : 'bg-zinc-100 text-zinc-800 rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 p-3 rounded-2xl rounded-bl-none">
                  <Loader2 className="animate-spin text-zinc-400" size={18} />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask for style advice..."
                className="w-full pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-zinc-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center space-x-2 group"
        >
          <Sparkles size={24} className="group-hover:text-yellow-400 transition-colors" />
          <span className="font-semibold pr-2">Ask Stylist</span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
