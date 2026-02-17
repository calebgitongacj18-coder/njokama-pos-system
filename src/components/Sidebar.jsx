import React from 'react';

export default function Sidebar({ setView, currentView, onPowerOff }) {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Home' },
    { id: 'pos', icon: '🛒', label: 'Sales' },
    { id: 'inventory', icon: '📦', label: 'Stock' },
    { id: 'history', icon: '📜', label: 'History' }
  ];

  return (
    <nav className="w-24 h-screen bg-slate-950 flex flex-col items-center py-4 text-white shadow-2xl z-10 shrink-0 border-r border-slate-900 overflow-hidden">
      
      {/* BRANDING LOGO AREA - Fixed Height to prevent pushing bottom elements */}
      <div className="flex-none h-32 flex items-center justify-center w-full relative overflow-visible">
        <div 
          className="relative group cursor-pointer z-20" 
          onClick={() => setView('dashboard')}
        >
          {/* Intense Electrical Glow */}
          <div className="absolute inset-0 bg-blue-600/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
          
          <img 
            src="/jokamalogo1.png" 
            alt="Jokama" 
            className="w-[120px] max-w-none h-auto object-contain relative z-20 transition-all duration-500 group-hover:scale-110 group-hover:brightness-125 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(37,99,235,0.4)] transform -translate-x-[12px]"
          />
        </div>
      </div>

      {/* Navigation Buttons - Main Section */}
      <div className="flex-1 flex flex-col items-center gap-4 w-full px-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full group relative py-3 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
              currentView === item.id 
                ? 'bg-blue-600 shadow-xl shadow-blue-600/20 text-white' 
                : 'hover:bg-slate-900 text-slate-500 hover:text-white'
            }`}
          >
            <span className={`text-xl transition-transform duration-300 ${
               currentView === item.id ? 'scale-110' : 'group-hover:scale-110'
            }`}>
              {item.icon}
            </span>
            
            <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${
              currentView === item.id ? 'text-white' : 'text-slate-600 group-hover:text-slate-300'
            }`}>
              {item.label}
            </span>

            {currentView === item.id && (
              <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full" />
            )}
          </button>
        ))}
      </div>

      {/* Bottom Section: Setup & Power - Pinned to bottom */}
      <div className="flex-none flex flex-col items-center pb-4 w-full px-2 gap-2">
         <button className="group flex flex-col items-center p-2 text-slate-600 hover:text-blue-400 transition-colors">
            <span className="text-lg group-hover:rotate-90 transition-transform duration-500">⚙️</span>
            <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Setup</span>
         </button>

         <button 
           onClick={onPowerOff}
           className="group w-full flex flex-col items-center py-3 rounded-2xl hover:bg-red-500/10 transition-all duration-300 border-t border-slate-900"
         >
            <div className="relative">
              <span className="text-lg grayscale group-hover:grayscale-0 transition-all group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                🔴
              </span>
            </div>
            <span className="text-[8px] font-black text-slate-600 group-hover:text-red-500 uppercase tracking-widest mt-0.5 transition-colors">
              Power
            </span>
         </button>
      </div>
    </nav>
  );
}