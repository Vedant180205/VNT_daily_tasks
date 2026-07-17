const Redis = require('ioredis');

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
});

connection.on('error', (err) => {
  console.error('Redis (BullMQ) Client Error', err);
});

connection.on('connect', () => {
  console.log('Connected to Redis (BullMQ)');
});

module.exports = connection;
