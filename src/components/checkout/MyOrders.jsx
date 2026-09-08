import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  ShoppingBag, 
  Package, 
  Loader, 
  ArrowLeft, 
  ExternalLink, 
  Truck, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  MapPin,
  Phone,
  User,
  Calendar
} from 'lucide-react';

export default function MyOrders({ onBackToStore }) {
  const { currentUser: user, userProfile, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      let fetchedOrders = [];

      // 1. Fetch from Firestore for logged in user (by UID, phone, and email)
      if (user) {
        // User subcollection
        try {
          const subQ = query(collection(db, 'users', user.uid, 'orders'));
          const subSnap = await getDocs(subQ);
          subSnap.forEach((d) => {
            fetchedOrders.push({ id: d.id, ...d.data() });
          });
        } catch (e) {
          console.warn('Subcollection fetch error:', e);
        }

        // Root collection by userId
        try {
          const rootQ = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const rootSnap = await getDocs(rootQ);
          rootSnap.forEach((d) => {
            if (!fetchedOrders.find((o) => o.id === d.id)) {
              fetchedOrders.push({ id: d.id, ...d.data() });
            }
          });
        } catch (e) {
          console.warn('Root collection fetch error:', e);
        }

        // Also query by phone number if user has phone
        const userPhone = userProfile?.phone ? userProfile.phone.replace(/[^0-9]/g, '') : null;
        if (userPhone && userPhone.length >= 10) {
          try {
            const phoneQ = query(collection(db, 'orders'), where('customerPhone', '==', userPhone));
            const phoneSnap = await getDocs(phoneQ);
            phoneSnap.forEach((d) => {
              if (!fetchedOrders.find((o) => o.id === d.id)) {
                fetchedOrders.push({ id: d.id, ...d.data() });
              }
            });
          } catch (e) {
            console.warn('Phone orders fetch error:', e);
          }
        }
      }

      // 2. Fetch/Merge from localStorage (Guest or recent device orders)
      try {
        const local = JSON.parse(localStorage.getItem('msv_recent_orders') || '[]');
        for (const localOrder of local) {
          if (!fetchedOrders.find((o) => o.id === localOrder.id)) {
            // Check latest data from root 'orders'
            try {
              const rootDocRef = doc(db, 'orders', localOrder.id);
              const rootDocSnap = await getDoc(rootDocRef);
              if (rootDocSnap.exists()) {
                fetchedOrders.push({ id: rootDocSnap.id, ...rootDocSnap.data() });
                continue;
              }
            } catch (err) {
              console.warn('Local order Firestore refresh failed:', err);
            }
            fetchedOrders.push(localOrder);
          }
        }
      } catch (e) {
        console.warn('LocalStorage order read error:', e);
      }

      // Sort by date descending
      fetchedOrders.sort((a, b) => {
        const timeA = a.createdAt?.seconds || a.createdAt?._seconds || (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() / 1000 : 0);
        const timeB = b.createdAt?.seconds || b.createdAt?._seconds || (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() / 1000 : 0);
        return timeB - timeA;
      });

      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleSearchOrder = async (e) => {
    e?.preventDefault();
    const queryTerm = searchQuery.trim();
    if (!queryTerm) return;

    setSearchLoading(true);
    setSearchError('');

    try {
      const cleanDigits = queryTerm.replace(/[^0-9]/g, '');

      // Check if it's already in loaded orders
      let found = orders.find(
        (o) => 
          o.id?.toLowerCase() === queryTerm.toLowerCase() ||
          o.shiprocketShipmentId?.toString() === queryTerm ||
          o.razorpayOrderId?.toLowerCase() === queryTerm.toLowerCase() ||
          (cleanDigits.length >= 10 && (o.customerPhone === cleanDigits || o.address?.phone?.replace(/[^0-9]/g, '') === cleanDigits))
      );

      if (found) {
        setSearchLoading(false);
        return;
      }

      let newlyFound = [];

      // 1. Search by doc ID in root 'orders'
      try {
        const rootDocRef = doc(db, 'orders', queryTerm);
        const rootSnap = await getDoc(rootDocRef);
        if (rootSnap.exists()) {
          newlyFound.push({ id: rootSnap.id, ...rootSnap.data() });
        }
      } catch {
        // Continue searching other criteria
      }

      // 2. Search by phone number in root 'orders' if 10 digits
      if (cleanDigits.length >= 10) {
        try {
          const phoneQ = query(collection(db, 'orders'), where('customerPhone', '==', cleanDigits));
          const phoneSnap = await getDocs(phoneQ);
          phoneSnap.forEach((d) => {
            if (!newlyFound.find((o) => o.id === d.id)) {
              newlyFound.push({ id: d.id, ...d.data() });
            }
          });
        } catch {
          // Continue searching
        }
      }

      // 3. Search by Shiprocket Shipment ID
      try {
        const srQ = query(collection(db, 'orders'), where('shiprocketShipmentId', '==', queryTerm));
        const srSnap = await getDocs(srQ);
        srSnap.forEach((d) => {
          if (!newlyFound.find((o) => o.id === d.id)) {
            newlyFound.push({ id: d.id, ...d.data() });
          }
        });
      } catch {
        // Continue
      }

      if (newlyFound.length > 0) {
        setOrders((prev) => {
          const merged = [...newlyFound, ...prev.filter((p) => !newlyFound.some((n) => n.id === p.id))];
          return merged;
        });
        setSearchLoading(false);
        return;
      }

      setSearchError(`No order found matching "${queryTerm}". Please check the Order ID, 10-digit mobile number, or Shiprocket Tracking ID.`);
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Search failed. Please check your connection and try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      order.id?.toLowerCase().includes(term) ||
      order.shiprocketShipmentId?.toString().toLowerCase().includes(term) ||
      order.shiprocketAwb?.toString().toLowerCase().includes(term) ||
      order.address?.fullName?.toLowerCase().includes(term) ||
      order.address?.phone?.includes(term) ||
      (order.items || []).some((it) => it.name?.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-900 animate-fade-in-up">
      {/* Top Bar */}
      <div className="bg-[#0A192F] text-white border-b border-slate-800 sticky top-[78px] lg:top-[96px] z-30 shadow-md">
        <div className="container-custom py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (onBackToStore) onBackToStore();
              else window.location.hash = '#store';
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black font-heading tracking-tight text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#F58220]" />
              <span>My Orders & Live Tracking</span>
            </h1>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 bg-[#172A45] hover:bg-[#1F3658] border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#F58220]' : 'text-[#F58220]'} />
            <span className="hidden sm:inline">{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="container-custom pt-8 max-w-4xl px-4">
        {/* Search & Lookup Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8">
          <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchError) setSearchError('');
                }}
                placeholder="Search by Order ID, Tracking ID, Product Name, or Phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={searchLoading || !searchQuery.trim()}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shrink-0 inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {searchLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Find Order</span>
                </>
              )}
            </button>
          </form>

          {searchError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* User Status Banner if guest */}
        {!user && (
          <div className="bg-gradient-to-r from-slate-900 to-[#0A2540] text-white rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Track Orders Across Devices</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sign in with your phone or email to sync and track all your purchases automatically.
                </p>
              </div>
            </div>
            <button
              onClick={() => openAuthModal && openAuthModal()}
              className="bg-accent-500 hover:bg-accent-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-transform hover:scale-105 shrink-0 cursor-pointer shadow"
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Loader className="animate-spin text-primary-500 mx-auto mb-4" size={36} />
            <p className="text-slate-600 font-bold text-sm">Loading your orders & tracking...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-5">
              <Package size={36} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2 font-heading">
              {searchQuery ? 'No matching orders found' : 'No orders found yet'}
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              {searchQuery 
                ? 'Try searching with a different order ID, phone number, or product name.' 
                : 'When you purchase drain clips, solar modules, or bulk combos, live tracking will appear here.'}
            </p>

            <button
              onClick={() => {
                if (onBackToStore) onBackToStore();
                else window.location.hash = '#store';
              }}
              className="inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#E07110] text-slate-950 font-black px-6 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer text-sm"
            >
              <ShoppingBag size={18} />
              <span>Browse Store Catalog</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const sec = order.createdAt?.seconds || order.createdAt?._seconds;
              const date = sec
                ? new Date(sec * 1000).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : typeof order.createdAt === 'string'
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Recently placed';

              const shipmentId = order.shiprocketShipmentId || order.shipment_id || null;
              const awb = order.shiprocketAwb || order.awb || null;
              const trackingCode = shipmentId || awb;

              const isPaid = order.status === 'paid' || order.paymentStatus === 'paid';
              const isShipped = !!trackingCode;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Card Header */}
                  <div className="bg-slate-50/80 border-b border-slate-200 p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                      <div>
                        <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                          Order Date
                        </span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {date}
                        </span>
                      </div>

                      <div>
                        <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                          Total Amount
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          ₹{Number(order.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div>
                        <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                          Payment Status
                        </span>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                            <CheckCircle2 size={12} />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                            <Clock size={12} />
                            {order.status || 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-left md:text-right">
                        <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          Order ID
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-700 break-all">{order.id}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(order.id, order.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Copy Order ID"
                      >
                        {copiedId === order.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items Section */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        Ordered Products
                      </h4>

                      <div className="space-y-3">
                        {(order.items || []).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/50 border border-slate-100"
                          >
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={item.image || '/assets/images/logo/msv_logo_500x300.png'}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-slate-900 text-sm truncate">{item.name}</h5>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span>Qty: <strong>{item.quantity}</strong></span>
                                {item.selectedSize && (
                                  <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                                    Size: {item.selectedSize}
                                  </span>
                                )}
                                {item.price && (
                                  <span className="font-bold text-slate-800">
                                    ₹{Number(item.price).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address Summary */}
                      {order.address && (
                        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                          <p className="font-bold text-slate-700 flex items-center gap-1.5">
                            <MapPin size={13} className="text-primary-500 shrink-0" />
                            Delivery to: {order.address.fullName || userProfile?.fullName || 'Customer'}
                          </p>
                          <p className="text-slate-500 pl-4.5">
                            {[order.address.flat, order.address.area, order.address.city, order.address.state, order.address.pincode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                          {order.address.phone && (
                            <p className="text-slate-500 pl-4.5 flex items-center gap-1">
                              <Phone size={11} />
                              {order.address.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Live Tracking Card */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4.5 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`p-2 rounded-xl ${isShipped ? 'bg-blue-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                            <Truck size={18} />
                          </div>
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Shipment Status
                            </span>
                            <span className="font-bold text-sm text-slate-900">
                              {order.shiprocketStatus 
                                ? order.shiprocketStatus.toUpperCase() 
                                : isShipped 
                                ? 'Shipment Generated' 
                                : 'Processing Order'}
                            </span>
                          </div>
                        </div>

                        {trackingCode ? (
                          <div className="bg-white rounded-xl p-3 border border-slate-200 mb-3">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Shiprocket ID / AWB
                            </span>
                            <span className="font-mono font-extrabold text-sm text-blue-700 break-all">
                              {trackingCode}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 leading-relaxed mb-3">
                            Your order is paid and currently queued for dispatch. Shiprocket courier tracking ID will appear here once assigned.
                          </p>
                        )}
                      </div>

                      {trackingCode ? (
                        <a
                          href={`https://shiprocket.co/tracking/${trackingCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all"
                        >
                          <span>Track Live on Shiprocket</span>
                          <ExternalLink size={13} />
                        </a>
                      ) : (
                        <button
                          onClick={handleRefresh}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                        >
                          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                          <span>Check Shipping Update</span>
                        </button>
                      )}
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
