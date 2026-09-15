import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const ADMIN_WHATSAPP = '919182612420';
export const ADMIN_EMAIL = 'balajiperuri09@gmail.com';
export const SENDER_EMAIL = 'mirrorsolarvision@gmail.com';
export const ADMIN_EMAILS = ['balajiperuri09@gmail.com', 'mirrorsolarvision@gmail.com'];
export const BUSINESS_PHONE = '+91 91826 12420';
export const BUSINESS_NAME = 'Mirror Solar Vision';

const CLOUD_FUNCTION_URL = 'https://us-central1-mirror-solar-vision.cloudfunctions.net/createBookingNotification';

/**
 * Format currency in Indian Rupees
 */
export const formatINR = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Extracts comprehensive product specifications (Size, kW, Clips Count, Category)
 */
export const extractProductSpecs = (item, orderData = {}) => {
  const name = item.name || item.productName || 'Solar Equipment';
  const variantLabel = item.variantLabel || '';
  const searchStr = `${name} ${variantLabel} ${orderData.productName || ''} ${orderData.selectedSize || ''} ${orderData.kw || ''}`;

  // 1. Extract Size (e.g. 30mm, 33mm, 35mm, 40mm)
  let size = item.selectedSize || item.size || orderData.selectedSize || orderData.size || '';
  if (!size) {
    const sizeMatch = searchStr.match(/\b(30|33|35|40)\s*mm\b/i) || searchStr.match(/\b(\d+)\s*mm\b/i);
    if (sizeMatch) size = sizeMatch[0];
  }

  // 2. Extract Solar Capacity / kW (e.g. 3 kW, 4 kW, 5 kW, 10 kW)
  let kw = item.kw ? (typeof item.kw === 'number' ? `${item.kw} kW` : item.kw) : (orderData.kw || '');
  if (!kw) {
    const kwMatch = searchStr.match(/\b(\d+\.?\d*)\s*kW\b/i);
    if (kwMatch) kw = kwMatch[0];
  }

  // 3. Extract Clips Count / Pack Units (e.g. 20 Clips, 50 Units)
  let clipsCount = item.clipsCount || item.totalUnits || orderData.totalUnits || orderData.selectedPack || '';
  if (clipsCount && typeof clipsCount === 'number') {
    clipsCount = `${clipsCount} Clips`;
  }
  if (!clipsCount) {
    const clipMatch = searchStr.match(/\b(\d+)\s*(clips|units|pcs|pieces)\b/i);
    if (clipMatch) clipsCount = `${clipMatch[1]} Clips`;
  }

  // Fallback calculation: If kW is known and clips missing, clips = kw * 4. If clips known and kW missing, kw = clips / 4.
  if (kw && !clipsCount) {
    const kwNum = parseFloat(kw);
    if (!isNaN(kwNum) && kwNum > 0) {
      clipsCount = `${Math.round(kwNum * 4)} Clips (${kwNum} kW)`;
    }
  } else if (clipsCount && !kw) {
    const clipNum = parseInt(clipsCount);
    if (!isNaN(clipNum) && clipNum > 0) {
      kw = `${(clipNum / 4)} kW`;
    }
  }

  const category = item.category || (name.toLowerCase().includes('drain') ? 'Maintenance Accessories' : 'Solar Equipment');

  return {
    name,
    size: size || (name.toLowerCase().includes('drain') ? '35mm (Standard)' : null),
    kw: kw || null,
    clipsCount: clipsCount || null,
    variantLabel: variantLabel || (size ? `${size}${kw ? ` • ${kw}` : ''}` : ''),
    category
  };
};

/**
 * Generates formatted WhatsApp message and click URL for Solar Store Order
 */
