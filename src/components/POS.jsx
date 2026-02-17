import React, { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal'; 

export default function POS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(true);
  const [completedSaleId, setCompletedSaleId] = useState(null);

  const fetchInventory = () => {
    fetch('http://localhost:5000/api/parts')
      .then(res => res.json())
      .then(data => {
        setInventory(data);
        setFilteredResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading inventory:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = inventory.filter(part => 
      part.part_name.toLowerCase().includes(lowerSearch) || 
      part.oem_number.toLowerCase().includes(lowerSearch)
    );
    setFilteredResults(filtered);
  }, [searchTerm, inventory]);

  const updateCartPrice = (id, newPrice) => {
    const price = parseFloat(newPrice) || 0;
    setCart(cart.map(item => 
      item.id === id ? { ...item, sale_price: price } : item
    ));
  };

  const addToCart = (part) => {
    const existing = cart.find(item => item.id === part.id);
    if (existing && existing.qty >= part.stock_quantity) {
      alert(`Only ${part.stock_quantity} units available!`);
      return;
    }
    if (existing) {
      setCart(cart.map(item => item.id === part.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      // original_price is set once here and never changed
      setCart([...cart, { 
        ...part, 
        qty: 1, 
        original_price: parseFloat(part.sale_price),
        sale_price: parseFloat(part.sale_price) 
      }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  // --- REAL-TIME CALCULATIONS ---
  const totalAmount = cart.reduce((sum, item) => sum + (item.sale_price * item.qty), 0);
  const totalOriginal = cart.reduce((sum, item) => sum + (item.original_price * item.qty), 0);
  const totalDiscount = totalOriginal - totalAmount;
  
  const subtotal = totalAmount / 1.16;
  const vatAmount = totalAmount - subtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const saleData = { 
      cart, 
      subtotal: subtotal.toFixed(2), 
      vat_amount: vatAmount.toFixed(2), 
      total_amount: totalAmount, 
      payment_method: paymentMethod 
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/sales/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCompletedSaleId(result.saleId);
        setCart([]);
        setSearchTerm("");
        fetchInventory();
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) { 
      console.error(err);
      alert("Checkout failed. Check if server is running."); 
    }
  };

  const getStockStatus = (qty) => {
    if (qty <= 0) return <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Out of Stock</span>;
    if (qty < 5) return <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase">Low Stock: {qty}</span>;
    return <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">{qty} Available</span>;
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 italic">Loading Njokama Inventory...</div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <div className="flex-1 p-8 flex flex-col">
        <header className="mb-8 shrink-0 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Njokama POS</h1>
            <p className="text-slate-400 text-sm font-medium">Select spare parts to create order</p>
          </div>
        </header>

        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" value={searchTerm}
            className="w-full p-5 pl-12 rounded-2xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none font-medium"
            placeholder="Search by part name or OEM number..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
          {filteredResults.map(part => (
            <div 
              key={part.id} 
              className={`bg-white p-5 rounded-2xl shadow-sm border-2 transition-all flex flex-col justify-between h-44 cursor-pointer hover:-translate-y-1
                ${part.stock_quantity <= 0 ? 'opacity-50 grayscale cursor-not-allowed border-transparent' : 'border-transparent hover:border-blue-500 hover:shadow-xl'}`}
              onClick={() => part.stock_quantity > 0 && addToCart(part)}
            >
              <div>
                <h3 className="font-bold text-slate-800 line-clamp-1">{part.part_name}</h3>
                <p className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-tighter">{part.oem_number}</p>
                {getStockStatus(part.stock_quantity)}
              </div>
              <div className="flex justify-between items-end">
                <p className="text-xl font-black text-blue-600">KES {Number(part.sale_price).toLocaleString()}</p>
                <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Add +</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: CART */}
      <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-2xl">
        <div className="p-6 border-b bg-slate-50/50 text-center">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <span className="text-5xl mb-4">🛒</span>
              <p className="font-black text-[10px] uppercase tracking-[0.2em]">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => {
              const itemSavings = (item.original_price - item.sale_price) * item.qty;
              return (
                <div key={item.id} className="group relative bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.part_name}</p>
                      
                      {/* EDITABLE PRICE INPUT */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Price:</span>
                        <input 
                          type="number"
                          value={item.sale_price}
                          onChange={(e) => updateCartPrice(item.id, e.target.value)}
                          className="w-24 bg-white border border-slate-200 rounded px-2 py-1 text-sm font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* INDIVIDUAL DISCOUNT BADGE */}
                      {itemSavings > 0 && (
                        <div className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                          DISCOUNT: KES {itemSavings.toLocaleString()}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Quantity: {item.qty}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-slate-900 text-sm">KES {(item.qty * item.sale_price).toLocaleString()}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                        className="text-[10px] text-red-500 font-black uppercase hover:text-red-700 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t-2 border-slate-100">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Payment Method</span>
              <select 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-bold text-slate-700"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="M-Pesa">M-Pesa</option>
              </select>
            </div>
            
            <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span>KES {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>

                {/* REAL-TIME TOTAL DISCOUNT SLOT */}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                    <span>Total Discount</span>
                    <span>- KES {totalDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>VAT (16%)</span>
                  <span>KES {vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-900 font-black uppercase text-sm">Grand Total</span>
                  <span className="text-3xl font-black text-blue-700">KES {totalAmount.toLocaleString()}</span>
                </div>
            </div>
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0}
            className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all
              ${cart.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {cart.length > 0 ? 'COMPLETE SALE ➔' : 'SELECT ITEMS'}
          </button>
        </div>
      </div>

      {completedSaleId && (
        <ReceiptModal 
          saleId={completedSaleId} 
          onClose={() => setCompletedSaleId(null)} 
        />
      )}
    </div>
  );
}