import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../services/api';

const STORAGE_KEY = 'kiwi_conversations_v1';
const ACTIVE_CONV_KEY = 'kiwi_active_conversation_id';

const SEARCH_KEYWORDS = [
  "latest", "today", "now", "current", "news", "recent", "update", "updates",
  "price of", "stock price", "who won", "score", "weather", "release date",
  "search for", "look up", "browse", "2024", "2025", "2026"
];

function generateId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

function detectPromptType(text) {
  if (/https?:\/\/[^\s]+/.test(text)) {
    return 'reading';
  }
  const lower = text.toLowerCase();
  if (SEARCH_KEYWORDS.some(k => lower.includes(k)) || lower.startsWith('search:') || lower.startsWith('search ')) {
    return 'searching';
  }
  return 'thinking';
}

export function useChat() {
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading conversations from localStorage:', e);
      return [];
    }
  });

  const [activeConvId, setActiveConvId] = useState(() => {
    return localStorage.getItem(ACTIVE_CONV_KEY) || null;
  });

  const [loadingStatus, setLoadingStatus] = useState('idle'); // 'idle' | 'thinking' | 'searching' | 'reading'
  const [searchFilter, setSearchFilter] = useState('');

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Error saving conversations to localStorage:', e);
    }
  }, [conversations]);

  // Persist active conversation ID
  useEffect(() => {
    if (activeConvId) {
      localStorage.setItem(ACTIVE_CONV_KEY, activeConvId);
    } else {
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }
  }, [activeConvId]);

  // Current active conversation object
  const activeConversation = conversations.find(c => c.id === activeConvId) || null;
  const messages = activeConversation ? activeConversation.messages : [];

  // Start new conversation
  const startNewChat = useCallback(() => {
    const newId = generateId();
    const newConv = {
      id: newId,
      title: 'New conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newId);
    return newId;
  }, []);

  // Switch conversation
  const selectConversation = useCallback((id) => {
    setActiveConvId(id);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((id, e) => {
    if (e) e.stopPropagation();
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (activeConvId === id) {
        const nextActive = updated.length > 0 ? updated[0].id : null;
        setActiveConvId(nextActive);
      }
      return updated;
    });
  }, [activeConvId]);

  // Clear current chat
  const clearCurrentChat = useCallback(() => {
    if (!activeConvId) return;
    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return { ...c, messages: [], updatedAt: Date.now() };
      }
      return c;
    }));
  }, [activeConvId]);

  // Clear all chats
  const clearAllChats = useCallback(() => {
    setConversations([]);
    setActiveConvId(null);
  }, []);

  // Send message
  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim() || loadingStatus !== 'idle') return;

    const trimmedText = text.trim();
    let currentConvId = activeConvId;
    let isBrandNew = false;

    // If no active conversation, create one
    if (!currentConvId) {
      currentConvId = generateId();
      isBrandNew = true;
    }

    // Determine initial intent status
    const expectedType = detectPromptType(trimmedText);
    setLoadingStatus(expectedType);

    const userMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: trimmedText,
      timestamp: Date.now(),
    };

    // Auto title generation
    const autoTitle = trimmedText.length > 32 
      ? trimmedText.substring(0, 32).trim() + '...' 
      : trimmedText;

    // Optimistically update conversation state
    setConversations(prev => {
      const existing = prev.find(c => c.id === currentConvId);
      if (existing) {
        return prev.map(c => {
          if (c.id === currentConvId) {
            const hasExistingMessages = c.messages.length > 0;
            return {
              ...c,
              title: hasExistingMessages ? c.title : autoTitle,
              updatedAt: Date.now(),
              messages: [...c.messages, userMessage]
            };
          }
          return c;
        });
      } else {
        return [{
          id: currentConvId,
          title: autoTitle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [userMessage]
        }, ...prev];
      }
    });

    if (isBrandNew) {
      setActiveConvId(currentConvId);
    }

    try {
      // Build history for backend
      const currentHistory = activeConversation ? activeConversation.messages : [];
      const data = await sendChatMessage(trimmedText, currentConvId, currentHistory);

      const assistantMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: data.response,
        source_type: data.source_type || 'normal',
        sources: data.sources || [],
        search_query: data.search_query,
        website_url: data.website_url,
        timestamp: Date.now()
      };

      setConversations(prev => prev.map(c => {
        if (c.id === currentConvId) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...c.messages, assistantMessage]
          };
        }
        return c;
      }));

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: `🦜 **Squawk!** Kiwi couldn't complete your request right now.\n\n*${err.message || 'Please check your backend connection and try again.'}*`,
        source_type: 'error',
        sources: [],
        timestamp: Date.now()
      };

      setConversations(prev => prev.map(c => {
        if (c.id === currentConvId) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...c.messages, errorMessage]
          };
        }
        return c;
      }));
    } finally {
      setLoadingStatus('idle');
    }
  }, [activeConvId, activeConversation, loadingStatus]);

  // Filtered conversation list
  const filteredConversations = conversations.filter(c => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return c.title.toLowerCase().includes(q) || 
      c.messages.some(m => m.content.toLowerCase().includes(q));
  });

  return {
    conversations: filteredConversations,
    allConversationsCount: conversations.length,
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
  };
}
