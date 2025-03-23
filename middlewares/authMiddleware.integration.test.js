
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireSignIn, isAdmin } from './authMiddleware.js';

// Create a minimal Express app for testing middleware
const app = express();
app.use(express.json());

// Test route that requires authentication
app.get('/protected', requireSignIn, (req, res) => {
  res.status(200).json({ message: 'Protected route accessed' });
});

// Test route that requires admin privileges
app.get('/admin', requireSignIn, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin route accessed' });
});

describe('Auth Middleware Integration Tests', () => {
    let userToken;
    let adminToken;
    let secret

  beforeAll(() => {
    // Create tokens for testing
    process.env.JWT_SECRET = 'test-secret';
    secret = process.env.JWT_SECRET;
    console.log('JWT_SECRET in test:', secret); // <-- check this output
    userToken = jwt.sign({ _id: 'user123', role: 'user' }, secret, { expiresIn: '1h' });
    adminToken = jwt.sign({ _id: 'admin123', role: 'admin' }, secret, { expiresIn: '1h' });
  });

  test('should allow access to a protected route with a valid token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Protected route accessed');
  });

  test('should deny access to a protected route without a token', async () => {
    const res = await request(app).get('/protected');
    // Assuming your middleware returns a 401 Unauthorized status
    expect(res.statusCode).toBe(401);
  });
});