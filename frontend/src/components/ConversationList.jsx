import React from 'react';
import { MessageSquare, Trash2, Search } from 'lucide-react';

export const ConversationList = ({
  conversations = [],
  activeConvId,
  searchFilter,
  setSearchFilter,
  onSelectConversation,
  onDeleteConversation,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search Conversations Input */}
      <div className="px-3 py-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 border border-transparent focus:border-emerald-500/50 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
          />
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            {searchFilter ? 'No matching conversations.' : 'No conversations yet.'}
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-medium ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                  }`} />
                  <span className="truncate">{conv.title || 'Untitled Chat'}</span>
                </div>

                <button
                  onClick={(e) => onDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                  title="Delete conversation"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
