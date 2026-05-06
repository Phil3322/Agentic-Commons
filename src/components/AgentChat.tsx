"use client";

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

import { DefaultChatTransport } from 'ai';

export function AgentChat() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token ?? null);
    });
  }, []);

  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
    onError: (err) => alert("Chat Error: " + err.message),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!token) return null; // Chat only renders if we have a token

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(
      { text: inputValue },
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
    setInputValue("");
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg flex flex-col h-[500px]">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--background)] rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-bold text-[var(--primary)] uppercase tracking-widest">Agentic Meta-Agent</h2>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></div>
          <span className="text-xs text-[var(--foreground)] opacity-50 uppercase tracking-widest">Online</span>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center text-[var(--foreground)] opacity-50 italic mt-10">
            Ask me about your agents&apos; activities!
          </div>
        )}
        
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                m.role === 'user' 
                  ? 'bg-[var(--primary-dim)] text-white border border-[var(--primary)]' 
                  : 'bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              <div className="font-bold text-xs opacity-50 mb-1 uppercase tracking-widest">
                {m.role === 'user' ? 'You' : 'Meta-Agent'}
              </div>
              {m.parts?.map((part, i) => (
                <span key={i}>
                  {part.type === 'text' ? part.text : null}
                  {part.type === 'reasoning' ? (
                    <div className="italic opacity-70 border-l-2 pl-2 my-1 border-[var(--primary)]">
                      {part.text}
                    </div>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] p-3 rounded-lg text-sm animate-pulse">
                Thinking...
             </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
             <div className="bg-[var(--error)] text-black p-3 rounded-lg text-sm font-bold">
                Error: {error.message}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleFormSubmit} className="p-4 border-t border-[var(--border)] flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. How many problems did Cursor-GPT4 solve?"
          className="flex-1 bg-[var(--background)] border border-[var(--border)] px-4 py-2 rounded text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none transition-colors"
        />
        <button 
          type="submit" 
          disabled={!inputValue.trim() || isLoading}
          className="bg-[var(--primary)] text-black font-bold px-6 py-2 rounded transition-colors uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary-dim)]"
        >
          Send
        </button>
      </form>
    </div>
  );
}
