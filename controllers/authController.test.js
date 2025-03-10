import { jest } from "@jest/globals";
import { registerController } from "./authController";
import userModel from "../models/userModel";
import { hashPassword } from "../helpers/authHelper";

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js");

describe("Register Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Street",
        answer: "Football",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should not save user model for invalid email", async () => {
    req.body.email = "invalid-email";
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Invalid email format" });
  });

  it("should not save user model for missing name", async () => {
    req.body.name = "";
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  it("should not save user model for missing email", async () => {
    req.body.email = "";
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  it("should not save user model for missing password", async () => {
    req.body.password = "";
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  it("should not save user model for missing phone", async () => {
    req.body.phone = "";
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });

  it("should not save user model for missing address", async () => {
    req.body.address = "";
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  it("should not save user model for missing answer", async () => {
    req.body.answer = "";
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  it("should not save user model if user already exists", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({ email: "existinguser@email.com" });
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  it("should save user model successfully for new user", async () => {
    const user = {
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
      phone: "1234567890",
      address: "123 Street",
      answer: "Football",
    };
    userModel.findOne = jest.fn().mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashedPassword");
    userModel.prototype.save = jest.fn().mockResolvedValue(user);

    await registerController(req, res);
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(userModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Register Successfully",
      user,
    });
  });
});
