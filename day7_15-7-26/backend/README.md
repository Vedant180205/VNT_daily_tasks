# Backend: Player Management API 🛡️

This is the Node/Express backend for the Player Management application, now supercharged with **Redis Caching**.

## 🚀 Key Features
- **Redis Caching**: Implemented on `GET /api/players` using Upstash for sub-millisecond response times.
- **Auto-Invalidation**: Write operations (Create, Update, Delete) automatically flush the Redis cache to ensure data freshness.
- **Advanced File Uploads**: `multer`-based multipart form handling with strict validation.

## ⚙️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   REDIS_URL=rediss://default:your-token@your-upstash-url:6379
   # Add your DB variables here...
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

## 📮 Postman Testing (Cache Verification)
We have provided Postman collections in the `postman/` directory to test the Redis implementation:
1. Import `Redis_Cache_Testing.postman_collection.json`.
2. Import `Redis_Cache_Testing.postman_environment.json`.
3. Select the "Local Redis Dev" environment.
4. Run the requests in order to see **CACHE MISS** (slow), **CACHE HIT** (fast), and **Invalidation** triggered in the terminal logs.
