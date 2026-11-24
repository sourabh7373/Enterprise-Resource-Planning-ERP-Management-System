const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('Auth API', () => {
  it('should register a new user with default EMPLOYEE role', async () => {
    const res = await request(app).post('/api/auth/register').send({ fullName: 'Test User', email: 'register@example.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toBe('EMPLOYEE');
  });

  it('should login a user', async () => {
    await User.create({ email: 'test@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail login with invalid credentials', async () => {
    await User.create({ email: 'test@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('should fail login for inactive account', async () => {
    await User.create({ email: 'inactive@example.com', password: 'password123', isActive: false });
    const res = await request(app).post('/api/auth/login').send({ email: 'inactive@example.com', password: 'password123' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Account is inactive');
  });

  it('should logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(200);
  });

  it('should get current user', async () => {
    const user = await User.create({ email: 'me@example.com', password: 'password123' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'me@example.com', password: 'password123' });
    const token = loginRes.body.token;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('me@example.com');
  });

  it('should change password', async () => {
    const user = await User.create({ email: 'change@example.com', password: 'password123' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'change@example.com', password: 'password123' });
    const token = loginRes.body.token;
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: 'newPassword456' });
    expect(res.statusCode).toBe(200);
  });

  it('should request password reset', async () => {
    await User.create({ email: 'reset@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'reset@example.com' });
    expect(res.statusCode).toBe(200);
  });

  it('should reset password with valid token', async () => {
    const user = await User.create({ email: 'reset@example.com', password: 'password123' });
    const resetToken = 'validtoken';
    const crypto = require('crypto');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, newPassword: 'newPassword789' });
    expect(res.statusCode).toBe(200);
    const updatedUser = await User.findOne({ email: 'reset@example.com' });
    expect(await updatedUser.comparePassword('newPassword789')).toBe(true);
    expect(updatedUser.resetPasswordToken).toBeUndefined();
    expect(updatedUser.resetPasswordExpires).toBeUndefined();
  });

  it('should not reset password with expired token', async () => {
    const user = await User.create({ email: 'expired@example.com', password: 'password123' });
    const resetToken = 'expiredtoken';
    const crypto = require('crypto');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() - 10 * 60 * 1000; // Expired 10 mins ago
    await user.save();

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, newPassword: 'newPassword789' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid or expired token');
  });
});
