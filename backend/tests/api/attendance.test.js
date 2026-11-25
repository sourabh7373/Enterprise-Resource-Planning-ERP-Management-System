const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Employee = require('../../models/Employee');
const Department = require('../../models/Department');
const Attendance = require('../../models/Attendance');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

describe('Attendance Management API Tests', () => {
  let adminToken, employeeToken, employeeId, adminUser, employeeUser;

  beforeAll(async () => await connectTestDB());
  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  beforeEach(async () => {
    // Create Department
    const dept = await Department.create({ name: 'Engineering', code: 'ENG' });

    // Create Admin User
    adminUser = await User.create({
      email: 'admin@erp.com',
      password: 'Password123!',
      role: 'SUPER_ADMIN'
    });

    // Create Employee User & Profile
    employeeUser = await User.create({
      email: 'employee@erp.com',
      password: 'Password123!',
      role: 'EMPLOYEE'
    });

    const emp = await Employee.create({
      fullName: 'John Employee',
      employeeId: 'EMP001',
      email: 'employee@erp.com',
      phone: '9876543210',
      department: dept._id,
      designation: 'Software Engineer',
      user: employeeUser._id
    });
    employeeId = emp._id;

    // Login Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@erp.com', password: 'Password123!' });
    adminToken = adminRes.body.token;

    // Login Employee
    const empRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@erp.com', password: 'Password123!' });
    employeeToken = empRes.body.token;
  });

  test('1. Successful employee check-in', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ remarks: 'Morning check-in' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checkIn).toBeDefined();
  });

  test('2. Duplicate check-in prevention', async () => {
    await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ remarks: 'Morning check-in' });

    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ remarks: 'Duplicate check-in' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('3. Successful check-out', async () => {
    await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ remarks: 'Morning check-in' });

    const res = await request(app)
      .post('/api/attendance/check-out')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ remarks: 'Evening check-out' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checkOut).toBeDefined();
  });

  test('4. HR can view all attendance', async () => {
    const res = await request(app)
      .get('/api/attendance')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
