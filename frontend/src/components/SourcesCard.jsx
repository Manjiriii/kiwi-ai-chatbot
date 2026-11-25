import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronDown, ChevronUp, Link2, CheckCircle2 } from 'lucide-react';

export const SourcesCard = ({ sourceType, sources = [], searchQuery, websiteUrl }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!sources || sources.length === 0) {
    if (sourceType === 'web_search') {
      return (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-500/20">
          <Globe className="w-3.5 h-3.5" />
          <span>Web search used</span>
        </div>
      );
    }
    return null;
  }

  // Single website source card (Website Reader mode)
  if (sourceType === 'website') {
    const primarySource = sources[0] || {};
    const domain = primarySource.domain || (websiteUrl ? new URL(websiteUrl).hostname : 'Website');
    const url = primarySource.url || websiteUrl;

    return (
      <div className="mt-3.5 p-3.5 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 max-w-lg">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            <Link2 className="w-4 h-4" />
            <span>Website Read by Kiwi</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-teal-700 dark:text-teal-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Extracted
          </span>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-2 rounded-xl bg-white dark:bg-gray-800/80 border border-teal-500/20 hover:border-teal-500/50 transition-all shadow-sm"
        >
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
              {primarySource.title || domain}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {domain}
            </p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-teal-500 flex-shrink-0" />
        </a>
      </div>
    );
  }

  // Web search sources accordion
  return (
    <div className="mt-3.5 rounded-2xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 overflow-hidden max-w-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-500" />
          <span>Web search used</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300">
            {sources.length} sources
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3 pt-1 space-y-2 border-t border-sky-500/10">
          {sources.map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-sky-500/20 hover:border-sky-500/50 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                  {src.title}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 flex-shrink-0" />
              </div>
              {(src.source || src.date) && (
                <div className="flex items-center gap-1.5 text-[10px] text-sky-600 dark:text-sky-400 font-medium mb-1">
                  {src.source && <span className="bg-sky-500/10 px-1.5 py-0.5 rounded">{src.source}</span>}
                  {src.source && src.date && <span className="text-gray-400">•</span>}
                  {src.date && <span className="text-gray-400 dark:text-gray-400">{src.date}</span>}
                </div>
              )}
              {src.snippet && (
                <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {src.snippet}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcesCard;
