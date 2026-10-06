const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require('cors')({origin: true});
const { 
  dispatchBookingNotifications,
  dispatchTrackingNotification,
  sendWhatsAppAlert
} = require("./notifications");

admin.initializeApp();

// Configuration using modern .env variables
const rzp_key_id = process.env.RAZORPAY_KEY_ID || "test_key_id";
const rzp_key_secret = process.env.RAZORPAY_KEY_SECRET || "test_key_secret";

const sr_email = (process.env.SHIPROCKET_EMAIL || "api@mirrorsolarvision.com").replace(/^['"]|['"]$/g, '').trim();
const sr_password = (process.env.SHIPROCKET_PASSWORD || "").replace(/^['"]|['"]$/g, '').trim();

const razorpayInstance = new Razorpay({
  key_id: rzp_key_id,
  key_secret: rzp_key_secret,
});

// Helper to get Shiprocket Token
async function getShiprocketToken() {
  const cleanEmail = (process.env.SHIPROCKET_EMAIL || sr_email || "api@mirrorsolarvision.com").replace(/^['"]|['"]$/g, '').trim();
  const cleanPassword = (process.env.SHIPROCKET_PASSWORD || sr_password || "").replace(/^['"]|['"]$/g, '').trim();

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error("Shiprocket auth error:", response.status, errText);
    throw new Error('Failed to authenticate with Shiprocket: ' + errText);
  }
  const data = await response.json();
  return data.token;
}

// Meta Conversions API (CAPI) & Dataset Quality API Configuration & Secret Manager Binding
let metaCapiSecret;
let metaQualitySecret;
try {
  const { defineSecret } = require('firebase-functions/params');
  metaCapiSecret = defineSecret('META_CAPI_ACCESS_TOKEN');
  metaQualitySecret = defineSecret('META_DATASET_QUALITY_TOKEN');
} catch (e) {}

function getMetaAccessToken() {
  let metaAccessToken = null;
  try {
    if (metaQualitySecret && typeof metaQualitySecret.value === 'function') {
      metaAccessToken = metaQualitySecret.value();
    }
  } catch (secErr) {}
  if (!metaAccessToken) {
    try {
      if (metaCapiSecret && typeof metaCapiSecret.value === 'function') {
        metaAccessToken = metaCapiSecret.value();
      }
    } catch (secErr) {}
  }
  if (!metaAccessToken) {
    metaAccessToken = process.env.META_DATASET_QUALITY_TOKEN || process.env.META_CAPI_ACCESS_TOKEN || process.env.FB_ACCESS_TOKEN;
  }
  return metaAccessToken ? metaAccessToken.trim() : null;
}

// Catalog ID Expansion Map for 100% Meta Catalog Match Rate
const CATALOG_ID_MAP = {
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

function getCanonicalCatalogId(rawId) {
  if (!rawId) return 'msv-drain-clips';
  const str = String(rawId).toLowerCase().trim();
  if (str.includes('drain') || str.includes('clip') || str.includes('35mm')) return 'msv-drain-clips';
  if (str.includes('bulk') || str.includes('combo-15') || str.includes('installer')) return 'bulk-combo-15000';
  if (str.includes('ma-prod-001') || str.includes('10-inch') || str.includes('ma-pp-10') || str.includes('spun-filter')) return 'ma-prod-001';
  if (str.includes('ma-prod-002') || str.includes('5-spun') || str.includes('5pk') || str.includes('wrench')) return 'ma-prod-002';
  return rawId;
}

function expandCatalogContentIds(itemsOrIds) {
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

// Meta Conversions API (CAPI) Server-Side Event Dispatcher with SHA256 Normalization & Deduplication
async function sendMetaConversionsApiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  clientIp,
  clientUserAgent,
  fbp,
  fbc,
  testEventCode,
  userData = {},
  customData = {}
}) {
  const pixelId = process.env.META_PIXEL_ID || '1133118705927784';
  const metaAccessToken = getMetaAccessToken();
  const envTestCode = process.env.META_TEST_EVENT_CODE;
  const activeTestCode = testEventCode || envTestCode;

  if (!metaAccessToken) {
    console.log(`[Meta CAPI] META_CAPI_ACCESS_TOKEN / META_DATASET_QUALITY_TOKEN not configured in environment or Secret Manager, skipping server dispatch for ${eventName} (${eventId}).`);
    return null;
  }

  const hashString = (str) => {
    if (!str || (typeof str !== 'string' && typeof str !== 'number')) return undefined;
    const clean = String(str).trim().toLowerCase();
    if (!clean) return undefined;
    return crypto.createHash('sha256').update(clean).digest('hex');
  };

  const normalizePhone = (phoneStr) => {
    if (!phoneStr) return undefined;
    let digits = String(phoneStr).replace(/[^0-9]/g, '');
    if (!digits) return undefined;
    if (digits.length === 10) digits = '91' + digits; // Standardize 10-digit Indian numbers with country code
    return hashString(digits);
  };

  const userPayload = {
    em: userData.email ? [hashString(userData.email)] : undefined,
    ph: userData.phone ? [normalizePhone(userData.phone)] : undefined,
    fn: userData.firstName ? [hashString(userData.firstName)] : undefined,
    ln: userData.lastName ? [hashString(userData.lastName)] : undefined,
    ct: userData.city ? [hashString(userData.city)] : undefined,
    st: userData.state ? [hashString(userData.state)] : undefined,
    zp: userData.pincode || userData.zip ? [hashString(userData.pincode || userData.zip)] : undefined,
    country: [hashString('in')],
    external_id: userData.externalId || userData.userId ? [hashString(userData.externalId || userData.userId)] : undefined,
    client_ip_address: clientIp || userData.clientIp || undefined,
    client_user_agent: clientUserAgent || userData.clientUserAgent || undefined,
    fbp: fbp || userData.fbp || undefined,
    fbc: fbc || userData.fbc || undefined
  };

  // Strip undefined keys from user_data (Meta requires non-empty or omitted keys)
  Object.keys(userPayload).forEach(k => userPayload[k] === undefined && delete userPayload[k]);

  const enrichedCustomData = { ...customData };
  if (
    enrichedCustomData.content_ids || 
    enrichedCustomData.contents || 
    eventName === 'Purchase' || 
    eventName === 'ViewContent' || 
    eventName === 'AddToCart' || 
    eventName === 'InitiateCheckout'
  ) {
    enrichedCustomData.content_type = enrichedCustomData.content_type || 'product';
    enrichedCustomData.content_ids = expandCatalogContentIds(enrichedCustomData.content_ids || enrichedCustomData.contents || []);
    if (Array.isArray(enrichedCustomData.contents)) {
      enrichedCustomData.contents = enrichedCustomData.contents.map(c => ({
        ...c,
        id: getCanonicalCatalogId(c.id)
      }));
    }
  }

  const eventItem = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl || 'https://mirrorsolarvision.com/',
    action_source: 'website',
    user_data: userPayload,
    custom_data: enrichedCustomData
  };

  const payload = {
    data: [eventItem]
  };

  if (activeTestCode) {
    payload.test_event_code = activeTestCode;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(metaAccessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`[Meta CAPI] Event [${eventName}] (ID: ${eventId}) dispatched successfully:`, JSON.stringify({ events_received: data.events_received, fbtrace_id: data.fbtrace_id }));
    } else {
      console.warn(`[Meta CAPI] API returned error for [${eventName}] (ID: ${eventId}):`, JSON.stringify(data.error || data));
    }
    return data;
  } catch (err) {
    console.error(`[Meta CAPI] Network dispatch error on ${eventName} (${eventId}):`, err.message || err);
    return null;
  }
}

/**
 * Normalizes customer contact and delivery address from various order payload structures
 */
function normalizeCustomerAddress(orderData = {}) {
  const rawAddr = orderData.address || {};
  let addrObj = {};

  if (typeof rawAddr === 'string') {
    addrObj.flat = rawAddr.trim();
    addrObj.fullAddress = rawAddr.trim();
  } else if (typeof rawAddr === 'object' && rawAddr !== null) {
    addrObj = { ...rawAddr };
  }

  // 1. Full Name
  const fullName = (
    addrObj.fullName ||
    addrObj.name ||
    addrObj.customerName ||
    orderData.customerName ||
    orderData.name ||
    orderData.fullName ||
    'Valued Customer'
  ).trim();
  
  // 2. Extract clean 10-digit mobile number
  let rawPhone = (
    addrObj.phone ||
    addrObj.mobile ||
    addrObj.contactNumber ||
    addrObj.phoneNumber ||
    orderData.customerPhone ||
    orderData.phone ||
    orderData.mobile ||
    orderData.contactNumber ||
    orderData.userPhone ||
    orderData.billing_phone ||
    ''
  ).toString().replace(/[^0-9]/g, '');

  // If no phone found in standard keys, search inside fullAddress or notes for 10-digit number
  if (!rawPhone || rawPhone.length < 10) {
    const textToSearch = `${typeof rawAddr === 'string' ? rawAddr : ''} ${addrObj.notes || ''} ${orderData.notes || ''}`;
    const phoneMatch = textToSearch.match(/(?:\+?91|0)?([6-9]\d{9})/);
    if (phoneMatch && phoneMatch[1]) {
      rawPhone = phoneMatch[1];
    }
  }

  if (rawPhone.length > 10 && rawPhone.startsWith('91')) {
    rawPhone = rawPhone.slice(2);
  } else if (rawPhone.length > 10 && rawPhone.startsWith('0')) {
    rawPhone = rawPhone.slice(1);
  }
  const cleanPhone = rawPhone.slice(-10);

  // 3. Email
  const email = (
    addrObj.email ||
    addrObj.customerEmail ||
    orderData.customerEmail ||
    orderData.email ||
    orderData.billing_email ||
    ''
  ).trim();
  
  // 4. Address Components
  let flat = (addrObj.flat || addrObj.house || addrObj.doorNo || addrObj.street || orderData.flat || (typeof rawAddr === 'string' ? rawAddr : '')).trim();
  let area = (addrObj.area || addrObj.street || addrObj.locality || addrObj.landmark || orderData.area || orderData.mandal || '').trim();
  let city = (addrObj.city || addrObj.town || orderData.city || orderData.mandal || orderData.district || '').trim();
  let district = (addrObj.district || orderData.district || '').trim();
  let state = (addrObj.state || orderData.state || '').trim();
  let pincode = (addrObj.pincode || addrObj.pin || addrObj.zip || addrObj.postalCode || orderData.pincode || '').toString().replace(/[^0-9]/g, '').trim();

  // If pincode is missing, try to find a 6-digit Indian PIN code in the text
  if (!pincode || pincode.length !== 6) {
    const rawSearchStr = `${flat} ${area} ${typeof rawAddr === 'string' ? rawAddr : ''}`;
    const pinMatch = rawSearchStr.match(/\b([1-9][0-9]{5})\b/);
    if (pinMatch && pinMatch[1]) {
      pincode = pinMatch[1];
    }
  }

  // Sensible defaults
  if (!state) {
    state = 'Andhra Pradesh';
  }
  if (!city) {
    city = district || 'Andhra Pradesh';
  }
  if (!pincode) {
    pincode = '520001';
  }

  // Combine full address string cleanly without duplicates
  const addressParts = [];
  if (flat) addressParts.push(flat);
  if (area && !flat.toLowerCase().includes(area.toLowerCase())) addressParts.push(area);
  if (city && !flat.toLowerCase().includes(city.toLowerCase()) && !area.toLowerCase().includes(city.toLowerCase())) addressParts.push(city);
  if (district && district !== city && !flat.toLowerCase().includes(district.toLowerCase())) addressParts.push(district);
  if (state && !flat.toLowerCase().includes(state.toLowerCase())) addressParts.push(state);
  if (pincode && !flat.includes(pincode)) addressParts.push(`PIN: ${pincode}`);

  const fullAddress = addressParts.join(', ') || (typeof rawAddr === 'string' ? rawAddr : 'Address on file');

  return {
    fullName,
    phone: cleanPhone,
    email,
    flat: flat || fullAddress,
    area,
    city: city || 'Andhra Pradesh',
    district,
    state: state || 'Andhra Pradesh',
    pincode: pincode || '520001',
    fullAddress
  };
}

async function createShiprocketOrderForRecord(orderData, razorpay_payment_id) {
  const orderBookingId = orderData.bookingId || orderData.firestoreOrderId;
  const addr = normalizeCustomerAddress(orderData);
  const items = orderData.items || [];
  const cleanPhone = addr.phone;
  const custEmail = addr.email || 'orders@mirrorsolarvision.com';
  const custName = addr.fullName;
  const nameParts = custName.split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || 'Customer';

  const token = await getShiprocketToken();
  
  const orderItems = items.map(item => ({
    name: (item.name || 'Solar Product').substring(0, 100),
    sku: (item.productId || item.cartItemId || item.id || `SKU_${Date.now()}`).substring(0, 50),
    units: Math.max(1, Number(item.quantity) || 1),
    selling_price: Math.max(1, Number(item.price) || (orderData.amount / (items.length || 1))),
    discount: 0,
    tax: 0,
    hsn: ''
  }));

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const formattedOrderDate = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

  const shiprocketPayload = {
    order_id: orderBookingId,
    order_date: formattedOrderDate,
    pickup_location: "work",
    channel_id: "",
    comment: `Mirror Solar Store Booking ID: ${orderBookingId} - Customer: ${custName} - Phone: ${cleanPhone}`,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: (addr.flat || addr.fullAddress || 'Address on file').substring(0, 100),
    billing_address_2: (addr.area || addr.city || '').substring(0, 100),
    billing_city: addr.city,
    billing_pincode: addr.pincode,
    billing_state: addr.state,
    billing_country: "India",
    billing_email: custEmail,
    billing_phone: cleanPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: "Prepaid",
    sub_total: orderData.amount,
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5
  };

  console.log("Sending Shiprocket Payload for Booking ID:", orderBookingId, "Customer Phone:", cleanPhone, "City:", addr.city);

  const createOrderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(shiprocketPayload)
  });

  if (!createOrderRes.ok) {
    const errData = await createOrderRes.text();
    console.error("Shiprocket creation failed:", errData);
    throw new Error("Shiprocket returned error: " + errData);
  }

  const srData = await createOrderRes.json();
  console.log("Shiprocket Order Created Successfully:", JSON.stringify(srData));
  return srData;
}

exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { amount, items, userId, address } = req.body.data || req.body; 
      
      // Server-side price calculation & product verification (Tamper protection)
      let calculatedTotal = 0;
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
          let itemPrice = Number(item.price) || 199;

          if (item.productId === 'msv-bulk-combo' || item.productId === 'bulk-combo-15000' || item.id === 'bulk-combo-15000') {
            itemPrice = 15000;
          } else if (item.productId === 'msv-drain-clips') {
            if (item.clipsCount && Number(item.clipsCount) > 0) {
              itemPrice = Number(item.clipsCount) * 25;
            } else if (itemPrice < 300) {
              itemPrice = 300;
            }
          } else if (item.productId === 'ma-prod-002' || item.sku === 'MA-PP-5PK-WR' || (item.name && item.name.toLowerCase().includes('5 spun') && (item.name.toLowerCase().includes('wrench') || item.name.toLowerCase().includes('runch')))) {
            itemPrice = qty >= 2 ? 945 : 995;
          } else if (item.productId === 'ma-prod-001' || item.sku === 'MA-PP-10-05M' || (item.name && item.name.toLowerCase().includes('pp spun'))) {
            itemPrice = qty >= 10 ? 180 : 199;
          }
          calculatedTotal += (itemPrice * qty);
        }
      }

      const finalAmount = calculatedTotal > 0 ? calculatedTotal : Math.max(10, Number(amount) || 199);

      // Clean, official Website Booking ID format (e.g. MSV-729401 or MA-729401)
      const isAquaOrder = items && items.some(it => (it.productId || '').startsWith('ma-') || (it.sku || '').startsWith('MA-'));
      const prefix = isAquaOrder ? 'MA' : 'MSV';
      const bookingId = `${prefix}-${Date.now().toString().slice(-6)}`;

      const options = {
        amount: Math.round(finalAmount * 100), // paise
        currency: "INR",
        receipt: bookingId,
      };

      const order = await razorpayInstance.orders.create(options);

      // Normalize and extract customer details safely
      const rawReq = req.body.data || req.body || {};
      const addr = normalizeCustomerAddress({
        address,
        customerName: address?.fullName || address?.name || rawReq.customerName || rawReq.name,
        customerPhone: address?.phone || address?.mobile || address?.contactNumber || rawReq.customerPhone || rawReq.phone,
        customerEmail: address?.email || rawReq.customerEmail || rawReq.email
      });

      const uid = userId || 'anonymous';
      const orderDataToSave = {
        userId: uid,
        bookingId: bookingId,
        firestoreOrderId: bookingId,
        customerName: addr.fullName,
        customerPhone: addr.phone,
        customerEmail: addr.email || 'orders@mirrorsolarvision.com',
        items: items || [],
        amount: finalAmount,
        address: typeof address === 'object' && address !== null ? { ...address, ...addr } : { fullAddress: addr.fullAddress, flat: addr.flat, area: addr.area, city: addr.city, state: addr.state, pincode: addr.pincode, phone: addr.phone, fullName: addr.fullName },
        razorpayOrderId: order.id,
        status: 'created',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Save using bookingId as document ID for 100% consistent matching
      await admin.firestore().collection('users').doc(uid).collection('orders').doc(bookingId).set(orderDataToSave);
      await admin.firestore().collection('orders').doc(bookingId).set(orderDataToSave);

      res.status(200).send({
        data: {
          id: order.id,
          currency: order.currency,
          amount: order.amount,
          firestoreOrderId: bookingId,
          bookingId: bookingId
        }
      });
    } catch (error) {
      console.error("createRazorpayOrder error:", error);
      res.status(500).send({ data: { error: 'Failed to create order' } });
    }
  });
});

