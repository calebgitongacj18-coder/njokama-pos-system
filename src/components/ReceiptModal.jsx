import React, { useEffect, useState } from 'react';

let currentPrintJob = null;

export default function ReceiptModal({ saleId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saleData, setSaleData] = useState(null);

  useEffect(() => {
    if (!saleId || currentPrintJob === saleId) return;
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/sales/receipt/${saleId}`);
        const data = await res.json();
        if (isMounted) {
          setSaleData(data);
          setLoading(false);
          runPrint(data);
        }
      } catch (err) {
        console.error("Print Error:", err);
        if (isMounted) onClose();
      }
    };

    const runPrint = (data) => {
      currentPrintJob = saleId;
      const { header, items } = data;

      // --- 1. CALCULATE TOTAL SAVINGS FOR THE RECEIPT ---
      let totalDiscount = 0;

      const iframe = document.createElement('iframe');
      Object.assign(iframe.style, { 
        position: 'fixed', 
        right: '100%', 
        bottom: '100%', 
        width: '0px', 
        height: '0px', 
        border: 'none' 
      });
      document.body.appendChild(iframe);

      // --- 2. GENERATE ITEM ROWS WITH DISCOUNT INFO ---
      const itemsHtml = items.map(item => {
        const soldPrice = parseFloat(item.unit_price);
        const originalPrice = parseFloat(item.original_price || item.unit_price);
        const savingsPerUnit = originalPrice - soldPrice;
        const rowSavings = savingsPerUnit * item.quantity;
        
        if (rowSavings > 0) totalDiscount += rowSavings;

        return `
          <tr>
            <td style="padding: 6px 0; vertical-align: top;">
              <div style="font-weight: bold; text-transform: uppercase; font-size: 13px;">${item.part_name}</div>
              <div style="font-size: 11px; color: #333;">
                ${item.quantity} x ${soldPrice.toLocaleString()}
                ${savingsPerUnit > 0 ? `<span style="color: #666; font-style: italic;"> (Was ${originalPrice.toLocaleString()})</span>` : ''}
              </div>
            </td>
            <td style="text-align: right; font-weight: bold; vertical-align: top; font-size: 13px; padding-top: 6px;">
              ${(item.quantity * soldPrice).toLocaleString()}
            </td>
          </tr>
          ${savingsPerUnit > 0 ? `
          <tr>
            <td colspan="2" style="font-size: 10px; color: #000; font-weight: bold; padding-bottom: 8px; border-bottom: 0.5px solid #eee;">
              Item Discount: - KES ${rowSavings.toLocaleString()}
            </td>
          </tr>` : ''}
        `;
      }).join('');

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <html>
          <head>
            <style>
              @page { margin: 0; }
              body { 
                font-family: 'Courier New', Courier, monospace; 
                width: 72mm; 
                margin: 0 auto; 
                padding: 10px; 
                font-size: 12px; 
                color: #000; 
                line-height: 1.4;
              }
              .center { text-align: center; }
              .divider { border-top: 1.5px dashed #000; margin: 8px 0; }
              table { width: 100%; border-collapse: collapse; }
              .flex-row { display: flex; justify-content: space-between; margin: 2px 0; }
              .logo-img { width: 150px; height: auto; margin-bottom: 5px; filter: grayscale(1); }
              .brand-name { font-size: 18px; font-weight: 900; margin: 0; text-transform: uppercase; }
              .total-line { font-size: 18px; font-weight: 900; margin-top: 5px; padding-top: 5px; border-top: 1px solid #000; }
              .savings-box { border: 1px solid #000; padding: 5px; margin: 10px 0; text-align: center; font-weight: 900; }
              .footer-note { font-size: 10px; margin-top: 20px; line-height: 1.2; }
            </style>
          </head>
          <body>
            <div class="center">
              <img src="/jokamalogo1.png" class="logo-img" onerror="this.style.display='none'"/>
              <h1 class="brand-name">JOKAMA Auto Services & SPARES</h1>
              <p style="margin: 2px 0; font-weight: bold;">Industrial Area, Naivasha</p>
              <p style="margin: 2px 0;">Tel: +254 700 000 000</p>
              <div class="divider"></div>
              <p style="font-weight: bold; font-size: 14px; margin: 5px 0;">TAX INVOICE #SAL-${saleId}</p>
              <p style="font-size: 11px;">Date: ${new Date(header.created_at).toLocaleString('en-KE')}</p>
            </div>
            
            <div class="divider"></div>
            <table>
                <thead>
                    <th style="text-align: left; font-size: 10px; border-bottom: 1px solid #000;">ITEM</th>
                    <th style="text-align: right; font-size: 10px; border-bottom: 1px solid #000;">TOTAL</th>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div class="divider"></div>
            
            <div class="flex-row"><span>Subtotal:</span><span>${Number(header.subtotal).toLocaleString(undefined,{minimumFractionDigits:2})}</span></div>
            <div class="flex-row"><span>VAT (16%):</span><span>${Number(header.vat_amount).toLocaleString(undefined,{minimumFractionDigits:2})}</span></div>
            
            ${totalDiscount > 0 ? `
              <div class="flex-row" style="color: #000; font-weight: bold;">
                <span>Total Discount:</span>
                <span>- KES ${totalDiscount.toLocaleString()}</span>
              </div>
            ` : ''}

            <div class="flex-row total-line"><span>TOTAL:</span><span>KES ${Number(header.total_amount).toLocaleString()}</span></div>
            <div class="flex-row" style="font-size: 11px; margin-top: 5px;"><span>Paid via:</span><span>${header.payment_method}</span></div>
            
            ${totalDiscount > 0 ? `
              <div class="savings-box">
                YOU SAVED KES ${totalDiscount.toLocaleString()}!
              </div>
            ` : ''}

            <div class="divider"></div>
            
            <div class="center footer-note">
                <p><b>THANK YOU FOR SHOPPING WITH US!</b><br/>Goods once sold are not returnable.</p>
                <p style="margin-top: 10px; font-weight: 900; text-transform: uppercase; font-size: 9px;">
                    Systems by Digital Technologies Kenya
                </p>
            </div>
          </body>
        </html>
      `);
      doc.close();

      const cleanup = () => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        currentPrintJob = null;
        if (isMounted) onClose();
      };

      setTimeout(() => {
        if (!iframe.contentWindow) return;
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(cleanup, 1000);
      }, 500);
    };

    fetchData();

    return () => {
      isMounted = false;
      currentPrintJob = null; 
    };
  }, [saleId]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 border border-white/20 max-w-sm w-full">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="font-black text-slate-800 uppercase text-lg">
            {loading ? "Preparing Data" : "Printing Receipt"}
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest">
            Digital Technologies Kenya
          </p>
        </div>
        <button 
          onClick={() => { 
            currentPrintJob = null; 
            onClose(); 
          }} 
          className="mt-4 px-6 py-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl text-[10px] font-black uppercase transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}