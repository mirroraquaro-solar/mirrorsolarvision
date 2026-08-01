import React from 'react';
import { CheckCircle, Package, Truck } from 'lucide-react';

const OrderSuccess = ({ orderData, onContinueShopping, onViewOrders }) => {
  const orderId = orderData?.orderId || orderData || 'N/A';
  const shipmentId = orderData?.shiprocketShipmentId;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. Your order has been placed and is being processed.
        </p>

        <div className="space-y-3 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 text-left flex items-start gap-4 border border-gray-100">
            <Package className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-500 font-medium">Order ID</p>
              <p className="text-gray-900 font-mono text-sm break-all">{orderId}</p>
            </div>
          </div>

          {shipmentId && (
            <div className="bg-blue-50 rounded-xl p-4 text-left flex items-start gap-4 border border-blue-100">
              <Truck className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-blue-700 font-bold">Shipping Created</p>
                <p className="text-blue-900 text-sm mt-1">
                  Shipment ID: <span className="font-mono font-bold">{shipmentId}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">You will receive an SMS with live tracking details once dispatched.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onViewOrders}
            className="w-full bg-[#131921] hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={onContinueShopping}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
