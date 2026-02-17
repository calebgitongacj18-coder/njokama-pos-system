import React, { useState } from 'react';

export default function LoginGate({ children }) {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (isPoweredOn) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center transition-all duration-700">
      <div 
        className="relative cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPoweredOn(true)}
      >
        {/* The Glow Effect */}
        <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${
          isHovered ? 'bg-blue-600/40 scale-150' : 'bg-transparent'
        }`} />

        {/* The Lamp/Power Button */}
        <div className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
          isHovered 
            ? 'border-blue-400 bg-blue-900/20 shadow-[0_0_50px_rgba(37,99,235,0.5)]' 
            : 'border-slate-800 bg-slate-900'
        }`}>
          <span className={`text-5xl transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'opacity-20'
          }`}>
            💡
          </span>
        </div>
      </div>

      <div className="mt-12 text-center flex flex-col items-center">
        {/* NEW: BRAND LOGO */}
        <img 
          src="/jokamalogo1.png"
          alt="Jokama Auto Service Logo" 
          className={`w-32 h-32 mb-6 object-contain transition-all duration-500 ${
            isHovered ? 'opacity-100 scale-105' : 'opacity-40 grayscale'
          }`}
        />

        <h1 className="text-white font-black text-2xl tracking-[0.3em] uppercase mb-2">
          Jokama Systems
        </h1>
        
        <p className={`text-xs font-bold tracking-widest transition-opacity duration-500 uppercase ${
          isHovered ? 'text-blue-400 opacity-100' : 'text-slate-600 opacity-50'
        }`}>
          {isHovered ? 'Click to Power On' : 'System Offline'}
        </p>
      </div>

      {/* Subtle bottom text */}
      <div className="absolute bottom-8 text-[10px] text-slate-800 font-mono">
        v2.0.26 // JOKAMA SECURE ACCESS
      </div>
    </div>
  );
}