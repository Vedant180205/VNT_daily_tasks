// 1. Import supertest to simulate HTTP requests
const request = require('supertest');

// We will NOT import the real app here directly, because we need to mock the DB first.
// We'll use jest.isolateModules to ensure a fresh import every time.

describe('GET /api/internal/status', () => {
  // Reset modules before EACH test to clear the "lastSuccessfulApiResponseAt" tracker.
  beforeEach(() => {
    jest.resetModules();
  });

  // --- TEST 1: Success Scenario (Database is Healthy) ---
  test('should return 200 and the correct structure when DB is healthy', async () => {
    // We run this in isolation to apply a specific mock
    await jest.isolateModules(async () => {
      // MOCK the database service to return TRUE (simulating a working DB)
      jest.doMock('../../src/services/db.service', () => ({
        checkDatabase: jest.fn().mockResolvedValue(true)
      }));

      // Now, import the app INSIDE this isolated context
      const app = require('../app');

      // Make the request using supertest
      const response = await request(app)
        .get('/api/internal/status')
        .expect('Content-Type', /json/) // Check header
        .expect(200);                   // Check status code

      // --- Assertions (Checks) ---
      // 1. Check all required fields exist
      expect(response.body).toHaveProperty('api');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('lastSuccessfulApiResponseAt');

      // 2. Check specific values
      expect(response.body.api).toBe('ok');
      expect(response.body.database).toBe('ok'); // Because we mocked true
      expect(response.body.environment).toBe(process.env.NODE_ENV || 'local'); // Default

      // 3. Check the timestamp format (matches ISO 8601)
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // 4. On the very first call, the tracker must be null
      expect(response.body.lastSuccessfulApiResponseAt).toBeNull();
    });
  });

  // --- TEST 2: Tracking Logic (The "Sticky Note") ---
  test('should track the last successful response time across multiple calls', async () => {
    await jest.isolateModules(async () => {
      // Mock DB as healthy
      jest.doMock('../../src/services/db.service', () => ({
        checkDatabase: jest.fn().mockResolvedValue(true)
      }));

      const app = require('../app');

      // --- Call 1 ---
      const res1 = await request(app).get('/api/internal/status');
      expect(res1.body.lastSuccessfulApiResponseAt).toBeNull(); // First call = null

      // --- Call 2 ---
      const res2 = await request(app).get('/api/internal/status');
      // res2's tracker should equal res1's timestamp (the time of the first call)
      expect(res2.body.lastSuccessfulApiResponseAt).toBe(res1.body.timestamp);

      // --- Call 3 ---
      const res3 = await request(app).get('/api/internal/status');
      // res3's tracker should equal res2's timestamp
      expect(res3.body.lastSuccessfulApiResponseAt).toBe(res2.body.timestamp);
    });
  });

  // --- TEST 3: Database Failure Scenario ---
  test('should return database: "error" when DB connection fails', async () => {
    await jest.isolateModules(async () => {
      // MOCK the database service to return FALSE (simulating a down DB)
      jest.doMock('../../src/services/db.service', () => ({
        checkDatabase: jest.fn().mockResolvedValue(false)
      }));

      const app = require('../app');

      const response = await request(app)
        .get('/api/internal/status')
        .expect(200); // Even though DB is down, the API itself still responds with 200

      // Check that the database field shows error
      expect(response.body.database).toBe('error');
      
      // Ensure the API itself is still considered "ok" (the app isn't crashing)
      expect(response.body.api).toBe('ok');
    });
  });
});
