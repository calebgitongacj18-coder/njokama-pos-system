import React, { useState, useEffect, useRef } from 'react';
import EditModal from './EditModal';

export default function Inventory({ initialFilter = "All" }) {
  const [allParts, setAllParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState(initialFilter);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ 
    category_id: '', 
    part_name: '', 
    oem_number: '', 
    brand: '', 
    sale_price: '', 
    stock_quantity: '', 
    cost_price: '', 
    bin_location: '' 
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  const refreshInventory = () => {
    fetch('http://localhost:5000/api/parts')
      .then(res => res.json())
      .then(data => {
        setAllParts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setAllParts([]);
      });
  };

  useEffect(() => {
    setStockFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    refreshInventory();
  }, []);

  // --- EXPORT LOGIC (Updated Branding to JOKAMA) ---
  const handleExportInventory = (isPdfPrompt = false) => {
    if (filteredParts.length === 0) {
      alert("No data available to export.");
      return;
    }

    if (isPdfPrompt) {
      alert("When the print window opens, set 'Destination' to 'Save as PDF'.");
    }

    const reportDate = new Date().toISOString().split('T')[0];
    const displayDate = new Date().toLocaleString('en-KE');
    // Changed "Inventory" to "Jokama_Inventory"
    const fileName = `Jokama_Inventory_${stockFilter.replace(/\s+/g, '_')}_${reportDate}`;

    const totalValuation = filteredParts.reduce((acc, part) => 
      acc + (parseFloat(part.sale_price || 0) * parseInt(part.stock_quantity || 0)), 0
    );

    const exportWindow = window.open('', '_blank');
    if (!exportWindow) return alert("Please allow pop-ups for reports.");

    const itemsHtml = filteredParts.map(item => `
      <tr>
        <td>${item.category_id || '-'}</td>
        <td style="font-weight: 600;">${item.part_name}</td>
        <td>${item.oem_number}</td>
        <td>${item.brand}</td>
        <td>${item.bin_location || '-'}</td>
        <td style="text-align: right;">${Number(item.sale_price).toLocaleString()}</td>
        <td style="text-align: center; ${item.stock_quantity < 5 ? 'color: #ef4444; font-weight: bold;' : ''}">
          ${item.stock_quantity}
        </td>
      </tr>
    `).join('');

    exportWindow.document.write(`
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .meta { display: flex; justify-content: space-between; margin: 20px 0; font-size: 12px; font-weight: bold; color: #64748b; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #1e293b; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
            td { padding: 8px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
            .valuation { margin-top: 20px; padding: 15px; background: #f8fafc; text-align: right; border-radius: 10px; border: 1px solid #e2e8f0; }
            @media print { @page { size: A4; margin: 1cm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0;">JOKAMA SPARES</h1>
            <p style="margin:5px 0 0 0; color: #64748b;">Inventory Control Export</p>
          </div>
          <div class="meta">
            <span>FILTER: ${stockFilter.toUpperCase()}</span>
            <span>ITEMS: ${filteredParts.length}</span>
            <span>DATE: ${displayDate}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>CAT</th><th>PART NAME</th><th>OEM NO</th><th>BRAND</th><th>BIN</th>
                <th style="text-align: right;">PRICE (KES)</th><th style="text-align: center;">QTY</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="valuation">
            <small style="color: #64748b; text-transform: uppercase; font-weight: bold;">Total Stock Valuation (Sale Price):</small><br/>
            <strong style="font-size: 20px;">KES ${totalValuation.toLocaleString()}</strong>
          </div>
          <script>
            window.onload = () => { 
              window.print(); 
              setTimeout(() => { window.close(); }, 700); 
            };
          </script>
        </body>
      </html>
    `);
    exportWindow.document.close();
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
      if (rows.length < 2) return alert("CSV file is empty.");

      const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF"]/g, ''));
      const required = ['category_id', 'part_name', 'oem_number', 'brand', 'cost_price', 'sale_price', 'stock_quantity', 'bin_location'];
      const missing = required.filter(req => !headers.includes(req));

      if (missing.length > 0) return alert(`Missing columns: ${missing.join(', ')}`);
      
      const dataToUpload = rows.slice(1).map(row => {
        const values = row.split(',');
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim().replace(/^["']|["']$/g, '');
        });
        return obj;
      });

      if (window.confirm(`Import ${dataToUpload.length} items?`)) {
        try {
          const res = await fetch('http://localhost:5000/api/parts/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parts: dataToUpload })
          });
          if (res.ok) {
            alert("Bulk Upload Successful!");
            refreshInventory();
          }
        } catch (err) { alert("Server connection error."); }
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const downloadTemplate = () => {
    const csvContent = "category_id,part_name,oem_number,brand,cost_price,sale_price,stock_quantity,bin_location\n1,Brake Pad,45022-S04,Akebono,2500,4500,10,Shelf-B2";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // UPDATED TEMPLATE NAME
    a.download = "Jokama_Inventory_Template.csv";
    a.click();
  };

  const handleSubmit = async (e, isConfirmed = false) => {
    if (e) e.preventDefault();
    const payload = { 
      ...formData, 
      category_id: parseInt(formData.category_id) || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      sale_price: parseFloat(formData.sale_price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      confirm_merge: isConfirmed 
    };

    try {
      const res = await fetch('http://localhost:5000/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });
      const data = await res.json();
      if (res.status === 409) {
        if (window.confirm(data.message)) handleSubmit(null, true); 
      } else if (res.ok) {
        setFormData({ category_id: '', part_name: '', oem_number: '', brand: '', sale_price: '', stock_quantity: '', cost_price: '', bin_location: '' });
        refreshInventory();
      }
    } catch (err) { alert("Failed to connect to the server."); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this part?")) {
      await fetch(`http://localhost:5000/api/parts/${id}`, { method: 'DELETE' });
      refreshInventory();
    }
  };

  const filteredParts = allParts.filter(part => {
    const matchesSearch = 
      (part.part_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (part.oem_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (part.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    if (stockFilter === "Low Stock") {
      return matchesSearch && part.stock_quantity < 5;
    }
    
    return matchesSearch;
  });

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Inventory</h1>
          <p className="text-slate-500 font-medium text-sm italic">Jokama Stock Control</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => handleExportInventory(false)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            🖨️ Export
          </button>

          <button 
            onClick={() => handleExportInventory(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            📄 Save PDF
          </button>

          <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

          <button onClick={downloadTemplate} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest px-2 transition-colors">
            📥 Template
          </button>
          <button onClick={() => fileInputRef.current.click()} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">
            📁 Bulk Import
          </button>
          <input type="file" ref={fileInputRef} onChange={handleBulkUpload} className="hidden" accept=".csv" />
        </div>
      </div>
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <div className="relative group w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search parts, OEM, or brands..." 
            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setStockFilter("All")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${stockFilter === "All" ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>All Stock</button>
          <button onClick={() => setStockFilter("Low Stock")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${stockFilter === "Low Stock" ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'text-slate-400'}`}>Low Stock</button>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Quick Add Item</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-9 gap-3">
          <input type="number" placeholder="Cat ID" className="bg-slate-50 border-none p-3 rounded-xl text-sm" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} />
          <input placeholder="Part Name" className="bg-slate-50 border-none p-3 rounded-xl text-sm" value={formData.part_name} onChange={e => setFormData({...formData, part_name: e.target.value})} required />
          <input placeholder="OEM No." className="bg-slate-50 border-none p-3 rounded-xl text-sm" value={formData.oem_number} onChange={e => setFormData({...formData, oem_number: e.target.value})} required />
          <input placeholder="Brand" className="bg-slate-50 border-none p-3 rounded-xl text-sm" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
          <input placeholder="Loc" className="bg-slate-50 border-none p-3 rounded-xl text-sm" value={formData.bin_location} onChange={e => setFormData({...formData, bin_location: e.target.value})} />
          <input type="number" placeholder="Cost" className="bg-slate-50 border-none p-3 rounded-xl text-sm" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} />
          <input type="number" placeholder="Sale" className="bg-slate-50 border-none p-3 rounded-xl text-sm font-bold" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} required />
          <input type="number" placeholder="Qty" className="bg-slate-50 border-none p-3 rounded-xl text-sm font-bold" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} required />
          <button className="bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all text-xs uppercase shadow-lg">Add</button>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredParts.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="p-5">Part Details & Bin</th>
                <th className="p-5 text-center">In Stock</th>
                <th className="p-5">Unit Price</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredParts.map(part => (
                <tr key={part.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-slate-800">{part.part_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase">
                        {part.oem_number} | {part.brand} | <span className="text-blue-600 font-bold">{part.bin_location || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${part.stock_quantity < 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
                      {part.stock_quantity} units
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="font-black text-slate-900 text-sm">KES {Number(part.sale_price).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-medium italic">Cost: {Number(part.cost_price).toLocaleString()}</div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => {setSelectedPart(part); setIsEditModalOpen(true);}} className="p-2 text-blue-600 font-bold text-xs hover:underline uppercase">Edit</button>
                      <button onClick={() => handleDelete(part.id)} className="p-2 text-slate-300 hover:text-red-500 font-bold text-xs transition-colors uppercase">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center">
            <div className="text-slate-300 mb-2 font-bold uppercase tracking-widest">Empty Shelf</div>
            <button onClick={() => {setSearchTerm(""); setStockFilter("All");}} className="text-blue-600 text-xs font-black uppercase">Clear Filters</button>
          </div>
        )}
      </div>

      {isEditModalOpen && <EditModal part={selectedPart} onClose={() => setIsEditModalOpen(false)} onRefresh={refreshInventory} />}
    </div>
  );
}