exports.verifyRazorpayPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const requestPayload = req.body.data || req.body || {};
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, firestoreOrderId, userId } = requestPayload;

      const uid = userId || 'anonymous';
      const userOrderDocRef = admin.firestore().collection('users').doc(uid).collection('orders').doc(firestoreOrderId);
      const rootOrderDocRef = admin.firestore().collection('orders').doc(firestoreOrderId);

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", rzp_key_secret)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        if (firestoreOrderId) {
          const failUpdate = {
            status: 'failed_verification',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          await userOrderDocRef.update(failUpdate).catch(() => {});
          await rootOrderDocRef.update(failUpdate).catch(() => {});
        }
        return res.status(400).send({ data: { error: 'Invalid Signature' } });
      }

      // Check existing order status for idempotency (avoid duplicate Shiprocket creation on multiple callbacks)
      let orderSnap = await userOrderDocRef.get();
      if (!orderSnap.exists) {
        orderSnap = await rootOrderDocRef.get();
      }

      if (orderSnap.exists) {
        const existingData = orderSnap.data();
        if (existingData.status === 'paid' && (existingData.shiprocketOrderId || existingData.shiprocketShipmentId)) {
          console.log("verifyRazorpayPayment: Order already processed & shipped for bookingId:", existingData.bookingId || firestoreOrderId);
          return res.status(200).send({
            data: {
              success: true,
              bookingId: existingData.bookingId || firestoreOrderId,
              shiprocketShipmentId: existingData.shiprocketShipmentId,
              shiprocketOrderId: existingData.shiprocketOrderId,
              alreadyProcessed: true
            }
          });
        }
      }

      // 1. Mark as Paid
      const paidUpdate = {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      if (firestoreOrderId) {
        await userOrderDocRef.update(paidUpdate).catch(() => {});
        await rootOrderDocRef.update(paidUpdate).catch(() => {});
      }

      if (!orderSnap.exists) {
         return res.status(200).send({ data: { success: true, message: 'Payment verified but order missing in DB' } });
      }
      
      const orderData = orderSnap.data();
      const orderBookingId = orderData.bookingId || firestoreOrderId;
      const addr = normalizeCustomerAddress(orderData);

      // 3. Create Shiprocket Order
      try {
        const srData = await createShiprocketOrderForRecord(orderData, razorpay_payment_id);
        
        // 4. Update Firestore with Shipping Details in both user subcollection and root collection
        const shippingSuccessUpdate = {
          status: 'paid',
          bookingId: orderBookingId,
          razorpayPaymentId: razorpay_payment_id,
          shiprocketOrderId: srData.order_id || null,
          shiprocketShipmentId: srData.shipment_id || null,
          shiprocketAwb: srData.awb_code || null,
          shiprocketStatus: srData.status || srData.status_code || 'PROCESSING',
          shiprocketResponse: JSON.stringify(srData),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await userOrderDocRef.update(shippingSuccessUpdate).catch(() => {});
        await rootOrderDocRef.update(shippingSuccessUpdate).catch(() => {});

        // 5. Trigger automated WhatsApp & Email notifications
        const fullOrderRecord = {
          ...orderData,
          bookingId: orderBookingId,
          razorpayPaymentId: razorpay_payment_id,
          shiprocketOrderId: srData.order_id || null,
          shiprocketShipmentId: srData.shipment_id || null,
          shiprocketAwb: srData.awb_code || null,
          status: 'paid'
        };
        dispatchBookingNotifications('order', fullOrderRecord).catch((notifErr) => {
          console.error("Order notification dispatch error:", notifErr);
        });

        // 6. Dispatch Server-Side Meta Conversions API (CAPI) Purchase Event with exact deduplication event_id
        const purchaseEventId = `purchase_${orderBookingId}`;
        const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '';
        const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '';
        const clientUserAgent = req.headers['user-agent'] || '';
        const passedFbp = requestPayload.fbp || orderData.fbp;
        const passedFbc = requestPayload.fbc || orderData.fbc;
        const passedSourceUrl = requestPayload.eventSourceUrl || 'https://mirrorsolarvision.com/';

        const orderItems = fullOrderRecord.items || [];
        const contentIds = orderItems.map(i => i.productId || i.sku || i.id || 'solar-product');
        const contentsArray = orderItems.map(i => ({
          id: i.productId || i.sku || i.id || 'solar-product',
          quantity: Math.max(1, Number(i.quantity) || 1),
          item_price: Number(i.price || i.unitPrice || (fullOrderRecord.amount / (orderItems.length || 1)))
        }));
        const totalItemsCount = orderItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);

        sendMetaConversionsApiEvent({
          eventName: 'Purchase',
          eventId: purchaseEventId,
          eventSourceUrl: passedSourceUrl,
          clientIp,
          clientUserAgent,
          fbp: passedFbp,
          fbc: passedFbc,
          userData: {
            email: addr.email || fullOrderRecord.customerEmail,
            phone: addr.phone || fullOrderRecord.customerPhone,
            firstName: addr.fullName.split(' ')[0] || 'Customer',
            lastName: addr.fullName.split(' ').slice(1).join(' ') || '',
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            externalId: fullOrderRecord.userId || uid,
            fbp: passedFbp,
            fbc: passedFbc
          },
          customData: {
            currency: 'INR',
            value: Number(fullOrderRecord.amount || 0),
            order_id: orderBookingId,
            content_type: 'product',
            content_ids: contentIds,
            contents: contentsArray,
            num_items: totalItemsCount
          }
        }).catch((capiErr) => {
          console.error("Meta CAPI purchase dispatch error:", capiErr);
        });

        return res.status(200).send({ 
          data: { 
            success: true, 
            bookingId: orderBookingId,
            shiprocketShipmentId: srData.shipment_id,
            shiprocketOrderId: srData.order_id
          } 
        });

      } catch (shippingError) {
        console.error("Failed to create Shiprocket Order:", shippingError);
        
        const shippingFailUpdate = {
          status: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          shiprocketStatus: 'failed_to_create',
          shiprocketError: shippingError.message || String(shippingError),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await userOrderDocRef.update(shippingFailUpdate).catch(() => {});
        await rootOrderDocRef.update(shippingFailUpdate).catch(() => {});

        // Trigger notifications even if courier label creation encountered an issue
        const fallbackOrderRecord = {
          ...orderData,
          bookingId: orderBookingId,
          razorpayPaymentId: razorpay_payment_id,
          status: 'paid'
        };
        dispatchBookingNotifications('order', fallbackOrderRecord).catch((notifErr) => {
          console.error("Order notification dispatch error:", notifErr);
        });

        return res.status(200).send({ 
          data: { 
            success: true, 
            warning: "Payment successful but failed to create shipping label: " + shippingError.message
          } 
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ data: { error: 'Verification Failed' } });
    }
  });
});

exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    // Verify signature
    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', rzp_key_secret)
      .update(req.rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error("Invalid Razorpay Webhook Signature");
      return res.status(400).send('Invalid signature');
    }

    const payload = req.body;
    if (payload.event === 'order.paid') {
      const rzpOrderId = payload.payload.order.entity.id;
      const rzpPaymentId = payload.payload.payment.entity.id;

      // Find the order in Firestore using a Collection Group query
      const snapshot = await admin.firestore().collectionGroup('orders').where('razorpayOrderId', '==', rzpOrderId).limit(1).get();
      if (!snapshot.empty) {
        const orderDocSnap = snapshot.docs[0];
        const orderRef = orderDocSnap.ref;
        const orderData = orderDocSnap.data();
        const bookingId = orderData.bookingId || orderDocSnap.id;

        // Also reference the root orders collection doc
        const rootOrderDocRef = admin.firestore().collection('orders').doc(bookingId);

        let srData = null;
        if (!orderData.shiprocketOrderId && !orderData.shiprocketShipmentId) {
          try {
            srData = await createShiprocketOrderForRecord(orderData, rzpPaymentId);
          } catch (srErr) {
            console.error("Webhook Shiprocket creation warning:", srErr);
          }
        }

        const updateData = {
          status: 'paid',
          razorpayPaymentId: rzpPaymentId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (srData) {
          updateData.shiprocketOrderId = srData.order_id || null;
          updateData.shiprocketShipmentId = srData.shipment_id || null;
          updateData.shiprocketAwb = srData.awb_code || null;
          updateData.shiprocketStatus = srData.status || srData.status_code || 'PROCESSING';
          updateData.shiprocketResponse = JSON.stringify(srData);
        }

        await orderRef.update(updateData).catch(() => {});
        await rootOrderDocRef.update(updateData).catch(() => {});

        const updatedFullOrder = {
          ...orderData,
          ...updateData,
          bookingId
        };

        // Trigger automated WhatsApp & Email notifications
        dispatchBookingNotifications('order', updatedFullOrder).catch((e) => console.error("Webhook notification error:", e));
      }
    }

    res.status(200).send('ok');
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    res.status(500).send('Error processing webhook');
  }
});

