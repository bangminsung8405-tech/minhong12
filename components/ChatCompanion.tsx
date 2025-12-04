import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { SendHorizontal, Bot, User } from 'lucide-react';
import { generateSupportiveMessage } from '../services/geminiService';

const ChatCompanion: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: '안녕하세요. 오늘 하루는 어떠셨나요? 힘들거나 답답한 일이 있다면 언제든 말씀해주세요. 천천히 들어드릴게요.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await generateSupportiveMessage(history, userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-sage-50 p-4 border-b border-sage-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-200 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-sage-600" />
            </div>
            <div>
                <h3 className="font-bold text-sage-800">한걸음 코치</h3>
                <p className="text-xs text-sage-500">언제나 당신 편이에요</p>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                        className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-sage-600 text-white rounded-br-none shadow-md' 
                                : 'bg-slate-100 text-slate-700 rounded-bl-none'
                        }`}
                    >
                        {msg.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-sage-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2 border border-slate-200 focus-within:border-sage-400 focus-within:ring-2 focus-within:ring-sage-100 transition-all">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="마음 속 이야기를 털어놓으세요..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 text-slate-700 placeholder:text-slate-400"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-2 bg-sage-600 rounded-full text-white disabled:opacity-50 hover:bg-sage-700 transition-colors"
                >
                    <SendHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default ChatCompanion;