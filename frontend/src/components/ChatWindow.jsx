import React, { useRef, useEffect } from 'react';
import { Menu, Plus, Sparkles } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import ChatInput from './ChatInput';
import ThemeToggle from './ThemeToggle';
import KiwiAvatar from './KiwiAvatar';

export const ChatWindow = ({
  messages = [],
  activeConversation,
  loadingStatus = 'idle',
  onSendMessage,
  onStartNewChat,
  onOpenMobileSidebar,
  theme,
  setTheme
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingStatus]);

  const hasMessages = messages.length > 0;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/70 dark:bg-[#0A0F1D] relative">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-[#0E1526]/70 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Conversation Title / Active State */}
          <div className="flex items-center gap-2">
            <KiwiAvatar size="xs" />
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                {activeConversation?.title || 'Kiwi AI Parrot 🦜'}
              </h2>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Meta LLaMA 3 70B • Live Web Search • URL Reader</span>
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartNewChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      {/* Main Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        {!hasMessages ? (
          <WelcomeScreen onSelectPrompt={onSendMessage} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {loadingStatus !== 'idle' && (
              <ThinkingIndicator status={loadingStatus} />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Message Composer */}
      <footer className="flex-shrink-0 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent dark:from-[#0A0F1D] dark:via-[#0A0F1D]/90 dark:to-transparent pt-2">
        <ChatInput onSendMessage={onSendMessage} loadingStatus={loadingStatus} />
      </footer>
    </main>
  );
};

export default ChatWindow;
