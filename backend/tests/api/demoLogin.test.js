const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

describe('ERP Demo Accounts Comprehensive Authentication Tests', () => {
  const demoAccounts = [
    { email: 'superadmin@erp.com', role: 'SUPER_ADMIN' },
    { email: 'admin@erp.com', role: 'SUPER_ADMIN' },
    { email: 'hr@erp.com', role: 'HR_MANAGER' },
    { email: 'finance@erp.com', role: 'FINANCE_MANAGER' },
    { email: 'sales@erp.com', role: 'SALES_MANAGER' },
    { email: 'inventory@erp.com', role: 'INVENTORY_MANAGER' },
    { email: 'employee@erp.com', role: 'EMPLOYEE' }
  ];

  const password = 'ERP@Demo123';

  beforeAll(async () => {
    // Seed demo accounts for testing
    for (const acc of demoAccounts) {
      let user = await User.findOne({ email: acc.email });
      if (!user) {
        await User.create({
          email: acc.email,
          password: password,
          role: acc.role,
          isActive: true
        });
      } else {
        user.role = acc.role;
        user.password = password;
        user.isActive = true;
        await user.save();
      }
    }
  });

  for (const acc of demoAccounts) {
    it(`should successfully login ${acc.email} with role ${acc.role}`, async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: acc.email, password });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('_id');
      expect(res.body.email).toBe(acc.email);
      expect(res.body.role).toBe(acc.role);
    });

    it(`should fail login for ${acc.email} with incorrect password`, async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: acc.email, password: 'WrongPassword!' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });
  }
});
