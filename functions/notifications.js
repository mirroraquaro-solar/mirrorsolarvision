const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

// Environment & Default Configurations
const rawAdminEmail = process.env.ADMIN_EMAIL || "balajiperuri09@mail.com,balajiperuri09@gmail.com,mirrorsolarvision@gmail.com";
const ADMIN_EMAILS = rawAdminEmail.split(',').map(e => e.trim()).filter(Boolean);
const ADMIN_EMAIL = ADMIN_EMAILS[0] || "balajiperuri09@mail.com";
const ADMIN_WHATSAPP = (process.env.ADMIN_WHATSAPP || "919182612420").replace(/[^0-9]/g, "");
const BUSINESS_NAME = process.env.BUSINESS_NAME || "Mirror Solar Vision";
const BUSINESS_PHONE = "+91 91826 12420";
const BUSINESS_ADDRESS = "Opposite Vmax Cinema Hall, GNT Road, Eluru, Andhra Pradesh - 534001";
const WEBSITE_URL = "https://mirrorsolarvision.com";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || "mirrorsolarvision@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "rxrdvcuobigttjve";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "Mirror Solar Vision";
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "mirrorsolarvision@gmail.com";

const WHATSAPP_GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL || "";
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "";

/**
 * Creates Nodemailer Transporter if credentials provided
 */
function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

/**
 * Format currency in Indian Rupees
 */
function formatINR(val) {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Builds Plaintext & WhatsApp Formatted Text for Solar Store Orders
 */
/**
 * Extracts comprehensive product specifications (Size, kW, Clips Count, Category)
 */
function extractProductSpecs(item, orderData = {}) {
  const name = item.name || item.productName || 'Solar Equipment';
  // Aqua PP Spun Filter support
  if (name.toLowerCase().includes('pp spun') || name.toLowerCase().includes('filter') || (item.productId || '').startsWith('ma-') || (item.sku || '').startsWith('MA-')) {
    return {
      name: name || '10" 5-Micron PP Spun Filter (120g)',
      size: '10 Inch Standard',
      kw: null,
      clipsCount: `${item.quantity || 1} Unit(s) [120g/pc]`,
      variantLabel: '10" 5-Micron Multi-Layer PP Spun Polypropylene (120g)',
      category: 'Water Filtration'
    };
  }

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
}

/**
 * Builds Plaintext & WhatsApp Formatted Text for Solar Store Orders
 */
function renderOrderWhatsAppText(orderData) {
  const bookingId = orderData.bookingId || orderData.firestoreOrderId || `MSV-${Date.now().toString().slice(-6)}`;
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
  }).join('\n\n') || `  • Solar Equipment (Total: ${formatINR(totalAmount)})`;

  // Build Warehouse Packing Slip Notes
  const packingList = rawItems.map((item, idx) => {
    const specs = extractProductSpecs(item, orderData);
    const qty = Number(item.quantity) || 1;
    return `  • Box #${idx + 1}: Pack *${specs.name}* [Size: *${specs.size || 'Standard'}* | Capacity: *${specs.kw || 'N/A'}* | Units: *${specs.clipsCount || (qty + ' Unit')}*]`;
  }).join('\n');

  return `🧾 *${BUSINESS_NAME.toUpperCase()} — OFFICIAL ORDER INVOICE*
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
📞 *Mirror Solar Vision Support:* ${BUSINESS_PHONE}
🏢 *Dispatch Office:* ${BUSINESS_ADDRESS}
🌐 *Website:* ${WEBSITE_URL}`;
}

/**
 * Builds Plaintext & WhatsApp Formatted Text for Rooftop Site Survey Bookings
 */
