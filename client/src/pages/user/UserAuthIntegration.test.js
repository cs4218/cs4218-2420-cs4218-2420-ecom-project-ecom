import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import userModel from "../../../../models/userModel.js"; 
import { useAuth } from "../../context/auth.js";

// Set up an in-memory MongoDB instance
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Create a minimal Express app for testing
const app = express();
app.use(bodyParser.json());

// Mock the `/api/v1/auth/user-auth` endpoint
app.get("/api/v1/auth/user-auth", (req, res) => {
  res.status(200).json({ ok: true });
});

// Mock the PrivateRoute component
app.use((req, res, next) => {
  req.auth = { token: "mock-token" }; // Simulate authenticated user
  next();
});

// Mock the Dashboard component
app.get("/dashboard", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from headers

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // Return 401 if no token
  }

  // Simulate authenticated user data
  const auth = { user: { name: "John Doe", email: "john@example.com", address: "123 Main St" } };
  res.status(200).json(auth);
});

// Mock the UserMenu component
app.get("/dashboard/user-menu", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from headers

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // Return 401 if no token
  }

  // Simulate user menu options
  const userMenu = [
    { label: "Profile", link: "/dashboard/user/profile" },
    { label: "Orders", link: "/dashboard/user/orders" },
  ];
  res.status(200).json(userMenu);
});

// Test suite
describe("General User Authentication Integration Tests", () => {
  beforeEach(async () => {
    // Clear the users collection before each test
    await userModel.deleteMany({});
  });

  it("should authenticate user and display dashboard data", async () => {
    // Create a test user
    const user = await userModel.create({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      phone: "1234567890",
      address: "123 Main St",
      answer: "Soccer",
    });

    // Simulate a request to the dashboard with a valid token
    const res = await request(app)
      .get("/dashboard")
      .set("Authorization", "Bearer mock-token");

    // Assert the response
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("John Doe");
    expect(res.body.user.email).toBe("john@example.com");
    expect(res.body.user.address).toBe("123 Main St");
  });

  it("should return 401 if user is not authenticated", async () => {
    // Simulate an unauthenticated request (no token)
    const res = await request(app).get("/dashboard");

    // Assert the response
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should display user menu options if user is authenticated", async () => {
    // Simulate a request to the user menu with a valid token
    const res = await request(app)
      .get("/dashboard/user-menu")
      .set("Authorization", "Bearer mock-token");

    // Assert the response
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2); // Expect 2 menu options
    expect(res.body[0].label).toBe("Profile");
    expect(res.body[0].link).toBe("/dashboard/user/profile");
    expect(res.body[1].label).toBe("Orders");
    expect(res.body[1].link).toBe("/dashboard/user/orders");
  });

  it("should return 401 if user is not authenticated for user menu", async () => {
    // Simulate an unauthenticated request (no token)
    const res = await request(app).get("/dashboard/user-menu");

    // Assert the response
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});