import React from 'react';
import KiwiParrot from '../assets/KiwiParrot';

export const KiwiLogo = ({ size = 'md', showTagline = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="relative">
        <KiwiParrot size={size === 'lg' ? 'md' : 'sm'} animated={true} />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            KIWI
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
            AI PARROT
          </span>
        </div>
        {showTagline && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px]">
            Your curious AI companion
          </p>
        )}
      </div>
    </div>
  );
};

export default KiwiLogo;