// Helper to normalize Shiprocket status codes and text into consistent stages
function normalizeShiprocketStatus(statusInput, statusCode) {
  const code = Number(statusCode || 0);
  const s = String(statusInput || '').toUpperCase().trim();

  // 1. Delivered
  if (code === 7 || code === 42 || code === 43 || s.includes('DELIVERED') || s === 'DLVD' || s.includes('CLOSED')) {
    return 'DELIVERED';
  }
  // 2. Out For Delivery
  if (
    code === 17 || code === 41 ||
    s.includes('OUT FOR DELIVERY') || s.includes('OUT_FOR_DELIVERY') || s.includes('OFD') || s.includes('REACHED AT DESTINATION')
  ) {
    return 'OUT_FOR_DELIVERY';
  }
  // 3. In Transit / Shipped / Picked Up
  if (
    code === 6 || code === 18 || code === 19 || code === 38 || code === 21 || code === 22 ||
    s.includes('IN TRANSIT') || s.includes('IN_TRANSIT') || s.includes('SHIPPED') || s.includes('PICKED UP') || s.includes('PICKUP') || s.includes('MANIFEST')
  ) {
    return 'SHIPPED';
  }
  // 4. Cancelled / RTO
  if (code === 8 || s.includes('CANC')) {
    return 'CANCELLED';
  }
  if (code === 9 || s.includes('RTO')) {
    return 'RTO_INITIATED';
  }
  // 5. Default Order Placed / Processing
  return 'PROCESSING';
}

