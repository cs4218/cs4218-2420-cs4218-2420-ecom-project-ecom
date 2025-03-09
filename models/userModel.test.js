import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "./userModel"; 

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await User.syncIndexes();
});

afterEach(async () => {
    await User.deleteMany({});
  });

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User Model", () => {
  let user;

  beforeEach(() => {
    user = new User({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      phone: "1234567890",
      address: { street: "123 Main St", city: "New York", zip: "10001" },
      answer: "My secret answer",
      role: 1,
    });
  });

  test("should create a new user", async () => {
    const savedUser = await user.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe("John Doe");
    expect(savedUser.email).toBe("john.doe@example.com");
    expect(savedUser.role).toBe(1); 
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  test("should fail if email is not unique", async () => {
    await user.save();
    const anotherUser = new User({
      name: "Jane Doe",
      email: "john.doe@example.com", 
      password: "password456",
      phone: "0987654321",
      address: { street: "456 Elm St", city: "San Francisco", zip: "94101" },
      answer: "Another secret answer",
    });

    await expect(anotherUser.save()).rejects.toThrowError(
      /E11000 duplicate key error collection:/
    );
  });

  test("should validate required fields", async () => {
    const invalidUser = new User({
      password: "password123",
      email: "missingname@gmail.com",
      phone: "1234567890",
      address: { street: "123 Main St", city: "New York", zip: "10001" },
      answer: "Secret answer",
    });

    await expect(invalidUser.save()).rejects.toThrowError(/name/);
  });

  test("should validate required fields", async () => {
    const invalidUser = new User({
      name: "Missing password",
      email: "missingpw@gmail.com",
      phone: "1234567890",
      address: { street: "123 Main St", city: "New York", zip: "10001" },
      answer: "Secret answer",
    });

    await expect(invalidUser.save()).rejects.toThrowError(/password/);
  });

  test("should validate required fields", async () => {
    const invalidUser = new User({
      name: "Missing Phone",
      email: "missingphone@gmail.com",
      password: "1234567890",
      address: { street: "123 Main St", city: "New York", zip: "10001" },
      answer: "Secret answer",
    });

    await expect(invalidUser.save()).rejects.toThrowError(/phone/);
  });

  test("should validate required fields", async () => {
    const invalidUser = new User({
      name: "Missing Address",
      email: "missingaddress@gmail.com",
      password: "1234567890",
      phone: "0123456",
      answer: "Secret answer",
    });

    await expect(invalidUser.save()).rejects.toThrowError(/address/);
  });

  test("should validate required fields", async () => {
    const invalidUser = new User({
      name: "Missing Answer",
      email: "missinganswer@gmail.com",
      password: "1234567890",
      phone: "0123456",
      address: { street: "123 Main St", city: "New York", zip: "10001" },
    });

    await expect(invalidUser.save()).rejects.toThrowError(/answer/);
  });

  

  test("should validate required fields", async () => {
    const invalidUser = new User({
      name: "Missing Email",
      password: "password123",
      phone: "1234567890",
      address: { street: "123 Main St", city: "New York", zip: "10001" },
      answer: "Secret answer",
    });

    await expect(invalidUser.save()).rejects.toThrowError(/email/);
  });

  test("should have a default role of 0 if not provided", async () => {
    const userWithDefaultRole = new User({
      name: "No Role",
      email: "no.role@example.com",
      password: "password123",
      phone: "1234567890",
      address: { street: "123 Main St", city: "New York", zip: "10001" },
      answer: "My answer",
    });

    const savedUser = await userWithDefaultRole.save();
    expect(savedUser.role).toBe(0); 
  });


  test("should auto-generate timestamps", async () => {
    const savedUser = await user.save();
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
    expect(savedUser.createdAt).toEqual(savedUser.updatedAt);
  });
});
