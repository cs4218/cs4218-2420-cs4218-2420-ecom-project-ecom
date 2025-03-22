import { searchProductController } from './productController'; 
import mongoose from "mongoose";
import request from "supertest";
import express from "express";
import dotenv from "dotenv";
const app = express();
app.use(express.json());
app.get('/api/search/:keyword', searchProductController);
dotenv.config()


describe('searchProductController Integration Test', () => {
  beforeAll(async () => {
      await mongoose.connect(process.env.MONGO_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true
      });
  })

  afterAll(async () => {
      await mongoose.connection.close();
  });

  test('returns products that match the keyword', async () => {
    const response = await request(app).get('/api/search/bestselling');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({ 
          name: 'Laptop', 
          price: 1499.99, 
        }),
        expect.not.objectContaining({ 
          name: 'Textbook', 
          price: 79.99, 
        }),
        expect.not.objectContaining({ 
          name: 'Smartphone', 
          price: 999.99, 
        }),
        expect.objectContaining({ 
          name: 'The Law of Contract in Singapore', 
          price: 54.99, 
        }),
        expect.objectContaining({ 
          name: 'Novel', 
          price: 14.99, 
        }),
        expect.not.objectContaining({ 
          name: 'NUS T-shirt', 
          price: 4.99, 
        }),
      ])
    );
  });
  test('returns empty array if no products are found', async () => {
    const response = await request(app).get('/api/search/non-existent-keyword');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  test('returns error 404 if search with empty field', async () => {
    const response = await request(app).get('/api/search/');
    expect(response.status).toBe(404);
  });

});
