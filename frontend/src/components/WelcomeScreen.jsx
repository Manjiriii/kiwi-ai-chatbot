import React from 'react';
import KiwiParrot from '../assets/KiwiParrot';
import PromptCard from './PromptCard';
import { Sparkles, Globe, Link2, BookOpen } from 'lucide-react';

export const WelcomeScreen = ({ onSelectPrompt }) => {
  const cards = [
    {
      title: 'Ask Kiwi',
      tag: 'General Knowledge',
      prompt: 'Explain quantum computing in simple words.',
      icon: Sparkles,
    },
    {
      title: 'Explore with Kiwi',
      tag: 'Live Web Search',
      prompt: 'What are the latest developments in AI?',
      icon: Globe,
    },
    {
      title: 'Give Kiwi a website',
      tag: 'Website Reader',
      prompt: 'Summarize this webpage for me: https://news.ycombinator.com',
      icon: Link2,
    },
    {
      title: 'Learn with Kiwi',
      tag: 'Programming & Tutoring',
      prompt: 'Teach me Python from beginner to advanced.',
      icon: BookOpen,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full text-center animate-fadeIn">
      {/* Mascot Hero */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-sky-500/20 to-teal-500/20 blur-2xl rounded-full scale-125 pointer-events-none"></div>
        <div className="relative p-3 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-xl inline-block">
          <KiwiParrot size="hero" animated={true} />
        </div>
      </div>

      {/* Greetings */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
        Hey, I'm <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 bg-clip-text text-transparent">Kiwi</span> 🦜
      </h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8 font-medium">
        Your curious AI companion for answers, research and the web.
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs font-semibold text-gray-600 dark:text-gray-400">
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> Live Web Search
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" /> Webpage Reader
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> LLaMA 3 70B
        </span>
      </div>

      {/* Prompt Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl text-left">
        {cards.map((card, idx) => (
          <PromptCard
            key={idx}
            title={card.title}
            tag={card.tag}
            prompt={card.prompt}
            icon={card.icon}
            onClick={onSelectPrompt}
          />
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
