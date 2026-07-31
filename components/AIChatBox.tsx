'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function AIChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Chào bạn! Mình là Trợ lý AI Du lịch Hà Tĩnh. Bạn cần tư vấn về địa điểm, ăn uống hay thời tiết cho chuyến đi của mình?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: data.data
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: 'Xin lỗi, hiện tại mình không thể trả lời. ' + (data.message || '')
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Đã có lỗi xảy ra khi kết nối máy chủ.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-orange-600 text-white p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-sm">Trợ lý Du lịch AI</h3>
                <p className="text-xs text-orange-200">Trực tuyến</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-orange-100 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-orange-600" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[75%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-orange-600 text-white rounded-tr-sm' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-orange-600" />
                </div>
                <div className="bg-white text-slate-700 shadow-sm border border-slate-100 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                  Đang suy nghĩ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về địa điểm, ăn uống, thời tiết..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 w-8 h-8 flex items-center justify-center bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-orange-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-orange-700 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500/30 group"
        >
          <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
}
