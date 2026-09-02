import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ShoppingBag, Package, Loader, ArrowLeft, ExternalLink, Truck } from 'lucide-react';

export default function MyOrders({ onBackToStore }) {
  const { currentUser: user, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        let fetchedOrders = [];
        let errors = [];

        // Try querying the subcollection first (New Backend format)
        try {
          const subQ = query(collection(db, 'users', user.uid, 'orders'));
          const subSnap = await getDocs(subQ);
          subSnap.forEach((doc) => fetchedOrders.push({ id: doc.id, ...doc.data() }));
        } catch (e) {
          errors.push('Subcollection error: ' + e.message);
        }

        // Try querying the root collection (Old Backend format)
        try {
          const rootQ = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const rootSnap = await getDocs(rootQ);
          rootSnap.forEach((doc) => {
            // Avoid duplicates if somehow it's in both
            if (!fetchedOrders.find(o => o.id === doc.id)) {
               fetchedOrders.push({ id: doc.id, ...doc.data() });
            }
          });
        } catch (e) {
          errors.push('Root collection error: ' + e.message);
        }

        if (fetchedOrders.length === 0 && errors.length > 0) {
           setErrorMsg(errors.join(' | '));
        }
        
        // Sort in memory by date descending
        fetchedOrders.sort((a, b) => {
           const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
           const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
           return timeB - timeA;
        });
        
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Critical error fetching orders:", error);
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pb-20">
        <Loader className="animate-spin text-primary-500 mb-4" size={40} />
        <p className="text-slate-600 font-bold">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 text-slate-900 animate-fade-in-up">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-6 pb-6 border-b border-slate-800">
        <div className="container-custom">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (onBackToStore) onBackToStore();
                else window.location.hash = '#store';
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
              Back to Store
            </button>
            <h1 className="text-xl md:text-2xl font-extrabold font-heading">
              Your <span className="text-accent-500">Orders</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="container-custom pt-8 max-w-4xl">
        <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
          <ShoppingBag size={24} className="text-primary-500" />
          Order History
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Package size={64} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-500 mb-6">Looks like you haven't placed any orders yet.</p>
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 text-left max-w-xl mx-auto border border-red-100 font-mono overflow-auto">
                <strong>Debug Info:</strong> {errorMsg}
              </div>
            )}
            <button 
              onClick={() => {
                if (onBackToStore) onBackToStore();
                else window.location.hash = '#store';
              }}
              className="bg-[#FFA41C] hover:bg-[#FA8900] text-slate-900 font-bold py-2.5 px-6 rounded-full transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const sec = order.createdAt?.seconds || order.createdAt?._seconds;
              const date = sec ? new Date(sec * 1000).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
              }) : 'Processing...';

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="bg-slate-100 border-b border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                    <div className="flex gap-6">
                      <div>
                        <span className="block text-slate-500 text-xs uppercase tracking-wide mb-1">Order Placed</span>
                        <span className="font-bold text-slate-700">{date}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-xs uppercase tracking-wide mb-1">Total</span>
                        <span className="font-bold text-slate-700">₹{order.amount?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="block text-slate-500 text-xs uppercase tracking-wide mb-1">Ship To</span>
                        <span className="font-bold text-slate-700 text-primary-600 cursor-pointer">{order.address?.fullName || userProfile?.fullName || 'Customer'}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="block text-slate-500 text-xs uppercase tracking-wide mb-1">Order #</span>
                      <span className="font-bold text-slate-700">{order.id}</span>
                    </div>
                  </div>

                  {/* Order Items & Status */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      
                      <div className="flex-1 space-y-4">
                        <h3 className="font-extrabold text-lg flex items-center gap-2">
                          {order.status === 'paid' ? (
                            <span className="text-emerald-600">Payment Successful</span>
                          ) : order.status === 'created' ? (
                            <span className="text-amber-500">Payment Pending</span>
                          ) : (
                            <span className="text-red-500">Payment Failed</span>
                          )}
                        </h3>
                        
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-lg p-2 shrink-0 flex items-center justify-center overflow-hidden">
                              <img src={item.image} alt={item.name} className="max-h-full max-w-full mix-blend-multiply object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                              <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                              {item.selectedSize && <p className="text-xs text-slate-400 mt-0.5">Size: {item.selectedSize}</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shiprocket Section */}
                      <div className="md:w-64 shrink-0 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                        <button className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-sm font-bold py-2 rounded-lg transition-colors">
                          View Invoice
                        </button>
                        
                        {order.shiprocketShipmentId ? (
                          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mt-2 text-center">
                            <Truck size={24} className="text-emerald-500 mx-auto mb-2" />
                            <span className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Tracking ID</span>
                            <span className="font-extrabold text-lg text-emerald-600">{order.shiprocketShipmentId}</span>
                            <a href={`https://shiprocket.co/tracking/${order.shiprocketShipmentId}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 hover:underline flex items-center justify-center gap-1 mt-2">
                              Track Package <ExternalLink size={12} />
                            </a>
                          </div>
                        ) : order.shiprocketStatus === 'failed_to_create' ? (
                          <div className="bg-red-50 border border-red-100 p-4 rounded-xl mt-2 text-center">
                            <span className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Shipping Error</span>
                            <span className="font-bold text-sm text-red-700">Label generation failed (Pending manual creation)</span>
                          </div>
                        ) : order.status === 'paid' ? (
                          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mt-2 text-center">
                            <span className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Shipping</span>
                            <span className="font-bold text-sm text-amber-700">Label generation pending</span>
                          </div>
                        ) : null}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
