
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isTyping }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50/50 rounded-xl border-2 border-orange-100"
    >
      {messages.map((msg, idx) => (
        <div 
          key={idx} 
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[85%] p-4 rounded-2xl text-lg ${
              msg.role === 'user' 
                ? 'bg-orange-500 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 shadow-sm border border-orange-100 rounded-tl-none'
            } animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className="whitespace-pre-wrap leading-relaxed">
              {msg.text}
            </div>
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 rounded-tl-none flex gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
