import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, X, Globe, Link2 } from 'lucide-react';

export const ChatInput = ({ onSendMessage, loadingStatus = 'idle' }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const isLoading = loadingStatus !== 'idle';

  // Auto resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
      <form onSubmit={handleSubmit} className="relative flex flex-col rounded-3xl bg-white dark:bg-[#151D2D] border border-gray-200/90 dark:border-gray-800 shadow-lg focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        
        {/* Helper quick tags */}
        <div className="flex items-center gap-1.5 px-4 pt-2.5 text-[11px] font-medium text-gray-400">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3 h-3" /> Smart Parrot AI
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 hover:text-sky-500 transition-colors">
            <Globe className="w-3 h-3" /> Live Search
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 hover:text-teal-500 transition-colors">
            <Link2 className="w-3 h-3" /> URL Reader
          </span>
        </div>

        {/* Text Area */}
        <div className="flex items-end gap-2 px-4 py-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask Kiwi anything... (or paste a URL / ask for live news)"
            className="flex-1 max-h-44 resize-none bg-transparent border-0 focus:ring-0 p-0 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed outline-none disabled:opacity-50"
          />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pb-0.5">
            {input.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-2xl flex items-center justify-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-100'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>

      {/* Micro footer hint */}
      <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-gray-400 dark:text-gray-500 select-none">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
        <span className="hidden sm:inline">Kiwi 🦜 Powered by LLaMA 3</span>
      </div>
    </div>
  );
};

export default ChatInput;
