import { relatedProductController } from "./productController";
import dotenv from "dotenv";
import express from "express";
import request from "supertest";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.get('/api/related-product/:pid/:cid', relatedProductController);
dotenv.config()

describe('Related Product Controller Integration Test', () => {
  beforeAll(async () => {
      await mongoose.connect(process.env.MONGO_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true
      });
  })

  afterAll(async () => {
      await mongoose.connection.close();
  });
    test("return related products for textbook", async () => {
        const pid = new ObjectId('66db427fdb0119d9234b27f1');
        const cid = new ObjectId('66db427fdb0119d9234b27ef');
        const response = await request(app).get(`/api/related-product/${pid}/${cid}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        const expectedProducts = [
          expect.objectContaining({ 
            name: 'The Law of Contract in Singapore', 
            price: 54.99, 
          }),
          expect.objectContaining({ 
            name: 'Novel', 
            price: 14.99, 
          }),
        ]
        const excludedProducts = [
          expect.objectContaining({ 
            name: 'Smartphone', 
            price: 999.99, 
          }),
          expect.objectContaining({ 
            name: 'Textbook', 
            price: 79.99, 
          }),
          expect.objectContaining({ 
            name: 'Laptop', 
            price: 1499.99, 
          }),
          expect.objectContaining({ 
            name: 'NUS T-shirt', 
            price: 4.99, 
          }),
        ]
        expect(response.body.products).toEqual(expect.arrayContaining(expectedProducts));
        expect(response.body.products).toEqual(expect.not.arrayContaining(excludedProducts));
    });

    test("return related products for laptop", async () => {
      const pid = new ObjectId('66db427fdb0119d9234b27f3');
      const cid = new ObjectId('66db427fdb0119d9234b27ed');
      const response = await request(app).get(`/api/related-product/${pid}/${cid}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const expectedProducts = [
        expect.objectContaining({ 
          name: 'Smartphone', 
          price: 999.99, 
        }),
      ]
      const excludedProducts = [
        expect.objectContaining({ 
          name: 'Textbook', 
          price: 79.99, 
        }),
        expect.objectContaining({ 
          name: 'The Law of Contract in Singapore', 
          price: 54.99, 
        }),
        expect.objectContaining({ 
          name: 'Laptop', 
          price: 1499.99, 
        }),
        expect.objectContaining({ 
          name: 'Novel', 
          price: 14.99, 
        }),
        expect.objectContaining({ 
          name: 'NUS T-shirt', 
          price: 4.99, 
        }),
      ]
      expect(response.body.products).toEqual(expect.arrayContaining(expectedProducts));
      expect(response.body.products).toEqual(expect.not.arrayContaining(excludedProducts));
 
  });
  test("return related products for smartphone", async () => {
    const pid = new ObjectId('66db427fdb0119d9234b27f5');
    const cid = new ObjectId('66db427fdb0119d9234b27ed');
    const response = await request(app).get(`/api/related-product/${pid}/${cid}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    const expectedProducts = [
      expect.objectContaining({ 
        name: 'Laptop', 
        price: 1499.99, 
      }),
    ]
    const excludedProducts = [
      expect.objectContaining({ 
        name: 'Textbook', 
        price: 79.99, 
      }),
      expect.objectContaining({ 
        name: 'The Law of Contract in Singapore', 
        price: 54.99, 
      }),
      expect.objectContaining({ 
        name: 'Smartphone', 
        price: 999.99, 
      }),
      expect.objectContaining({ 
        name: 'Novel', 
        price: 14.99, 
      }),
      expect.objectContaining({ 
        name: 'NUS T-shirt', 
        price: 4.99, 
      }),
    ]
    expect(response.body.products).toEqual(expect.arrayContaining(expectedProducts));
    expect(response.body.products).toEqual(expect.not.arrayContaining(excludedProducts));
  
});

      test("return related products for novel", async () => {
      const pid = new ObjectId('66db427fdb0119d9234b27f9');
      const cid = new ObjectId('66db427fdb0119d9234b27ef');
      const response = await request(app).get(`/api/related-product/${pid}/${cid}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const expectedProducts = [
        expect.objectContaining({ 
          name: 'Textbook', 
          price: 79.99, 
        }),
        expect.objectContaining({ 
          name: 'The Law of Contract in Singapore', 
          price: 54.99, 
        }),
      ]
      const excludedProducts = [
        expect.objectContaining({ 
          name: 'Laptop', 
          price: 1499.99, 
        }),
  
        expect.objectContaining({ 
          name: 'Smartphone', 
          price: 999.99, 
        }),
        expect.objectContaining({ 
          name: 'Novel', 
          price: 14.99, 
        }),
        expect.objectContaining({ 
          name: 'NUS T-shirt', 
          price: 4.99, 
        }),
      ]
      expect(response.body.products).toEqual(expect.arrayContaining(expectedProducts));
      expect(response.body.products).toEqual(expect.not.arrayContaining(excludedProducts));
  });

  test("return related products for law-of-contract", async () => {
    const pid = new ObjectId('67a2171ea6d9e00ef2ac0229');
    const cid = new ObjectId('66db427fdb0119d9234b27ef');
    const response = await request(app).get(`/api/related-product/${pid}/${cid}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    const expectedProducts = [
      expect.objectContaining({ 
        name: 'Textbook', 
        price: 79.99, 
      }),
      expect.objectContaining({ 
        name: 'Novel', 
        price: 14.99, 
      }),
    ]
    const excludedProducts = [
      expect.objectContaining({ 
        name: 'Laptop', 
        price: 1499.99, 
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
        name: 'NUS T-shirt', 
        price: 4.99, 
      }),
    ]
    expect(response.body.products).toEqual(expect.arrayContaining(expectedProducts));
    expect(response.body.products).toEqual(expect.not.arrayContaining(excludedProducts));

});


test("return related products for t-shirt", async () => {
  const pid = new ObjectId('67a21772a6d9e00ef2ac022a');
  const cid = new ObjectId('66db427fdb0119d9234b27ee');
  const response = await request(app).get(`/api/related-product/${pid}/${cid}`);
  expect(response.status).toBe(200);
  expect(response.body).toEqual({
      success: true,
      products: []
    }); 
});
  
});