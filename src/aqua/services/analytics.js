/**
 * MIRROR SOLAR VISION & MIRROR AQUA ANALYTICS PIPELINE
 * Hybrid Meta Pixel + Meta Conversions API (CAPI) Integration with Server-Side Deduplication
 * Preserves UTM campaign parameters, captures _fbp/_fbc cookies, and dispatches real website events:
 * 1. ViewContent
 * 2. AddToCart
 * 3. InitiateCheckout
 * 4. Purchase
 * 5. Contact (Leads, Site Surveys, Quotes, WhatsApp Chats)
 */

// Catalog ID Expansion Map for 100% Meta Catalog Match Rate
export const CATALOG_ID_MAP = {
  // 1. MSV Heavy-Duty Drain Clips
  'msv-drain-clips': ['msv-drain-clips', 'MSV-DRAIN-35MM', 'MSV-DRAIN-CLIPS', 'drain-clips', 'solar-drain-clips', 'msv-drain-clip-35mm', 'msv-drain-clips-35mm', 'msv-drain-clips-30mm', 'msv-drain-clips-40mm'],
  'MSV-DRAIN-35MM': ['msv-drain-clips', 'MSV-DRAIN-35MM', 'MSV-DRAIN-CLIPS', 'drain-clips', 'solar-drain-clips', 'msv-drain-clip-35mm', 'msv-drain-clips-35mm'],
  'drain-clips': ['msv-drain-clips', 'MSV-DRAIN-35MM', 'MSV-DRAIN-CLIPS', 'drain-clips', 'solar-drain-clips', 'msv-drain-clip-35mm', 'msv-drain-clips-35mm'],

  // 2. ₹15,000 Bulk Combo
  'bulk-combo-15000': ['bulk-combo-15000', 'installer-bulk-combo', 'msv-bulk-combo', 'MSV-COMBO-15K', 'bulk-combo', 'solar-hardware-combo', 'bulk-combos', 'MSV-BULK-COMBO'],
  'installer-bulk-combo': ['bulk-combo-15000', 'installer-bulk-combo', 'msv-bulk-combo', 'MSV-COMBO-15K', 'bulk-combo', 'solar-hardware-combo', 'MSV-BULK-COMBO'],
  'msv-bulk-combo': ['bulk-combo-15000', 'installer-bulk-combo', 'msv-bulk-combo', 'MSV-COMBO-15K', 'bulk-combo', 'solar-hardware-combo', 'MSV-BULK-COMBO'],
  'MSV-COMBO-15K': ['bulk-combo-15000', 'installer-bulk-combo', 'msv-bulk-combo', 'MSV-COMBO-15K', 'bulk-combo', 'solar-hardware-combo', 'MSV-BULK-COMBO'],
  'bulk-combo': ['bulk-combo-15000', 'installer-bulk-combo', 'msv-bulk-combo', 'MSV-COMBO-15K', 'bulk-combo', 'solar-hardware-combo', 'MSV-BULK-COMBO'],

  // 3. Mirror Aqua 10" PP Spun Filter (120g)
  'ma-prod-001': ['ma-prod-001', 'MA-PP-10-05M', '10-inch-5-micron-pp-spun-filter', '10-inch-pp-spun-filter', 'ma-pp-spun-filter-120g', 'spun-filter', 'pp-filter'],
  'MA-PP-10-05M': ['ma-prod-001', 'MA-PP-10-05M', '10-inch-5-micron-pp-spun-filter', '10-inch-pp-spun-filter', 'ma-pp-spun-filter-120g', 'spun-filter', 'pp-filter'],
  '10-inch-5-micron-pp-spun-filter': ['ma-prod-001', 'MA-PP-10-05M', '10-inch-5-micron-pp-spun-filter', '10-inch-pp-spun-filter', 'ma-pp-spun-filter-120g', 'spun-filter', 'pp-filter'],
  '10-inch-pp-spun-filter': ['ma-prod-001', 'MA-PP-10-05M', '10-inch-5-micron-pp-spun-filter', '10-inch-pp-spun-filter', 'ma-pp-spun-filter-120g', 'spun-filter', 'pp-filter'],
  'ma-pp-spun-filter-120g': ['ma-prod-001', 'MA-PP-10-05M', '10-inch-5-micron-pp-spun-filter', '10-inch-pp-spun-filter', 'ma-pp-spun-filter-120g', 'spun-filter', 'pp-filter'],

  // 4. Mirror Aqua 5-Spun + Wrench Combo
  'ma-prod-002': ['ma-prod-002', 'MA-PP-5PK-WR', '5-spun-filter-pack-with-free-wrench', 'ma-5-spun-free-wrench-combo'],
  'MA-PP-5PK-WR': ['ma-prod-002', 'MA-PP-5PK-WR', '5-spun-filter-pack-with-free-wrench', 'ma-5-spun-free-wrench-combo'],
  '5-spun-filter-pack-with-free-wrench': ['ma-prod-002', 'MA-PP-5PK-WR', '5-spun-filter-pack-with-free-wrench', 'ma-5-spun-free-wrench-combo'],
  'ma-5-spun-free-wrench-combo': ['ma-prod-002', 'MA-PP-5PK-WR', '5-spun-filter-pack-with-free-wrench', 'ma-5-spun-free-wrench-combo']
};

