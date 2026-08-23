import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const PromptCard = ({ title, prompt, icon: Icon, tag, onClick }) => {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="group relative flex flex-col items-start p-4 rounded-2xl bg-white/80 dark:bg-[#151D2D] hover:bg-emerald-50/50 dark:hover:bg-[#1A2438] border border-gray-200/80 dark:border-gray-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full"
    >
      <div className="flex items-center justify-between w-full mb-2.5">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {tag || title}
          </span>
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
      </div>

      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
        "{prompt}"
      </p>
    </button>
  );
};

export default PromptCard;