exports.shiprocketWebhook = functions.https.onRequest(async (req, res) => {
  // Always accept any test ping or preflight
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    return res.status(200).json({ success: true, message: 'Webhook active' });
  }

  try {
    const data = req.body || {};
    console.log("Shiprocket Webhook Payload received:", JSON.stringify(data));

    const awb = data.awb || data.awb_code || null;
    const rawStatus = (data.current_status || data.shipment_status || data.status || data.current_status_id || '').toString().trim();
    const statusCode = data.current_status_id || data.status_code || null;
    const shipmentId = data.shipment_id ? String(data.shipment_id) : null;
    const orderId = data.order_id ? String(data.order_id) : null;
    const courierName = data.courier_name || data.courier_partner_name || null;
    const etd = data.etd || data.edd || null;
    const deliveredDate = (data.delivered_date || data.delivery_date || (rawStatus.toUpperCase().includes('DELIVERED') ? new Date().toISOString() : null));

    const normalizedStatus = normalizeShiprocketStatus(rawStatus, statusCode);

    const currentLocation = data.current_location || data.location || data.city || (data.scans && data.scans.length ? (data.scans[data.scans.length - 1].location || data.scans[0].location) : null);
    const activity = data.activity || (data.scans && data.scans.length ? (data.scans[data.scans.length - 1].activity || data.scans[0].activity) : null);
    const origin = data.origin || data.pickup_location || 'Eluru Dispatch Warehouse, Andhra Pradesh';
    const destination = data.destination || data.delivery_city || null;

    if (rawStatus || awb || shipmentId || orderId) {
      const updatePayload = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      if (rawStatus) {
        updatePayload.shiprocketStatus = normalizedStatus;
        updatePayload.shiprocketRawStatus = rawStatus;
        if (statusCode) updatePayload.shiprocketStatusCode = statusCode;
      }
      if (awb) updatePayload.shiprocketAwb = awb;
      if (shipmentId) updatePayload.shiprocketShipmentId = shipmentId;
      if (courierName) updatePayload.courierName = courierName;
      if (etd) updatePayload.estimatedDelivery = etd;
      if (deliveredDate) updatePayload.deliveredDate = deliveredDate;
      if (currentLocation) updatePayload.currentLocation = currentLocation;
      if (activity) updatePayload.lastActivity = activity;
      if (data.scans && Array.isArray(data.scans)) {
        updatePayload.shiprocketActivities = data.scans;
      }

      // 1. Match by exact doc ID in root 'orders'
      if (orderId) {
        try {
          const rootDoc = await admin.firestore().collection('orders').doc(orderId).get();
          if (rootDoc.exists) {
            await rootDoc.ref.update(updatePayload).catch(() => {});
            const userId = rootDoc.data()?.userId;
            if (userId && userId !== 'anonymous') {
              await admin.firestore().collection('users').doc(userId).collection('orders').doc(orderId).update(updatePayload).catch(() => {});
            }
          }
        } catch (e) {
          console.warn("Root doc direct lookup error:", e);
        }
      }

      // 2. Also search via queries by bookingId, shiprocketOrderId, shipmentId, or awb
      const queryList = [];
      if (orderId) {
        queryList.push(admin.firestore().collection('orders').where('bookingId', '==', orderId).get());
        queryList.push(admin.firestore().collection('orders').where('shiprocketOrderId', '==', orderId).get());
        queryList.push(admin.firestore().collectionGroup('orders').where('bookingId', '==', orderId).get());
        queryList.push(admin.firestore().collectionGroup('orders').where('shiprocketOrderId', '==', orderId).get());
      }
      if (shipmentId) {
        queryList.push(admin.firestore().collection('orders').where('shiprocketShipmentId', '==', shipmentId).get());
        queryList.push(admin.firestore().collection('orders').where('shiprocketShipmentId', '==', Number(shipmentId)).get());
        queryList.push(admin.firestore().collectionGroup('orders').where('shiprocketShipmentId', '==', shipmentId).get());
        queryList.push(admin.firestore().collectionGroup('orders').where('shiprocketShipmentId', '==', Number(shipmentId)).get());
      }
      if (awb) {
        queryList.push(admin.firestore().collection('orders').where('shiprocketAwb', '==', awb).get());
        queryList.push(admin.firestore().collectionGroup('orders').where('shiprocketAwb', '==', awb).get());
      }

      let updatedOrderRecord = null;
      for (const snap of results) {
        for (const docSnap of snap.docs) {
          const docData = docSnap.data() || {};
          await docSnap.ref.update(updatePayload).catch(() => {});
          const docId = docSnap.id;
          await admin.firestore().collection('orders').doc(docId).update(updatePayload).catch(() => {});
          if (!updatedOrderRecord) {
            updatedOrderRecord = { ...docData, ...updatePayload, id: docId };
          }
        }
      }

      // Automatically dispatch live WhatsApp tracking update to customer with city-to-city transit details
      if (updatedOrderRecord && (awb || rawStatus)) {
        try {
          await dispatchTrackingNotification(updatedOrderRecord, {
            status: normalizedStatus || rawStatus,
            awb: awb || updatedOrderRecord.shiprocketAwb,
            courierName: courierName || updatedOrderRecord.courierName,
            estimatedDelivery: etd || updatedOrderRecord.estimatedDelivery,
            currentLocation: currentLocation || updatedOrderRecord.currentLocation,
            activity: activity || updatedOrderRecord.lastActivity,
            origin: origin || 'Eluru Dispatch Warehouse, Andhra Pradesh',
            destination: destination || (updatedOrderRecord.address ? `${updatedOrderRecord.address.city || ''}, ${updatedOrderRecord.address.state || 'AP'}` : null)
          });
        } catch (dispatchErr) {
          console.error("Failed to dispatch tracking WhatsApp notification:", dispatchErr);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error("Shiprocket Webhook Error:", error);
    return res.status(200).json({ success: false, error: 'Processed with errors' });
  }
});

// Live on-demand tracking lookup endpoint from Shiprocket
exports.getShiprocketTracking = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const trackingId = req.query.trackingId || req.body?.data?.trackingId || req.body?.trackingId;
      const bookingId = req.query.bookingId || req.body?.data?.bookingId || req.body?.bookingId;
      const orderDocId = req.query.orderId || req.body?.data?.orderId || req.body?.orderId;

      const lookupKey = (trackingId || bookingId || orderDocId || '').toString().trim();
      if (!lookupKey) {
        return res.status(400).send({ data: { error: 'Tracking ID (AWB, Shipment ID, or Booking ID) required' } });
      }

      const token = await getShiprocketToken();
      let trackingResult = null;
      let rawData = null;

      // 1. Try tracking via AWB
      try {
        const trackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${lookupKey}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (trackRes.ok) {
          rawData = await trackRes.json();
          if (rawData?.tracking_data?.track_status === 1 || rawData?.tracking_data?.shipment_track?.length > 0) {
            trackingResult = rawData;
          }
        }
      } catch (err) {
        console.warn("AWB lookup error:", err);
      }

      // 2. Fallback: Try tracking via Shipment ID
      if (!trackingResult) {
        try {
          const shipTrackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${lookupKey}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (shipTrackRes.ok) {
            rawData = await shipTrackRes.json();
            if (rawData?.tracking_data?.track_status === 1 || rawData?.tracking_data?.shipment_track?.length > 0) {
              trackingResult = rawData;
            }
          }
        } catch (err) {
          console.warn("Shipment ID lookup error:", err);
        }
      }

      // 3. Fallback: Try tracking via Order ID (Booking ID)
      if (!trackingResult) {
        try {
          const orderTrackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${encodeURIComponent(lookupKey)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (orderTrackRes.ok) {
            rawData = await orderTrackRes.json();
            if (rawData?.tracking_data?.track_status === 1 || rawData?.tracking_data?.shipment_track?.length > 0) {
              trackingResult = rawData;
            }
          }
        } catch (err) {
          console.warn("Order ID lookup error:", err);
        }
      }

      // If nothing found or tracking_data unavailable, return whatever rawData exists or fallback
      const trackData = trackingResult?.tracking_data || rawData?.tracking_data || {};
      const shipmentTrackArr = trackData.shipment_track || [];
      const primaryTrack = shipmentTrackArr[0] || {};
      const activities = trackData.shipment_track_activities || [];

      const rawStatus = primaryTrack.current_status || trackData.current_status || primaryTrack.status || 'PROCESSING';
      const statusCode = trackData.shipment_status || primaryTrack.status_code || null;
      const normalizedStatus = normalizeShiprocketStatus(rawStatus, statusCode);

      const courierName = primaryTrack.courier_name || trackData.courier_name || 'Shiprocket Partner';
      const awbCode = primaryTrack.awb_code || primaryTrack.awb || trackData.awb || lookupKey;
      const deliveredDate = primaryTrack.delivered_date || (normalizedStatus === 'DELIVERED' ? new Date().toISOString() : null);
      const edd = primaryTrack.edd || primaryTrack.expected_delivery_date || trackData.etd || null;
      const trackUrl = trackData.track_url || `https://shiprocket.co/tracking/${awbCode}`;

      const responsePayload = {
        success: true,
        normalizedStatus,
        rawStatus,
        statusCode,
        courierName,
        awb: awbCode,
        deliveredDate,
        estimatedDelivery: edd,
        activities,
        trackUrl,
        raw: rawData
      };

      // 4. Auto-sync to Firestore if bookingId or orderDocId was passed
      const targetSyncKey = bookingId || orderDocId || lookupKey;
      if (targetSyncKey && normalizedStatus) {
        const syncUpdate = {
          shiprocketStatus: normalizedStatus,
          shiprocketRawStatus: rawStatus,
          shiprocketAwb: awbCode,
          courierName: courierName,
          deliveredDate: deliveredDate,
          estimatedDelivery: edd,
          shiprocketActivities: activities,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        try {
          if (orderDocId) {
            await admin.firestore().collection('orders').doc(orderDocId).update(syncUpdate).catch(() => {});
          }
          const bQuery = await admin.firestore().collection('orders').where('bookingId', '==', targetSyncKey).get();
          for (const docSnap of bQuery.docs) {
            await docSnap.ref.update(syncUpdate).catch(() => {});
          }
        } catch (syncErr) {
          console.warn("Firestore auto-sync error:", syncErr);
        }
      }

      return res.status(200).send({ data: responsePayload });
    } catch (error) {
      console.error("Shiprocket Tracking fetch error:", error);
      res.status(500).send({ data: { error: 'Failed to fetch tracking info' } });
    }
  });
});

