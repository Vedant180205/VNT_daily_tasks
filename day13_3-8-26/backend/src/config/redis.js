const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  },
  password: process.env.REDIS_PASSWORD || undefined
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Connected to Redis server');
});

// Connect to Redis when this module is required
client.connect().catch(console.error);

module.exports = client;
