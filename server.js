const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS Middleware — allow your frontend origin
app.use(cors({
  origin: ['http://127.0.0.1', 'http://localhost:5500'], // adjust as needed
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

console.log('KEY_ID:', process.env.KEY_ID);   // Should print your Key ID (never print secret)
console.log('KEY_SECRET:', process.env.KEY_SECRET); // Never print your secret, just verify in backend code.

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});


// Create Order Endpoint
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;  // Amount in rupees

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise (₹100 = 10000 paise)
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    });

    res.json({ orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating order');
  }
});

// Magic Checkout Preferences (Optional)
app.post('/create-magic-checkout', async (req, res) => {
  const { orderId } = req.body;

  try {
    const response = await razorpay.orders.fetch(orderId); // Fetch order details

    // Send the order details or preferences for magic checkout
    res.json({
      key_id: process.env.KEY_ID,
      order_id: response.id,
      amount: response.amount,
      currency: response.currency,
      qr_required: true, // You can customize this based on your needs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating Magic Checkout preferences');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

