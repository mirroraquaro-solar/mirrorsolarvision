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
      const { amount, items, userId, address } = req.body.data; 
      
      const options = {
        amount: amount * 100, // paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpayInstance.orders.create(options);

      // Save order and address to Firestore
      const uid = userId || 'anonymous';
      const cleanPhone = (address?.phone || '').replace(/[^0-9]/g, '');
      const customerEmail = address?.email || 'info@mirrorsolarvision.com';
      const customerName = address?.fullName || 'Customer';

      const orderDataToSave = {
        userId: uid,
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

      const orderRef = await admin.firestore().collection('users').doc(uid).collection('orders').add(orderDataToSave);

      // Also mirror to root 'orders' collection for instant lookup by order ID / phone
      try {
        await admin.firestore().collection('orders').doc(orderRef.id).set({
          ...orderDataToSave,
          firestoreOrderId: orderRef.id
        });
      } catch (rootSaveErr) {
        console.warn("Could not write to root orders collection:", rootSaveErr);
      }

      res.status(200).send({
        data: {
          id: order.id,
          currency: order.currency,
          amount: order.amount,
          firestoreOrderId: orderRef.id
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
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, firestoreOrderId, userId } = req.body.data;

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
      const address = orderData.address || {};
      const items = orderData.items || [];
      const cleanPhone = (address.phone || orderData.customerPhone || '9999999999').replace(/[^0-9]/g, '');
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
          sku: item.id || `SKU_${Date.now()}`,
          units: item.quantity || 1,
          selling_price: item.price || (orderData.amount / (items.length || 1)),
          discount: 0,
          tax: 0,
          hsn: ''
        }));

        const shiprocketPayload = {
          order_id: firestoreOrderId, // Unique Order ID in Shiprocket
          order_date: new Date().toISOString(),
          pickup_location: "MIRROR SOLAR VISION, opposite Vijayalakshmi cinema hall, ELURU, 534001, opposite V max cinema hall, West Godavari, Andhra Pradesh, India, 534001", // Matches warehouse/pickup name in Shiprocket dashboard
          channel_id: "",
          comment: `Mirror Solar Store Order - Customer Phone: ${cleanPhone}`,
          billing_customer_name: firstName,
          billing_last_name: lastName,
          billing_address: address.flat || address.area || "Address line",
          billing_address_2: address.area || "",
          billing_city: address.city || "City",
          billing_pincode: address.pincode || "520001",
          billing_state: address.state || "Andhra Pradesh",
          billing_country: "India",
          billing_email: custEmail,
          billing_phone: cleanPhone.length === 10 ? cleanPhone : "9999999999",
          shipping_is_billing: true,
          order_items: orderItems,
          payment_method: "Prepaid",
          sub_total: orderData.amount,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 1 // in kg
        };

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
        
        // 4. Update Firestore with Shipping Details in both user subcollection and root collection
        const shippingSuccessUpdate = {
          status: 'paid',
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
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await userOrderDocRef.update(shippingFailUpdate).catch(() => {});
        await rootOrderDocRef.update(shippingFailUpdate).catch(() => {});

        // We still return success: true because the PAYMENT was successful
        return res.status(200).send({ 
          data: { 
            success: true, 
            warning: "Payment successful but failed to create shipping label."
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
    const awb = data.awb;
    const currentStatus = data.current_status;

    if (awb && currentStatus) {
      // Find order by AWB / Shipment ID (Shiprocket often sends AWB in webhook)
      const snapshot = await admin.firestore().collectionGroup('orders').where('shiprocketShipmentId', '==', data.shipment_id || data.awb).limit(1).get();
      
      // Fallback: search by shiprocket order_id
      let orderRef;
      if (!snapshot.empty) {
        orderRef = snapshot.docs[0].ref;
      } else if (data.order_id) {
        const orderSnap = await admin.firestore().collectionGroup('orders').where('shiprocketOrderId', '==', data.order_id).limit(1).get();
        if (!orderSnap.empty) {
          orderRef = orderSnap.docs[0].ref;
        }
      }

      if (orderRef) {
        await orderRef.update({
          shiprocketStatus: currentStatus,
          shiprocketAwb: awb,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Shiprocket Webhook Error:", error);
    // Always return 200 to Shiprocket so it doesn't think the endpoint is dead
    return res.status(200).json({ success: false, error: 'Processed with errors' });
  }
});
