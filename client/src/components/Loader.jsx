import React from 'react';

const Loader = () => (
  <div className="flex flex-col items-center gap-8 z-50">
    {/* Container */}
    <div className="relative w-40 h-40 flex items-center justify-center">

      {/* 1. Orbiting Satellite */}
      <div className="absolute inset-0 rounded-full animate-spin-slow border border-dashed border-cyan-500/20"></div>
      <div className="absolute inset-2 rounded-full animate-spin-reverse-slow border border-dotted border-purple-500/20"></div>

      {/* 2. Outer Glow Field */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-purple-500/30 blur-[40px] animate-pulse-slow"></div>

      {/* 3. Liquid Morph Core */}
      <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 via-white to-purple-400 animate-liquid-spin shadow-[0_0_60px_rgba(34,211,238,0.4)] opacity-90 mix-blend-screen"></div>

      {/* 4. Center Neural Spark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-black/80 rounded-full border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner">
          {/* Tiny blinking synapses */}
          <div className="relative w-full h-full">
            <div className="absolute top-4 left-6 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute bottom-4 right-5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping delay-300"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.9)] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Text Scanner */}
    <div className='flex flex-col items-center gap-2'>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200 font-bold uppercase tracking-[0.3em] text-xs animate-none drop-shadow-md">
          Dreaming
        </p>
        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
      </div>
      <span className="text-zinc-600 text-[10px] font-mono tracking-widest uppercase opacity-70">Synthesizing Pixels</span>
    </div>
  </div>
);

export default Loader;
