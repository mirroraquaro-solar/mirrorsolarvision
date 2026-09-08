import React from 'react';
import { CheckCircle, Package, Truck, ExternalLink, ArrowRight, ShoppingBag } from 'lucide-react';

const OrderSuccess = ({ orderData, onContinueShopping, onViewOrders }) => {
  const orderId = orderData?.orderId || (typeof orderData === 'string' ? orderData : orderData?.id || 'N/A');
  const shipmentId = orderData?.shiprocketShipmentId;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-sm ring-8 ring-emerald-50">
          <CheckCircle className="h-10 w-10" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-heading">
          Payment Successful!
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mb-6">
          Thank you for ordering with Mirror Solar Vision. Your order is confirmed and shipping is being prepared.
        </p>

        <div className="space-y-3.5 mb-8 text-left">
          {/* Order ID Card */}
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
              <Package className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Order ID / Reference</p>
              <p className="text-slate-900 font-mono font-bold text-sm sm:text-base break-all mt-0.5">{orderId}</p>
            </div>
          </div>

          {/* Shipment Tracking Info */}
          {shipmentId ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl p-4.5 border border-blue-200 flex flex-col gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-blue-700 font-extrabold uppercase tracking-wider">Shiprocket Shipment Created</p>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Live</span>
                  </div>
                  <p className="text-slate-900 text-sm font-bold mt-1">
                    Tracking ID: <span className="font-mono text-blue-900">{shipmentId}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Courier details and live updates are tracked via Shiprocket. You will also receive an SMS.
                  </p>
                </div>
              </div>

              <a
                href={`https://shiprocket.co/tracking/${shipmentId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all"
              >
                <span>Track Package on Shiprocket</span>
                <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-amber-900 font-extrabold uppercase tracking-wider">Shipment Label In Progress</p>
                <p className="text-xs text-slate-700 mt-1">
                  Your shipment is being generated in our dispatch system. You can view real-time tracking updates anytime in <strong>My Orders</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onViewOrders}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-slate-900 text-white font-bold py-3.5 px-5 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
          >
            <ShoppingBag size={18} className="text-[#F58220]" />
            <span>View My Orders & Full Tracking</span>
            <ArrowRight size={16} />
          </button>
          
          <button
            onClick={onContinueShopping}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-2xl transition-colors text-sm cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
