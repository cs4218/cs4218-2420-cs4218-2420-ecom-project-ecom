import {
  registerController,
  loginController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  testController,
} from "./authController";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import { jest } from "@jest/globals";

jest.mock("../models/userModel");
jest.mock("../models/orderModel");
jest.mock("../helpers/authHelper");
jest.mock("jsonwebtoken");

describe("Register Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "Jane Street",
        email: "jane@example.com",
        password: "password321",
        phone: "91112222",
        address: "London Bridge",
        answer: "Cool",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should return name error message if name is missing", async () => {
    req.body.name = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  test("should return email error message if email is missing", async () => {
    req.body.email = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  test("should return password error message if password is missing", async () => {
    req.body.password = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  test("should return phone error message if phone is missing", async () => {
    req.body.phone = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });

  test("should return address error message if address is missing", async () => {
    req.body.address = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  test("should return answer error message if answer is missing", async () => {
    req.body.answer = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  test("should return an error if user already exists", async () => {
    userModel.findOne.mockResolvedValue({ email: "jane@example.com" });
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  // Code adapted from https://chatgpt.com/share/67c80299-5ad0-8013-84ec-1461351a83bc
  test("should hash the password and register the user successfully", async () => {
    userModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed_password");

    const mockSave = jest.fn().mockResolvedValue({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      password: "hashed_password",
      answer: req.body.answer,
    });

    userModel.mockImplementation(() => ({
      save: mockSave,
    }));

    await registerController(req, res);

    expect(hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Register Successfully",
      user: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        password: "hashed_password",
        answer: req.body.answer,
      },
    });
  });

  test("should return 500 if an error occurs during registration", async () => {
    userModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed_password");
    userModel.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    }));

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Errro in Registeration",
      error: expect.any(Object),
    });
  });
});

// Code adapted from https://chatgpt.com/share/67c80299-5ad0-8013-84ec-1461351a83bc
describe("Login Controller", () => {
  let req, res, user;

  beforeEach(() => {
    req = {
      body: {
        email: "user@example.com",
        password: "user123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    user = {
      _id: "user123",
      name: "Test User",
      email: "user@example.com",
      phone: "90908877",
      address: "123 Test Street",
      password: "hashedpassword",
      role: "user",
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return error if email or password is missing", async () => {
    req.body.email = "";
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });

    req.body.email = "user@example.com";
    req.body.password = "";
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("should return error if user is not registered", async () => {
    userModel.findOne.mockResolvedValue(null);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registerd",
    });
  });

  test("should return error if password is incorrect", async () => {
    userModel.findOne.mockResolvedValue(user);
    comparePassword.mockResolvedValue(false);

    await loginController(req, res);

    expect(comparePassword).toHaveBeenCalledWith(
      req.body.password,
      user.password
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  test("should login successfully and return a token", async () => {
    userModel.findOne.mockResolvedValue(user);
    comparePassword.mockResolvedValue(true);
    JWT.sign.mockReturnValue("mocked-jwt-token");

    await loginController(req, res);

    expect(comparePassword).toHaveBeenCalledWith(
      req.body.password,
      user.password
    );
    expect(JWT.sign).toHaveBeenCalledWith(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token: "mocked-jwt-token",
    });
  });

  test("should return 500 if an error occurs", async () => {
    userModel.findOne.mockRejectedValue(new Error("Database error"));

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error: expect.any(Object),
    });
  });
});

describe("Forgot Password Controller", () => {
  let req, res, user;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        answer: "Cool",
        newPassword: "newPassword123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    user = {
      _id: "user123",
      email: "test@example.com",
      answer: "Cool",
      password: "hashedpassword",
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return error if email is missing", async () => {
    req.body.email = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Emai is required",
    });
  });

  test("should return error if answer is missing", async () => {
    req.body.answer = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "answer is required",
    });
  });

  test("should return error if new password is missing", async () => {
    req.body.newPassword = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "New Password is required",
    });
  });

  test("should return error if user is not found", async () => {
    userModel.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: req.body.email,
      answer: req.body.answer,
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
  });

  // Code adapted from https://chatgpt.com/share/67c80299-5ad0-8013-84ec-1461351a83bc
  test("should hash the new password successfully reset password", async () => {
    userModel.findOne.mockResolvedValue(user);
    hashPassword.mockResolvedValue("hashedNewPassword");
    userModel.findByIdAndUpdate.mockResolvedValue({});

    await forgotPasswordController(req, res);

    expect(hashPassword).toHaveBeenCalledWith(req.body.newPassword);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(user._id, {
      password: "hashedNewPassword",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });

  test("should return 500 if an error occurs", async () => {
    userModel.findOne.mockRejectedValue(new Error("Database error"));

    jest.spyOn(console, "log").mockImplementation(() => {});

    await forgotPasswordController(req, res);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error: expect.any(Object),
    });
    console.log.mockRestore();
  });
});