export const getWhatsAppOrderReceipt = (orderData) => {
  const bookingId = orderData.bookingId || orderData.firestoreOrderId || orderData.orderId || `MSV-${Date.now().toString().slice(-6)}`;
  const address = orderData.address || {};
  const rawItems = orderData.items || (orderData.productName ? [{ name: orderData.productName, price: orderData.totalPrice || orderData.amount, quantity: orderData.quantity || 1 }] : []);
  const custName = (address.fullName || orderData.customerName || orderData.name || 'Valued Customer').trim();
  const custPhone = (address.phone || orderData.customerPhone || orderData.phone || '').replace(/[^0-9]/g, '');
  const custEmail = address.email || orderData.customerEmail || orderData.email || '';
  const fullAddress = [
    address.flat || orderData.flat || orderData.address,
    address.area || orderData.area,
    address.city || orderData.city || orderData.mandal,
    address.district || orderData.district,
    address.state || orderData.state || 'Andhra Pradesh',
    (address.pincode || orderData.pincode) ? `PIN: ${address.pincode || orderData.pincode}` : ''
  ].filter(Boolean).join(', ');

  const totalAmount = orderData.amount || orderData.totalPrice || 0;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  // Build Itemized Breakdown
  const itemsList = rawItems.map((item, idx) => {
    const specs = extractProductSpecs(item, orderData);
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || (totalAmount / (rawItems.length || 1));
    const lineTotal = qty * price;

    let details = [];
    if (specs.size) details.push(`📏 Frame Size: *${specs.size}*`);
    if (specs.kw) details.push(`⚡ Plant Capacity: *${specs.kw}*`);
    if (specs.clipsCount) details.push(`🔢 Units/Clips: *${specs.clipsCount}*`);

    return `  ${idx + 1}. *${specs.name}*
     ${details.length ? details.join(' | ') + '\n     ' : ''}🏷️ Quantity: *${qty}* | Price: *${formatINR(price)}* | Total: *${formatINR(lineTotal)}*`;
  }).join('\n\n') || `  • Solar Store Equipment (Total: ${formatINR(totalAmount)})`;

  // Build Warehouse Packing Slip Notes
  const packingList = rawItems.map((item, idx) => {
    const specs = extractProductSpecs(item, orderData);
    const qty = Number(item.quantity) || 1;
    return `  • Box #${idx + 1}: Pack *${specs.name}* [Size: *${specs.size || 'Standard'}* | Capacity: *${specs.kw || 'N/A'}* | Units: *${specs.clipsCount || (qty + ' Unit')}*]`;
  }).join('\n');

  const message = `🧾 *${BUSINESS_NAME.toUpperCase()} — OFFICIAL ORDER INVOICE*
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Payment Status:* PAID & CONFIRMED (Razorpay Verified)
📦 *Booking / Order ID:* ${bookingId}
💳 *Razorpay Payment ID:* ${orderData.razorpayPaymentId || 'Verified Online'}
💰 *Total Amount Paid:* *${formatINR(totalAmount)}* (Prepaid Online)
📅 *Date & Time:* ${dateStr}

👤 *Customer & Contact Details:*
• *Customer Name:* ${custName}
• *Phone / Mobile:* +91 ${custPhone}
${custEmail ? `• *Email:* ${custEmail}\n` : ''}📍 *Complete Delivery & Shipping Address:*
${fullAddress || 'Address on file'}

🛒 *Ordered Products & Exact Specifications:*
${itemsList}

📦 *WAREHOUSE PACKING INSTRUCTIONS:*
${packingList}
  • Verify frame size & clip count matches solar plant capacity before sealing box.
  • Include official tax invoice & Mirror Solar warranty slip.

${orderData.shiprocketShipmentId ? `🚚 *Shiprocket Shipment ID:* ${orderData.shiprocketShipmentId}\n🔗 *Live Courier Track:* https://shiprocket.co/tracking/${orderData.shiprocketShipmentId}` : '🚚 *Logistics Status:* Order verified, ready for immediate dispatch'}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Support:* ${BUSINESS_PHONE}
🏢 *Dispatch Office:* Opposite Vmax Cinema Hall, Eluru, AP
🌐 *Website:* https://mirrorsolarvision.com`;

  return {
    text: message,
    businessWaUrl: `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`*NEW ORDER BOOKING CONFIRMATION*\n\n${message}`)}`,
    customerShareWaUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(`*My Mirror Solar Vision Order Invoice:*\n\n${message}`)}`
  };
};

/**
 * Generates formatted WhatsApp message for Site Survey Bookings
 */
export const getWhatsAppSiteSurveyText = (surveyData) => {
  const bookingId = surveyData.bookingId || `MSV-SRV-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const message = `☀️ *MIRROR SOLAR VISION — FREE SITE SURVEY BOOKING*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Booking Reference:* ${bookingId}
📅 *Date:* ${dateStr}

👤 *Customer Details:*
• *Name:* ${surveyData.name || 'Customer'}
• *Phone:* ${surveyData.phone || 'N/A'}
• *District:* ${surveyData.district || 'Andhra Pradesh'}
• *Mandal / Town:* ${surveyData.mandal || 'N/A'}

⚡ *Solar Assessment Details:*
• *Monthly Electricity Bill:* ${surveyData.bill || 'Not specified'}
• *Roof Type:* ${surveyData.roofType || 'RCC / Standard'}
• *Preferred Date:* ${surveyData.preferredDate || 'Earliest Available'}

🎯 *Service:* PM Surya Ghar Free Rooftop Shadow Analysis & Layout Design
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Vision:* ${BUSINESS_PHONE}
🌐 *Website:* https://mirrorsolarvision.com`;

  return {
    text: message,
    waUrl: `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`
  };
};

/**
 * Generates formatted WhatsApp message for Quote Requests
 */
