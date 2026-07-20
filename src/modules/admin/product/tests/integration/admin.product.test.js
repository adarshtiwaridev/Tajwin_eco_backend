import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../../../app.js'; // Assuming app.js exists at root level for express

// Mocking the authentication middleware for testing
jest.mock('#middlewares/authMiddleware.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: new mongoose.Types.ObjectId(), role: 'ADMIN' };
    next();
  },
}));

describe('Admin Product API Integration Tests', () => {
  let productId;

  beforeAll(async () => {
    // Setup in-memory DB or connect to test DB
  });

  afterAll(async () => {
    // Teardown DB
  });

  it('should return validation error if required fields are missing on create', async () => {
    const res = await request(app)
      .post('/api/v1/admin/products')
      .send({ brand: 'Dell' }); // missing name, category, etc.

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should create a product with valid data', async () => {
    const res = await request(app)
      .post('/api/v1/admin/products')
      .field('name', 'Test Laptop')
      .field('brand', 'TestBrand')
      .field('model', 'X1')
      .field('category', 'Laptops')
      .field('shortDescription', 'Short desc')
      .field('fullDescription', 'Full desc')
      .field('processorBrand', 'Intel')
      .field('processorModel', 'i7')
      .field('ramSize', 16)
      .field('ramType', 'DDR4')
      .field('storageCapacity', 512)
      .field('storageType', 'SSD')
      .field('screenSize', 15.6)
      .field('resolution', '1920x1080')
      .field('graphics', 'Integrated')
      .field('operatingSystem', 'Windows 11')
      .field('conditionGrade', 'Grade A')
      .field('warranty', '1 Year')
      .field('originalPrice', 1000)
      .field('sellingPrice', 800)
      .field('stockQuantity', 10)
      .attach('featuredImage', Buffer.from('mock image'), 'test.png'); // Mock image upload

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toEqual('Test Laptop');
    expect(res.body.data.discountPercentage).toEqual(20);

    productId = res.body.data.id;
  });

  it('should get all products with pagination', async () => {
    const res = await request(app).get('/api/v1/admin/products?page=1&limit=10');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('should update a product successfully', async () => {
    const res = await request(app)
      .put(`/api/v1/admin/products/${productId}`)
      .send({ sellingPrice: 750 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sellingPrice).toEqual(750);
  });
});
