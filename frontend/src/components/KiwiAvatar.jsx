import React from 'react';
import KiwiParrot from '../assets/KiwiParrot';

export const KiwiAvatar = ({ size = 'sm', status = 'idle', className = '' }) => {
  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-teal-500/10 border border-emerald-500/20 shadow-sm ${className}`}>
      <KiwiParrot size={size} status={status} animated={status !== 'idle'} />
      {status !== 'idle' && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      )}
    </div>
  );
};

export default KiwiAvatar;