function renderSurveyWhatsAppText(data) {
  const bookingId = data.bookingId || `MSV-SRV-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  return `☀️ *${BUSINESS_NAME.toUpperCase()} — FREE SITE SURVEY BOOKING*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Booking Reference:* ${bookingId}
📅 *Requested On:* ${dateStr}

👤 *Customer Details:*
• *Name:* ${data.name || 'Customer'}
• *Phone:* ${data.phone || 'N/A'}
• *District:* ${data.district || 'N/A'}
• *Mandal / Town:* ${data.mandal || 'N/A'}

⚡ *Solar Assessment Details:*
• *Monthly Electricity Bill:* ${data.bill || 'Not specified'}
• *Roof Type:* ${data.roofType || 'RCC / Standard'}
• *Preferred Date:* ${data.preferredDate || 'Earliest available'}

🎯 *Action Required:*
Our design engineers will call the customer within 24 hours to schedule physical rooftop inspection.
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Vision:* ${BUSINESS_PHONE}
🌐 *Website:* ${WEBSITE_URL}`;
}

/**
 * Builds Plaintext & WhatsApp Formatted Text for Quote Inquiries
 */
function renderQuoteWhatsAppText(data) {
  const bookingId = data.bookingId || `MSV-QTE-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  return `⚡ *${BUSINESS_NAME.toUpperCase()} — FREE SOLAR QUOTE REQUEST*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Quote Reference:* ${bookingId}
📅 *Submitted On:* ${dateStr}

👤 *Customer Details:*
• *Name:* ${data.name || 'Customer'}
• *Phone:* ${data.phone || 'N/A'}
• *Email:* ${data.email || 'N/A'}
• *District:* ${data.district || 'Andhra Pradesh'}

📊 *Requirements:*
• *Property Type:* ${data.propertyType || 'Residential'}
• *Monthly Bill:* ${data.monthlyBill || 'N/A'}
• *Inquiry Type:* ${data.inquiryType || 'PM Surya Ghar / Solar Plant'}
${data.message ? `• *Customer Note:* ${data.message}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Vision:* ${BUSINESS_PHONE}
🌐 *Website:* ${WEBSITE_URL}`;
}

/**
 * Builds Plaintext & WhatsApp Formatted Text for Bulk Combos
 */
function renderBulkWhatsAppText(data) {
  const bookingId = data.bookingId || `MSV-BLK-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  return `📦 *${BUSINESS_NAME.toUpperCase()} — BULK COMBO ORDER REQUEST*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Booking Reference:* ${bookingId}
📅 *Date:* ${dateStr}

👤 *Customer Details:*
• *Name:* ${data.name || 'Customer'}
• *Company:* ${data.companyName || 'N/A'}
• *Phone:* ${data.phone || 'N/A'}
• *WhatsApp:* ${data.whatsapp || data.phone || 'N/A'}
• *District:* ${data.district || 'Andhra Pradesh'}
• *Delivery Address:* ${data.message || 'N/A'}

🛒 *Package Details:*
• *Combo Name:* ${data.comboName || '100x Solar Polymer Drain Clips + Tool Kit'}
• *Quantity:* ${data.quantity || 1} Set(s)
• *Total Estimate:* ${formatINR(data.totalPrice || (data.quantity || 1) * 15000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Support:* ${BUSINESS_PHONE}
🌐 *Website:* ${WEBSITE_URL}`;
}

/**
 * Generates Rich Responsive HTML Invoice for Orders
 */
