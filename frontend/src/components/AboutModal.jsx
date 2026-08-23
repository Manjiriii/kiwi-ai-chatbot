import React from 'react';
import { X, Globe, Link2, Sparkles, Feather } from 'lucide-react';
import KiwiParrot from '../assets/KiwiParrot';

export const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#151D2D] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden p-6 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot */}
        <div className="flex justify-center mb-3 mt-2">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/20">
            <KiwiParrot size="lg" animated={true} />
          </div>
        </div>

        {/* Title & Tagline */}
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          KIWI 🦜
        </h2>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">
          Intelligent AI Parrot Mascot
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium italic mt-2">
          "Your curious AI companion for answers, research and the web."
        </p>

        {/* Important Mascot Badge */}
        <div className="mt-4 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2">
          <Feather className="w-4 h-4 text-amber-500" />
          <span>Kiwi is a Friendly Parrot Mascot (Not a fruit!)</span>
        </div>

        {/* Capabilities */}
        <div className="mt-4 space-y-2 text-left text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40">
            <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>LLaMA 3 70B Instruct intelligence via Hugging Face</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40">
            <Globe className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span>Live web search powered by DuckDuckGo</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40">
            <Link2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
            <span>Live webpage content extractor and reader</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
          >
            Got it, Kiwi!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
