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
      const orderRef = await admin.firestore().collection('orders').add({
        userId: userId || 'anonymous',
        items: items || [],
        amount: amount,
        address: address || {}, // Store the delivery address
        razorpayOrderId: order.id,
        status: 'created',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

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
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, firestoreOrderId } = req.body.data;

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", rzp_key_secret)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        if (firestoreOrderId) {
          await admin.firestore().collection('orders').doc(firestoreOrderId).update({
            status: 'failed_verification',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        return res.status(400).send({ data: { error: 'Invalid Signature' } });
      }

      // 1. Mark as Paid
      if (firestoreOrderId) {
        await admin.firestore().collection('orders').doc(firestoreOrderId).update({
          status: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // 2. Fetch Order Details for Shiprocket
      const orderDoc = await admin.firestore().collection('orders').doc(firestoreOrderId).get();
      if (!orderDoc.exists) {
         return res.status(200).send({ data: { success: true, message: 'Payment verified but order missing in DB' } });
      }
      
      const orderData = orderDoc.data();
      const address = orderData.address || {};
      const items = orderData.items || [];

      // 3. Create Shiprocket Order
      try {
        const token = await getShiprocketToken();
        
        // Map items to Shiprocket format
        const orderItems = items.map(item => ({
          name: item.name,
          sku: item.id,
          units: item.quantity,
          selling_price: item.price,
          discount: 0,
          tax: 0,
          hsn: ''
        }));

        const shiprocketPayload = {
          order_id: firestoreOrderId, // Unique ID
          order_date: new Date().toISOString(),
          pickup_location: "work", // Matches the name in Shiprocket dashboard
          channel_id: "",
          comment: "Created via Mirror Solar Store",
          billing_customer_name: address.fullName || "Customer",
          billing_last_name: "",
          billing_address: address.flat || "Address",
          billing_address_2: address.area || "",
          billing_city: address.city || "City",
          billing_pincode: address.pincode || "110001",
          billing_state: address.state || "State",
          billing_country: "India",
          billing_email: "test@example.com", // You might want to pass email in address too
          billing_phone: address.phone || "9999999999",
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
          throw new Error("Shiprocket returned error");
        }

        const srData = await createOrderRes.json();
        
        // 4. Update Firestore with Shipping Details
        await admin.firestore().collection('orders').doc(firestoreOrderId).update({
          shiprocketOrderId: srData.order_id || null,
          shiprocketShipmentId: srData.shipment_id || null,
          shiprocketStatus: srData.status || srData.status_code || null,
          shiprocketResponse: JSON.stringify(srData),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).send({ 
          data: { 
            success: true, 
            shiprocketShipmentId: srData.shipment_id
          } 
        });

      } catch (shippingError) {
        console.error("Failed to create Shiprocket Order:", shippingError);
        // We still return success: true because the PAYMENT was successful, just shipping failed.
        // You would manually retry or fix shipping in the dashboard later.
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

      // Find the order in Firestore
      const snapshot = await admin.firestore().collection('orders').where('razorpayOrderId', '==', rzpOrderId).limit(1).get();
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
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const data = req.body;
    const awb = data.awb;
    const currentStatus = data.current_status;

    if (awb && currentStatus) {
      // Find order by AWB / Shipment ID (Shiprocket often sends AWB in webhook)
      const snapshot = await admin.firestore().collection('orders').where('shiprocketShipmentId', '==', data.shipment_id || data.awb).limit(1).get();
      
      // Fallback: search by shiprocket order_id
      let orderRef;
      if (!snapshot.empty) {
        orderRef = snapshot.docs[0].ref;
      } else if (data.order_id) {
        const orderSnap = await admin.firestore().collection('orders').where('shiprocketOrderId', '==', data.order_id).limit(1).get();
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

    res.status(200).send('ok');
  } catch (error) {
    console.error("Shiprocket Webhook Error:", error);
    res.status(500).send('Error processing webhook');
  }
});
