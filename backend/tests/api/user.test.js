const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('User Management & RBAC APIs', () => {
  let adminToken, employeeToken;
  let adminUser, employeeUser, targetUser;

  beforeEach(async () => {
    adminUser = await User.create({ email: 'admin@example.com', password: 'password123', role: 'SUPER_ADMIN' });
    employeeUser = await User.create({ email: 'employee@example.com', password: 'password123', role: 'EMPLOYEE' });
    targetUser = await User.create({ email: 'target@example.com', password: 'password123', role: 'EMPLOYEE' });

    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    const employeeLogin = await request(app).post('/api/auth/login').send({ email: 'employee@example.com', password: 'password123' });
    employeeToken = employeeLogin.body.token;
  });

  describe('GET /api/users', () => {
    it('should allow SUPER_ADMIN to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
    });

    it('should deny EMPLOYEE access to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow SUPER_ADMIN to get any user by id', async () => {
      const res = await request(app)
        .get(`/api/users/${targetUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe('target@example.com');
    });

    it('should allow EMPLOYEE to get their own profile', async () => {
      const res = await request(app)
        .get(`/api/users/${employeeUser._id}`)
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe('employee@example.com');
    });

    it('should deny EMPLOYEE access to another user profile', async () => {
      const res = await request(app)
        .get(`/api/users/${targetUser._id}`)
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/users', () => {
    it('should allow SUPER_ADMIN to create a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'newuser@example.com', password: 'password123', role: 'HR_MANAGER' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.email).toBe('newuser@example.com');
      expect(res.body.data.role).toBe('HR_MANAGER');
    });

    it('should deny EMPLOYEE from creating a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ email: 'newuser2@example.com', password: 'password123', role: 'EMPLOYEE' });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow SUPER_ADMIN to update user details', async () => {
      const res = await request(app)
        .put(`/api/users/${targetUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'SALES_MANAGER' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.role).toBe('SALES_MANAGER');
    });

    it('should deny EMPLOYEE from updating user details', async () => {
      const res = await request(app)
        .put(`/api/users/${targetUser._id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ role: 'SALES_MANAGER' });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/users/:id/status', () => {
    it('should allow SUPER_ADMIN to update user status (activate/deactivate)', async () => {
      const res = await request(app)
        .patch(`/api/users/${targetUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should deny EMPLOYEE from updating user status', async () => {
      const res = await request(app)
        .patch(`/api/users/${targetUser._id}/status`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ isActive: false });
      expect(res.statusCode).toBe(403);
    });
  });
});
