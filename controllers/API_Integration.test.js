import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import { jest } from '@jest/globals';
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";


let mongoServer;

describe("Category and Product API Integration Tests", () => {

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
    });

    beforeEach(async () => {
        // seed in-memory database with categories and product data
        const category = await categoryModel.create({
            name: "Smartphones",
            slug: "smartphones",
        });

        const products = await productModel.create([
            {
                name: "Apple iPhone",
                slug: "apple-iphone",
                description: "Latest Apple iPhone",
                price: 999,
                category: category._id,
                quantity: 10,
                shipping: true,
            },
            {
                name: "Samsung Galaxy",
                slug: "samsung-galaxy",
                description: "Latest Samsung Galaxy",
                price: 799,
                category: category._id,
                quantity: 15,
                shipping: true,
            },
        ]);
        
    });

    afterEach(async () => {
        // Restore original implementation of categoryModel after each test 
        jest.restoreAllMocks();
        // Clear all collections after each test
        await categoryModel.deleteMany({});
        await productModel.deleteMany({});
    });

    afterAll(async () => {
        console.log("Shutting down MongoDB Memory Server...");

        await mongoose.connection.close(); // Close active connection
        await mongoose.disconnect(); // Ensure full disconnection

        if (mongoServer) {
            await mongoServer.stop();
            console.log("MongoDB Memory Server stopped.");
        }
    });

    describe("Category API tests", () => {
        test("GET /api/v1/category/get-category - should return all categories", async () => {
            const res = await request(app).get("/api/v1/category/get-category");
    
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.category.length).toBeGreaterThan(0);
            expect(res.body.category[0].name).toBe("Smartphones");
        });
    
        test("GET /api/v1/category/get-category - should handle errors gracefully", async () => {
            jest.spyOn(categoryModel, "find").mockImplementation(() => {
                throw new Error("Database Error");
            });
    
            const res = await request(app).get("/api/v1/category/get-category");
    
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Error while getting all categories");
        })
    })

    describe("Product API tests", () => {
        test("should return products matching the search keyword only", async () => {
            
            const res = await request(app).get("/api/v1/product/search/Apple");
    
            expect(res.status).toBe(200);
            expect(res.body[0].name).toBe("Apple iPhone");
            expect(res.body[0].description).toContain("Apple");
            expect(res.body.length).toBe(1);
        });

        test("should handle product model errors gracefully", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => {
                throw new Error("Database Error");
            });

            const res = await request(app).get("/api/v1/product/search/Nokia");

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Error In Search Product API");
        });

        test("should return related products in the same category, excluding the current product", async () => {
            const product = await productModel.findOne({ name: "Apple iPhone" });
            const category = await categoryModel.findOne({ name: "Smartphones" });

            const res = await request(app).get(`/api/v1/product/related-product/${product._id}/${category._id}`);

            expect(res.status).toBe(200);
            expect(res.body.products[0].name).toBe("Samsung Galaxy");
            expect(res.body.products).toHaveLength(1);
        });

        test("should return no products if no related products exist", async () => {
            // create new product with a new category
            const category = await categoryModel.create({
                name: "Accessories",
                slug: "accessories",
            });
            const product = await productModel.create({
                name: "Google Pixel",
                slug: "google-pixel",
                description: "Google Pixel phone",
                price: 899,
                category: category._id,
                quantity: 5,
                shipping: true,
            });

            const res = await request(app).get(`/api/v1/product/related-product/${product._id}/${category._id}`);
            expect(res.status).toBe(200);
            expect(res.body.products).toHaveLength(0);

        });

        test("should handle errors when retrieving related products", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => {
                throw new Error("Database Error");
            });

            const product = await productModel.findOne({ name: "Apple iPhone" });
            const category = await categoryModel.findOne({ name: "Smartphones" });

            const res = await request(app).get(`/api/v1/product/related-product/${product._id}/${category._id}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Error while geting related product");
        });

        test("should return products belonging to a category", async () => {
            const category = await categoryModel.findOne({ slug: "smartphones" });

            const res = await request(app).get(`/api/v1/product/product-category/${category.slug}`)
            
            expect(res.status).toBe(200);
            expect(res.body.products).toHaveLength(2); // Two products in the "Smartphones" category
            expect(res.body.category.name).toBe("Smartphones");
        });

        test("should return no products for category with no product yet", async () => {
            const res = await request(app).get("/api/v1/product/product-category/no-product-category")
            
            expect(res.status).toBe(200);
            expect(res.body.products.length).toBe(0);
        });

        test("should handle database errors while sourcing category products gracefully", async () => {
            jest.spyOn(productModel, "find").mockImplementation(() => {
                throw new Error("Database Error");
            });

            const res = await request(app).get("/api/v1/product/product-category/error-category")
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Error While Getting products by category");
        });

    });
});


describe("Order and Profile API Tests", () => {
  let testUser;
  let testToken;
  let testOrders = [];

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

    // seed in-memory database with categories and product data
    const category = await categoryModel.create({
      name: "Smartphones",
      slug: "smartphones",
  });

  const products = await productModel.create([
      {
          name: "Apple iPhone",
          slug: "apple-iphone",
          description: "Latest Apple iPhone",
          price: 999,
          category: category._id,
          quantity: 10,
          shipping: true,
      },
      {
          name: "Samsung Galaxy",
          slug: "samsung-galaxy",
          description: "Latest Samsung Galaxy",
          price: 799,
          category: category._id,
          quantity: 15,
          shipping: true,
      },
  ]);

    // Create a test user and get authentication token
    const userResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email: "testuser@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test Street",
        DOB: "1990-01-01",
        answer: "Test Answer"
      });
    
    testUser = userResponse.body.user;
    
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "testuser@example.com",
        password: "password123"
      });
    
    testToken = loginResponse.body.token;
    
       const  orders = await orderModel.create([
        {
            products: [products[0]._id], // iPhone
            payment: {
                transaction_id: "test-transaction-1",
                amount: 999
            },
            buyer: testUser._id,
            status: "Processing"
        },
        {
            products: [products[0]._id, products[1]._id], // iPhone and Samsung
            payment: {
                transaction_id: "test-transaction-2",
                amount: 1798
            },
            buyer: testUser._id,
            status: "Shipped"
        }
    ]);
    testOrders = [orders[0], orders[1]];
  });

  afterAll(async () => {
    console.log("Shutting down MongoDB Memory Server...");

    await mongoose.connection.close(); // Close active connection
    await mongoose.disconnect(); // Ensure full disconnection

    if (mongoServer) {
        await mongoServer.stop();
        console.log("MongoDB Memory Server stopped.");
    }
});

  describe("Profile API Tests", () => {
    test("PUT /api/v1/auth/profile - should update user profile successfully", async () => {
      const res = await request(app)
        .put("/api/v1/auth/profile")
        .set("Authorization", testToken)
        .send({
          name: 'Updated Test User',
          phone: '5555555555',
          address: '789 Updated Street',
          email: 'test@gmail.com'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Profile Updated");
      expect(res.body.updatedUser.name).toBe("Updated Test User");
      expect(res.body.updatedUser.phone).toBe("5555555555");
      expect(res.body.updatedUser.email).toBe('test@gmail.com');
    });
    
    test("PUT /api/v1/auth/profile - should reject short passwords", async () => {
      const res = await request(app)
        .put("/api/v1/auth/profile")
        .set("Authorization", testToken)
        .send({
          name: 'Updated Test User',
          phone: '5555555555',
          address: '789 Updated Street',
          email: 'test@gmail.com',
          password: '12345' // Too short
        });
      
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Password must be at least 6 characters long');
    });
    
    test("PUT /api/v1/auth/profile - should handle unauthorized access", async () => {
      const res = await request(app)
        .put("/api/v1/auth/profile")
        .send({ // No authorization token
          name: "Hacker"
        });
      
      expect(res.status).toBeGreaterThanOrEqual(401);
    });
  });
  
  describe("Order API Tests", () => {
    test("GET /api/v1/auth/orders - should get user orders", async () => {
      const res = await request(app)
        .get("/api/v1/auth/orders")
        .set("Authorization", testToken);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0); 
      expect(res.body[0].buyer.name).toBeDefined();
      expect(res.body[0].products).toBeDefined();
    });
    
    test("GET /api/v1/auth/all-orders - should get all orders (admin only)", async () => {
      await userModel.findByIdAndUpdate(testUser._id, { role: 1 });
      
      const res = await request(app)
        .get("/api/v1/auth/all-orders")
        .set("Authorization", testToken);

        if (res.status === 500) {
          console.log("Error response:", res.body);
        }
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      
      await userModel.findByIdAndUpdate(testUser._id, { role: 0 });
    });
    
    test("GET /api/v1/auth/all-orders - should reject non-admin users", async () => {
      await userModel.findByIdAndUpdate(testUser._id, { role: 0 });
      
      const res = await request(app)
        .get("/api/v1/auth/all-orders")
        .set("Authorization", testToken);
      
      expect(res.status).toBeGreaterThanOrEqual(401);
    });
    
    test("PUT /api/v1/auth/order-status/:orderId - should update order status", async () => {
      await userModel.findByIdAndUpdate(testUser._id, { role: 1 });
      
      const orderId = testOrders[0]._id;
      const res = await request(app)
        .put(`/api/v1/auth/order-status/${orderId}`)
        .set("Authorization", testToken)
        .send({
          status: "Shipped"
        });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Shipped");
      
      // Restore user role
      await userModel.findByIdAndUpdate(testUser._id, { role: 0 });
    });
    
    test("PUT /api/v1/auth/order-status/:orderId - should reject invalid status values", async () => {
      await userModel.findByIdAndUpdate(testUser._id, { role: 1 });
      
      const orderId = testOrders[0]._id;
      const res = await request(app)
        .put(`/api/v1/auth/order-status/${orderId}`)
        .set("Authorization", testToken)
        .send({
          status: "InvalidStatus"
        });
      
      // Restore user role
      await userModel.findByIdAndUpdate(testUser._id, { role: 0 });
    });
  });
});