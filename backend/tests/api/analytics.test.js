const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const analyticsRoutes = require('../../routes/analyticsRoutes');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

// Mock auth middleware
jest.mock('../../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: '60c72b2f9b1d8b27a8f3b456', role: 'SUPER_ADMIN' };
    next();
  },
  authorizeRoles: (...roles) => (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRoutes);

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Analytics API Tests', () => {
  it('should return analytics overview structure when connected to test db', async () => {
    const res = await request(app).get('/api/analytics/overview');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('kpis');
    expect(res.body).toHaveProperty('salesAnalytics');
    expect(res.body).toHaveProperty('financialAnalytics');
    expect(res.body).toHaveProperty('hrAnalytics');
    expect(res.body).toHaveProperty('inventoryAnalytics');
  });
});
