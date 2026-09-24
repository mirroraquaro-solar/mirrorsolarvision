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
 * Generates formatted WhatsApp message for Drain Clips Quick Orders
 */
export const getWhatsAppDrainClipsText = (orderData) => {
  return getWhatsAppOrderReceipt(orderData);
};

/**
 * Generates direct customer WhatsApp click-to-chat URL with pre-filled confirmation text
 */
export const getCustomerWhatsAppUrl = (phone, text) => {
  const cleanPhone = (phone || '').toString().replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    return `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(text)}`;
  } else if (cleanPhone.length > 10) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};

/**
 * Clean browser print utility for official confirmation document / slip
 */
export const printConfirmationDocument = ({
  title = 'OFFICIAL ORDER CONFIRMATION SLIP',
  bookingId = '',
  date = '',
  customerName = '',
  customerPhone = '',
  customerEmail = '',
  address = '',
  items = [],
  totalAmount = 0,
  paymentStatus = 'Confirmed',
  paymentId = '',
  shipmentId = '',
  notes = '',
  _type = 'order'
}) => {
  const dateStr = date || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const itemsRows = (items && items.length > 0)
    ? items.map((item, idx) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const rowTotal = qty * price || (totalAmount && items.length === 1 ? totalAmount : price);
        const specs = [];
        if (item.selectedSize || item.size) specs.push(`Size: ${item.selectedSize || item.size}`);
        if (item.kw) specs.push(`Capacity: ${item.kw}${typeof item.kw === 'number' ? ' kW' : ''}`);
        if (item.clipsCount) specs.push(`Units: ${item.clipsCount}`);
        if (item.variantLabel && !specs.length) specs.push(item.variantLabel);

        return `<tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#0f172a;">
            <strong>${idx + 1}. ${item.name || item.productName || 'Solar Equipment'}</strong>
            ${specs.length ? `<div style="font-size:11px; color:#64748b; margin-top:2px;">${specs.join(' • ')}</div>` : ''}
          </td>
          <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:center; color:#334155;">${qty}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:right; color:#334155;">${price > 0 ? formatINR(price) : 'Included'}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:right; font-weight:bold; color:#0f172a;">${rowTotal > 0 ? formatINR(rowTotal) : formatINR(totalAmount)}</td>
        </tr>`;
      }).join('')
    : `<tr>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#0f172a;"><strong>${title} Details</strong></td>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:center; color:#334155;">1</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:right; color:#334155;">${totalAmount > 0 ? formatINR(totalAmount) : 'Standard'}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:right; font-weight:bold; color:#0f172a;">${totalAmount > 0 ? formatINR(totalAmount) : 'Registered'}</td>
      </tr>`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(bookingId || 'MSV')}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${bookingId || 'Mirror Solar Vision'}</title>
  <style>
    * { box-sizing: border-box; margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #ffffff; color: #0f172a; padding: 24px; font-size: 13px; line-height: 1.5; }
    .doc-container { max-width: 780px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 28px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; border-bottom: 2px solid #0A2540; }
    .brand-title { font-size: 22px; font-weight: 900; color: #0A2540; letter-spacing: -0.5px; }
    .brand-title span { color: #F58220; }
    .brand-subtitle { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-top: 2px; }
    .company-info { font-size: 11px; color: #475569; text-align: right; line-height: 1.4; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .ref-block { display: flex; justify-content: space-between; margin: 18px 0; padding: 14px 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .ref-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .ref-value { font-size: 15px; font-weight: 800; color: #0A2540; font-family: monospace; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .card { padding: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; }
    .card-title { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #0A2540; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: left; padding: 8px 12px; }
    th.text-center { text-align: center; }
    th.text-right { text-align: right; }
    .total-box { margin-top: 12px; text-align: right; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .footer { margin-top: 24px; padding-top: 14px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
    .print-actions { margin-bottom: 16px; text-align: right; }
    .btn-print { background: #0A2540; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer; }
    @media print {
      body { padding: 0; }
      .doc-container { border: none; padding: 0; }
      .print-actions { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="doc-container">
    <div class="header">
      <div>
        <div class="brand-title">MIRROR SOLAR <span>VISION</span></div>
        <div class="brand-subtitle">${title}</div>
        <div class="badge">✓ ${paymentStatus}</div>
      </div>
      <div class="company-info">
        <strong>Mirror Solar Vision</strong><br/>
        Opposite Vmax Cinema Hall, GNT Road<br/>
        Eluru, Andhra Pradesh - 534001<br/>
        Support: +91 91826 12420 | info@mirrorsolarvision.com<br/>
        Website: mirrorsolarvision.com
      </div>
    </div>

    <div class="ref-block">
      <div>
        <div class="ref-label">Booking / Order Reference</div>
        <div class="ref-value">${bookingId || 'MSV-ORD'}</div>
      </div>
      <div style="text-align:right;">
        <div class="ref-label">Date & Time</div>
        <div style="font-weight:700; color:#0f172a;">${dateStr}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Customer Details</div>
        <div><strong>Name:</strong> ${customerName || 'Valued Customer'}</div>
        <div><strong>Phone:</strong> +91 ${customerPhone || 'On file'}</div>
        ${customerEmail ? `<div><strong>Email:</strong> ${customerEmail}</div>` : ''}
        ${paymentId ? `<div><strong>Razorpay Payment ID:</strong> <span style="font-family:monospace; font-weight:bold;">${paymentId}</span></div>` : ''}
        ${shipmentId ? `<div><strong>Shiprocket Shipment ID:</strong> <span style="font-family:monospace; font-weight:bold;">${shipmentId}</span></div>` : ''}
      </div>

      <div class="card">
        <div class="card-title">${address ? 'Delivery / Installation Location' : 'Requirement Details'}</div>
        <div>${address || 'Address provided during booking.'}</div>
        ${notes ? `<div style="margin-top:6px; color:#475569; font-style:italic;">Note: ${notes}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description & Specifications</th>
          <th class="text-center" style="width:70px;">Qty</th>
          <th class="text-right" style="width:110px;">Unit Rate</th>
          <th class="text-right" style="width:130px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    ${totalAmount > 0 ? `
    <div class="total-box">
      <div style="font-size:14px; font-weight:800; color:#0A2540;">
        Total Amount: <span style="color:#047857; font-size:17px;">${formatINR(totalAmount)}</span>
      </div>
      <div style="font-size:11px; color:#64748b; margin-top:2px;">
        ${paymentId ? 'Prepaid Online via Razorpay' : 'Payable on Dispatch / Confirmation'}
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <div>
        <p>• Official computer-generated confirmation slip issued by Mirror Solar Vision.</p>
        <p>• For dispatch tracking or technical support, contact <strong>+91 91826 12420</strong>.</p>
      </div>
      <img src="${qrUrl}" alt="QR Code" style="width:64px; height:64px; border:1px solid #cbd5e1; border-radius:6px; padding:2px;" />
    </div>
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => { window.print(); }, 400);
    });
  </script>
</body>
</html>`;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  } else {
    // Fallback if popup blocker is active: use an iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 3000);
    }, 500);
  }
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
  } else if (type === 'order' || type === 'drain_clips') {
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

/**
 * Live On-Demand Shiprocket Tracking Service
 */
const SHIPROCKET_TRACKING_URL = 'https://us-central1-mirror-solar-vision.cloudfunctions.net/getShiprocketTracking';

export const fetchLiveShiprocketTracking = async (trackingId, options = {}) => {
  const lookupKey = (trackingId || options.bookingId || options.orderId || '').toString().trim();
  if (!lookupKey) return null;

  try {
    const res = await fetch(SHIPROCKET_TRACKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          trackingId: lookupKey,
          bookingId: options.bookingId || null,
          orderId: options.orderId || null
        }
      })
    });

    if (!res.ok) {
      // Try GET fallback with query params
      const getRes = await fetch(`${SHIPROCKET_TRACKING_URL}?trackingId=${encodeURIComponent(lookupKey)}&bookingId=${encodeURIComponent(options.bookingId || '')}`);
      if (getRes.ok) {
        const getData = await getRes.json();
        return getData?.data || getData;
      }
      return null;
    }

    const json = await res.json();
    return json?.data || json;
  } catch (err) {
    console.warn('Shiprocket live tracking lookup error:', err);
    return null;
  }
};

/**
 * Universal Stage & Milestone Normalizer for Orders
 * Stages:
 *  0 -> Ordered & Packed (Order Placed)
 *  1 -> Shipped & In Transit (Handed to courier / on route)
 *  2 -> Out for Delivery (Courier boy out for final drop)
 *  3 -> Delivered (Successfully handed over to customer)
 */
export const parseShiprocketTrackingMilestone = (order = {}) => {
  const raw = (order.shiprocketStatus || order.status || '').toString().toUpperCase().trim();
  const rawCode = Number(order.shiprocketStatusCode || 0);

  // 1. Check Delivered (Stage 3 - 100%)
  if (
    rawCode === 7 || rawCode === 42 || rawCode === 43 ||
    raw.includes('DELIVERED') || raw.includes('DLVD') || raw.includes('CLOSED')
  ) {
    return {
      stageIndex: 3,
      headline: 'Delivered to Customer',
      badge: 'Delivered',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      progressPercent: 100,
      tooltipLabel: 'Delivered',
      tooltipPosition: '90%',
      isDelivered: true,
      isOutForDelivery: true,
      isShipped: true,
      isOrdered: true
    };
  }

  // 2. Check Out For Delivery (Stage 2 - ~66%)
  if (
    rawCode === 17 || rawCode === 41 ||
    raw.includes('OUT FOR DELIVERY') || raw.includes('OUT_FOR_DELIVERY') || raw.includes('OFD') || raw.includes('REACHED AT DESTINATION') || raw.includes('DESTINATION HUB')
  ) {
    return {
      stageIndex: 2,
      headline: 'Out for Delivery Today',
      badge: 'Out for Delivery',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      progressPercent: 66,
      tooltipLabel: 'Out for Delivery',
      tooltipPosition: '63%',
      isDelivered: false,
      isOutForDelivery: true,
      isShipped: true,
      isOrdered: true
    };
  }

  // 3. Check Shipped & In Transit (Stage 1 - ~33%)
  if (
    rawCode === 6 || rawCode === 18 || rawCode === 19 || rawCode === 38 || rawCode === 21 || rawCode === 22 ||
    raw.includes('SHIPPED') || raw.includes('IN TRANSIT') || raw.includes('IN_TRANSIT') || raw.includes('PICKED UP') || raw.includes('PICKUP') || raw.includes('MANIFEST')
  ) {
    return {
      stageIndex: 1,
      headline: 'Shipped & In Transit',
      badge: 'In Transit',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      progressPercent: 33,
      tooltipLabel: 'Shipped & In Transit',
      tooltipPosition: '38%',
      isDelivered: false,
      isOutForDelivery: false,
      isShipped: true,
      isOrdered: true
    };
  }

  // 4. Default: Order Placed & Packed (Stage 0 - 10%)
  return {
    stageIndex: 0,
    headline: 'Order Placed & Packed',
    badge: 'Order Packed',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    progressPercent: 10,
    tooltipLabel: 'Order Packed',
    tooltipPosition: '12%',
    isDelivered: false,
    isOutForDelivery: false,
    isShipped: false,
    isOrdered: true
  };
};
