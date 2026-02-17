import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import SalesHistory from './components/SalesHistory';

function App() {
  const [view, setView] = useState("dashboard");
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const [inventoryFilter, setInventoryFilter] = useState("All");

  const handleViewInventory = (filter = "All") => {
    setView("inventory");
    setInventoryFilter(filter);
  };

  const renderView = () => {
    switch (view) {
      case "dashboard": return <Dashboard onViewInventory={() => handleViewInventory("Low Stock")} />;
      case "pos": return <POS />;
      case "inventory": return <Inventory initialFilter={inventoryFilter} />;
      case "history": return <SalesHistory />;
      default: return <Dashboard onViewInventory={() => handleViewInventory("Low Stock")} />;
    }
  };

  // --- THE UPDATED PROFESSIONAL LOGIN GATE ---
  if (!isPoweredOn) {
    return (
      <div 
        className="h-screen w-full bg-[#010409] flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000 select-none"
        onClick={() => setIsPoweredOn(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Atmosphere */}
        <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        {/* LOGO AREA - Fixed Height Container to prevent shifting */}
        <div className="relative flex flex-col items-center justify-center w-full h-[500px]">
          
          {/* Electrical Aura Ring */}
          <div className={`absolute rounded-full border border-blue-400/20 transition-all duration-1000 ${
            isHovered ? 'w-[650px] h-[650px] opacity-100 rotate-180' : 'w-[300px] h-[300px] opacity-0 rotate-0'
          }`} />

          {/* Lightning Core Glow */}
          <div className={`absolute w-[400px] h-[400px] rounded-full blur-[100px] transition-all duration-700 pointer-events-none ${
            isHovered ? 'bg-blue-500/30 opacity-100 animate-pulse' : 'opacity-0'
          }`} />
          
          {/* THE LOGO */}
          <img 
            src="/jokamalogo1.png"
            alt="Jokama Logo" 
            className={`relative z-20 w-[550px] h-[550px] object-contain transition-all duration-700 ease-out cursor-pointer ${
              isHovered 
                ? 'scale-105 brightness-125 drop-shadow-[0_0_80px_rgba(37,99,235,0.8)] grayscale-0' 
                : 'scale-100 opacity-30 brightness-50 grayscale'
            }`}
          />
        </div>

        {/* INTERACTION UI - Positioned Absolutely so Logo doesn't push it */}
        <div className={`absolute bottom-[20%] flex flex-col items-center gap-4 transition-all duration-700 z-30 pointer-events-none ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
           <div className="flex items-center gap-6">
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-blue-500" />
              <p className="text-blue-400 text-xs font-black tracking-[1.5em] uppercase">
                Initialize POS
              </p>
              <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-blue-500" />
           </div>
           
           <p className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase">
             Click anywhere to authenticate
           </p>
        </div>

        {/* Technical Footer */}
        <div className="absolute bottom-8 w-full px-12 flex justify-between items-end opacity-10 pointer-events-none font-mono text-[8px] text-slate-400 tracking-[0.3em]">
           <div>TERMINAL_ID // JKM-01</div>
           <div className="text-right uppercase">Encrypted Session<br/>Est. 2026_Secure</div>
        </div>

      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans overflow-hidden animate-in fade-in zoom-in duration-700">
      <Sidebar 
        setView={(newView) => {
          if (newView !== 'inventory') setInventoryFilter("All");
          setView(newView);
        }} 
        currentView={view} 
        onPowerOff={() => setIsPoweredOn(false)} 
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}

export default App;