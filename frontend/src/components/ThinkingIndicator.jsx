import React from 'react';
import KiwiAvatar from './KiwiAvatar';
import { Globe, Link2, Sparkles } from 'lucide-react';

export const ThinkingIndicator = ({ status = 'thinking' }) => {
  let label = 'Kiwi is thinking...';
  let Icon = Sparkles;
  let iconColor = 'text-emerald-500';

  if (status === 'searching') {
    label = '🌐 Kiwi is searching the web...';
    Icon = Globe;
    iconColor = 'text-sky-500';
  } else if (status === 'reading') {
    label = '🔗 Kiwi is reading the website...';
    Icon = Link2;
    iconColor = 'text-teal-500';
  }

  return (
    <div className="flex items-start gap-3.5 max-w-3xl animate-fadeIn py-2">
      <KiwiAvatar size="sm" status={status} />
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#151D2D] border border-gray-200/80 dark:border-gray-800 shadow-sm">
        <Icon className={`w-4 h-4 ${iconColor} animate-spin`} style={{ animationDuration: '3s' }} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
