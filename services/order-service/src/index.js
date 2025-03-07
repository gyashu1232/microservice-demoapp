const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const cors = require('cors');

const app = express();
const PORT = 8003;

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://mongodb:27017/order-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: String,
  products: [{
    productId: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String,
  shippingAddress: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// RabbitMQ Connection
let channel;
async function connectQueue() {
  try {
    const connection = await amqp.connect('amqp://rabbitmq:5672');
    channel = await connection.createChannel();
    await channel.assertQueue('order_created');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
  }
}
connectQueue();

// Routes
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    
    // Publish order created event
    channel.sendToQueue(
      'order_created',
      Buffer.from(JSON.stringify(order))
    );
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});