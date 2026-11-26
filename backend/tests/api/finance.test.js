const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');

describe('Finance API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_test');
    const user = await User.create({
      email: 'finance@test.com',
      password: 'password123',
      role: 'FINANCE_MANAGER'
    });
    userId = user._id;
    const res = await request(app).post('/api/auth/login').send({
      email: 'finance@test.com',
      password: 'password123'
    });
    token = res.body.token;
  });

  afterAll(async () => {
    await Transaction.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test('GET /api/finance/summary should return 200 and summary data', async () => {
    await Transaction.create({
      type: 'INCOME',
      category: 'Sales',
      amount: 1000,
      paymentMethod: 'Cash',
      paymentStatus: 'PAID',
      createdBy: userId
    });

    const res = await request(app)
      .get('/api/finance/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('income', 1000);
    expect(res.body).toHaveProperty('expenses', 0);
  });
});