// Code adapted from https://chatgpt.com/share/67c80299-5ad0-8013-84ec-1461351a83bc
describe("Update Profile Controller", () => {
  let req, res, user;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      body: {
        name: "Jon Doe",
        email: "jon@example.com",
        password: "password",
        address: "address",
        phone: "98990088",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    user = {
      _id: "user123",
      name: "Bob Doe",
      email: "bob@example.com",
      password: "passwordpassword",
      phone: "98221111",
      address: "London Bridge",
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return error if password is less than 6 characters", async () => {
    req.body.password = "pass";
    await updateProfileController(req, res);

    expect(res.json).toHaveBeenCalledWith({
      error: "Passsword is required and 6 character long",
    });
  });

  test("should update the user profile successfully when password provided", async () => {
    userModel.findById.mockResolvedValue(user);
    hashPassword.mockResolvedValue("hashedNewPassword");
    userModel.findByIdAndUpdate.mockResolvedValue({
      ...user,
      name: req.body.name,
      password: "hashedNewPassword",
      phone: req.body.phone,
      address: req.body.address,
    });

    await updateProfileController(req, res);

    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: req.body.name,
        password: "hashedNewPassword",
        phone: req.body.phone,
        address: req.body.address,
      },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.any(Object),
    });
  });

  test("should update the user profile successfully when password is NOT provided", async () => {
    req.body.password = "";
    userModel.findById.mockResolvedValue(user);
    userModel.findByIdAndUpdate.mockResolvedValue({
      ...user,
      name: req.body.name,
      password: user.password,
      phone: req.body.phone,
      address: req.body.address,
    });

    await updateProfileController(req, res);

    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(hashPassword).not.toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: req.body.name,
        password: user.password,
        phone: req.body.phone,
        address: req.body.address,
      },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.any(Object),
    });
  });

  test("should update the user profile when optional fields are missing", async () => {
    req.body = {};

    userModel.findById.mockResolvedValue(user);
    userModel.findByIdAndUpdate.mockResolvedValue(user);

    await updateProfileController(req, res);

    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: user.name,
        password: user.password,
        phone: user.phone,
        address: user.address,
      },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.any(Object),
    });
  });

  test("should handle errors and return status 400", async () => {
    const errorMessage = "Database error";
    userModel.findById.mockRejectedValue(new Error(errorMessage));

    jest.spyOn(console, "log").mockImplementation(() => {});

    await updateProfileController(req, res);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Update profile",
      error: expect.any(Error),
    });
    console.log.mockRestore();
  });
});

// Code adapted from https://chatgpt.com/share/67c80299-5ad0-8013-84ec-1461351a83bc
describe("Orders Controller", () => {
  let req, res, mockOrder;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      params: { orderId: "order123" },
      body: { status: "Shipped" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    mockOrder = [
      {
        _id: "order1",
        products: [{ _id: "product1", name: "Macbook" }],
        payment: {},
        buyer: { _id: "tim123", name: "Tim" },
        status: "Not Process",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockQuery = {
      populate: jest.fn().mockImplementation(() => mockQuery),
      exec: jest.fn().mockResolvedValue(mockOrder),
    };

    orderModel.find.mockReturnValue(mockQuery);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return orders for the authenticated user", async () => {
    await getOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
  });

  test("should return 500 error if an error occurs in getOrdersController", async () => {
    orderModel.find.mockImplementation(() => {
      throw new Error("Database error");
    });

    await getOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Geting Orders",
      error: expect.any(Object),
    });
  });

  describe("Get All Orders Controller", () => {
    let req, res, mockOrders;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      };

      mockOrder = [
        {
          _id: "order1",
          products: [{ _id: "product1", name: "Macbook" }],
          payment: {},
          buyer: { _id: "user123", name: "John Doe" },
          status: "Shipped",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: "order2",
          products: [{ _id: "product2", name: "iPhone" }],
          payment: {},
          buyer: { _id: "user456", name: "Jane Smith" },
          status: "Processing",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders),
      };

      orderModel.find.mockReturnValue(mockQuery);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should return all orders successfully", async () => {
      await getAllOrdersController(req, res);

      expect(orderModel.find).toHaveBeenCalledWith({});
    });

    test("should return 500 error if an error occurs", async () => {
      orderModel.find.mockImplementation(() => {
        throw new Error("Database error");
      });

      await getAllOrdersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error WHile Geting Orders",
        error: expect.any(Object),
      });
    });
  });

  // Code adapted from https://chatgpt.com/share/67c80299-5ad0-8013-84ec-1461351a83bc
  describe("Order Status Controller", () => {
    let req, res, mockOrder;

    beforeEach(() => {
      req = {
        params: { orderId: "order123" },
        body: { status: "Shipped" },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      };

      mockOrder = {
        _id: "order123",
        products: [{ _id: "product1", name: "Macbook" }],
        payment: {},
        buyer: { _id: "user123", name: "John Doe" },
        status: "Shipped",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should update order status successfully", async () => {
      orderModel.findByIdAndUpdate.mockResolvedValue(mockOrder);

      await orderStatusController(req, res);

      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.orderId,
        { status: req.body.status },
        { new: true }
      );

      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    test("should return 500 error if an error occurs", async () => {
      orderModel.findByIdAndUpdate.mockRejectedValue(
        new Error("Database error")
      );

      await orderStatusController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error While Updateing Order",
        error: expect.any(Object),
      });
    });
  });

  describe("Test Controller", () => {
    let req, res;

    beforeEach(() => {
      req = {};
      res = {
        send: jest.fn(),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should return protected routes successfully", () => {
      testController(req, res);

      expect(res.send).toHaveBeenCalledWith("Protected Routes");
    });

    test("should handle errors correctly", () => {
      const error = new Error("Test error");

      const mockRes = {
        send: jest.fn(() => {
          throw error;
        }),
      };

      expect(() => testController(req, mockRes)).toThrow(error);
    });
  });
});
