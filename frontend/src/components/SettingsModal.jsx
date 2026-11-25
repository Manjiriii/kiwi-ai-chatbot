import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, Laptop, Trash2, ShieldCheck, Check, Server } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export const SettingsModal = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  onClearCurrentChat,
  onClearAllChats,
  activeConvId,
  allConversationsCount
}) => {
  const [backendInfo, setBackendInfo] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [clearedNotice, setClearedNotice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoadingHealth(true);
      checkBackendHealth()
        .then(info => setBackendInfo(info))
        .finally(() => setLoadingHealth(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearCurrent = () => {
    if (window.confirm('Clear all messages in this conversation?')) {
      onClearCurrentChat();
      setClearedNotice('Current conversation cleared.');
      setTimeout(() => setClearedNotice(''), 2500);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL conversations? This cannot be undone.')) {
      onClearAllChats();
      setClearedNotice('All conversation history cleared.');
      setTimeout(() => setClearedNotice(''), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#151D2D] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {clearedNotice && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 border border-emerald-500/20">
            <Check className="w-4 h-4" />
            <span>{clearedNotice}</span>
          </div>
        )}

        <div className="mt-5 space-y-6">
          {/* Appearance */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    theme === id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Management */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
              Conversations
            </label>
            <div className="space-y-2">
              <button
                onClick={handleClearCurrent}
                disabled={!activeConvId}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Clear current conversation</span>
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={handleClearAll}
                disabled={allConversationsCount === 0}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-red-200/60 dark:border-red-900/40 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Clear all conversations ({allConversationsCount})</span>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Backend Info */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 text-xs">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2">
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              <span>Backend & AI Status</span>
            </div>
            {loadingHealth ? (
              <p className="text-gray-500">Checking status...</p>
            ) : backendInfo ? (
              <div className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                <p>Status: <span className="text-emerald-500 font-semibold">{backendInfo.status}</span></p>
                <p>Model: <span className="font-mono text-gray-800 dark:text-gray-200">{backendInfo.configured_model || backendInfo.model || 'openrouter/free'}</span></p>
                <p>AI Provider: <span className={backendInfo.openrouter_configured ? "text-emerald-500 font-semibold" : backendInfo.hf_token_configured ? "text-blue-500 font-semibold" : "text-amber-500 font-semibold"}>
                  {backendInfo.openrouter_configured ? "OpenRouter (openrouter/free) ✓" : backendInfo.hf_token_configured ? "Hugging Face (Fallback) ✓" : "Set OPENROUTER_API_KEY in Vercel"}
                </span></p>
                {backendInfo.last_successful_provider && (
                  <p>Last Active AI: <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                    {backendInfo.last_successful_provider} ({backendInfo.last_successful_model || 'active'})
                  </span></p>
                )}
              </div>
            ) : (
              <p className="text-red-400">Backend disconnected.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
