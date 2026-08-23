import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';

function App() {
  const { theme, setTheme } = useTheme();
  const {
    conversations,
    allConversationsCount,
    activeConvId,
    activeConversation,
    messages,
    loadingStatus,
    searchFilter,
    setSearchFilter,
    startNewChat,
    selectConversation,
    deleteConversation,
    clearCurrentChat,
    clearAllChats,
    sendMessage
  } = useChat();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-[#0A0F1D] text-gray-900 dark:text-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isDesktopSidebarCollapsed}
        onToggleCollapse={() => setIsDesktopSidebarCollapsed(prev => !prev)}
        conversations={conversations}
        activeConvId={activeConvId}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        onStartNewChat={startNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Chat Window */}
      <ChatWindow
        messages={messages}
        activeConversation={activeConversation}
        loadingStatus={loadingStatus}
        onSendMessage={sendMessage}
        onStartNewChat={startNewChat}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        onClearCurrentChat={clearCurrentChat}
        onClearAllChats={clearAllChats}
        activeConvId={activeConvId}
        allConversationsCount={allConversationsCount}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

export default App;
