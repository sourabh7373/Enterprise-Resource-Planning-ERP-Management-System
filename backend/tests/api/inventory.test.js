const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const Supplier = require('../../models/Supplier');
const User = require('../../models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('Day 9 Inventory API Endpoints', () => {
  let token;
  let categoryId;
  let supplierId;
  let productId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Inventory Admin',
      email: 'invadmin@example.com',
      password: 'password123',
      role: 'SUPER_ADMIN'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invadmin@example.com', password: 'password123' });
    
    token = res.body.token;

    const category = await Category.create({ name: 'Electronics', description: 'Gadgets' });
    categoryId = category._id;

    const supplier = await Supplier.create({ name: 'Tech Corp', email: 'tech@corp.com', phone: '1234567890', companyName: 'Tech Corp Inc' });
    supplierId = supplier._id;

    const product = await Product.create({
      name: 'Laptop',
      SKU: 'LAP-001',
      category: categoryId,
      supplier: supplierId,
      purchasePrice: 500,
      sellingPrice: 800,
      currentStock: 2,
      minimumStockLevel: 5
    });
    productId = product._id;
  });

  it('GET /api/categories should return categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/suppliers should return suppliers', async () => {
    const res = await request(app)
      .get('/api/suppliers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/products should return products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/inventory/low-stock should return low stock products', async () => {
    const res = await request(app)
      .get('/api/inventory/low-stock')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/inventory/stock-in should increase stock and create movement', async () => {
    const res = await request(app)
      .post('/api/inventory/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        quantity: 10,
        referenceDocument: 'PO-1001',
        remarks: 'Restocking'
      });
    expect(res.status).toBe(201);
    expect(res.body.quantity).toBe(10);
    expect(res.body.previousStock).toBe(2);
    expect(res.body.newStock).toBe(12);

    const product = await Product.findById(productId);
    expect(product.currentStock).toBe(12);
  });

  it('POST /api/inventory/stock-out should decrease stock and create movement', async () => {
    const res = await request(app)
      .post('/api/inventory/stock-out')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        quantity: 1,
        referenceDocument: 'SO-1001',
        remarks: 'Dispatch'
      });
    expect(res.status).toBe(201);
    expect(res.body.quantity).toBe(1);
    expect(res.body.previousStock).toBe(2);
    expect(res.body.newStock).toBe(1);

    const product = await Product.findById(productId);
    expect(product.currentStock).toBe(1);
  });

  it('POST /api/inventory/stock-out should reject insufficient stock', async () => {
    const res = await request(app)
      .post('/api/inventory/stock-out')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        quantity: 5,
        referenceDocument: 'SO-1002',
        remarks: 'Dispatch too many'
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient stock');
  });
});