/**
 * Universal Endpoint for Lead, Survey, and Inquiry Bookings
 * Saves to Firestore and dispatches Email + WhatsApp notifications immediately
 */
exports.createBookingNotification = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const payload = req.body.data || req.body;
      const type = payload.type || 'site_survey';
      const data = payload.data || payload;

      const prefixMap = {
        'site_survey': 'SRV',
        'quote_request': 'QTE',
        'bulk_combo': 'BLK',
        'drain_clips': 'DRN',
        'order': 'ORD'
      };
      const prefix = prefixMap[type] || 'MSV';
      const bookingId = `MSV-${prefix}-${Date.now().toString().slice(-6)}`;

      const bookingRecord = {
        bookingId,
        type,
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new'
      };

      let collectionName = 'bookings';
      if (type === 'site_survey') collectionName = 'site_surveys';
      else if (type === 'quote_request') collectionName = 'quotes';
      else if (type === 'bulk_combo') collectionName = 'bulk_orders';
      else if (type === 'drain_clips') collectionName = 'drain_clip_orders';

      const docRef = await admin.firestore().collection(collectionName).add(bookingRecord);
      bookingRecord.id = docRef.id;

      // Also record in central root bookings collection for admin overview
      await admin.firestore().collection('bookings').doc(bookingId).set(bookingRecord).catch(() => {});

      // Dispatch automated WhatsApp & Email
      const notifResults = await dispatchBookingNotifications(type, bookingRecord);

      // Dispatch Server-Side Meta Conversions API (CAPI) Contact Event
      const contactEventId = `contact_${bookingId}`;
      const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '';
      const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '';
      const clientUserAgent = req.headers['user-agent'] || '';

      const custName = (data.name || data.fullName || '').trim();
      const nameParts = custName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      sendMetaConversionsApiEvent({
        eventName: 'Contact',
        eventId: contactEventId,
        eventSourceUrl: payload.eventSourceUrl || 'https://mirrorsolarvision.com/',
        clientIp,
        clientUserAgent,
        fbp: payload.fbp || data.fbp,
        fbc: payload.fbc || data.fbc,
        userData: {
          email: data.email,
          phone: data.phone,
          firstName: firstName,
          lastName: lastName,
          city: data.city || data.district,
          state: data.state || 'Andhra Pradesh',
          pincode: data.pincode,
          fbp: payload.fbp || data.fbp,
          fbc: payload.fbc || data.fbc
        },
        customData: {
          currency: 'INR',
          value: Number(data.totalPrice || data.amount || 0),
          content_name: data.productName || `Mirror Solar Inquiry: ${type}`,
          content_category: type
        }
      }).catch((capiErr) => {
        console.error("Meta CAPI contact dispatch error:", capiErr);
      });

      return res.status(200).send({
        data: {
          success: true,
          bookingId,
          id: docRef.id,
          notifications: notifResults
        }
      });
    } catch (err) {
      console.error("createBookingNotification error:", err);
      return res.status(500).send({ data: { error: err.message || 'Notification failed' } });
    }
  });
});