export function getCanonicalCatalogId(rawId) {
  if (!rawId) return 'msv-drain-clips';
  const str = String(rawId).toLowerCase().trim();
  if (str.includes('drain') || str.includes('clip') || str.includes('35mm')) return 'msv-drain-clips';
  if (str.includes('bulk') || str.includes('combo-15') || str.includes('installer')) return 'bulk-combo-15000';
  if (str.includes('ma-prod-001') || str.includes('10-inch') || str.includes('ma-pp-10') || str.includes('spun-filter')) return 'ma-prod-001';
  if (str.includes('ma-prod-002') || str.includes('5-spun') || str.includes('5pk') || str.includes('wrench')) return 'ma-prod-002';
  return rawId;
}

export function expandCatalogContentIds(itemsOrIds) {
  if (!itemsOrIds) return ['msv-drain-clips', 'MSV-DRAIN-35MM', 'drain-clips'];
  const list = Array.isArray(itemsOrIds) ? itemsOrIds : [itemsOrIds];
  const ids = new Set();
  
  for (const item of list) {
    if (!item) continue;
    const rawId = typeof item === 'string' ? item : (item.item_id || item.productId || item.product?.id || item.sku || item.id || '');
    if (!rawId) continue;
    ids.add(rawId);
    
    if (CATALOG_ID_MAP[rawId]) {
      CATALOG_ID_MAP[rawId].forEach(id => ids.add(id));
      continue;
    }
    
    const lower = rawId.toLowerCase();
    if (lower.includes('drain') || lower.includes('clip') || lower.includes('35mm') || lower.includes('30mm') || lower.includes('40mm')) {
      CATALOG_ID_MAP['msv-drain-clips'].forEach(id => ids.add(id));
    } else if (lower.includes('bulk') || lower.includes('combo-15') || lower.includes('installer') || lower.includes('15000')) {
      CATALOG_ID_MAP['bulk-combo-15000'].forEach(id => ids.add(id));
    } else if (lower.includes('ma-prod-001') || lower.includes('10-inch') || lower.includes('ma-pp-10') || lower.includes('120g') || lower.includes('spun-filter')) {
      CATALOG_ID_MAP['ma-prod-001'].forEach(id => ids.add(id));
    } else if (lower.includes('ma-prod-002') || lower.includes('5-spun') || lower.includes('5pk') || lower.includes('wrench') || lower.includes('spanner')) {
      CATALOG_ID_MAP['ma-prod-002'].forEach(id => ids.add(id));
    }
  }
  
  const result = Array.from(ids);
  return result.length > 0 ? result : ['msv-drain-clips', 'MSV-DRAIN-35MM', 'drain-clips'];
}

class AnalyticsService {
  constructor() {
    this.utmParams = this.captureUTMParams();
    this.trackedScrollDepths = new Set();
    this.initScrollListener();
  }

