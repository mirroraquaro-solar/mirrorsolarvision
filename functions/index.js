const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require('cors')({origin: true});

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
          await orderRef.update({
            status: 'paid',
            razorpayPaymentId: rzpPaymentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Trigger Shiprocket if not already done
          if (!orderData.shiprocketOrderId) {
            // Here you would trigger Shiprocket just like verifyRazorpayPayment
            // For brevity, the frontend verification will usually handle this first.
          }
        }
      }
    }

    res.status(200).send('ok');
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    res.status(500).send('Error processing webhook');
  }
});

exports.shiprocketWebhook = functions.https.onRequest(async (req, res) => {
  // Always accept any test ping or preflight
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    return res.status(200).json({ success: true, message: 'Webhook active' });
  }

  try {
    const data = req.body || {};
    console.log("Shiprocket Webhook Payload received:", JSON.stringify(data));

    const awb = data.awb || data.awb_code || null;
    const currentStatus = (data.current_status || data.shipment_status || data.status || data.current_status_id || '').toString().trim();
    const shipmentId = data.shipment_id ? String(data.shipment_id) : null;
    const orderId = data.order_id ? String(data.order_id) : null;

    if (currentStatus || awb) {
      const updatePayload = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      if (currentStatus) updatePayload.shiprocketStatus = currentStatus;
      if (awb) updatePayload.shiprocketAwb = awb;
      if (shipmentId) updatePayload.shiprocketShipmentId = shipmentId;
      if (data.courier_name) updatePayload.courierName = data.courier_name;
      if (data.etd) updatePayload.estimatedDelivery = data.etd;

      // 1. Try finding by Firestore Order ID directly in root 'orders'
      if (orderId) {
        try {
          const rootDoc = await admin.firestore().collection('orders').doc(orderId).get();
          if (rootDoc.exists) {
            await rootDoc.ref.update(updatePayload);
            const userId = rootDoc.data()?.userId;
            if (userId && userId !== 'anonymous') {
              await admin.firestore().collection('users').doc(userId).collection('orders').doc(orderId).update(updatePayload).catch(() => {});
            }
          }
        } catch (e) {
          console.warn("Could not update root doc by order_id:", e);
        }
      }

      // 2. Also search via collectionGroup query by shipment_id, awb, or order_id
      const queryList = [];
      if (shipmentId) {
        queryList.push(admin.firestore().collectionGroup('orders').where('shiprocketShipmentId', '==', shipmentId).get());
        queryList.push(admin.firestore().collectionGroup('orders').where('shiprocketShipmentId', '==', Number(shipmentId)).get());
      }
      if (awb) {
        queryList.push(admin.firestore().collectionGroup('orders').where('shiprocketAwb', '==', awb).get());
      }
      if (orderId) {
        queryList.push(admin.firestore().collectionGroup('orders').where('shiprocketOrderId', '==', orderId).get());
      }

      const results = await Promise.all(queryList);
      for (const snap of results) {
        for (const docSnap of snap.docs) {
          await docSnap.ref.update(updatePayload).catch(() => {});
          // Also sync to root orders if it's a subcollection doc
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
      if (!trackingId) {
        return res.status(400).send({ data: { error: 'Tracking ID (AWB or Shipment ID) required' } });
      }

      const token = await getShiprocketToken();
      // Try tracking via AWB or Shipment ID
      const trackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!trackRes.ok) {
        // Fallback to shipment track
        const shipTrackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${trackingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const shipData = await shipTrackRes.json();
        return res.status(200).send({ data: shipData });
      }

      const data = await trackRes.json();
      return res.status(200).send({ data });
    } catch (error) {
      console.error("Shiprocket Tracking fetch error:", error);
      res.status(500).send({ data: { error: 'Failed to fetch tracking info' } });
    }
  });
});
