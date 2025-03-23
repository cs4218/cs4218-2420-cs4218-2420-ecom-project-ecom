import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  registerController,
  loginController,
  forgotPasswordController,
  testController, 
  updateProfileController, 
  getOrdersController, 
  getAllOrdersController, 
  orderStatusController } from './authController.js';
import userModel from '../models/userModel.js'; // ensure the correct path
import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';
import categoryModel from '../models/categoryModel.js';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';
import { requireSignIn, isAdmin } from '../middlewares/authMiddleware.js'; // Adjust path as needed
dotenv.config();

// Set up a minimal Express app and register routes.
const app = express();
app.use(bodyParser.json());

app.post('/api/v1/auth/register', registerController);
app.post('/api/v1/auth/login', loginController);
app.post('/api/v1/auth/forgot-password', forgotPasswordController);
app.get('/api/v1/auth/test', testController);
app.put('/api/v1/auth/profile', requireSignIn, updateProfileController);
app.get('/api/v1/auth/orders', requireSignIn, getOrdersController);
app.get('/api/v1/auth/all-orders', requireSignIn, isAdmin, getAllOrdersController);
app.put('/api/v1/auth/order-status/:orderId', requireSignIn, isAdmin, orderStatusController);

let mongoServer;


app.get('/test-auth', requireSignIn, (req, res) => {
  res.status(200).json({ user: req.user });
});



// Connect to an in-memory MongoDB instance before tests.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clean up database between tests.
afterEach(async () => {
  await userModel.deleteMany();
});

// Disconnect and stop the in-memory MongoDB instance after all tests.
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Controller Integration Tests', () => {
  const userData = {
    name: 'IntegrationTestName',
    email: 'integrationtest@email.com',
    password: 'password123',
    phone: '1234567890',
    address: 'Singapore',
    DOB: '2000-01-01',
    answer: 'Soccer',
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    // console.log(res.body.message);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should not register a user with an already registered email', async () => {
    // First registration
    await request(app).post('/api/v1/auth/register').send(userData);

    // Try registering the same email again.
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);
    // console.log(res.body.message);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
  }, 10000);

  it('should login an existing user', async () => {
    // Register the user first.
    await request(app).post('/api/v1/auth/register').send(userData);

    // Attempt login.
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: userData.password });

    console.log(res.body.message);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(userData.email);
  });

  it('should not login with an incorrect password', async () => {
    await request(app).post('/api/v1/auth/register').send(userData);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: 'wrongpassword' });

    console.log(res.body.message);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid password/i);
  });

  it('should reset password', async () => {
    //Register first
    await request(app).post('/api/v1/auth/register').send(userData);
    const forgotPasswordPayload = {
      email: userData.email,
      answer: userData.answer,
      newPassword: 'newPassword123'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send(forgotPasswordPayload);
  
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Password Reset Successfully/i);
  });

  it('should not reset password for non-existent email', async () => {
    //Register first
    await request(app).post('/api/v1/auth/register').send(userData);
    const forgotPasswordPayload = {
      email: 'invalidemail@gmail.com',
      answer: userData.answer,
      newPassword: 'newPassword123'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send(forgotPasswordPayload);
  
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Wrong Email or Answer/i);
  });

  it('should not reset password for wrong password', async () => {
    //Register first
    await request(app).post('/api/v1/auth/register').send(userData);
    const forgotPasswordPayload = {
      email: userData.email,
      answer: 'random answer',
      newPassword: 'newPassword123'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send(forgotPasswordPayload);
  
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Wrong Email or Answer/i);
  });
});

let testUser;
let testAdmin;
let testToken;
let adminToken;
let testProducts = [];
let testOrders = [];

