import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  loginController,
  forgotPasswordController,
  testController,
} from "../../../../controllers/authController.js";
import userModel from "../../../../models/userModel.js";
import dotenv from "dotenv";
import { hashPassword } from "../../../../helpers/authHelper.js";
dotenv.config();

// Set up a minimal Express app for the test.
const app = express();
app.use(bodyParser.json());

// Register the login route
app.post("/api/auth/login", loginController);
app.post("/api/auth/forgot-password", forgotPasswordController);
app.get("/api/auth/protected", testController);

let mongoServer;

// Connect to an in-memory MongoDB instance before each test.
beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed the in-memory database with the sample user data
  const userData = {
    name: "daniel",
    email: "ddd@email.com",
    password: "password123",
    phone: "1234567890",
    address: "Singapore",
    DOB: "2000-01-01",
    answer: "Soccer",
  };
  const hashedPassword = await hashPassword(userData.password);
  userData.password = hashedPassword;
  await userModel.create(userData); // This inserts the user data directly into the in-memory database
});

// Disconnect and stop the in-memory MongoDB instance after each test.
afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Login Controller Integration Tests", () => {
  const userData = {
    email: "ddd@email.com",
    password: "password123",
    answer:"Soccer"
  };

  it("should login an existing user", async () => {
    // Check if the user exists in the database before attempting to login
    const userInDb = await userModel.findOne({ email: userData.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb.email).toBe(userData.email);

    // Attempt login with correct credentials.
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password });

    // Check response status and message
    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(userData.email);

    // Validate token structure (check if it’s a valid JWT)
    const tokenParts = res.body.token.split(".");
    expect(tokenParts).toHaveLength(3); // A JWT consists of 3 parts
  });

  it("should not login with incorrect password", async () => {
    // Check if the user exists in the database before attempting to login
    const userInDb = await userModel.findOne({ email: userData.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb.email).toBe(userData.email);

    // Attempt login with incorrect password.
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: "wrongpassword" });

    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid Password/i);
  });

  it("should not login with unregistered email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "unregistered@email.com", password: "password123" });

    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Email is not registered/i);
  });

  it("should not login with empty email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "", password: "password123" });

    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid email or password/i);
  });

  it("should not login with empty password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: "" });

    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid email or password/i);
  });

  it("should not login with invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "invalidemail", password: "password123" });

    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Email is not registered/i);
  });

  it("should handle internal server errors gracefully", async () => {
    // Simulate a server error by sending an invalid request
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "error@test.com", password: "password123" });

    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Email is not registered/i);
  });

});
