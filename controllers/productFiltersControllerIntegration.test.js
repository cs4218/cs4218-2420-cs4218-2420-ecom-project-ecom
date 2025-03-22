import { productFiltersController } from "./productController";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import express from "express";
import request from "supertest";
import mongoose from "mongoose";


dotenv.config();

describe("Product Filters Controller Integration Test", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    })

    afterAll(async () => {
        await mongoose.connection.close();
    });

    const app = express();
    app.use(express.json());
    app.post('/api/filter-products', productFiltersController);

    it("filters products with no filters applied", async () => {
        const response = await request(app).post('/api/filter-products').send({checked: [], radio: []});
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            products: expect.arrayContaining([
                // all products in database 
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

    it("filters products with checked filters applied", async () => {
        const electronicsCategory = new ObjectId('66db427fdb0119d9234b27ed');
        const response = await request(app).post('/api/filter-products').send({checked: [electronicsCategory], radio: []});
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            products: expect.arrayContaining([
                expect.objectContaining({ 
                    name: 'Laptop', 
                    price: 1499.99, 
                  }),
                  expect.not.objectContaining({ 
                    name: 'Textbook', 
                    price: 79.99, 
                  }),
                  expect.objectContaining({ 
                    name: 'Smartphone', 
                    price: 999.99, 
                  }),
                  expect.not.objectContaining({ 
                    name: 'The Law of Contract in Singapore', 
                    price: 54.99, 
                  }),
                  expect.not.objectContaining({ 
                    name: 'Novel', 
                    price: 14.99, 
                  }),
                  expect.not.objectContaining({ 
                    name: 'NUS T-shirt', 
                    price: 4.99, 
                  }),
            ])
          });
    });

    it("filters products with price filters applied", async () => {
        const response = await request(app).post('/api/filter-products').send({checked: [], radio: [0, 100]});
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            products: expect.arrayContaining([
                expect.not.objectContaining({ 
                    name: 'Laptop', 
                    price: 1499.99, 
                  }),
                  expect.objectContaining({ 
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
                  expect.objectContaining({ 
                    name: 'NUS T-shirt', 
                    price: 4.99, 
                  }),
            ])
          });
    });

    it("filters products with both checked and price filters applied", async () => {
      const electronicsCategory = new ObjectId('66db427fdb0119d9234b27ed');
      const response = await request(app).post('/api/filter-products').send({checked: [electronicsCategory], radio: [0, 1000]});
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
          success: true,
          products: expect.arrayContaining([
              expect.not.objectContaining({ 
                  name: 'Laptop', 
                  price: 1499.99, 
                }),
                expect.not.objectContaining({ 
                  name: 'Textbook', 
                  price: 79.99, 
                }),
                expect.objectContaining({ 
                  name: 'Smartphone', 
                  price: 999.99, 
                }),
                expect.not.objectContaining({ 
                  name: 'The Law of Contract in Singapore', 
                  price: 54.99, 
                }),
                expect.not.objectContaining({ 
                  name: 'Novel', 
                  price: 14.99, 
                }),
                expect.not.objectContaining({ 
                  name: 'NUS T-shirt', 
                  price: 4.99, 
                }),
          ])
        });
  });

})