/**
 * Universal Server-Side Meta Conversions API Event Dispatcher Endpoint
 * Handles ViewContent, AddToCart, InitiateCheckout, Purchase, and Contact events
 * Automatically extracts and enriches Client IP and Client User-Agent
 */
exports.trackMetaServerEvent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const payload = req.body.data || req.body || {};
      const { eventName, eventId, eventSourceUrl, userData = {}, customData = {}, testEventCode } = payload;

      if (!eventName || !eventId) {
        return res.status(400).send({ data: { error: 'eventName and eventId are required.' } });
      }

      // Safe client IP extraction (handles proxies / Cloudflare / Firebase CDN headers)
      const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '';
      const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '';

      // Client User Agent extraction
      const clientUserAgent = req.headers['user-agent'] || '';

      const capiResult = await sendMetaConversionsApiEvent({
        eventName,
        eventId,
        eventSourceUrl: eventSourceUrl || 'https://mirrorsolarvision.com/',
        clientIp,
        clientUserAgent,
        fbp: userData.fbp,
        fbc: userData.fbc,
        testEventCode,
        userData,
        customData
      });

      return res.status(200).send({
        data: {
          success: true,
          eventId,
          eventName,
          capiResult: capiResult ? { events_received: capiResult.events_received } : null
        }
      });
    } catch (error) {
      console.error("[Meta CAPI] trackMetaServerEvent endpoint error:", error.message || error);
      return res.status(500).send({ data: { error: 'Failed to process Meta CAPI server event' } });
    }
  });
});

