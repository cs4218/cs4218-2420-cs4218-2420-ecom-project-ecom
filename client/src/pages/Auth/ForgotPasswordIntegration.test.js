import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  forgotPasswordController,
} from "../../../../controllers/authController.js";
import userModel from "../../../../models/userModel.js";
import dotenv from "dotenv";
import { hashPassword } from "../../../../helpers/authHelper.js";
dotenv.config();

// Set up a minimal Express app for the test.
const app = express();
app.use(bodyParser.json());

// Register the login route
app.post("/api/auth/forgot-password", forgotPasswordController);

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

describe("Forgot Password Controller Integration Tests", () => {
  const userData = {
    email: "ddd@email.com",
    password: "password123",
    answer:"Soccer"
  };

  it("should reset password with correct email and answer", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: userData.email,
      answer: userData.answer,
      newPassword: "newpassword123",
    });

    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Password Reset Successfully");
  });

  it("should not reset password with incorrect email or answer", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: userData.email,
      answer: "WrongAnswer", // Incorrect answer
      newPassword: "newpassword123",
    });

    console.log(res.body.message); // Optional for debugging
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Wrong Email Or Answer/i);
  });


  it("should return 400 for missing email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      answer: userData.answer,
      newPassword: "newpassword123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });

  it("should return 400 for missing answer", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: userData.email,
      newPassword: "newpassword123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("answer is required");
  });

  it("should return 400 for missing new password", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: userData.email,
      answer: userData.answer,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("New Password is required");
  });

});