export const getWhatsAppQuoteText = (quoteData) => {
  const bookingId = quoteData.bookingId || `MSV-QTE-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const message = `⚡ *MIRROR SOLAR VISION — FREE SOLAR QUOTE REQUEST*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Quote Reference:* ${bookingId}
📅 *Date:* ${dateStr}

👤 *Customer Details:*
• *Name:* ${quoteData.name || 'Customer'}
• *Phone:* ${quoteData.phone || 'N/A'}
• *Email:* ${quoteData.email || 'N/A'}
• *District:* ${quoteData.district || 'Andhra Pradesh'}

📊 *Requirements:*
• *Property Type:* ${quoteData.propertyType || 'Residential'}
• *Monthly Bill:* ${quoteData.monthlyBill || 'N/A'}
• *Inquiry Type:* ${quoteData.inquiryType || 'PM Surya Ghar / Solar Plant'}
${quoteData.message ? `• *Customer Note:* ${quoteData.message}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Vision:* ${BUSINESS_PHONE}
🌐 *Website:* https://mirrorsolarvision.com`;

  return {
    text: message,
    waUrl: `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`
  };
};

/**
 * Generates formatted WhatsApp message for Bulk Combo Orders
 */
export const getWhatsAppBulkComboText = (bulkData) => {
  const bookingId = bulkData.bookingId || `MSV-BLK-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const message = `📦 *MIRROR SOLAR VISION — BULK COMBO ORDER REQUEST*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Booking Reference:* ${bookingId}
📅 *Date:* ${dateStr}

👤 *Customer Details:*
• *Name:* ${bulkData.name || 'Customer'}
• *Company:* ${bulkData.companyName || 'N/A'}
• *Phone:* ${bulkData.phone || 'N/A'}
• *WhatsApp:* ${bulkData.whatsapp || bulkData.phone || 'N/A'}
• *District:* ${bulkData.district || 'Andhra Pradesh'}
• *Delivery Address:* ${bulkData.message || 'N/A'}

🛒 *Package Details:*
• *Combo Name:* ${bulkData.comboName || '100x Solar Polymer Drain Clips + Tool Kit'}
• *Quantity:* ${bulkData.quantity || 1} Set(s)
• *Total Estimate:* ${formatINR(bulkData.totalPrice || (bulkData.quantity || 1) * 15000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Support:* ${BUSINESS_PHONE}
🌐 *Website:* https://mirrorsolarvision.com`;

  return {
    text: message,
    waUrl: `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`
  };
};

/**
 * Submits a Booking / Inquiry:
 * 1. Saves to Firestore
 * 2. Calls Cloud Function to send automated Email + WhatsApp notifications
 * 3. Returns booking ID and WhatsApp direct launch URL
 */
export const submitBookingWithNotification = async (type, data) => {
  const prefixMap = {
    'site_survey': 'SRV',
    'quote_request': 'QTE',
    'bulk_combo': 'BLK',
    'drain_clips': 'DRN',
    'order': 'ORD'
  };
  const prefix = prefixMap[type] || 'MSV';
  const bookingId = `MSV-${prefix}-${Date.now().toString().slice(-6)}`;

  const payload = {
    bookingId,
    type,
    ...data,
    createdAt: serverTimestamp(),
    status: 'new'
  };

  // 1. Direct Firestore write as reliable client database layer
  let collectionName = 'bookings';
  if (type === 'site_survey') collectionName = 'site_surveys';
  else if (type === 'quote_request') collectionName = 'quotes';
  else if (type === 'bulk_combo') collectionName = 'bulk_orders';
  else if (type === 'drain_clips') collectionName = 'drain_clip_orders';

  let firestoreId = null;
  try {
    const docRef = await addDoc(collection(db, collectionName), payload);
    firestoreId = docRef.id;
    await setDoc(doc(db, 'bookings', bookingId), { ...payload, firestoreId }).catch(() => {});
  } catch (dbErr) {
    console.warn("Firestore direct write error:", dbErr);
  }

  // 2. Trigger Cloud Function for Email & WhatsApp Dispatch
  let backendResponse = null;
  try {
    const res = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          type,
          data: { ...data, bookingId, firestoreId }
        }
      })
    });
    if (res.ok) {
      backendResponse = await res.json();
    }
  } catch (fnErr) {
    console.warn("Cloud function trigger error (falling back to direct client notifications):", fnErr);
  }

  // 3. Build WhatsApp redirect link for instant user action
  let waInfo = { text: '', waUrl: '' };
  if (type === 'site_survey') {
    waInfo = getWhatsAppSiteSurveyText({ ...data, bookingId });
  } else if (type === 'quote_request') {
    waInfo = getWhatsAppQuoteText({ ...data, bookingId });
  } else if (type === 'bulk_combo') {
    waInfo = getWhatsAppBulkComboText({ ...data, bookingId });
  } else if (type === 'order') {
    const orderInfo = getWhatsAppOrderReceipt({ ...data, bookingId });
    waInfo = { text: orderInfo.text, waUrl: orderInfo.businessWaUrl };
  }

  return {
    bookingId,
    firestoreId,
    backendResponse,
    waText: waInfo.text,
    waUrl: waInfo.waUrl
  };
};