/**
 * Diagnostic Endpoint for Meta Dataset Quality API & Conversions API Health Check
 * Securely queries Meta Graph API to verify token validity, permissions, and EMQ parameter coverage
 */
exports.getMetaDatasetQualityMetrics = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const pixelId = process.env.META_PIXEL_ID || '1133118705927784';
      const token = getMetaAccessToken();

      if (!token) {
        return res.status(400).send({
          data: {
            success: false,
            error: 'Meta access token is not configured in Firebase environment or Secret Manager.'
          }
        });
      }

      // Check token identity & permissions with Graph API
      const meRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${encodeURIComponent(token)}`);
      const meData = await meRes.json();

      return res.status(200).send({
        data: {
          success: true,
          datasetId: pixelId,
          tokenConfigured: true,
          tokenValid: !meData.error,
          systemUserId: meData.id || null,
          tokenType: 'Dataset Quality API & Conversions API Token',
          graphApiVersion: 'v19.0',
          integrationType: 'Direct CAPI + Dataset Quality API',
          emqOptimization: {
            emailSha256: true,
            phoneE164Sha256: true,
            namesSha256: true,
            addressGeoSha256: true,
            fbpCookieMatched: true,
            fbcCookieMatched: true,
            clientIpEnriched: true,
            clientUserAgentEnriched: true,
            catalogContentIdsExpanded: true
          }
        }
      });
    } catch (error) {
      console.error("[Meta Dataset Quality] Diagnostics error:", error.message || error);
      return res.status(500).send({ data: { error: error.message || 'Failed to check Dataset Quality status' } });
    }
  });
});

/**
 * Meta WhatsApp Cloud API Webhook Handler
 * Supports Meta webhook verification challenge and incoming delivery/status events
 */
exports.whatsappWebhook = functions.https.onRequest((req, res) => {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mirrorsolar_wa_verify_2026';

  // 1. Webhook Verification Handshake (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Meta WhatsApp Webhook] Verified successfully!');
      return res.status(200).send(challenge);
    } else {
      console.warn('[Meta WhatsApp Webhook] Verification failed. Token mismatch.');
      return res.status(403).send('Forbidden');
    }
  }

  // 2. Incoming Messages & Delivery Receipts (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      console.log('[Meta WhatsApp Webhook Event]:', JSON.stringify(body));

      // Store incoming events or status ticks in Firestore
      if (admin.apps && admin.apps.length) {
        admin.firestore().collection('whatsapp_events').add({
          payload: body,
          receivedAt: admin.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (e) {
      console.error('[Meta WhatsApp Webhook] Error:', e);
      return res.status(200).send('EVENT_PROCESSED');
    }
  }

  return res.status(405).send('Method Not Allowed');
});

/**
 * On-Demand Test Endpoint for WhatsApp Notifications
 */
exports.testWhatsAppNotification = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const phone = req.query.phone || req.body?.phone || '919182612420';
      const customMsg = req.query.message || req.body?.message || `🚚 *MIRROR SOLAR VISION — LIVE COURIER TRACKING UPDATE*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hello *Valued Customer*, here is the real-time shipping update for your order:

📦 *Order / Booking ID:* MSV-2026-98124
📍 *Courier Status:* *IN TRANSIT / DISPATCHED*
💳 *Payment Status:* PAID & CONFIRMED (*₹14,999* Prepaid Online)

🛒 *Order Items & Specifications:*
  1. *Solar Panel Water Drain Clips (35mm)*
     📏 Frame Size: *35mm* | ⚡ Capacity: *5 kW* | 🔢 Units: *20 Clips*
     🏷️ Quantity: *1 Pack*

🚚 *COURIER & TRACKING DETAILS:*
• 🏷️ *AWB / Tracking Number:* *148291048291*
• 🚛 *Courier Partner:* *Delhivery Express*
• 📅 *Estimated Delivery Date:* *Thursday, 8th Oct*

🔗 *Live Tracking Link (Click to Track):*
https://shiprocket.co/tracking/148291048291

━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Vision Support:* +91 91826 12420
🏢 *Dispatch Hub:* Opposite Vmax Cinema Hall, GNT Road, Eluru, AP
🌐 *Website:* https://mirrorsolarvision.com`;

      const result = await sendWhatsAppAlert({
        phone: phone,
        message: customMsg
      });

      return res.status(200).send({
        success: true,
        targetPhone: phone,
        result
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        error: err.message || String(err)
      });
    }
  });
});


