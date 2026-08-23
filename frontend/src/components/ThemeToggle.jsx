import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export const ThemeToggle = ({ theme, setTheme, variant = 'inline' }) => {
  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  if (variant === 'button-group') {
    return (
      <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-800 rounded-xl">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              theme === value
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Icon toggle button for header
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={`Switch to ${nextTheme} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-5 h-5 text-emerald-600 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};

export default ThemeToggle;
