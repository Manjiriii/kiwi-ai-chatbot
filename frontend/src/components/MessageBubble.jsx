import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import KiwiAvatar from './KiwiAvatar';
import SourcesCard from './SourcesCard';
import { Copy, Check, User } from 'lucide-react';

export const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom Code Block component with Copy button
  const CodeBlock = ({ inline, className, children, ...props }) => {
    const [codeCopied, setCodeCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    if (!inline && match) {
      const handleCodeCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      };

      return (
        <div className="relative my-3 rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-700 bg-gray-900 text-gray-100 font-mono text-xs">
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-gray-800/90 border-b border-gray-700 text-gray-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-emerald-400">
              {match[1]}
            </span>
            <button
              onClick={handleCodeCopy}
              className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
            >
              {codeCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3.5 overflow-x-auto">
            <pre className="!m-0 !p-0">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        </div>
      );
    }

    return (
      <code className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs" {...props}>
        {children}
      </code>
    );
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-3xl ml-auto animate-fadeIn group">
        <div className="flex flex-col items-end">
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm max-w-xl break-words">
            <p className="text-sm sm:text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-xs shadow-sm">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Kiwi Assistant Message
  return (
    <div className="flex items-start gap-3.5 max-w-3xl animate-fadeIn group">
      <KiwiAvatar size="sm" />
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-xs text-gray-900 dark:text-white tracking-wide">
            Kiwi 🦜
          </span>
          <span className="text-[11px] text-gray-400">
            {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="relative px-5 py-4 rounded-2xl rounded-tl-sm bg-white dark:bg-[#151D2D] border border-gray-200/80 dark:border-gray-800/90 text-gray-800 dark:text-gray-200 shadow-sm leading-relaxed text-sm sm:text-[15px]">
          <div className="prose-kiwi">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeBlock,
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline font-medium" />
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Sources / Web / URL metadata */}
          <SourcesCard
            sourceType={message.source_type}
            sources={message.sources}
            searchQuery={message.search_query}
            websiteUrl={message.website_url}
          />

          {/* Message Actions */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 text-gray-400">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-medium hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
