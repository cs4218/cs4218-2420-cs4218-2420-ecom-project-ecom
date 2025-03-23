import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  getAllOrdersController,
  orderStatusController,
} from "../../../../controllers/authController.js";
import orderModel from "../../../../models/orderModel.js";
import userModel from "../../../../models/userModel.js";
import productModel from "../../../../models/productModel.js";
import dotenv from "dotenv";
dotenv.config();

// Set up a minimal Express app for the test.
const app = express();
app.use(bodyParser.json());

// Register the order routes
app.get("/api/v1/auth/all-orders", getAllOrdersController);
app.put("/api/v1/auth/order-status/:orderId", orderStatusController);

let mongoServer;

// Connect to an in-memory MongoDB instance before each test.
beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {});
});

// Disconnect from the in-memory MongoDB instance after each test.
afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("AdminOrders Integration Tests", () => {
  const userData = {
    name: "daniel",
    email: "ddd@email.com",
    password: "password123",
    phone: "1234567890",
    address: "Singapore",
    DOB: "2000-01-01",
    answer: "Soccer",
  };

  const productData = {
    name: "PS5 Controller",
    slug: "controller",
    description: "PS5 white controller",
    price: 60.99,
    category: new mongoose.Types.ObjectId(), // Valid ObjectId for category
    quantity: 6,
    photo: {
      data: Buffer.from("test"), // Mock photo data
      contentType: "image/png",
    },
    shipping: true,
  };

  const orderData = {
    status: "Not Process",
    buyer: null, // Will be populated with a valid ObjectId
    products: [], // Will be populated with valid ObjectIds
    payment: { success: true },
  };

  beforeEach(async () => {
    // Create a user
    const user = await userModel.create(userData);
    orderData.buyer = user._id; // Set buyer to the user's ObjectId

    // Create a product
    const product = await productModel.create(productData);
    orderData.products.push(product._id); // Add product's ObjectId to the products array

    // Create an order
    await orderModel.create(orderData);
  });

  it("should fetch all orders", async () => {
    const res = await request(app).get("/api/v1/auth/all-orders");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].buyer.name).toBe(userData.name);
    expect(res.body[0].products[0].name).toBe(productData.name);
  });

  it("should update order status", async () => {
    const order = await orderModel.findOne({ status: "Not Process" });
    const res = await request(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .send({ status: "Processing" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Processing");

    const updatedOrder = await orderModel.findById(order._id);
    expect(updatedOrder.status).toBe("Processing");
  });

  it("should return an error for invalid order ID", async () => {
    const invalidOrderId = "invalidOrderId";
    const res = await request(app)
      .put(`/api/v1/auth/order-status/${invalidOrderId}`)
      .send({ status: "Processing" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Error While Updateing Order/i);
  });

  it("should return an error for missing status", async () => {
    const order = await orderModel.findOne({ status: "Not Process" });
    const res = await request(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .send({}); // Missing status

    expect(res.status).toBe(400); // Expect 400 instead of 500
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Status is required/i); // Updated error message
  });

  it("should return an empty array when there are no orders", async () => {
    // Clear all orders from the database
    await orderModel.deleteMany({});

    const res = await request(app).get("/api/v1/auth/all-orders");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0); // Expect an empty array
  });

  it("should return an error for invalid status value", async () => {
    const order = await orderModel.findOne({ status: "Not Process" });
    const res = await request(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .send({ status: "InvalidStatus" }); // Invalid status value

    expect(res.status).toBe(400); // Expect 400 Bad Request
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid status value/i); // Custom error message
  });

  it("should return an error for non-existent order ID", async () => {
    const nonExistentOrderId = new mongoose.Types.ObjectId(); // Generate a valid but non-existent order ID
    const res = await request(app)
      .put(`/api/v1/auth/order-status/${nonExistentOrderId}`)
      .send({ status: "Processing" });

    expect(res.status).toBe(404); // Expect 404 Not Found
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Order not found/i); // Custom error message
  });

  it("should handle fetching a large number of orders", async () => {
    // Create 100 orders
    const user = await userModel.findOne({ email: userData.email });
    const product = await productModel.findOne({ name: productData.name });

    for (let i = 0; i < 100; i++) {
      await orderModel.create({
        status: "Not Process",
        buyer: user._id,
        products: [product._id],
        payment: { success: true },
      });
    }

    const res = await request(app).get("/api/v1/auth/all-orders");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(101); // 100 new orders + 1 existing order
  });

  it("should handle orders with multiple products", async () => {
    const user = await userModel.findOne({ email: userData.email });

    // Create multiple products
    const product1 = await productModel.create({
      name: "Product 1",
      slug: "product-1",
      description: "Description of Product 1",
      price: 10.99,
      category: new mongoose.Types.ObjectId(),
      quantity: 5,
      photo: {
        data: Buffer.from("test"),
        contentType: "image/png",
      },
      shipping: true,
    });

    const product2 = await productModel.create({
      name: "Product 2",
      slug: "product-2",
      description: "Description of Product 2",
      price: 20.99,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      photo: {
        data: Buffer.from("test"),
        contentType: "image/png",
      },
      shipping: true,
    });

    // Create an order with multiple products
    const order = await orderModel.create({
      status: "Not Process",
      buyer: user._id,
      products: [product1._id, product2._id],
      payment: { success: true },
    });


    console.log("Created Order:", order); // Inspect the created order
    const res = await request(app).get("/api/v1/auth/all-orders");

    expect(res.status).toBe(200);
    console.log("Response Body:", res.body); // Inspect the response body
    expect(res.body[0].products).toHaveLength(2); // Expect 2 products in the order
  });

});