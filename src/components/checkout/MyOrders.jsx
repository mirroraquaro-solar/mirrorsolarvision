import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ShoppingBag, 
  Package, 
  Loader, 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Check, 
  Copy, 
  MapPin, 
  Users, 
  MessageCircle, 
  Share2, 
  ChevronRight, 
  ShieldCheck, 
  Headphones, 
  Star, 
  Send, 
  X, 
  AlertCircle,
  Truck,
  ExternalLink,
  Activity
} from 'lucide-react';
import { 
  fetchLiveShiprocketTracking, 
  parseShiprocketTrackingMilestone,
  ADMIN_WHATSAPP,
  BUSINESS_PHONE
} from '../../services/notificationService';

export default function MyOrders({ onBackToStore, onBackToHome }) {
  const { currentUser: user, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [shareNotification, setShareNotification] = useState(null);

  // Live Shiprocket Tracking Modal State
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingModalLoading, setTrackingModalLoading] = useState(false);
  const [trackingModalData, setTrackingModalData] = useState(null);
  const [trackingModalError, setTrackingModalError] = useState('');

  // Optional Review Modal State for Bookers
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerCity, setReviewerCity] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("msv_submitted_reviews") || "{}");
    } catch {
      return {};
    }
  });

  const handleOpenReviewModal = (order, item) => {
    const defaultName = order?.address?.fullName || userProfile?.fullName || user?.displayName || "Customer";
    const defaultCity = order?.address?.city ? (order.address.city + ", " + (order.address.state || "AP")) : "Andhra Pradesh";
    setReviewModalOrder(order);
    setReviewModalItem(item || (order?.items && order.items[0]) || {});
    setReviewRating(5);
    setReviewHoverRating(0);
    setReviewTitle("");
    setReviewComment("");
    setReviewerName(defaultName !== "Customer" ? defaultName : "");
    setReviewerCity(defaultCity);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOrder(null);
    setReviewModalItem(null);
    setIsSubmittingReview(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalOrder || isSubmittingReview) return;
    setIsSubmittingReview(true);
    const orderKey = reviewModalOrder.bookingId || reviewModalOrder.id;
    const reviewData = {
      orderId: reviewModalOrder.id || orderKey,
      bookingId: orderKey,
      productId: reviewModalItem?.productId || reviewModalItem?.id || "msv-drain-clips",
      productName: reviewModalItem?.name || "MSV Heavy-Duty Drain Clips",
      variantLabel: reviewModalItem?.variantLabel || "",
      rating: Number(reviewRating) || 5,
      title: reviewTitle.trim() || "Verified Order Review",
      comment: reviewComment.trim() || "High quality solar hardware, fast shipping, and excellent support.",
      name: reviewerName.trim() || reviewModalOrder?.address?.fullName || "Verified Buyer",
      location: reviewerCity.trim() || (reviewModalOrder?.address?.city ? (reviewModalOrder.address.city + ", AP") : "Andhra Pradesh"),
      verified: true,
      verifiedBadge: "Verified Order Buyer",
      date: "Just now",
      source: "my_orders",
      createdAt: new Date().toISOString()
    };
    try {
      if (db) {
        await addDoc(collection(db, "product_reviews"), {
          ...reviewData,
          serverCreatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn("Firestore review save warning:", err);
    }
    try {
      const stored = JSON.parse(localStorage.getItem("msv_submitted_reviews") || "{}");
      stored[orderKey] = reviewData;
      localStorage.setItem("msv_submitted_reviews", JSON.stringify(stored));
      setSubmittedReviews(stored);
      const allReviewsList = JSON.parse(localStorage.getItem("msv_custom_reviews_list") || "[]");
      localStorage.setItem("msv_custom_reviews_list", JSON.stringify([reviewData, ...allReviewsList]));
    } catch (localErr) {
      console.warn("localStorage save warning:", localErr);
    }
    setIsSubmittingReview(false);
    handleCloseReviewModal();
  };

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

      // 3. Asynchronously sync live real-time Shiprocket courier updates for active/undelivered orders
      (async () => {
        for (const ord of fetchedOrders) {
          const raw = (ord.shiprocketStatus || ord.status || '').toString().toUpperCase();
          const lookupKey = ord.shiprocketAwb || ord.shiprocketShipmentId || ord.bookingId;
          if (lookupKey && !raw.includes('DELIVERED')) {
            try {
              const live = await fetchLiveShiprocketTracking(lookupKey, {
                bookingId: ord.bookingId || ord.id,
                orderId: ord.id
              });
              if (live && live.normalizedStatus && live.normalizedStatus !== ord.shiprocketStatus) {
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === ord.id
                      ? {
                          ...o,
                          shiprocketStatus: live.normalizedStatus,
                          shiprocketRawStatus: live.rawStatus || o.shiprocketRawStatus,
                          shiprocketStatusCode: live.statusCode || o.shiprocketStatusCode,
                          shiprocketAwb: live.awb || o.shiprocketAwb,
                          courierName: live.courierName || o.courierName,
                          deliveredDate: live.deliveredDate || o.deliveredDate,
                          estimatedDelivery: live.estimatedDelivery || o.estimatedDelivery,
                          shiprocketActivities: live.activities?.length ? live.activities : o.shiprocketActivities,
                          shiprocketTrackUrl: live.trackUrl || o.shiprocketTrackUrl
                        }
                      : o
                  )
                );
              }
            } catch (err) {
              console.warn('Background tracking sync error:', err);
            }
          }
        }
      })();
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const handleOpenTrackingModal = async (order) => {
    setTrackingModalOrder(order);
    setTrackingModalLoading(true);
    setTrackingModalError('');
    setTrackingModalData(null);

    const lookupKey = order.shiprocketAwb || order.shiprocketShipmentId || order.bookingId || order.id;
    try {
      const live = await fetchLiveShiprocketTracking(lookupKey, {
        bookingId: order.bookingId || order.id,
        orderId: order.firestoreOrderId || order.id
      });

      if (live && live.success) {
        setTrackingModalData(live);
        const updatedOrder = {
          ...order,
          shiprocketStatus: live.normalizedStatus || order.shiprocketStatus,
          shiprocketRawStatus: live.rawStatus || order.shiprocketRawStatus,
          shiprocketStatusCode: live.statusCode || order.shiprocketStatusCode,
          shiprocketAwb: live.awb || order.shiprocketAwb,
          courierName: live.courierName || order.courierName,
          deliveredDate: live.deliveredDate || order.deliveredDate,
          estimatedDelivery: live.estimatedDelivery || order.estimatedDelivery,
          shiprocketActivities: live.activities?.length ? live.activities : order.shiprocketActivities,
          shiprocketTrackUrl: live.trackUrl || order.shiprocketTrackUrl
        };
        setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));
        setTrackingModalOrder(updatedOrder);

        try {
          const local = JSON.parse(localStorage.getItem('msv_recent_orders') || '[]');
          const updatedLocal = local.map((loc) =>
            loc.id === order.id || loc.bookingId === order.bookingId ? { ...loc, ...updatedOrder } : loc
          );
          localStorage.setItem('msv_recent_orders', JSON.stringify(updatedLocal));
        } catch (e) {
          console.warn('localStorage sync warning:', e);
        }
      } else {
        setTrackingModalData({
          normalizedStatus: order.shiprocketStatus || 'PROCESSING',
          rawStatus: order.shiprocketRawStatus || 'Order Placed & Verified',
          courierName: order.courierName || 'Shiprocket Partner Courier',
          awb: order.shiprocketAwb || order.shiprocketShipmentId || lookupKey,
          deliveredDate: order.deliveredDate,
          estimatedDelivery: order.estimatedDelivery,
          activities: order.shiprocketActivities || [],
          trackUrl: `https://shiprocket.co/tracking/${order.shiprocketAwb || order.shiprocketShipmentId || lookupKey}`
        });
      }
    } catch (err) {
      console.warn('Tracking fetch error:', err);
      setTrackingModalError('Could not fetch live tracking from courier API.');
    } finally {
      setTrackingModalLoading(false);
    }
  };

  const handleCloseTrackingModal = () => {
    setTrackingModalOrder(null);
    setTrackingModalData(null);
    setTrackingModalError('');
    setTrackingModalLoading(false);
  };

  const handleSearchOrder = async (e) => {
    e?.preventDefault();
    const queryTerm = searchQuery.trim();
    if (!queryTerm) return;

    setSearchLoading(true);
    setSearchError('');

    try {
      const cleanDigits = queryTerm.replace(/[^0-9]/g, '');
      const lowerTerm = queryTerm.toLowerCase();

      // Check if it's already in loaded orders
      let found = orders.find(
        (o) => 
          o.bookingId?.toLowerCase() === lowerTerm ||
          o.id?.toLowerCase() === lowerTerm ||
          o.firestoreOrderId?.toLowerCase() === lowerTerm ||
          o.shiprocketShipmentId?.toString() === queryTerm ||
          o.shiprocketAwb?.toString() === queryTerm ||
          o.razorpayOrderId?.toLowerCase() === lowerTerm ||
          (cleanDigits.length >= 10 && (
            o.customerPhone === cleanDigits || 
            o.address?.phone?.replace(/[^0-9]/g, '') === cleanDigits
          ))
      );

      if (found) {
        setSearchLoading(false);
        return;
      }

      let newlyFound = [];

      // 1. Search in localStorage 'msv_recent_orders'
      try {
        const local = JSON.parse(localStorage.getItem('msv_recent_orders') || '[]');
        for (const loc of local) {
          const locDigits = (loc.address?.phone || loc.customerPhone || '').replace(/[^0-9]/g, '');
          if (
            loc.id?.toLowerCase() === lowerTerm ||
            loc.bookingId?.toLowerCase() === lowerTerm ||
            loc.firestoreOrderId?.toLowerCase() === lowerTerm ||
            loc.shiprocketShipmentId?.toString() === queryTerm ||
            loc.shiprocketAwb?.toString() === queryTerm ||
            (cleanDigits.length >= 10 && locDigits.includes(cleanDigits))
          ) {
            if (!newlyFound.some((n) => n.id === loc.id)) {
              newlyFound.push(loc);
            }
          }
        }
      } catch (localErr) {
        console.warn('LocalStorage search error:', localErr);
      }

      // 2. Search by doc ID in root 'orders'
      if (db) {
        try {
          const rootDocRef = doc(db, 'orders', queryTerm);
          const rootSnap = await getDoc(rootDocRef);
          if (rootSnap.exists()) {
            const data = { id: rootSnap.id, ...rootSnap.data() };
            if (!newlyFound.some((n) => n.id === data.id)) {
              newlyFound.push(data);
            }
          }
        } catch {
          // Continue searching other criteria
        }

        // 3. Search by bookingId in root 'orders'
        try {
          const bookingQ = query(collection(db, 'orders'), where('bookingId', '==', queryTerm));
          const bookingSnap = await getDocs(bookingQ);
          bookingSnap.forEach((d) => {
            const data = { id: d.id, ...d.data() };
            if (!newlyFound.some((n) => n.id === data.id)) {
              newlyFound.push(data);
            }
          });
        } catch {
          // Continue
        }

        // 4. Search by phone number in root 'orders' if 10 digits
        if (cleanDigits.length >= 10) {
          try {
            const phoneQ = query(collection(db, 'orders'), where('customerPhone', '==', cleanDigits));
            const phoneSnap = await getDocs(phoneQ);
            phoneSnap.forEach((d) => {
              const data = { id: d.id, ...d.data() };
              if (!newlyFound.some((n) => n.id === data.id)) {
                newlyFound.push(data);
              }
            });
          } catch {
            // Continue
          }
        }

        // 5. Search by Shiprocket Shipment ID
        try {
          const srQ = query(collection(db, 'orders'), where('shiprocketShipmentId', '==', queryTerm));
          const srSnap = await getDocs(srQ);
          srSnap.forEach((d) => {
            const data = { id: d.id, ...d.data() };
            if (!newlyFound.some((n) => n.id === data.id)) {
              newlyFound.push(data);
            }
          });
        } catch {
          // Continue
        }

        // 6. Search by Shiprocket AWB
        try {
          const awbQ = query(collection(db, 'orders'), where('shiprocketAwb', '==', queryTerm));
          const awbSnap = await getDocs(awbQ);
          awbSnap.forEach((d) => {
            const data = { id: d.id, ...d.data() };
            if (!newlyFound.some((n) => n.id === data.id)) {
              newlyFound.push(data);
            }
          });
        } catch {
          // Continue
        }
      }

      if (newlyFound.length > 0) {
        setOrders((prev) => {
          const merged = [...newlyFound, ...prev.filter((p) => !newlyFound.some((n) => n.id === p.id))];
          return merged;
        });
        setSearchLoading(false);
        return;
      }

      setSearchError(`No order found matching "${queryTerm}". Please verify the Booking ID (e.g. MSV-...), 10-digit phone number, or Courier AWB.`);
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Search failed. Please check your connection and try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareProduct = (product, order) => {
    const prodName = product?.name || 'MSV Solar Drain Clips';
    const prodPrice = product?.price || order?.amount || 300;
    const shareText = `☀️ Check out *${prodName}* from Mirror Solar Vision!\n⭐ 5.0 Rating (2,840+ Customer Reviews) • 10,000+ Units Sold Across AP & India!\n💰 Price: ₹${Number(prodPrice).toLocaleString('en-IN')}\nPrevents sludge build-up & restores 10-15% solar generation!\n🔗 Order Online: https://mirrorsolarvision.com/#store\n📞 Support: ${BUSINESS_PHONE}`;

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
              else if (onBackToHome) onBackToHome();
              else window.location.hash = '#store';
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800 hover:text-primary-600 transition-colors cursor-pointer uppercase tracking-tight"
          >
            <ArrowLeft size={18} />
            <span>ORDER DETAILS & TRACKING</span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hello Mirror Solar Vision, I need help with my order tracking.')}`}
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
              const milestoneInfo = parseShiprocketTrackingMilestone(order);
              const currentMilestoneIdx = milestoneInfo.stageIndex;
              const progressPercent = milestoneInfo.progressPercent;
              const tooltipLabel = milestoneInfo.tooltipLabel;
              const tooltipPosition = milestoneInfo.tooltipPosition;
              const statusHeadline = milestoneInfo.headline;

              const shippedDateObj = new Date(orderDateObj.getTime() + 2 * 24 * 60 * 60 * 1000);
              const shippedDateStr = formatShortDate(shippedDateObj);

              const outForDeliveryDateObj = new Date(orderDateObj.getTime() + 5 * 24 * 60 * 60 * 1000);
              const outForDeliveryDateStr = formatShortDate(outForDeliveryDateObj);

              const defaultDeliveryDateObj = new Date(orderDateObj.getTime() + 6 * 24 * 60 * 60 * 1000);
              let deliveryDateStr = formatShortDate(defaultDeliveryDateObj);
              let estimatedDeliveryHeadline = formatDeliveryDay(defaultDeliveryDateObj);

              if (order.deliveredDate) {
                try {
                  const d = new Date(order.deliveredDate);
                  if (!isNaN(d.getTime())) {
                    deliveryDateStr = formatShortDate(d);
                    estimatedDeliveryHeadline = formatDeliveryDay(d);
                  }
                } catch {}
              } else if (order.estimatedDelivery) {
                try {
                  const d = new Date(order.estimatedDelivery);
                  if (!isNaN(d.getTime())) {
                    deliveryDateStr = formatShortDate(d);
                    estimatedDeliveryHeadline = formatDeliveryDay(d);
                  }
                } catch {}
              }

              const shipmentId = order.shiprocketShipmentId || order.shipment_id || null;
              const awb = order.shiprocketAwb || order.awb || null;
              const trackingCode = awb || shipmentId;
              const bookingId = order.bookingId || order.firestoreOrderId || order.id || 'MSV-ORD';
              const orderKey = order.bookingId || order.firestoreOrderId || order.id || `ORD-${order.id}`;
              const isReviewed = !!submittedReviews[orderKey];
              const courierName = order.courierName || 'Shiprocket Partner';

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
                  label: milestoneInfo.isDelivered ? 'Delivered' : 'Delivery',
                  date: deliveryDateStr,
                }
              ];

              const items = Array.isArray(order.items) ? order.items : [];
              const firstItem = items.length > 0 ? items[0] : null;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  {/* 1. PRODUCT DETAILS HEADER */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-200 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={firstItem?.image || '/assets/images/001.png'}
                          alt={firstItem?.name || 'Product'}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-mono font-bold">
                          <span>Order #{bookingId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bookingId, order.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                            title="Copy Order / Booking ID"
                          >
                            {copiedId === order.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                          <ChevronRight size={15} className="text-slate-400 shrink-0" />
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-base truncate mt-0.5">
                          {firstItem?.name || 'MSV Solar Drain Clips'}
                        </h4>

                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                          {firstItem?.selectedSize ? `Size: ${firstItem.selectedSize} • ` : 'Standard Size • '}Prepaid (₹{Number(order.amount || 0).toLocaleString('en-IN')})
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            All issue easy returns • 100% Genuine
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShareProduct(firstItem, order)}
                      className="inline-flex items-center justify-center gap-1.5 bg-[#E7F8F0] hover:bg-[#D5F3E4] text-[#075E54] border border-[#25D366]/50 font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer self-start sm:self-auto w-full sm:w-auto"
                      title="Share Product Details on WhatsApp"
                    >
                      <MessageCircle size={14} className="text-[#25D366] fill-[#25D366]" />
                      <Share2 size={12} className="text-[#075E54]" />
                      <span>Share Product</span>
                    </button>
                  </div>

                  {/* 2. STATUS & DELIVERY ESTIMATE BANNER */}
                  <div className="px-4 sm:px-6 pt-5 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 relative ${
                            milestoneInfo.isDelivered
                              ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                              : milestoneInfo.isOutForDelivery
                              ? 'bg-indigo-100 border border-indigo-300 text-indigo-700'
                              : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                          }`}
                        >
                          {milestoneInfo.isDelivered ? (
                            <Check size={22} className="text-emerald-600 stroke-[3]" />
                          ) : (
                            <Package size={20} className="text-amber-500" />
                          )}
                          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check size={9} strokeWidth={3} />
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-lg font-black text-slate-900 font-heading">
                              {statusHeadline}
                            </h3>
                            <span className={`text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full border ${milestoneInfo.badgeColor}`}>
                              {milestoneInfo.badge}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
                            {milestoneInfo.isDelivered ? (
                              <span className="text-emerald-700 font-extrabold">Package delivered successfully on {deliveryDateStr}</span>
                            ) : (
                              <>
                                Delivery by <span className="text-slate-800">{estimatedDeliveryHeadline}</span>
                                {trackingCode && <span className="text-slate-400 font-normal"> • via {courierName}</span>}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {trackingCode && (
                        <button
                          onClick={() => handleOpenTrackingModal(order)}
                          className="hidden sm:inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-extrabold py-1.5 px-3 rounded-xl transition shadow-xs cursor-pointer shrink-0"
                          title="View live courier tracking checkpoints"
                        >
                          <Truck size={13} className="text-blue-600" />
                          <span>Live Tracking</span>
                          <ExternalLink size={11} className="text-blue-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. HORIZONTAL VISUAL STEPPER WITH FLOATING TOOLTIP */}
                  <div className="px-3 sm:px-6 pt-4 pb-5">
                    <div className="relative mb-3 flex items-center" style={{ minHeight: '36px' }}>
                      <div
                        className="transition-all duration-500 ease-out"
                        style={{
                          marginLeft: tooltipPosition,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <div className={`text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap relative border ${
                          milestoneInfo.isDelivered ? 'bg-emerald-800 border-emerald-700' : 'bg-[#1F2937] border-slate-700'
                        }`}>
                          <span className="text-xs sm:text-sm">{milestoneInfo.isDelivered ? '✅' : '📦'}</span>
                          <span>{tooltipLabel}</span>
                          <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 ${
                            milestoneInfo.isDelivered ? 'border-t-emerald-800' : 'border-t-[#1F2937]'
                          }`}></div>
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
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-300 text-slate-500'
                              } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                            >
                              {isCompleted ? (
                                <Check size={11} strokeWidth={3} />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
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
                              className={`block text-[9px] sm:text-[11px] md:text-xs font-bold leading-tight ${
                                isPassedOrActive ? (msIdx === 3 && milestoneInfo.isDelivered ? 'text-emerald-700 font-extrabold' : 'text-slate-900') : 'text-slate-400'
                              }`}
                            >
                              {ms.label}
                            </span>
                            <span
                              className={`block text-[8px] sm:text-[10px] md:text-[11px] leading-tight ${
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
                  <div className="px-3 sm:px-6 pb-4">
                    <div className="bg-[#EEF4FF] border border-[#D5E3FF] rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs text-[#204484] gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                          <Users size={12} />
                        </div>
                        <span className="font-bold text-[11px] sm:text-xs truncate">
                          <strong className="font-extrabold text-[#0E2F6C]">10,000+ Customers</strong> rated 5★
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 shrink-0">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="font-black text-[10px] sm:text-[11px] text-slate-800">5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. ADDRESS & ACTION BAR */}
                  <div className="px-4 sm:px-6 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {order.address && (
                      <div className="text-xs text-slate-600 space-y-0.5 max-w-sm">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin size={12} className="text-primary-600 shrink-0" />
                          <span>Delivery Address:</span>
                        </p>
                        <p className="text-slate-500 pl-4 truncate text-[11px] sm:text-xs">
                          {[order.address.fullName, order.address.flat, order.address.city, order.address.pincode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                      {trackingCode && (
                        <button
                          onClick={() => handleOpenTrackingModal(order)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 sm:py-2 px-3 rounded-xl transition-colors cursor-pointer shadow-xs"
                          title="View live Shiprocket courier timeline"
                        >
                          <Truck size={13} />
                          <span>Live Track</span>
                        </button>
                      )}

                      <button
                        onClick={handleRefresh}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold py-2.5 sm:py-2 px-3 rounded-xl transition-colors cursor-pointer"
                        title="Refresh Tracking Status"
                      >
                        <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                      </button>

                      <button
                        onClick={() => handleShareProduct(firstItem, order)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs py-2.5 sm:py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer"
                        title="Share Product Details on WhatsApp"
                      >
                        <MessageCircle size={14} className="text-slate-950 fill-slate-950" />
                        <Share2 size={12} className="text-slate-950" />
                        <span>Share</span>
                      </button>

                      {/* Product Review Button for Bookers */}
                      {isReviewed ? (
                        <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold py-2.5 sm:py-2 px-3 rounded-xl">
                          <Star size={12} className="fill-emerald-500 text-emerald-500" />
                          <span>Reviewed ⭐⭐⭐⭐⭐</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenReviewModal(order, firstItem)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs py-2.5 sm:py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs"
                          title="Rate this product"
                        >
                          <Star size={13} className="fill-amber-400 text-amber-500" />
                          <span>Rate Product</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SHIPROCKET LIVE COURIER TRACKING MODAL */}
        {trackingModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 text-left max-h-[90vh] overflow-y-auto">
              <button
                onClick={handleCloseTrackingModal}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-600 text-white shrink-0 shadow-md">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-xl font-black text-slate-900 font-heading">
                      Live Courier Tracking
                    </h3>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                      Shiprocket
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Order #{trackingModalOrder.bookingId || trackingModalOrder.id}
                  </p>
                </div>
              </div>

              {trackingModalLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader size={30} className="animate-spin text-blue-600" />
                  <p className="text-xs font-bold">Contacting Shiprocket Courier Network...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trackingModalError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                      <AlertCircle size={14} className="text-amber-600 shrink-0" />
                      <span>{trackingModalError}</span>
                    </div>
                  )}

                  {/* Status Banner */}
                  {(() => {
                    const mInfo = parseShiprocketTrackingMilestone(trackingModalOrder);
                    return (
                      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                        mInfo.isDelivered 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                          : mInfo.isOutForDelivery 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                          : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider opacity-70">Current Status</p>
                          <h4 className="text-base sm:text-lg font-black mt-0.5">{mInfo.headline}</h4>
                          <p className="text-xs font-semibold opacity-90 mt-0.5">
                            {trackingModalData?.rawStatus || trackingModalOrder.shiprocketRawStatus || 'In Transit'}
                          </p>
                        </div>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${mInfo.badgeColor}`}>
                          {mInfo.badge}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Courier & AWB Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Courier Partner</span>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {trackingModalData?.courierName || trackingModalOrder.courierName || 'Shiprocket Partner'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Tracking AWB Code</span>
                        <p className="text-xs font-mono font-black text-slate-900 mt-0.5 truncate">
                          {trackingModalData?.awb || trackingModalOrder.shiprocketAwb || trackingModalOrder.shiprocketShipmentId || 'MSV-TRACK'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(trackingModalData?.awb || trackingModalOrder.shiprocketAwb || trackingModalOrder.shiprocketShipmentId, 'awb-code')}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
                        title="Copy AWB Code"
                      >
                        {copiedId === 'awb-code' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Live Scan Timeline Activities */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={14} className="text-blue-600" />
                        <span>Live Courier Scans</span>
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">Real-Time Sync</span>
                    </div>

                    {trackingModalData?.activities && trackingModalData.activities.length > 0 ? (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 max-h-56 overflow-y-auto">
                        {trackingModalData.activities.map((act, idx) => (
                          <div key={idx} className="flex items-start gap-3 relative">
                            {idx < trackingModalData.activities.length - 1 && (
                              <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-slate-200 -mb-3"></div>
                            )}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              idx === 0 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-300 text-slate-600'
                            }`}>
                              <Check size={10} strokeWidth={3} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-extrabold text-slate-900 leading-snug">
                                {act.activity || act.status || 'Status Update'}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                                {act.location && <span>📍 {act.location}</span>}
                                {act.date && <span>🕒 {act.date}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-1">
                        <p className="text-xs font-bold text-slate-700">Package Dispatched & Moving in Network</p>
                        <p className="text-[11px] text-slate-500">
                          Detailed hub-by-hub scans are registered automatically as courier agents scan the barcode.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* External Shiprocket Link and Refresh Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenTrackingModal(trackingModalOrder)}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Refresh Live Scans</span>
                    </button>

                    <a
                      href={
                        trackingModalData?.trackUrl ||
                        `https://shiprocket.co/tracking/${trackingModalOrder.shiprocketAwb || trackingModalOrder.shiprocketShipmentId || trackingModalOrder.bookingId}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-95 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-sm transition cursor-pointer"
                    >
                      <span>Open Official Shiprocket Portal</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* REVIEW MODAL */}
        {reviewModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-4 text-left">
              <button
                onClick={handleCloseReviewModal}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Star size={20} className="fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-heading">
                    Rate & Review Product
                  </h3>
                  <p className="text-xs text-slate-500">
                    Order #{reviewModalOrder.bookingId || reviewModalOrder.id} • {reviewModalItem?.name || "MSV Solar Product"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 pt-1">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">Select Rating:</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={
                            (reviewHoverRating || reviewRating) >= star
                              ? "fill-amber-400 text-amber-400 transition-colors"
                              : "text-slate-300 transition-colors"
                          }
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-amber-700 ml-1.5">
                      {reviewRating === 5 ? "5.0 (Excellent)" : reviewRating === 4 ? "4.0 (Very Good)" : reviewRating === 3 ? "3.0 (Good)" : (reviewRating + ".0")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {["⚡ Fast Delivery", "💯 Top UV Quality", "👍 Easy Snap-on", "🛡️ Heavy-Duty", "💧 Prevents Sludge"].map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!reviewComment.includes(tag)) {
                          setReviewComment(prev => prev ? (prev + " • " + tag) : tag);
                        }
                      }}
                      className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g., Solved panel sludge issues on our rooftop!"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Review
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your feedback about the product durability, fit, and delivery speed..."
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseReviewModal}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{isSubmittingReview ? "Submitting..." : "Submit Review"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}