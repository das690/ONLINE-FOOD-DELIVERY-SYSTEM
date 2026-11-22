import React from 'react';
import { Printer, X, UtensilsCrossed, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

const InvoiceModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `FE-INV-${(order._id || '').slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const orderTime = new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const subtotal = order.subtotal || order.totalAmount;
  const cgst = Math.round((order.tax || 0) / 2);
  const sgst = (order.tax || 0) - cgst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn no-print-backdrop">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-surface-200 dark:border-stone-800 text-surface-900 dark:text-surface-100 my-8">
        {/* Action Header (Hidden on print) */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-surface-200 dark:border-stone-800 no-print">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-stone-800 dark:text-brand-400 px-3 py-1 rounded-xl">
              Tax Invoice & Receipt
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-md touch-target"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 p-2 touch-target"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="space-y-6">
          {/* Top Invoice Banner */}
          <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b-2 border-dashed border-surface-200 dark:border-stone-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-surface-900 dark:text-white">
                  Food<span className="text-brand-500">Express</span>
                </h2>
                <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">
                  Official GST Tax Invoice
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-black text-surface-900 dark:text-white">{invoiceNumber}</p>
              <p className="text-xs text-surface-500 font-medium">Date: {orderDate} at {orderTime}</p>
              <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                {order.paymentStatus === 'Completed' || order.paymentMethod === 'cod' ? 'Invoice Paid' : 'Payment Verified'}
              </span>
            </div>
          </div>

          {/* Restaurant & Customer Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-4 border-b border-surface-100 dark:border-stone-800">
            {/* Restaurant Box */}
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">Sold By (FSSAI Lic. Kitchen):</p>
              <h4 className="text-sm font-black text-surface-900 dark:text-white">
                {order.restaurant?.name || 'Partner Kitchen'}
              </h4>
              <p className="text-surface-600 dark:text-surface-400 font-medium">
                {order.restaurant?.location || 'Bengaluru Central'}
              </p>
              <p className="text-surface-400 text-[11px]">GSTIN: 29ABCDE1234F1Z5</p>
              <p className="text-surface-400 text-[11px]">FSSAI Reg: 11223344000123</p>
            </div>

            {/* Customer Box */}
            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">Billed & Delivered To:</p>
              <h4 className="text-sm font-black text-surface-900 dark:text-white">
                {order.customer?.name || 'Customer'}
              </h4>
              <p className="text-surface-600 dark:text-surface-400 font-medium">
                {order.deliveryAddress?.fullAddress || `${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}`}
              </p>
              {order.deliveryAddress?.phone && (
                <p className="text-surface-500 text-[11px] font-semibold">
                  Phone: {order.deliveryAddress.phone}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-stone-800 text-surface-500 font-extrabold uppercase text-[10px]">
                  <th className="py-2 text-left">Item Description</th>
                  <th className="py-2 text-center">Type</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-stone-800 font-medium">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="py-2.5">
                    <td className="py-2.5 text-left font-bold text-surface-900 dark:text-surface-100">
                      {item.menuItemName || item.name}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} title={item.isVeg ? 'Veg' : 'Non-Veg'}></span>
                    </td>
                    <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 text-right font-medium">₹{item.price}</td>
                    <td className="py-2.5 text-right font-black text-surface-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Calculation Summary */}
          <div className="pt-4 border-t-2 border-surface-200 dark:border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between text-surface-600 dark:text-surface-400">
              <span>Item Subtotal</span>
              <span className="font-extrabold text-surface-900 dark:text-white">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-surface-600 dark:text-surface-400">
              <span>Delivery Partner Charges</span>
              <span className="font-extrabold text-surface-900 dark:text-white">
                {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee || 40}`}
              </span>
            </div>
            <div className="flex justify-between text-surface-600 dark:text-surface-400">
              <span>CGST (2.5%)</span>
              <span className="font-extrabold text-surface-900 dark:text-white">₹{cgst}</span>
            </div>
            <div className="flex justify-between text-surface-600 dark:text-surface-400">
              <span>SGST (2.5%)</span>
              <span className="font-extrabold text-surface-900 dark:text-white">₹{sgst}</span>
            </div>
            {order.tip > 0 && (
              <div className="flex justify-between text-brand-600 dark:text-brand-400 font-bold">
                <span>Delivery Partner Tip (100% to rider)</span>
                <span>+ ₹{order.tip}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promotional Coupon ({order.couponCode || 'PROMO'})</span>
                <span>- ₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-surface-900 dark:text-white pt-3 border-t border-surface-200 dark:border-stone-800">
              <span>Grand Total Paid</span>
              <span className="text-brand-600 dark:text-brand-400 text-lg">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Delivery & Eco Preferences Notice */}
          {order.deliveryPreferences && (
            <div className="p-3 bg-surface-50 dark:bg-stone-800/60 rounded-2xl text-[11px] text-surface-600 dark:text-surface-400 flex flex-wrap gap-3">
              {order.deliveryPreferences.noCutlery && (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">🌱 Opted out of plastic cutlery</span>
              )}
              {order.deliveryPreferences.contactless && (
                <span className="font-bold text-brand-600 dark:text-brand-400">🚪 Contactless delivery requested</span>
              )}
              {order.deliveryPreferences.dontRingBell && (
                <span className="font-bold">🔕 Do not ring bell</span>
              )}
              {order.deliveryPreferences.dropAtSecurity && (
                <span className="font-bold">🛡️ Drop at security gate</span>
              )}
            </div>
          )}

          {/* Footer Legal & Compliance */}
          <div className="pt-4 border-t border-surface-100 dark:border-stone-800 text-[10px] text-surface-400 text-center space-y-1">
            <p>This is a computer-generated tax invoice and requires no physical signature.</p>
            <p>Thank you for choosing FoodExpress — Lightning food delivery powered by modern MERN stack.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
