import React from 'react';
import { Plus, Settings, Info, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import KiwiLogo from './KiwiLogo';
import ConversationList from './ConversationList';

export const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  conversations,
  activeConvId,
  searchFilter,
  setSearchFilter,
  onStartNewChat,
  onSelectConversation,
  onDeleteConversation,
  onOpenSettings,
  onOpenAbout
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-[#0E1526] border-r border-gray-200/90 dark:border-gray-800 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-20' : 'w-72 lg:w-72'
        }`}
      >
        {/* Top Branding & Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800/80">
          {!isCollapsed ? (
            <KiwiLogo size="sm" showTagline={false} onClick={onStartNewChat} />
          ) : (
            <div className="mx-auto cursor-pointer" onClick={onToggleCollapse} title="Expand sidebar">
              <KiwiLogo size="sm" showTagline={false} />
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onStartNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all ${
              isCollapsed ? 'px-0' : ''
            }`}
            title="Start New Chat"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Conversation List */}
        {!isCollapsed ? (
          <ConversationList
            conversations={conversations}
            activeConvId={activeConvId}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            onSelectConversation={(id) => {
              onSelectConversation(id);
              if (window.innerWidth < 1024) onClose();
            }}
            onDeleteConversation={onDeleteConversation}
          />
        ) : (
          <div className="flex-1" />
        )}

        {/* Bottom Actions (Settings & About) */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/80 space-y-1">
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button
            onClick={onOpenAbout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="About Kiwi"
          >
            <Info className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>About Kiwi 🦜</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
