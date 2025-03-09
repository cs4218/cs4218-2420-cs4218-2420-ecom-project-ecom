import mongoose from "mongoose";
import UserModel from "./userModel"; // Adjust the path as needed

// Mocking TextEncoder and TextDecoder globally
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3]))
}));

global.TextDecoder = jest.fn().mockImplementation(() => ({
  decode: jest.fn().mockReturnValue("decoded string")
}));

// Mock Mongoose
jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    model: jest.fn(),
  };
});

describe("UserModel Schema", () => {
  let userSchema;

  beforeAll(() => {
    expect(mongoose.model).toHaveBeenCalledWith("users", expect.any(Object));
    userSchema = mongoose.model.mock.calls[0][1].obj;
  });

  test("should have required fields", () => {
    expect(userSchema.name.required).toBe(true);
    expect(userSchema.email.required).toBe(true);
    expect(userSchema.password.required).toBe(true);
    expect(userSchema.phone.required).toBe(true);
    expect(userSchema.address.required).toBe(true);
    expect(userSchema.answer.required).toBe(true);
  });

  test("should have default role value of 0", () => {
    expect(userSchema.role.default).toBe(0);
  });

  test("should define correct types for fields", () => {
    expect(userSchema.name.type).toBe(String);
    expect(userSchema.email.type).toBe(String);
    expect(userSchema.password.type).toBe(String);
    expect(userSchema.phone.type).toBe(String);
    expect(userSchema.address.type).toBe(Object);
    expect(userSchema.answer.type).toBe(String);
    expect(userSchema.role.type).toBe(Number);
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure all connections are closed
  });
  afterAll(() => {
    // Clean up global mocks if needed
    jest.restoreAllMocks();
  });
});
