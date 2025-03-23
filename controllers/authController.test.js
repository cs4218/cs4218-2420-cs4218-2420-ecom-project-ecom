import { jest } from "@jest/globals";
import { registerController, loginController, forgotPasswordController, testController } from "./authController";
import userModel from "../models/userModel";
import * as authHelper from "../helpers/authHelper"; 

jest.mock("../helpers/authHelper"); 
jest.mock("../models/userModel.js");

describe("Register Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
        DOB: "2000-01-01",
        answer: "Football",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("user model is not saved for invalid email", async () => {
    req.body.email = "invalid-email";
    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({
      message: "Valid email is Required",
    });
  });

  test("user model is not saved for invalid phone no (alphabets as input)", async () => {
    req.body.phone = "lettersInput";
    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({
      message: "Phone number must not exceed 15 digits and can contain only numbers",
    });
  });

  test("user model is not saved for invalid phone no (>15 digits)", async () => {
    req.body.phone = "1234567890123456";
    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({
      message: "Phone number must not exceed 15 digits and can contain only numbers",
    });
  });

  test("user model is not saved for invalid DOB", async () => {
    req.body.DOB = "2100-01-01";
    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({
      message: "Date of Birth cannot be in the future",
    });
  });
  
  test("should return error when user already exists", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({ _id: "someId" });

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already registered, please login",
    });
  });

  test("should register user successfully", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn().mockResolvedValue({
      _id: "someId",
      name: "John Doe",
      email: "john@example.com",
      phone: "12344000",
      address: "123 Street",
      DOB: "2000-01-01",
      answer: "Football",
    });

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Registered Successfully",
      user: expect.objectContaining({
        name: "John Doe",
        email: "john@example.com",
        phone: "12344000",
        address: "123 Street",
      }),
    });
  });
});

describe("Login Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "john@example.com",
        password: "password123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("user model cannot be found with non-existent email", async () => {
    req.body.email = "non-existent-email";
    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await loginController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registered",
    });
  });

  
  test("should not authenticate user with invalid password", async () => {
    req.body.password = "wrongPassword";

    userModel.findOne = jest.fn().mockResolvedValue({
        _id: "someUserId",
        email: "john@example.com",
        password: "hashedPassword123",
    });

    authHelper.comparePassword.mockResolvedValue(false); 

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Invalid Password",
    });
  });

  describe("Forgot Password Controller Test", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          email: "john@example.com",
          answer: "Football",
          newPassword: "newSecurePass123",
        },
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  
    test("should return 400 if email is missing", async () => {
      req.body.email = "";
      await forgotPasswordController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
    });
  
    test("should return 400 if answer is missing", async () => {
      req.body.answer = "";
      await forgotPasswordController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Answer is required" });
    });
  
    test("should return 400 if newPassword is missing", async () => {
      req.body.newPassword = "";
      await forgotPasswordController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "New Password is required" });
    });
  
    test("should return 404 if user is not found", async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);
      await forgotPasswordController(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Wrong Email Or Answer",
      });
    });
  
    test("should reset password successfully", async () => {
      const userMock = { _id: "12345" };
      userModel.findOne = jest.fn().mockResolvedValue(userMock);
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
  
      await forgotPasswordController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Password Reset Successfully",
      });
    });
  });

  describe("Test Controller", () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      req = {};
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
    });

    test("should return 'Protected Routes' when accessed successfully", () => {
      testController(req, res);
      expect(res.send).toHaveBeenCalledWith("Protected Routes");
    });

    test("should handle errors gracefully", () => {
      console.error = jest.fn();

      // Force an error by throwing inside the controller
      const errorController = (req, res) => {
        throw new Error("Unexpected error");
      };

      expect(() => errorController(req, res)).toThrow("Unexpected error");
    });
  });
});
