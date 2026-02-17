import React, { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState("All");
  const [showVoided, setShowVoided] = useState(true);

  const fetchHistory = () => {
    // Note: Removed setLoading(true) here to prevent the whole screen 
    // from flickering white when just refreshing data in the background
    fetch('http://localhost:5000/api/sales/history')
      .then(res => res.json())
      .then(data => {
        setSales(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = `SAL-${sale.id}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = filterPayment === "All" || sale.payment_method === filterPayment;
    const matchesVoidStatus = showVoided ? true : sale.status !== 'voided';
    return matchesSearch && matchesPayment && matchesVoidStatus;
  });

  const summary = filteredSales.reduce((acc, sale) => {
    if (sale.status !== 'voided') {
      acc.subtotal += Number(sale.subtotal || 0);
      acc.vat += Number(sale.vat_amount || 0);
      acc.grandTotal += Number(sale.total_amount || 0);
    }
    return acc;
  }, { subtotal: 0, vat: 0, grandTotal: 0 });

  const handleExportCSV = () => {
    if (filteredSales.length === 0) return alert("No data to export!");
    const headers = ["Receipt ID", "Date", "Time", "Payment Method", "Status", "Subtotal (KES)", "VAT 16% (KES)", "Grand Total (KES)"];
    const rows = filteredSales.map(sale => [
      `SAL-${sale.id}`,
      new Date(sale.created_at).toLocaleDateString('en-KE'),
      new Date(sale.created_at).toLocaleTimeString('en-KE'),
      `"${sale.payment_method}"`,
      sale.status.toUpperCase(),
      Number(sale.subtotal).toFixed(2),
      Number(sale.vat_amount).toFixed(2),
      Number(sale.total_amount).toFixed(2)
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Njokama_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales History</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">Njokama Spares Financial Records</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search Receipt ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="bg-white border-none shadow-sm px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 outline-none"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="All">All Payments</option>
            <option value="Cash">Cash Only</option>
            <option value="M-Pesa">M-Pesa Only</option>
          </select>

          <button 
            onClick={() => setShowVoided(!showVoided)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${
              showVoided ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-400 border-slate-100'
            }`}
          >
            {showVoided ? 'SHOWN VOIDED' : 'HIDDEN VOIDED'}
          </button>

          <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-black transition-all shadow-lg text-sm uppercase flex items-center gap-2">
            📊 Export
          </button>
        </div>
      </div>

      {/* SUMMARY TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Revenue (Excl. VAT)</p>
          <p className="text-2xl font-black text-slate-900">KES {summary.subtotal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">VAT (16%)</p>
          <p className="text-2xl font-black text-slate-900">KES {summary.vat.toLocaleString()}</p>
        </div>
        <div className="bg-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-100">
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Gross Revenue (Incl. VAT)</p>
          <p className="text-2xl font-black text-white">KES {summary.grandTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 text-[10px] uppercase font-black tracking-[0.15em]">
                <th className="p-5">Receipt ID</th>
                <th className="p-5">Date & Time</th>
                <th className="p-5">Subtotal</th>
                <th className="p-5">VAT (16%)</th>
                <th className="p-5">Grand Total</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr 
                  key={sale.id} 
                  className={`transition-colors group ${sale.status === 'voided' ? 'bg-red-50/40 grayscale-[0.5]' : 'hover:bg-blue-50/40'}`}
                >
                  <td className="p-5 font-mono text-xs font-bold text-slate-600">#SAL-{sale.id}</td>
                  <td className="p-5">
                    <div className="text-sm font-bold text-slate-700">
                      {new Date(sale.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        sale.payment_method === 'M-Pesa' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {sale.payment_method}
                      </span>
                      {sale.status === 'voided' && (
                        <span className="text-[9px] font-black uppercase text-red-600">VOIDED</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-sm text-slate-600 font-medium">
                    KES {Number(sale.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-5 text-sm text-emerald-600 font-medium">
                    KES {Number(sale.vat_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-5 font-black text-slate-900">
                    KES {Number(sale.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => setSelectedSaleId(sale.id)} 
                      className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white border border-slate-100 rounded-xl font-bold text-xs uppercase transition-all shadow-sm"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FIX APPLIED HERE --- */}
      {selectedSaleId && (
        <ReceiptModal 
          saleId={selectedSaleId} 
          onClose={() => {
            // 1. First, kill the modal by setting ID to null
            setSelectedSaleId(null);
            
            // 2. Refresh the history in the background after the modal is gone
            // This prevents the "double print" loop
            setTimeout(() => {
                fetchHistory(); 
            }, 50);
          }} 
        />
      )}
    </div>
  );
}