function renderOrderEmailHtml(orderData) {
  const bookingId = orderData.bookingId || orderData.firestoreOrderId || `MSV-${Date.now().toString().slice(-6)}`;
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

  // Generate Table Rows with rich badges for Size & kW
  const rows = rawItems.map((item, idx) => {
    const specs = extractProductSpecs(item, orderData);
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || (totalAmount / (rawItems.length || 1));
    const lineTotal = qty * price;
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 14px 10px; font-size: 14px; color: #1e293b;">
          <strong style="color: #0f172a; font-size: 15px;">${idx + 1}. ${specs.name}</strong>
          <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px;">
            ${specs.size ? `<span style="display:inline-block; background-color: #0a2540; color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; margin-right: 4px;">📏 Frame: ${specs.size}</span>` : ''}
            ${specs.kw ? `<span style="display:inline-block; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; margin-right: 4px;">⚡ Capacity: ${specs.kw}</span>` : ''}
            ${specs.clipsCount ? `<span style="display:inline-block; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">🔢 Units: ${specs.clipsCount}</span>` : ''}
          </div>
          ${item.category ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Category: ${item.category}</div>` : ''}
        </td>
        <td style="padding: 14px 10px; font-size: 14px; text-align: center; color: #1e293b; font-weight: bold;">${qty}</td>
        <td style="padding: 14px 10px; font-size: 14px; text-align: right; color: #475569;">${formatINR(price)}</td>
        <td style="padding: 14px 10px; font-size: 14px; text-align: right; font-weight: bold; color: #0f172a;">${formatINR(lineTotal)}</td>
      </tr>
    `;
  }).join('');

  // Warehouse Packing Instruction Cards
  const packingCards = rawItems.map((item, idx) => {
    const specs = extractProductSpecs(item, orderData);
    const qty = Number(item.quantity) || 1;
    return `
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px;">
        <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">Package #${idx + 1}: ${specs.name} (${qty} Set)</p>
        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
          • Frame Size to Pack: <strong style="color: #0f172a; background-color: #f1f5f9; padding: 1px 6px; border-radius: 4px;">${specs.size || 'Standard Size'}</strong> &nbsp;|&nbsp;
          • Solar Capacity: <strong style="color: #047857; background-color: #ecfdf5; padding: 1px 6px; border-radius: 4px;">${specs.kw || 'N/A'}</strong> &nbsp;|&nbsp;
          • Count & Pack: <strong style="color: #92400e; background-color: #fef3c7; padding: 1px 6px; border-radius: 4px;">${specs.clipsCount || (qty + ' Unit')}</strong>
        </p>
      </div>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mirror Solar Vision — Official Order & Packing Invoice</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 660px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;" cellpadding="0" cellspacing="0">
            
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; border-bottom: 4px solid #f59e0b;">
                <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">☀️ MIRROR SOLAR VISION</h1>
                <p style="color: #cbd5e1; margin: 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Official Order Confirmation & Packing Invoice</p>
              </td>
            </tr>

            <!-- Success Alert Badge -->
            <tr>
              <td style="padding: 24px 24px 0 24px;">
                <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
                  <span style="display: inline-block; font-size: 24px; margin-bottom: 4px;">✅</span>
                  <h2 style="color: #065f46; margin: 0 0 4px 0; font-size: 18px; font-weight: 700;">Payment Verified & Order Confirmed!</h2>
                  <p style="color: #047857; margin: 0; font-size: 13px;">Booking Reference: <strong style="font-size: 15px; color: #064e3b; letter-spacing: 0.5px;">${bookingId}</strong></p>
                </div>
              </td>
            </tr>

            <!-- WAREHOUSE PACKING SLIP SECTION -->
            <tr>
              <td style="padding: 20px 24px 0 24px;">
                <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #fcd34d; padding-bottom: 6px;">
                    <strong style="color: #92400e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📦 Warehouse Packing & Dispatch Slip</strong>
                    <span style="background-color: #f59e0b; color: #ffffff; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 9999px;">PRIORITY PACK</span>
                  </div>
                  ${packingCards}
                  <p style="margin: 6px 0 0 0; font-size: 11px; color: #78350f;">
                    ⚠️ <em>Please check frame thickness (30mm / 35mm / 40mm) and clip count before sealing the dispatch box.</em>
                  </p>
                </div>
              </td>
            </tr>

            <!-- Order & Customer Details Grid -->
            <tr>
              <td style="padding: 20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" valign="top" style="padding-right: 10px;">
                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; min-height: 125px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Customer Information</h3>
                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${custName}</p>
                        <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">📞 +91 ${custPhone}</p>
                        ${custEmail ? `<p style="margin: 0; font-size: 13px; color: #475569;">✉️ ${custEmail}</p>` : ''}
                      </div>
                    </td>
                    <td width="50%" valign="top" style="padding-left: 10px;">
                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; min-height: 125px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Delivery & Shipping Address</h3>
                        <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.4;">${fullAddress || 'Address on file'}</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Items Table -->
            <tr>
              <td style="padding: 0 24px 20px 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #334155; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">Order & Product Breakdown</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                      <th align="left" style="padding: 10px 8px; font-size: 12px; color: #475569; text-transform: uppercase;">Product & Specifications</th>
                      <th align="center" style="padding: 10px 8px; font-size: 12px; color: #475569; text-transform: uppercase;">Qty</th>
                      <th align="right" style="padding: 10px 8px; font-size: 12px; color: #475569; text-transform: uppercase;">Unit Price</th>
                      <th align="right" style="padding: 10px 8px; font-size: 12px; color: #475569; text-transform: uppercase;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows || `<tr><td colspan="4" style="padding: 12px; text-align: center;">Solar Store Order (${formatINR(totalAmount)})</td></tr>`}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" align="right" style="padding: 12px 8px 4px 8px; font-size: 13px; color: #64748b;">Subtotal:</td>
                      <td align="right" style="padding: 12px 8px 4px 8px; font-size: 13px; color: #0f172a; font-weight: 600;">${formatINR(totalAmount)}</td>
                    </tr>
                    <tr>
                      <td colspan="3" align="right" style="padding: 4px 8px; font-size: 13px; color: #64748b;">Shipping / Delivery:</td>
                      <td align="right" style="padding: 4px 8px; font-size: 13px; color: #16a34a; font-weight: 600;">FREE (All AP)</td>
                    </tr>
                    <tr style="border-top: 2px solid #0f172a;">
                      <td colspan="3" align="right" style="padding: 12px 8px; font-size: 16px; font-weight: 800; color: #0f172a;">Total Paid:</td>
                      <td align="right" style="padding: 12px 8px; font-size: 18px; font-weight: 900; color: #ea580c;">${formatINR(totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>

            <!-- Payment & Logistics Info Box -->
            <tr>
              <td style="padding: 0 24px 24px 24px;">
                <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 14px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="font-size: 12px; color: #475569;">
                        💳 <strong>Razorpay Payment ID:</strong><br>
                        <span style="font-family: monospace; font-size: 13px; color: #0f172a; font-weight: bold;">${orderData.razorpayPaymentId || 'Verified Online'}</span>
                      </td>
                      <td width="50%" style="font-size: 12px; color: #475569;">
                        📅 <strong>Date & Time:</strong><br>
                        <span style="color: #0f172a; font-weight: 600;">${dateStr}</span>
                      </td>
                    </tr>
                    ${orderData.shiprocketShipmentId ? `
                    <tr>
                      <td colspan="2" style="padding-top: 10px; font-size: 12px; color: #475569;">
                        🚚 <strong>Shiprocket Courier Tracking:</strong><br>
                        Shipment ID: <strong>${orderData.shiprocketShipmentId}</strong> | <a href="https://shiprocket.co/tracking/${orderData.shiprocketShipmentId}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: bold;">Track Package Live &rarr;</a>
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
              </td>
            </tr>

            <!-- WhatsApp Direct Action Button -->
            <tr>
              <td style="padding: 0 24px 28px 24px; text-align: center;">
                <a href="https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Hello Mirror Solar Vision, I have an inquiry about order ${bookingId}`)}" target="_blank" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(34,197,94,0.3);">
                  💬 Chat on WhatsApp (+91 91826 12420)
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #0f172a; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                <p style="margin: 0 0 6px 0; color: #f8fafc; font-weight: bold;">${BUSINESS_NAME}</p>
                <p style="margin: 0 0 4px 0;">${BUSINESS_ADDRESS}</p>
                <p style="margin: 0;">Phone: ${BUSINESS_PHONE} | Website: <a href="${WEBSITE_URL}" style="color: #fbbf24; text-decoration: none;">${WEBSITE_URL}</a></p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Generates Rich HTML for Leads (Survey, Quote, Bulk)
 */
function renderLeadEmailHtml(type, leadData) {
  let title = "New Website Lead";
  let badgeText = "New Inquiry";
  let badgeColor = "#0284c7";

  if (type === 'site_survey') {
    title = "☀️ New PM Surya Ghar Rooftop Site Survey Booking";
    badgeText = "Site Survey";
    badgeColor = "#f59e0b";
  } else if (type === 'quote_request') {
    title = "⚡ New Solar Quote & Custom Layout Request";
    badgeText = "Quote Request";
    badgeColor = "#10b981";
  } else if (type === 'bulk_combo') {
    title = "📦 New Bulk Combo Order Request";
    badgeText = "Bulk Order";
    badgeColor = "#8b5cf6";
  }

  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
    <table width="100%" style="background-color:#f8fafc; padding: 24px 12px;" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #0f172a; padding: 24px; text-align: center; border-bottom: 4px solid #f59e0b;">
                <span style="background-color: ${badgeColor}; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px;">${badgeText}</span>
                <h2 style="color: #ffffff; margin: 12px 0 0 0; font-size: 20px;">${title}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748b;">Booking Reference: <strong>${leadData.bookingId || 'N/A'}</strong> | Received: <strong>${dateStr}</strong></p>
                
                <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px;">
                  ${leadData.name ? `<tr><td width="35%" style="color:#64748b; font-weight:600;">Full Name:</td><td style="color:#0f172a; font-weight:bold;">${leadData.name}</td></tr>` : ''}
                  ${leadData.companyName ? `<tr><td style="color:#64748b; font-weight:600;">Company:</td><td style="color:#0f172a;">${leadData.companyName}</td></tr>` : ''}
                  ${leadData.phone ? `<tr><td style="color:#64748b; font-weight:600;">Phone / Mobile:</td><td style="color:#0f172a; font-weight:bold;"><a href="tel:${leadData.phone}" style="color:#0284c7; text-decoration:none;">${leadData.phone}</a></td></tr>` : ''}
                  ${leadData.whatsapp ? `<tr><td style="color:#64748b; font-weight:600;">WhatsApp:</td><td style="color:#0f172a;"><a href="https://wa.me/91${leadData.whatsapp.replace(/[^0-9]/g, '')}" style="color:#16a34a; text-decoration:none;">+91 ${leadData.whatsapp}</a></td></tr>` : ''}
                  ${leadData.email ? `<tr><td style="color:#64748b; font-weight:600;">Email:</td><td style="color:#0f172a;"><a href="mailto:${leadData.email}" style="color:#0284c7; text-decoration:none;">${leadData.email}</a></td></tr>` : ''}
                  ${leadData.district ? `<tr><td style="color:#64748b; font-weight:600;">District:</td><td style="color:#0f172a;">${leadData.district}</td></tr>` : ''}
                  ${leadData.mandal ? `<tr><td style="color:#64748b; font-weight:600;">Mandal / Town:</td><td style="color:#0f172a;">${leadData.mandal}</td></tr>` : ''}
                  ${leadData.bill ? `<tr><td style="color:#64748b; font-weight:600;">Monthly Bill:</td><td style="color:#0f172a;">${leadData.bill}</td></tr>` : ''}
                  ${leadData.monthlyBill ? `<tr><td style="color:#64748b; font-weight:600;">Monthly Bill:</td><td style="color:#0f172a;">${leadData.monthlyBill}</td></tr>` : ''}
                  ${leadData.roofType ? `<tr><td style="color:#64748b; font-weight:600;">Roof Type:</td><td style="color:#0f172a;">${leadData.roofType}</td></tr>` : ''}
                  ${leadData.preferredDate ? `<tr><td style="color:#64748b; font-weight:600;">Preferred Date:</td><td style="color:#0f172a;">${leadData.preferredDate}</td></tr>` : ''}
                  ${leadData.propertyType ? `<tr><td style="color:#64748b; font-weight:600;">Property Type:</td><td style="color:#0f172a;">${leadData.propertyType}</td></tr>` : ''}
                  ${leadData.quantity ? `<tr><td style="color:#64748b; font-weight:600;">Quantity:</td><td style="color:#0f172a; font-weight:bold;">${leadData.quantity} Set(s)</td></tr>` : ''}
                  ${leadData.totalPrice ? `<tr><td style="color:#64748b; font-weight:600;">Total Estimate:</td><td style="color:#ea580c; font-weight:bold;">${formatINR(leadData.totalPrice)}</td></tr>` : ''}
                  ${leadData.message ? `<tr><td style="color:#64748b; font-weight:600;">Notes / Address:</td><td style="color:#334155;">${leadData.message}</td></tr>` : ''}
                </table>

                <div style="margin-top: 24px; text-align: center;">
                  <a href="https://wa.me/91${(leadData.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${leadData.name || ''}, thank you for contacting Mirror Solar Vision regarding your ${badgeText}.`)}" style="display:inline-block; background-color:#22c55e; color:#ffffff; font-weight:bold; padding:12px 20px; border-radius:10px; text-decoration:none; font-size:14px;">
                    💬 Open Customer Chat on WhatsApp
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f1f5f9; padding: 14px; text-align: center; color: #64748b; font-size: 11px;">
                ${BUSINESS_NAME} Automated Booking Notifications System
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Sends Email via Nodemailer if SMTP configured, logs and stores diagnostic otherwise
 */
async function sendEmailNotification({ to, subject, html, text, cc }) {
  const transporter = getTransporter();
  const recipientList = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);

  if (!recipientList.length) {
    recipientList.push(ADMIN_EMAIL);
  }

  const mailOptions = {
    from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
    to: recipientList.join(', '),
    subject: subject,
    text: text || "Mirror Solar Vision Notification",
    html: html
  };

  if (cc) {
    mailOptions.cc = Array.isArray(cc) ? cc.filter(Boolean).join(', ') : cc;
  }

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${mailOptions.to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("Nodemailer sendMail failed:", err);
      if (admin.apps && admin.apps.length) {
        await admin.firestore().collection('notifications_log').add({
          channel: 'email',
          status: 'smtp_error',
          error: err.message || String(err),
          recipient: mailOptions.to,
          subject: subject,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});
      }
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[SMTP Notification Queued] ${mailOptions.to} - "${subject}"`);
    if (admin.apps && admin.apps.length) {
      await admin.firestore().collection('notifications_log').add({
        channel: 'email',
        status: 'pending_smtp_credentials',
        recipient: mailOptions.to,
        subject: subject,
        note: 'Configure SMTP_USER and SMTP_PASS in Cloud Functions .env to enable direct live SMTP sending.',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }).catch(() => {});
    }
    return { success: true, queued: true, note: 'SMTP credentials pending in .env' };
  }
}

/**
 * Sends WhatsApp notification to Gateway if configured, logs message
 */
async function sendWhatsAppAlert({ phone, message }) {
  const targetPhone = (phone || ADMIN_WHATSAPP).replace(/[^0-9]/g, '');
  console.log(`[WhatsApp Alert Prepared for +${targetPhone}]:\n${message}`);

  if (WHATSAPP_GATEWAY_URL) {
    try {
      const response = await fetch(WHATSAPP_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          message: message,
          apiKey: WHATSAPP_API_KEY
        })
      });
      const data = await response.json().catch(() => ({}));
      return { success: response.ok, data };
    } catch (err) {
      console.error("WhatsApp Gateway call failed:", err);
      return { success: false, error: err.message };
    }
  }

  // Record dispatch in Firestore
  if (admin.apps && admin.apps.length) {
    await admin.firestore().collection('notifications_log').add({
      channel: 'whatsapp',
      targetPhone: targetPhone,
      messageSnippet: message.substring(0, 300),
      status: 'recorded',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }).catch(() => {});
  }

  return { success: true, directWaLink: `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}` };
}

/**
 * Universal Dispatcher: Sends Email + WhatsApp for any order or booking
 */
async function dispatchBookingNotifications(type, data) {
  let waText = '';
  let emailHtml = '';
  let emailSubject = '';
  const customerEmail = data.email || data.customerEmail || data.address?.email || data.billing_email || data.userEmail || null;
  const customerPhone = data.phone || data.customerPhone || data.address?.phone || data.billing_phone || null;

  if (type === 'order') {
    const bookingId = data.bookingId || data.firestoreOrderId || 'MSV-ORD';
    waText = renderOrderWhatsAppText(data);
    emailHtml = renderOrderEmailHtml(data);
    const storeBranding = (bookingId.startsWith('MA') || (data.items && data.items.some(it => (it.productId || '').startsWith('ma-')))) ? 'Mirror Aqua' : BUSINESS_NAME;
    emailSubject = `Order Confirmed: ${bookingId} — ${storeBranding} (₹${Number(data.amount || 0).toLocaleString('en-IN')})`;
  } else if (type === 'site_survey') {
    waText = renderSurveyWhatsAppText(data);
    emailHtml = renderLeadEmailHtml(type, data);
    emailSubject = `☀️ New Rooftop Site Survey Booking: ${data.name || 'Customer'} (${data.district || 'AP'})`;
  } else if (type === 'quote_request') {
    waText = renderQuoteWhatsAppText(data);
    emailHtml = renderLeadEmailHtml(type, data);
    emailSubject = `⚡ New Free Solar Quote Request: ${data.name || 'Customer'} (${data.district || 'AP'})`;
  } else if (type === 'bulk_combo') {
    waText = renderBulkWhatsAppText(data);
    emailHtml = renderLeadEmailHtml(type, data);
    emailSubject = `📦 New Bulk Combo Order: ${data.name || 'Customer'} (${data.quantity || 1} Sets - ₹${Number(data.totalPrice || 0).toLocaleString('en-IN')})`;
  } else {
    waText = `📋 *New Booking on ${BUSINESS_NAME}*\n\n${JSON.stringify(data, null, 2)}`;
    emailHtml = renderLeadEmailHtml('inquiry', data);
    emailSubject = `New Notification from ${BUSINESS_NAME}`;
  }

  // 1. Send Email: to Admin recipients (balajiperuri09@mail.com, balajiperuri09@gmail.com, mirrorsolarvision@gmail.com) AND Customer
  const recipients = [...ADMIN_EMAILS];
  if (customerEmail && customerEmail.trim() && !recipients.some(r => r.toLowerCase() === customerEmail.trim().toLowerCase())) {
    recipients.push(customerEmail.trim());
  }

  const emailPromise = sendEmailNotification({
    to: recipients,
    subject: emailSubject,
    html: emailHtml,
    text: waText
  });

  // 2. Send WhatsApp alert to Admin Number (+91 8639103947)
  const waAdminPromise = sendWhatsAppAlert({
    phone: ADMIN_WHATSAPP,
    message: `📢 *NEW WEBSITE NOTIFICATION*\n\n${waText}`
  });

  // 3. Send WhatsApp alert to Customer Number (if customer provided phone)
  let waCustPromise = Promise.resolve(null);
  if (customerPhone && customerPhone.replace(/[^0-9]/g, '') !== ADMIN_WHATSAPP) {
    waCustPromise = sendWhatsAppAlert({
      phone: customerPhone,
      message: waText
    });
  }

  const [emailRes, waAdminRes, waCustRes] = await Promise.allSettled([emailPromise, waAdminPromise, waCustPromise]);

  return {
    email: emailRes.status === 'fulfilled' ? emailRes.value : { error: emailRes.reason },
    waAdmin: waAdminRes.status === 'fulfilled' ? waAdminRes.value : { error: waAdminRes.reason },
    waCustomer: waCustRes.status === 'fulfilled' ? waCustRes.value : null,
    renderedWhatsAppText: waText
  };
}

module.exports = {
  dispatchBookingNotifications,
  renderOrderWhatsAppText,
  renderSurveyWhatsAppText,
  renderQuoteWhatsAppText,
  renderBulkWhatsAppText,
  renderOrderEmailHtml,
  renderLeadEmailHtml,
  sendEmailNotification,
  sendWhatsAppAlert,
  ADMIN_EMAIL,
  ADMIN_WHATSAPP
};
