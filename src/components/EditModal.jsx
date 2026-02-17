import React, { useState } from 'react';

export default function EditModal({ part, onClose, onRefresh }) {
  const [formData, setFormData] = useState({ ...part });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/parts/${part.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onRefresh(); // Reload the table
        onClose();   // Close the modal
      }
    } catch (err) {
      alert("Error updating part.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="font-black text-xl text-slate-800 tracking-tight">Edit Spare Part</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">ID: #{part.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all"
          >
            ✕
          </button>
        </div>
        
        {/* EDIT FORM */}
        <form onSubmit={handleUpdate} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Part Name</label>
            <input 
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.part_name} 
              onChange={e => setFormData({...formData, part_name: e.target.value})} 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price (KES)</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.sale_price} 
                onChange={e => setFormData({...formData, sale_price: e.target.value})} 
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Stock Quantity</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.stock_qty} 
                onChange={e => setFormData({...formData, stock_qty: e.target.value})} 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">OEM Number (Serial)</label>
            <input 
              className="w-full bg-slate-100/50 border-none p-4 rounded-2xl text-slate-500 font-mono text-sm outline-none cursor-not-allowed"
              value={formData.oem_number} 
              disabled
              title="OEM Number cannot be changed once registered"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className={`flex-1 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest ${
                isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {isSaving ? 'Saving...' : 'Update Records'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}