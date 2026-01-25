import React from 'react';

const Loader = () => (
  <div className="flex flex-col items-center gap-6 z-20">
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Pulse Orb - Cyan/Blue */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 blur-xl opacity-50 animate-orb-pulse"></div>

      {/* Liquid Spinner - Cyan/Emerald */}
      <div className="relative w-24 h-24 bg-gradient-to-tr from-cyan-400 via-blue-400 to-emerald-400 animate-liquid-spin shadow-[0_0_50px_rgba(6,182,212,0.3)]"></div>

      {/* Inner Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-black rounded-full border border-white/10 backdrop-blur-3xl flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse"></div>
        </div>
      </div>
    </div>
    <div className='flex flex-col items-center gap-1'>
      <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Synthesizing</p>
      <span className="text-zinc-500 text-xs font-mono">Neural Network Active</span>
    </div>
  </div>
);

export default Loader;
