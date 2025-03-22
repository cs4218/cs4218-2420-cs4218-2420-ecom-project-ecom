import productModel from "../models/productModel.js";
import { productListController } from "./productController.js";
import mongoose from "mongoose";
import request from "supertest";
import express from "express";

const app = express();
app.use(express.json());
app.get('/api/list-products/:page', productListController);

describe("productListController Integration Test", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    })

    afterAll(async () => {
        await mongoose.connection.close();
    });

  test("returns paginated products", async () => {
  const response = await request(app).get('/api/list-products/1');
  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    success: true,
    products: expect.arrayContaining([
      expect.objectContaining({ 
        name: 'Laptop', 
        price: 1499.99, 
      }),
      expect.objectContaining({ 
        name: 'Textbook', 
        price: 79.99, 
      }),
      expect.objectContaining({ 
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
      expect.objectContaining({ 
        name: 'NUS T-shirt', 
        price: 4.99, 
      }),
    ])
  });
  });
});