describe('Auth Controller Extended Integration Tests', () => {
  beforeAll(async () => {
    // Start an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Ensure mongoose disconnects before reconnecting
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect Mongoose to the test DB
    await mongoose.connect(mongoUri);

    const category = await categoryModel.create({
          name: "Smartphones",
          slug: "smartphones",
      });

    // Create test products
    testProducts = await productModel.create([
      {
        name: 'Test Product 1',
        slug: 'test-product-1',
        description: 'Test Description 1',
        price: 100,
        category: category._id,
        quantity: 10,
        shipping: true,
      },
      {
        name: 'Test Product 2',
        slug: 'test-product-2',
        description: 'Test Description 2',
        price: 200,
        category: category._id,
        quantity: 20,
        shipping: true,
      }
    ]);

    // Create a regular test user
    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Test Street',
        DOB: '1990-01-01',
        answer: 'Test Answer'
      });
    
    testUser = userResponse.body.user;
    
    // Create an admin user
    const adminResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '9876543210',
        address: '456 Admin Street',
        DOB: '1985-01-01',
        answer: 'Admin Answer'
      });
    
    testAdmin = adminResponse.body.user;
    
    // Set admin role
    await userModel.findByIdAndUpdate(testAdmin._id, { role: 1 });

    // Then retrieve the updated user object
    testAdmin = await userModel.findById(testAdmin._id);
    console.log("testadmin role:", testAdmin.role);
    
    // Get tokens for both users
    const userLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    
    testToken = userLoginResponse.body.token;
    
    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    
    adminToken = adminLoginResponse.body.token;
    
    // Create test orders
    testOrders = await orderModel.create([
      {
        products: [testProducts[0]._id],
        payment: {
          transaction_id: 'test-transaction-1',
          amount: 100
        },
        buyer: testUser._id,
        status: 'Processing'
      },
      {
        products: [testProducts[0]._id, testProducts[1]._id],
        payment: {
          transaction_id: 'test-transaction-2',
          amount: 300
        },
        buyer: testUser._id,
        status: 'Not Process'
      }
    ]);
  });

  afterAll(async () => {
    // Clean up database and close connections
    await userModel.deleteMany({});
    await productModel.deleteMany({});
    await orderModel.deleteMany({});
    
    await mongoose.connection.close();
    await mongoose.disconnect();
    
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('updateProfileController Tests', () => {
    test('should update user profile successfully', async () => {
      const updatedData = {
        name: 'Updated Test User',
        phone: '5555555555',
        address: '789 Updated Street',
        email: 'test@gmail.com'
      };
      
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedData);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Profile Updated Successfully');
      expect(res.body.updatedUser.name).toBe(updatedData.name);
      expect(res.body.updatedUser.phone).toBe(updatedData.phone);
      expect(res.body.updatedUser.address).toBe(updatedData.address);
      expect(res.body.updatedUser.email).toBe(updatedData.email);
    });
    
    test('should reject passwords shorter than 6 characters', async () => {
      const updatedData = {
        name: 'Updated Test User',
        phone: '5555555555',
        address: '789 Updated Street',
        email: 'test@gmail.com',
        password: '12345' // Too short
      };
      
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedData);
      
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Password must be at least 6 characters long');
    });
    
    test('should reject unauthorized access', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .send({
          name: 'Unauthorized Update'
        });
      
      expect(res.status).toBeGreaterThanOrEqual(401);
    });
    
    test('should handle database errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Error Test'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email is required');
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });

  describe('getOrdersController Tests', () => {
    test('should get user orders successfully', async () => {
      const res = await request(app)
        .get('/api/v1/auth/orders')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2); // We created 2 orders for this user
      
      // Verify order properties
      expect(res.body[0].buyer).toBeDefined();
      expect(res.body[0].products).toBeDefined();
      expect(res.body[0].payment).toBeDefined();
      expect(res.body[0].status).toBeDefined();
    });
    
    test('should not return orders for other users', async () => {
      // Create another user with no orders
      const anotherUser = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
          phone: '9999999999',
          address: '999 Another Street',
          DOB: '1995-01-01',
          answer: 'Another Answer'
        });
      
      const anotherLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'another@example.com',
          password: 'password123'
        });
      
      const anotherToken = anotherLoginRes.body.token;
      
      const res = await request(app)
        .get('/api/v1/auth/orders')
        .set('Authorization', anotherToken);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0); // This user has no orders
    });
    
    test('should handle unauthorized access', async () => {
      const res = await request(app)
        .get('/api/v1/auth/orders');
      
      expect(res.status).toBeGreaterThanOrEqual(401);
    });
    
    test('should handle database errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(orderModel, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const res = await request(app)
        .get('/api/v1/auth/orders')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Error WHile Geting Orders');
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });

  describe('getAllOrdersController Tests', () => {
       
    test('should reject non-admin users', async () => {
      const res = await request(app)
        .get('/api/v1/auth/all-orders')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.status).toBeGreaterThanOrEqual(401);
      expect(res.body.success).toBe(false);
    });
    
    test('should handle unauthorized access', async () => {
      const res = await request(app)
        .get('/api/v1/auth/all-orders');
      
      expect(res.status).toBeGreaterThanOrEqual(401);
    });
  });

  describe('orderStatusController Tests', () => {
    test('should reject non-admin users', async () => {
      const orderId = testOrders[0]._id;
      
      const res = await request(app)
        .put(`/api/v1/auth/order-status/${orderId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'Cancelled' });
      
      expect(res.status).toBeGreaterThanOrEqual(401);
      expect(res.body.success).toBe(false);
    });
    
    test('should handle unauthorized access', async () => {
      const orderId = testOrders[0]._id;
      
      const res = await request(app)
        .put(`/api/v1/auth/order-status/${orderId}`)
        .send({ status: 'Cancelled' });
      
      expect(res.status).toBeGreaterThanOrEqual(401);
    });
    
    
  });
});