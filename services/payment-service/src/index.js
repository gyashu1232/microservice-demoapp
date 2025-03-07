const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const cors = require('cors');

const app = express();
const PORT = 8005;

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://mongodb:27017/payment-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  status: String,
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// RabbitMQ Connection
let channel;
async function connectQueue() {
  try {
    const connection = await amqp.connect('amqp://rabbitmq:5672');
    channel = await connection.createChannel();
    await channel.assertQueue('payment_processed');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
  }
}
connectQueue();

// Routes
app.post('/api/payments', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    
    // Publish payment processed event
    channel.sendToQueue(
      'payment_processed',
      Buffer.from(JSON.stringify(payment))
    );
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/payments/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});