const express = require('express');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const PORT = 8004;

app.use(express.json());
app.use(cors());

// Redis connection
const redis = new Redis({
  host: 'redis',
  port: 6379
});

// Routes
app.post('/api/cart/:userId/items', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    
    const cartKey = `cart:${userId}`;
    await redis.hset(cartKey, productId, quantity);
    
    const cart = await redis.hgetall(cartKey);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await redis.hgetall(`cart:${userId}`);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await redis.del(`cart:${userId}`);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
});