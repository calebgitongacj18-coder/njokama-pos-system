import React, { useState, useEffect, useCallback } from 'react';

export default function Dashboard({ onViewInventory }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/sales/stats?t=${new Date().getTime()}`);
      const stats = await res.json();
      setData(stats);
      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading && !data) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#f8fafc]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence</p>
      </div>
    </div>
  );

  const chartData = data?.categorySpread || [
    { label: 'Engine', value: 45, color: 'bg-blue-600' },
    { label: 'Brakes', value: 30, color: 'bg-emerald-500' },
    { label: 'Suspension', value: 15, color: 'bg-amber-500' },
    { label: 'Other', value: 10, color: 'bg-slate-400' },
  ];

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#f1f5f9] p-6 gap-6 overflow-hidden font-sans">
      
      {/* COMPACT CHIC HEADER */}
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Intelligence
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em]">
              Enterprise Control
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={() => { setLoading(true); fetchStats(); }}
             className="bg-white border border-slate-200 shadow-sm text-slate-700 px-5 py-2.5 rounded-xl text-[9px] font-black hover:bg-slate-50 transition-all active:scale-95"
           >
             {loading ? 'SYNCING...' : 'REFRESH'}
           </button>
           <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black flex items-center shadow-lg border border-slate-800 tracking-widest uppercase">
             {new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}
           </div>
        </div>
      </header>

      {/* KPI GRID: Balanced Spacing */}
      <div className="grid grid-cols-3 gap-6 shrink-0">
        <div className="bg-gradient-to-br from-[#00b09b] to-[#96c93d] p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden group">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Daily Revenue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs font-light opacity-60">KES</span>
            <span className="text-2xl font-black tracking-tighter tabular-nums">
              {Number(data?.summary?.dailyTotal || 0).toLocaleString()}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10 text-6xl group-hover:scale-110 transition-transform">💰</div>
        </div>

        <div className="bg-white border border-white p-6 rounded-[2rem] shadow-sm text-slate-900 relative overflow-hidden group">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inventory Value</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs font-light text-slate-300">KES</span>
            <span className="text-2xl font-black tracking-tighter tabular-nums text-blue-600">
              {Number(data?.summary?.inventoryValue || 0).toLocaleString()}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] text-6xl">📦</div>
        </div>

        <div 
          onClick={onViewInventory}
          className={`p-6 rounded-[2rem] shadow-lg relative overflow-hidden group text-white cursor-pointer transition-all hover:brightness-110 ${
            data?.summary?.lowStockCount > 0 ? 'bg-[#ff4b2b]' : 'bg-slate-800'
          }`}
        >
          <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Stock Alerts</p>
          <p className="text-2xl font-black mt-1">
            {data?.summary?.lowStockCount} <span className="text-[10px] font-medium uppercase tracking-widest ml-1 opacity-50">Items</span>
          </p>
          <div className="mt-2 text-[8px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Resolve Warnings →</div>
        </div>
      </div>

      {/* CHART SECTION: Flexible Area */}
      <div className="flex-1 min-h-0 bg-white border border-white rounded-[2.5rem] p-8 shadow-sm flex flex-col relative">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Asset Allocation</h2>
            <div className="bg-slate-50 px-4 py-1 rounded-full text-[8px] font-black text-slate-400 border border-slate-100 uppercase tracking-widest">
              Live Integrity: 100%
            </div>
        </div>

        <div className="flex-1 flex items-end gap-6 px-2 min-h-0">
          {chartData.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <div className="absolute -top-8 bg-slate-900 text-white text-[8px] px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-black shadow-xl z-20">
                {bar.value}%
              </div>
              <div 
                className={`${bar.color} w-full rounded-t-xl transition-all duration-[1000ms] group-hover:brightness-110`} 
                style={{ height: `${bar.value}%` }}
              >
                 <div className="w-full h-full bg-gradient-to-t from-black/5 to-transparent rounded-t-xl"></div>
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase mt-3 tracking-widest group-hover:text-slate-900 transition-colors">{bar.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER: Scroll-Locked Panels */}
      <div className="grid grid-cols-2 gap-6 h-[25%] shrink-0">
        <div className="bg-slate-900 rounded-[2rem] p-6 flex flex-col overflow-hidden border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
             <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Fast Moving Units</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {data?.fastMoving?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-tight truncate max-w-[150px]">{item.part_name}</span>
                <span className="text-[10px] font-black text-blue-400 tabular-nums bg-blue-500/10 px-2 py-0.5 rounded-md">
                    {item.total_sold} <small className="text-[7px] opacity-40 ml-0.5">UNITS</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></div>
             <h3 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">Shortfall Warnings</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {data?.outOfStock?.length > 0 ? (
              data.outOfStock.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tight truncate max-w-[150px]">{item.part_name}</span>
                  <span className="text-[7px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md uppercase tracking-tighter">Depleted</span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <p className="text-[8px] font-black uppercase tracking-widest">System Nominal</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}