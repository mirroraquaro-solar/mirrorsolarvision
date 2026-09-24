const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require('cors')({origin: true});
const { 
  dispatchBookingNotifications 
} = require("./notifications");

admin.initializeApp();

// Configuration using modern .env variables
const rzp_key_id = process.env.RAZORPAY_KEY_ID || "test_key_id";
const rzp_key_secret = process.env.RAZORPAY_KEY_SECRET || "test_key_secret";

const sr_email = process.env.SHIPROCKET_EMAIL || "test@example.com";
const sr_password = process.env.SHIPROCKET_PASSWORD || "test_password";

const razorpayInstance = new Razorpay({
  key_id: rzp_key_id,
  key_secret: rzp_key_secret,
});

// Helper to get Shiprocket Token
async function getShiprocketToken() {
  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: sr_email, password: sr_password })
  });
  if (!response.ok) {
    throw new Error('Failed to authenticate with Shiprocket');
  }
  const data = await response.json();
  return data.token;
}

exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      // We now expect 'address' to be passed from the frontend CheckoutPage
      const { amount, items, userId, address } = req.body.data || req.body; 
      
      // Clean, official Website Booking ID format (e.g. MSV-729401)
      const bookingId = `MSV-${Date.now().toString().slice(-6)}`;

      const options = {
        amount: amount * 100, // paise
        currency: "INR",
        receipt: bookingId,
      };

      const order = await razorpayInstance.orders.create(options);

      // Save order and address to Firestore
      const uid = userId || 'anonymous';
      const cleanPhone = (address?.phone || '').replace(/[^0-9]/g, '');
      const customerEmail = address?.email || 'info@mirrorsolarvision.com';
      const customerName = address?.fullName || 'Customer';

      const orderDataToSave = {
        userId: uid,
        bookingId: bookingId,
        firestoreOrderId: bookingId,
        customerName: customerName,
        customerPhone: cleanPhone,
        customerEmail: customerEmail,
        items: items || [],
        amount: amount,
        address: address || {}, // Store delivery address
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
      console.error(error);
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
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, firestoreOrderId, userId } = req.body.data || req.body;

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

      // 2. Fetch Order Details for Shiprocket
      let orderSnap = await userOrderDocRef.get();
      if (!orderSnap.exists) {
        orderSnap = await rootOrderDocRef.get();
      }

      if (!orderSnap.exists) {
         return res.status(200).send({ data: { success: true, message: 'Payment verified but order missing in DB' } });
      }
      
      const orderData = orderSnap.data();
      const orderBookingId = orderData.bookingId || firestoreOrderId;
      const address = orderData.address || {};
      const items = orderData.items || [];
      const cleanPhone = (address.phone || orderData.customerPhone || '9849810668').replace(/[^0-9]/g, '');
      const custEmail = address.email || orderData.customerEmail || 'orders@mirrorsolarvision.com';
      const custName = (address.fullName || orderData.customerName || 'Customer').trim();
      const nameParts = custName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      // 3. Create Shiprocket Order
      try {
        const token = await getShiprocketToken();
        
        // Map items to Shiprocket format
        const orderItems = items.map(item => ({
          name: item.name || 'Solar Product',
          sku: (item.productId || item.cartItemId || item.id || `SKU_${Date.now()}`).substring(0, 50),
          units: Number(item.quantity) || 1,
          selling_price: Number(item.price) || (orderData.amount / (items.length || 1)),
          discount: 0,
          tax: 0,
          hsn: ''
        }));

        // Format order_date in Shiprocket expected format: 'YYYY-MM-DD HH:MM'
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const formattedOrderDate = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

        const shiprocketPayload = {
          order_id: orderBookingId, // Pass official MSV-XXXXXX Booking ID to Shiprocket
          order_date: formattedOrderDate,
          pickup_location: "work", // Matches exact primary pickup location nickname in Shiprocket
          channel_id: "",
          comment: `Mirror Solar Store Booking ID: ${orderBookingId} - Phone: ${cleanPhone}`,
          billing_customer_name: firstName,
          billing_last_name: lastName || "Customer",
          billing_address: address.flat || address.area || "Main Road",
          billing_address_2: address.area || address.city || "Area",
          billing_city: address.city || "Eluru",
          billing_pincode: address.pincode || "534001",
          billing_state: address.state || "Andhra Pradesh",
          billing_country: "India",
          billing_email: custEmail,
          billing_phone: cleanPhone.length === 10 ? cleanPhone : "9849810668",
          shipping_is_billing: true,
          order_items: orderItems,
          payment_method: "Prepaid",
          sub_total: orderData.amount,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5 // in kg
        };

        console.log("Sending Shiprocket Payload with Booking ID:", orderBookingId);

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

        // We still return success: true because the PAYMENT was successful
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
        const orderRef = snapshot.docs[0].ref;
        const orderData = snapshot.docs[0].data();

        // If not already paid, mark as paid
        if (orderData.status !== 'paid') {
          const updatedPaidOrder = {
            ...orderData,
            status: 'paid',
            razorpayPaymentId: rzpPaymentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          await orderRef.update({
            status: 'paid',
            razorpayPaymentId: rzpPaymentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Trigger automated WhatsApp & Email notification via webhook fallback
          dispatchBookingNotifications('order', updatedPaidOrder).catch((e) => console.error("Webhook notification error:", e));
        }
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

      const results = await Promise.all(queryList);
      for (const snap of results) {
        for (const docSnap of snap.docs) {
          await docSnap.ref.update(updatePayload).catch(() => {});
          const docId = docSnap.id;
          await admin.firestore().collection('orders').doc(docId).update(updatePayload).catch(() => {});
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

