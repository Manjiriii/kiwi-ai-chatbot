import React from 'react';

/**
 * KiwiParrot Mascot Component
 * A high-fidelity, intelligent, and friendly AI Parrot Mascot.
 * 
 * Note: Kiwi is strictly an AI Parrot character (NOT a fruit).
 */
export const KiwiParrot = ({ 
  size = 'md', 
  animated = false, 
  status = 'idle', // 'idle' | 'thinking' | 'searching' | 'reading'
  className = '' 
}) => {
  // Dimension mapping
  const sizeMap = {
    xs: { w: 24, h: 24 },
    sm: { w: 32, h: 32 },
    md: { w: 44, h: 44 },
    lg: { w: 64, h: 64 },
    xl: { w: 96, h: 96 },
    hero: { w: 140, h: 140 }
  };

  const { w, h } = sizeMap[size] || sizeMap.md;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className} ${
        animated ? 'transition-transform duration-300 hover:scale-105' : ''
      }`}
      style={{ width: w, height: h }}
      aria-label="Kiwi the AI Parrot Mascot"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-md ${
          status === 'thinking' ? 'animate-subtle-pulse' : ''
        }`}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bodyGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />   {/* Emerald */}
            <stop offset="50%" stopColor="#0EA5E9" />  {/* Cyan/Teal */}
            <stop offset="100%" stopColor="#0284C7" /> {/* Deep Blue */}
          </linearGradient>

          <linearGradient id="wingGrad" x1="30" y1="45" x2="85" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="40%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>

          <linearGradient id="beakGrad" x1="75" y1="42" x2="105" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />   {/* Warm Amber */}
            <stop offset="100%" stopColor="#F59E0B" /> {/* Deep Yellow */}
          </linearGradient>

          <linearGradient id="crestGrad" x1="40" y1="10" x2="70" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>

          <linearGradient id="chestGlow" x1="45" y1="45" x2="75" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Tech Orbit / Perch Ring */}
        <circle 
          cx="60" 
          cy="60" 
          r="54" 
          stroke="url(#bodyGrad)" 
          strokeWidth="2" 
          strokeDasharray="4 6" 
          opacity="0.35" 
          className={status === 'searching' || status === 'reading' ? 'animate-spin' : ''}
          style={{ transformOrigin: '60px 60px', animationDuration: '8s' }}
        />

        {/* Parrot Long Tail Feathers */}
        <path
          d="M38 78 C32 94 22 108 26 114 C30 112 42 98 46 84 Z"
          fill="#0284C7"
          opacity="0.9"
        />
        <path
          d="M44 80 C40 98 34 112 38 116 C42 114 50 96 52 82 Z"
          fill="#0EA5E9"
          opacity="0.95"
        />

        {/* Parrot Body */}
        <ellipse
          cx="58"
          cy="64"
          rx="26"
          ry="30"
          fill="url(#bodyGrad)"
        />

        {/* Parrot Chest Soft Highlight */}
        <path
          d="M58 48 C68 48 76 56 76 68 C76 78 68 86 58 86 C52 86 48 78 48 68 C48 56 52 48 58 48 Z"
          fill="url(#chestGlow)"
        />

        {/* Parrot Head */}
        <circle
          cx="66"
          cy="42"
          r="20"
          fill="#10B981"
        />

        {/* Parrot Crest Feathers (Intelligent Crown) */}
        <path
          d="M62 24 C60 12 50 8 46 12 C52 16 56 22 58 26 Z"
          fill="url(#crestGrad)"
        />
        <path
          d="M68 23 C72 10 65 6 58 10 C62 14 65 20 66 25 Z"
          fill="#F59E0B"
        />

        {/* White Cheek Patch */}
        <ellipse
          cx="64"
          cy="44"
          rx="8"
          ry="7"
          fill="#FFFFFF"
          opacity="0.9"
        />

        {/* Intelligent Eye (with subtle blink) */}
        <g className="animate-blink" style={{ transformOrigin: '63px 42px' }}>
          <circle cx="63" cy="42" r="4.5" fill="#0A0F1D" />
          {/* Eye reflection / spark */}
          <circle cx="64.5" cy="40.5" r="1.5" fill="#FFFFFF" />
          <circle cx="61.8" cy="43.2" r="0.7" fill="#6EE7B7" />
        </g>

        {/* Curved Parrot Beak (Upper & Lower) */}
        {/* Upper hooked beak */}
        <path
          d="M74 37 C82 39 93 45 92 56 C88 56 80 50 74 47 Z"
          fill="url(#beakGrad)"
          stroke="#D97706"
          strokeWidth="0.75"
        />
        {/* Lower small beak */}
        <path
          d="M75 48 C79 50 83 54 84 56 C80 57 76 53 74 50 Z"
          fill="#D97706"
        />

        {/* Parrot Wing */}
        <g className={status === 'reading' || status === 'searching' ? 'animate-wing-flap' : ''} style={{ transformOrigin: '48px 54px' }}>
          <path
            d="M48 50 C58 50 68 58 64 74 C60 84 46 88 38 78 C34 72 38 56 48 50 Z"
            fill="url(#wingGrad)"
          />
          {/* Wing Feather Detail Lines */}
          <path
            d="M46 58 C52 64 56 74 54 80"
            stroke="#A7F3D0"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M40 64 C45 70 48 76 46 81"
            stroke="#A7F3D0"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>

        {/* Parrot Feet / Perch Claws */}
        <ellipse cx="54" cy="93" rx="4" ry="2" fill="#F59E0B" />
        <ellipse cx="64" cy="93" rx="4" ry="2" fill="#F59E0B" />

        {/* Tech Indicator Pulse on Beak or Orbit */}
        {status === 'thinking' && (
          <circle cx="92" cy="56" r="3" fill="#38BDF8" className="animate-ping" opacity="0.8" />
        )}
      </svg>
    </div>
  );
};

export default KiwiParrot;
