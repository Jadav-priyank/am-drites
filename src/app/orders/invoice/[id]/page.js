"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Printer, ArrowLeft } from "lucide-react";

export default function CustomerInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders?id=${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
        // Automatically trigger print dialog once content renders
        setTimeout(() => {
          window.print();
        }, 800);
      } else {
        setError(data.error || "Order not found or access denied");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Loading Invoice...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-650 gap-4">
        <span className="text-sm font-bold text-red-500">{error || "Access Denied"}</span>
        <button
          onClick={() => window.close()}
          className="border border-primary/20 hover:border-primary text-primary text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          Close Page
        </button>
      </div>
    );
  }

  // Calculate fields
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDue = order.totalAmount;
  const shippingCharges = Math.max(0, totalDue - subtotal);
  const couponDiscount = Math.max(0, subtotal + shippingCharges - totalDue);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 md:p-12 max-w-4xl mx-auto selection:bg-amber-100">
      
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-border-none {
            border: none !important;
          }
        }
      `}</style>

      {/* Control bar */}
      <div className="no-print flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Close Invoice</span>
        </button>
        <button
          onClick={() => window.print()}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-4.5 py-2.5 rounded-xl shadow-lg shadow-primary/10 flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* Invoice Card */}
      <div className="border border-slate-200 print-border-none p-6 md:p-10 rounded-3xl flex flex-col gap-8">
        
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
          <div>
            <h1 className="font-outfit font-black text-3xl text-primary tracking-tight leading-none">AM DRIETS</h1>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Nature&apos;s Goodness, Preserved</p>
            <div className="text-[10px] text-slate-500 font-bold mt-2 flex flex-col gap-0.5">
              <span>GSTIN: 24FGCPR9808C1ZB</span>
              <span>FASSAI Lic No: 20726022002709</span>
            </div>
          </div>
          <div className="text-right md:text-right flex flex-col items-start md:items-end gap-1.5">
            <span className="bg-primary-light text-primary border border-primary/10 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Tax Invoice / Bill Statement
            </span>
            <div className="text-sm font-bold text-slate-800 font-mono mt-1">
              Invoice No: INV-AMD-{order._id.substring(order._id.length - 8).toUpperCase()}
            </div>
            <div className="text-xs text-slate-500 font-bold">
              Date: {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </div>
          </div>
        </div>

        {/* Addresses Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
          {/* Seller details */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sold By</span>
            <div className="font-bold text-sm text-slate-850">AM DRIETS</div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Kamrej, Surat, Gujarat, India - 394185
              <br />
              Email: info@amdriets.com
              <br />
              GSTIN: 24FGCPR9808C1ZB | FASSAI Lic No. 20726022002709
            </p>
          </div>

          {/* Buyer details */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billed / Shipped To</span>
            {order.shippingAddress ? (
              <>
                <div className="font-bold text-sm text-slate-850">{order.shippingAddress.name}</div>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
                  <br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic">No delivery details provided.</p>
            )}
          </div>
        </div>

        {/* Order Details & Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Payment Method</span>
            <span className="font-bold text-slate-800 uppercase mt-0.5 block">{order.paymentMethod}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{order.paymentStatus}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Status</span>
            <span className="font-bold text-primary uppercase mt-0.5 block">{order.status}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Courier / Tracking</span>
            <span className="font-semibold text-slate-600 mt-0.5 block truncate">
              {order.courierPartner ? `${order.courierPartner}: ${order.trackingNumber}` : "Pending Shipment"}
            </span>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="flex flex-col">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Snack Item Details</th>
                <th className="py-3 px-2 text-center">Size</th>
                <th className="py-3 px-2 text-right">Unit Price</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <tr key={item._id || item.id} className="text-slate-700">
                  <td className="py-3 px-2 font-bold text-slate-900">
                    {item.name}
                    <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">{item.category}</span>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-slate-500">{item.size}</td>
                  <td className="py-3 px-2 text-right font-semibold">₹{item.price}</td>
                  <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 px-2 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations Block */}
        <div className="flex justify-end mt-4">
          <div className="w-full md:w-80 flex flex-col gap-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">₹{subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping Charges</span>
              <span className="font-bold text-slate-900">
                {shippingCharges === 0 ? "FREE" : `₹${shippingCharges}`}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>Promo Coupon Deduction</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            
            {/* Grand Total */}
            <div className="flex items-center justify-between text-slate-900 border-t border-slate-200 pt-3 text-sm font-black font-outfit">
              <span>Grand Total</span>
              <span className="text-primary text-lg">₹{totalDue}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="text-center text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-6 mt-8 flex flex-col gap-1.5">
          <p>This is a computer-generated tax invoice. No signature is required.</p>
          <p className="text-slate-500 font-bold">Thank you for choosing health and nature with AM DRIETS!</p>
        </div>

      </div>
    </div>
  );
}