  captureUTMParams() {
    if (typeof window === 'undefined') return {};
    const urlParams = new URLSearchParams(window.location.search);
    const utm = {};
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    keys.forEach(key => {
      const val = urlParams.get(key);
      if (val) utm[key] = val;
    });

    // Persist in session storage and localStorage for complete acquisition journey retention
    if (Object.keys(utm).length > 0) {
      try {
        sessionStorage.setItem('ma_utm_attribution', JSON.stringify(utm));
        localStorage.setItem('ma_first_touch_utm', JSON.stringify({ ...utm, capturedAt: new Date().toISOString() }));
      } catch (e) {}
    } else {
      try {
        const stored = sessionStorage.getItem('ma_utm_attribution') || localStorage.getItem('ma_first_touch_utm');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }

    return utm;
  }

  initScrollListener() {
    if (typeof window === 'undefined') return;
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (scrollHeight <= 0) return;
          
          const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

          if (scrollPercent >= 25 && !this.trackedScrollDepths.has(25)) {
            this.trackedScrollDepths.add(25);
            this.trackEvent('scroll_25', { depth: '25%' });
          }
          if (scrollPercent >= 50 && !this.trackedScrollDepths.has(50)) {
            this.trackedScrollDepths.add(50);
            this.trackEvent('scroll_50', { depth: '50%' });
          }
          if (scrollPercent >= 75 && !this.trackedScrollDepths.has(75)) {
            this.trackedScrollDepths.add(75);
            this.trackEvent('scroll_75', { depth: '75%' });
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  getAttribution() {
    return this.utmParams;
  }

  /**
   * Helper to retrieve cookie value by name
   */
  getCookie(name) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  }

  /**
   * Captures the Meta _fbp cookie (Browser Pixel Cookie)
   */
  getFbp() {
    return this.getCookie('_fbp');
  }

  /**
   * Captures the Meta _fbc cookie or generates from URL fbclid parameter
   */
  getFbc() {
    const cookieFbc = this.getCookie('_fbc');
    if (cookieFbc) return cookieFbc;

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get('fbclid');
      if (fbclid) {
        return `fb.1.${Date.now()}.${fbclid}`;
      }
    }
    return null;
  }

  /**
   * Asynchronous dispatch to Cloud Function trackMetaServerEvent for Server-Side CAPI
   */
  async sendServerCAPI(eventName, eventId, customData = {}, userData = {}) {
    if (typeof window === 'undefined') return;

    try {
      const fbp = this.getFbp();
      const fbc = this.getFbc();

      // Attempt to retrieve stored customer info if not explicitly passed
      let storedCustomer = {};
      try {
        storedCustomer = JSON.parse(localStorage.getItem('kc_customer_info') || '{}');
      } catch (e) {}

      const mergedUserData = {
        email: userData.email || storedCustomer.email || undefined,
        phone: userData.phone || storedCustomer.phone || undefined,
        firstName: userData.firstName || userData.fullName?.split(' ')[0] || storedCustomer.fullName?.split(' ')[0] || undefined,
        lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || storedCustomer.fullName?.split(' ').slice(1).join(' ') || undefined,
        city: userData.city || storedCustomer.city || undefined,
        state: userData.state || storedCustomer.state || undefined,
        pincode: userData.pincode || userData.zip || storedCustomer.pincode || undefined,
        fbp: fbp || userData.fbp || undefined,
        fbc: fbc || userData.fbc || undefined,
        clientUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      };

      const endpoint = 'https://us-central1-mirror-solar-vision.cloudfunctions.net/trackMetaServerEvent';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          eventName,
          eventId,
          eventSourceUrl: window.location.href,
          userData: mergedUserData,
          customData
        })
      }).catch(err => {
        if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
          console.warn('[Analytics] Meta CAPI server ping notice:', err);
        }
      });
    } catch (e) {
      // Non-blocking fail-safe
    }
  }

  trackEvent(eventName, payload = {}) {
    const enrichedPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
      attribution: this.utmParams
    };

    // Console debug for local verification
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.log(`📊 [Mirror Analytics] ${eventName}:`, enrichedPayload);
    }

    // GA4 Integration Bridge (window.gtag)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, enrichedPayload);
    }

    // Meta Pixel & CAPI Hybrid Integration with exact deduplication eventID
    if (typeof window !== 'undefined') {
      // 1. ViewContent
      if (eventName === 'view_item' || eventName === 'ViewContent') {
        const firstItem = payload.items?.[0] || {};
        const eventId = payload.event_id || `vc_${firstItem.item_id || firstItem.productId || 'item'}_${Date.now()}`;
        const contentIds = expandCatalogContentIds(payload.items || [firstItem]);
        const customData = {
          content_type: 'product',
          content_ids: contentIds,
          contents: (payload.items || [firstItem]).map(i => ({
            id: getCanonicalCatalogId(i.item_id || i.productId || i.sku || i.id),
            quantity: Number(i.quantity) || 1,
            item_price: Number(i.price || i.unitPrice || payload.value || 0)
          })),
          content_name: firstItem.item_name || payload.content_name || 'Product Detail',
          content_category: firstItem.item_category || payload.category || 'Solar & Water Purification',
          value: Number(payload.value || firstItem.price || 0),
          currency: payload.currency || 'INR'
        };

        if (window.fbq) {
          window.fbq('track', 'ViewContent', customData, { eventID: eventId });
        }
        this.sendServerCAPI('ViewContent', eventId, customData, payload.customer || payload.userData);
      } 
      // 2. AddToCart
      else if (eventName === 'add_to_cart' || eventName === 'AddToCart') {
        const firstItem = payload.items?.[0] || {};
        const eventId = payload.event_id || `atc_${firstItem.item_id || firstItem.productId || 'item'}_${Date.now()}`;
        const contentIds = expandCatalogContentIds(payload.items || [firstItem]);
        const customData = {
          content_type: 'product',
          content_ids: contentIds,
          contents: (payload.items || [firstItem]).map(i => ({
            id: getCanonicalCatalogId(i.item_id || i.productId || i.sku || i.id),
            quantity: Number(i.quantity) || 1,
            item_price: Number(i.price || i.unitPrice || 0)
          })),
          content_name: firstItem.item_name || payload.content_name,
          value: Number(payload.value || 0),
          currency: payload.currency || 'INR'
        };

        if (window.fbq) {
          window.fbq('track', 'AddToCart', customData, { eventID: eventId });
        }
        this.sendServerCAPI('AddToCart', eventId, customData, payload.customer || payload.userData);
      } 
      // 3. InitiateCheckout
      else if (eventName === 'begin_checkout' || eventName === 'InitiateCheckout') {
        const eventId = payload.event_id || `ic_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const contentIds = expandCatalogContentIds(payload.items || []);
        const customData = {
          content_type: 'product',
          content_ids: contentIds,
          contents: (payload.items || []).map(i => ({
            id: getCanonicalCatalogId(i.item_id || i.productId || i.sku || i.id),
            quantity: Number(i.quantity) || 1,
            item_price: Number(i.price || i.unitPrice || 0)
          })),
          value: Number(payload.value || 0),
          currency: payload.currency || 'INR',
          num_items: (payload.items || []).reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)
        };

        if (window.fbq) {
          window.fbq('track', 'InitiateCheckout', customData, { eventID: eventId });
        }
        this.sendServerCAPI('InitiateCheckout', eventId, customData, payload.customer || payload.userData);
      } 
      // 4. Purchase
      else if (eventName === 'purchase' || eventName === 'Purchase') {
        const rawOrderId = payload.order_id || payload.orderId || payload.bookingId || payload.transaction_id || 'MSV-ORDER';
        const purchaseEventId = payload.event_id || (String(rawOrderId).startsWith('purchase_') ? rawOrderId : `purchase_${rawOrderId}`);
        const contentIds = expandCatalogContentIds(payload.items || []);
        const customData = {
          content_type: 'product',
          content_ids: contentIds,
          contents: (payload.items || []).map(i => ({
            id: getCanonicalCatalogId(i.productId || i.item_id || i.sku || i.id),
            quantity: Number(i.quantity) || 1,
            item_price: Number(i.price || i.unitPrice || 0)
          })),
          value: Number(payload.value || payload.total || payload.amount || 0),
          currency: payload.currency || 'INR',
          num_items: (payload.items || []).reduce((acc, i) => acc + (Number(i.quantity) || 1), 0),
          order_id: rawOrderId
        };

        if (window.fbq) {
          window.fbq('track', 'Purchase', customData, { eventID: purchaseEventId });
        }
        // Note: The Firebase backend verifyRazorpayPayment function also triggers server CAPI Purchase with the identical purchaseEventId for 100% deduplication.
      } 
      // 5. Contact (Leads, Site Surveys, Quotes, Inquiries, WhatsApp)
      else if (
        eventName === 'contact' || 
        eventName === 'Contact' || 
        eventName === 'bulk_enquiry' || 
        eventName === 'dealer_enquiry' || 
        eventName === 'site_survey' || 
        eventName === 'quote_request' || 
        eventName === 'compatibility_enquiry' || 
        eventName === 'whatsapp_click'
      ) {
        const bookingId = payload.bookingId || payload.booking_id;
        const contactEventId = payload.event_id || (bookingId ? `contact_${bookingId}` : `contact_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
        const customData = {
          content_name: payload.business_name || payload.businessName || payload.productName || payload.name || 'Mirror Solar / Aqua Lead',
          content_category: eventName,
          value: Number(payload.value || (payload.quantity ? Number(payload.quantity) * 180 : 0)),
          currency: 'INR'
        };

        if (window.fbq) {
          window.fbq('track', 'Contact', customData, { eventID: contactEventId });
        }
        this.sendServerCAPI('Contact', contactEventId, customData, payload.customer || payload.leadData || payload);
      }
    }
  }

  trackPageView(pagePath) {
    this.trackEvent('page_view', { page_path: pagePath || window.location.pathname });
  }

  trackViewItem(product) {
    this.trackEvent('view_item', {
      currency: 'INR',
      value: product.price,
      items: [{
        item_id: product.sku || product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        micron: product.specifications?.micron || '5 Micron',
        size: product.specifications?.size || '10 Inch'
      }]
    });
  }

  trackQuantitySelect(product, quantity, tierLabel) {
    this.trackEvent('quantity_select', {
      product_id: product.id || product.sku,
      product_name: product.name,
      quantity,
      tier_label: tierLabel,
      total_value: product.price * quantity
    });
  }

  trackAddToCart(product, quantity = 1) {
    this.trackEvent('add_to_cart', {
      currency: 'INR',
      value: (product.price || product.unitPrice || 199) * quantity,
      items: [{
        item_id: product.sku || product.id,
        item_name: product.name,
        price: product.price || product.unitPrice || 199,
        quantity: quantity
      }]
    });
  }

  trackBuyNow(product, quantity = 1) {
    this.trackEvent('buy_now', {
      currency: 'INR',
      value: (product.price || product.unitPrice || 199) * quantity,
      product_id: product.sku || product.id,
      quantity
    });
  }

  trackBeginCheckout(cartItems, totalValue, customerInfo = {}) {
    this.trackEvent('begin_checkout', {
      currency: 'INR',
      value: totalValue,
      customer: customerInfo,
      items: cartItems.map(item => ({
        item_id: item.product?.sku || item.product?.id || item.productId || item.sku || item.id,
        item_name: item.product?.name || item.name || 'Product',
        price: item.product?.price || item.unitPrice || item.price || 0,
        quantity: item.quantity || 1
      }))
    });
  }

  trackPaymentStart(orderId, amount, method) {
    this.trackEvent('payment_start', {
      order_id: orderId,
      value: amount,
      currency: 'INR',
      method
    });
  }

  trackPaymentFailure(orderId, error) {
    this.trackEvent('payment_failure', {
      order_id: orderId,
      error_message: typeof error === 'string' ? error : error?.message || 'Payment failed'
    });
  }

  trackPurchase(orderData) {
    const orderId = orderData.orderId || orderData.bookingId || orderData.id || 'MSV-ORDER';
    const eventId = String(orderId).startsWith('purchase_') ? orderId : `purchase_${orderId}`;
    this.trackEvent('purchase', {
      event_id: eventId,
      order_id: orderId,
      booking_id: orderData.bookingId || orderId,
      transaction_id: orderData.payment?.transactionId || orderId,
      value: orderData.total || orderData.amount || 0,
      currency: 'INR',
      shipping: orderData.shippingFee || 0,
      items: (orderData.items || []).map(i => ({
        productId: i.productId || i.product?.id || i.sku || i.id,
        name: i.product?.name || i.name || 'Product',
        price: i.unitPrice || i.price || 0,
        quantity: i.quantity || 1
      })),
      customer: orderData.customer || orderData.address || {},
      attribution: this.utmParams
    });
  }

  trackContact(contactData) {
    this.trackEvent('contact', {
      bookingId: contactData.bookingId,
      name: contactData.name || contactData.fullName,
      phone: contactData.phone,
      email: contactData.email,
      district: contactData.district,
      city: contactData.city,
      value: contactData.totalPrice || contactData.amount || 0,
      productName: contactData.productName || contactData.type,
      customer: contactData
    });
  }

  trackCouponApply(couponCode, success, discountAmount = 0) {
    this.trackEvent('coupon_apply', {
      coupon_code: couponCode,
      success,
      discount_amount: discountAmount
    });
  }

  trackWhatsAppClick(context, product, quantity = 1) {
    this.trackEvent('whatsapp_click', {
      context, // 'hero_order' | 'compatibility_help' | 'floating_cta' | 'bulk_chat'
      product_id: product?.id || 'general',
      product_name: product?.name || 'Mirror Aqua Inquiry',
      quantity
    });
  }

  trackCompatibilityEnquiry(purifierModel, bowlType) {
    this.trackEvent('compatibility_enquiry', {
      purifier_model: purifierModel,
      bowl_type: bowlType
    });
  }

  trackBulkEnquiry(leadData) {
    this.trackEvent('bulk_enquiry', {
      bookingId: leadData.bookingId,
      product_id: leadData.productId,
      quantity: leadData.requiredQuantity,
      city: leadData.city,
      business_name: leadData.businessName,
      customer: leadData
    });
  }

  trackDealerEnquiry(leadData) {
    this.trackEvent('dealer_enquiry', {
      bookingId: leadData.bookingId,
      city: leadData.city,
      district: leadData.district,
      business_name: leadData.businessName,
      customer: leadData
    });
  }
}

export const analytics = new AnalyticsService();
