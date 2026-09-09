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
  Users,
  Calendar,
  MessageSquare,
  MessageCircle,
  Share2,
  ChevronRight,
  ShieldCheck,
  Headphones,
  Star
} from 'lucide-react';
import { BUSINESS_CONTACT } from '../../data/bulkComboData';

export default function MyOrders({ onBackToStore }) {
  const { currentUser: user, userProfile, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [shareNotification, setShareNotification] = useState(null);

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
          o.bookingId?.toLowerCase() === queryTerm.toLowerCase() ||
          o.id?.toLowerCase() === queryTerm.toLowerCase() ||
          o.shiprocketShipmentId?.toString() === queryTerm ||
          o.shiprocketAwb?.toString() === queryTerm ||
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

      setSearchError(`No order found matching "${queryTerm}". Please check the Booking ID, 10-digit mobile number, or Tracking ID.`);
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

  const handleShareProduct = (product, order) => {
    const prodName = product?.name || 'MSV Solar Drain Clips';
    const prodPrice = product?.price || order?.amount || 300;
    const shareText = `☀️ Check out *${prodName}* from Mirror Solar Vision!\n⭐ 5.0 Rating (2,840+ Customer Reviews) • 10,000+ Units Sold Across AP & India!\n💰 Price: ₹${Number(prodPrice).toLocaleString('en-IN')}\nPrevents sludge build-up & restores 10-15% solar generation!\n🔗 Order Online: https://mirrorsolarvision.com/#store\n📞 Support: +91 86391 03947`;

    if (navigator.share) {
      navigator.share({
        title: prodName,
        text: shareText,
        url: 'https://mirrorsolarvision.com/#store'
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
    setShareNotification(`Product details shared!`);
    setTimeout(() => setShareNotification(null), 3000);
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      order.bookingId?.toLowerCase().includes(term) ||
      order.id?.toLowerCase().includes(term) ||
      order.shiprocketShipmentId?.toString().toLowerCase().includes(term) ||
      order.shiprocketAwb?.toString().toLowerCase().includes(term) ||
      order.address?.fullName?.toLowerCase().includes(term) ||
      order.address?.phone?.includes(term) ||
      (order.items || []).some((it) => it.name?.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-slate-100/70 min-h-screen pb-24 text-slate-900 animate-fade-in-up">
      {/* Top Header Bar — Refined Mobile & Desktop */}
      <div className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="container-custom py-3 flex items-center justify-between gap-4 max-w-4xl">
          <button
            onClick={() => {
              if (onBackToStore) onBackToStore();
              else window.location.hash = '#store';
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800 hover:text-primary-600 transition-colors cursor-pointer uppercase tracking-tight"
          >
            <ArrowLeft size={18} />
            <span>ORDER DETAILS</span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/918639103947?text=${encodeURIComponent('Hello Mirror Solar Vision, I need help with my order tracking.')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#7828C8] hover:text-[#5B1F99] transition cursor-pointer uppercase tracking-wider"
            >
              <Headphones size={16} />
              <span>HELP</span>
            </a>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-primary-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {shareNotification && (
        <div className="fixed top-16 right-4 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in-up">
          <Check size={14} className="text-emerald-400" />
          <span>{shareNotification}</span>
        </div>
      )}

      <div className="container-custom pt-6 max-w-3xl px-3 sm:px-4">
        {/* Search & Lookup Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 mb-6">
          <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchError) setSearchError('');
                }}
                placeholder="Search Booking ID (e.g. MSV-244545), Phone, or Tracking ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
              className="bg-[#0A2540] hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {searchLoading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
              <span>Find Order</span>
            </button>
          </form>

          {searchError && (
            <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-red-500" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <Loader className="animate-spin text-primary-500 mx-auto mb-4" size={36} />
            <p className="text-slate-600 font-bold text-sm">Loading your orders & live tracking...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Package size={30} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1 font-heading">
              {searchQuery ? 'No matching orders found' : 'No orders found'}
            </h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mb-5">
              {searchQuery 
                ? 'Check the Booking ID or 10-digit phone number entered.' 
                : 'Your booked orders and live Shiprocket tracking timeline will appear here.'}
            </p>

            <button
              onClick={() => {
                if (onBackToStore) onBackToStore();
                else window.location.hash = '#store';
              }}
              className="inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#E07110] text-slate-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-xs"
            >
              <ShoppingBag size={15} />
              <span>Browse Products</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              let orderDateObj = new Date();
              try {
                const sec = order.createdAt?.seconds || order.createdAt?._seconds;
                if (sec) {
                  orderDateObj = new Date(sec * 1000);
                } else if (order.createdAt) {
                  const parsed = new Date(order.createdAt);
                  if (!isNaN(parsed.getTime())) orderDateObj = parsed;
                }
              } catch {
                orderDateObj = new Date();
              }
              
              const formatShortDate = (d) => {
                try {
                  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                } catch {
                  return 'Today';
                }
              };

              const formatDeliveryDay = (d) => {
                try {
                  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                } catch {
                  return 'Soon';
                }
              };

              const orderedDateStr = formatShortDate(orderDateObj);
              
              const shippedDateObj = new Date(orderDateObj.getTime() + 2 * 24 * 60 * 60 * 1000);
              const shippedDateStr = formatShortDate(shippedDateObj);

              const outForDeliveryDateObj = new Date(orderDateObj.getTime() + 5 * 24 * 60 * 60 * 1000);
              const outForDeliveryDateStr = formatShortDate(outForDeliveryDateObj);

              const deliveryDateObj = new Date(orderDateObj.getTime() + 6 * 24 * 60 * 60 * 1000);
              const deliveryDateStr = formatShortDate(deliveryDateObj);
              const estimatedDeliveryHeadline = formatDeliveryDay(deliveryDateObj);

              const shipmentId = order.shiprocketShipmentId || order.shipment_id || null;
              const awb = order.shiprocketAwb || order.awb || null;
              const trackingCode = shipmentId || awb;
              const bookingId = order.bookingId || order.firestoreOrderId || order.id || 'MSV-ORD';

              const rawStatus = (order.shiprocketStatus || order.status || 'PAID').toString().toUpperCase();

              const milestones = [
                {
                  key: 'ordered',
                  label: 'Ordered',
                  date: orderedDateStr,
                },
                {
                  key: 'shipped',
                  label: 'Shipped',
                  date: shippedDateStr,
                },
                {
                  key: 'out',
                  label: 'Out for Delivery',
                  date: outForDeliveryDateStr,
                },
                {
                  key: 'delivered',
                  label: 'Delivery',
                  date: deliveryDateStr,
                }
              ];

              let currentMilestoneIdx = 0;
              let tooltipLabel = 'Order Packed';
              let tooltipPosition = '12%';
              let progressPercent = 10;
              let statusHeadline = 'Order Placed';

              if (rawStatus.includes('DELIVERED')) {
                currentMilestoneIdx = 3;
                tooltipLabel = 'Delivered';
                tooltipPosition = '88%';
                progressPercent = 100;
                statusHeadline = 'Delivered to Customer';
              } else if (rawStatus.includes('OUT_FOR_DELIVERY') || rawStatus.includes('OUT FOR DELIVERY')) {
                currentMilestoneIdx = 2;
                tooltipLabel = 'Out for Delivery';
                tooltipPosition = '63%';
                progressPercent = 66;
                statusHeadline = 'Out for Delivery Today';
              } else if (rawStatus.includes('PICKED UP') || rawStatus.includes('SHIPPED') || rawStatus.includes('IN_TRANSIT') || rawStatus.includes('IN TRANSIT') || !!trackingCode) {
                currentMilestoneIdx = 1;
                tooltipLabel = 'Shipped & In Transit';
                tooltipPosition = '38%';
                progressPercent = 33;
                statusHeadline = 'Shipped & In Transit';
              } else {
                currentMilestoneIdx = 0;
                tooltipLabel = 'Order Packed';
                tooltipPosition = '12%';
                progressPercent = 10;
                statusHeadline = 'Order Placed';
              }

              const items = Array.isArray(order.items) ? order.items : [];
              const firstItem = items.length > 0 ? items[0] : null;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  {/* 1. PRODUCT DETAILS HEADER (Exact Layout from Image) */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-white">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-200 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={firstItem?.image || '/assets/images/001.png'}
                          alt={firstItem?.name || 'Product'}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-mono font-bold">
                          <span>Order #{bookingId}</span>
                          <ChevronRight size={15} className="text-slate-400 shrink-0" />
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate mt-0.5">
                          {firstItem?.name || 'MSV Solar Drain Clips'}
                        </h4>

                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {firstItem?.selectedSize ? `Size: ${firstItem.selectedSize} • ` : 'Standard Size • '}Prepaid (₹{Number(order.amount || 0).toLocaleString('en-IN')})
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            All issue easy returns • 100% Genuine
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShareProduct(firstItem, order)}
                      className="inline-flex items-center gap-1.5 bg-[#E7F8F0] hover:bg-[#D5F3E4] text-[#075E54] border border-[#25D366]/50 font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
                      title="Share Product Details on WhatsApp"
                    >
                      <MessageCircle size={14} className="text-[#25D366] fill-[#25D366]" />
                      <Share2 size={12} className="text-[#075E54]" />
                      <span>Share Product</span>
                    </button>
                  </div>

                  {/* 2. STATUS & DELIVERY ESTIMATE BANNER */}
                  <div className="px-4 sm:px-6 pt-5 pb-2">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 relative">
                        <Package size={22} className="text-amber-500" />
                        <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                          <Check size={9} strokeWidth={3} />
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                          {rawStatus.replace('_', ' ')}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
                          Delivery by <span className="text-slate-800">{estimatedDeliveryHeadline}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. HORIZONTAL VISUAL STEPPER WITH FLOATING TOOLTIP */}
                  <div className="px-4 sm:px-6 pt-4 pb-5">
                    <div className="relative mb-3 flex items-center" style={{ minHeight: '36px' }}>
                      <div
                        className="transition-all duration-500 ease-out"
                        style={{
                          marginLeft: tooltipPosition,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <div className="bg-[#1F2937] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap relative border border-slate-700">
                          <span className="text-sm">📦</span>
                          <span>{tooltipLabel}</span>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1F2937]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>
                      <div
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 z-0 transition-all duration-500"
                        style={{ width: `calc(${progressPercent}% - 6px)` }}
                      ></div>
                      {milestones.map((ms, msIdx) => {
                        const isCompleted = msIdx <= currentMilestoneIdx;
                        const isCurrent = msIdx === currentMilestoneIdx;
                        return (
                          <div key={ms.key} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-300 text-slate-500'
                              } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                            >
                              {isCompleted ? (
                                <Check size={12} strokeWidth={3} />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-4 gap-1 mt-3 text-center">
                      {milestones.map((ms, msIdx) => {
                        const isPassedOrActive = msIdx <= currentMilestoneIdx;
                        return (
                          <div key={ms.key} className="space-y-0.5">
                            <span
                              className={`block text-[11px] sm:text-xs font-bold ${
                                isPassedOrActive ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {ms.label}
                            </span>
                            <span
                              className={`block text-[10px] sm:text-[11px] ${
                                isPassedOrActive ? 'text-slate-600 font-semibold' : 'text-slate-400'
                              }`}
                            >
                              {ms.date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. SOCIAL PROOF BANNER */}
                  <div className="px-4 sm:px-6 pb-4">
                    <div className="bg-[#EEF4FF] border border-[#D5E3FF] rounded-2xl p-3 flex items-center justify-between text-xs text-[#204484]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          <Users size={13} />
                        </div>
                        <span className="font-bold">
                          <strong className="font-extrabold text-[#0E2F6C]">10,000+ Customers</strong> rated 5 star for this product
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 shrink-0">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="font-black text-[11px] text-slate-800">5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. WHATSAPP BILL, AWB & ADDRESS SUMMARY */}
                  <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {order.address && (
                      <div className="text-xs text-slate-600 space-y-0.5 max-w-sm">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin size={12} className="text-primary-600" />
                          <span>Delivery Address:</span>
                        </p>
                        <p className="text-slate-500 pl-4 truncate">
                          {[order.address.fullName, order.address.flat, order.address.city, order.address.pincode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {trackingCode && (
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold py-2 px-3 rounded-xl">
                          <Truck size={13} className="text-blue-600" />
                          <span>AWB: {trackingCode}</span>
                        </span>
                      )}

                      <button
                        onClick={handleRefresh}
                        className="inline-flex items-center justify-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl transition-colors cursor-pointer"
                        title="Refresh Tracking Status"
                      >
                        <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                      </button>

                      <button
                        onClick={() => handleShareProduct(firstItem, order)}
                        className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer"
                        title="Share Product Details on WhatsApp"
                      >
                        <MessageCircle size={14} className="text-slate-950 fill-slate-950" />
                        <Share2 size={12} className="text-slate-950" />
                        <span>Share Product</span>
                      </button>
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
