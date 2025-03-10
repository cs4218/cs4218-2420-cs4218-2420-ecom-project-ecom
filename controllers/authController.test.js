import { jest } from "@jest/globals";
import { getOrdersController, updateProfileController, getAllOrdersController, orderStatusController, registerController } from "./authController";
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";
import hashPassword from "../helpers/authHelper";

jest.mock("../models/userModel.js");
jest.mock("../models/orderModel.js");
jest.mock("../helpers/authHelper", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashpassword123")
}));

describe("Update Profile Controller Test", () => {
  let req, res, mockUser, mockOldUser, consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
    req = {
      user: { _id: "1" },
      body: {
        name: "John Doe",
        email: "johndoe-email",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
      },
    };

    mockOldUser = {
      name: "John Old",
      email: "johndoe-email",
      password: "oldpassword123",
      phone: "old12344000",
      address: "old123 Street",
      answer: "yes",
    }

    mockUser = {
      name: "John Doe",
      email: "johndoe-email",
      password: "hashpassword123",
      phone: "12344000",
      address: "123 Street",
      answer: "yes",
    }

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  })

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test("should return error if password less than 6 chars or empty", async () => {
    req.body.password = "inval";
    userModel.findById = jest.fn().mockResolvedValue(mockOldUser);
    await updateProfileController(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Password is required and 6 character long" })

    req.body.password = "";
    await updateProfileController(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Password is required and 6 character long" })
  });

  test("should successfully update all fields in profile", async () => {
    userModel.findById = jest.fn().mockResolvedValue(mockOldUser);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...mockOldUser,
      name: "John Doe",
      password: "hashpassword123",
      phone: "12344000",
      address: "123 Street",
    })

    await updateProfileController(req, res);

    expect(userModel.findById).toHaveBeenCalledWith("1");
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("1", {
      name: "John Doe",
      password: "hashpassword123",
      phone: "12344000",
      address: "123 Street",
    },
      { new: true });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser: mockUser,
    })
  });

  test("should successfully update only one field in profile", async () => {
    const expectedChange = {
      name: "John Doe",
      password: "oldpassword123",
      phone: "old12344000",
      address: "old123 Street",
      answer: "yes",
      email: "johndoe-email"
    }
    req.body = { name: "John Doe" }
    userModel.findById = jest.fn().mockResolvedValue(mockOldUser);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...mockOldUser,
      name: "John Doe",
    })

    await updateProfileController(req, res);

    expect(userModel.findById).toHaveBeenCalledWith("1");
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("1",
      {
        name: "John Doe",
        password: "oldpassword123",
        phone: "old12344000",
        address: "old123 Street",
      },
      { new: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser: expectedChange,
    })
  });

  test("should log error if update throws error", async () => {
    userModel.findById = jest.fn().mockRejectedValue(new Error("Testing Error"));
    await updateProfileController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"))
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Update profile",
      error: Error("Testing Error"),
    });
  });
});

describe("Get Orders Controller Test", () => {
  let req, res, consoleLogSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
    req = {
      user: { _id: "1" }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test("should successfully get orders", async () => {
    orderModel.find = jest.fn(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn(() => Promise.resolve({ order: "test" })),
      })),
    }));
    await getOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalledWith({ buyer: "1" });
    expect(res.json).toHaveBeenCalledWith({ order: "test" })
  });

  test("should log error when getting orders error thrown", async () => {
    orderModel.find = jest.fn(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn().mockRejectedValue(new Error("Testing Error")),
      })),
    }));
    await getOrdersController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Geting Orders",
      error: Error("Testing Error"),
    })
  });
});

describe("Get All Orders Controller Test", () => {
  let req, res, consoleLogSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test("should successfully get all orders", async () => {
    orderModel.find = jest.fn(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn(() => ({
          sort: jest.fn().mockResolvedValue([{ buyer: "1" }, { buyer: "2" }])
        })),
      })),
    }));
    await getAllOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith([{ buyer: "1" }, { buyer: "2" }])
  });

  test("should log error when getting all orders error thrown", async () => {
    orderModel.find = jest.fn(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn(() => ({
          sort: jest.fn().mockRejectedValue(new Error("Testing Error"))
        })),
      })),
    }));
    await getAllOrdersController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Geting Orders",
      error: Error("Testing Error"),
    })
  });
});

describe("Order Status Controller Test", () => {
  let req, res, consoleLogSpy, orders;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { orderId: "1" },
      body: { status: "Paid" }
    }
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    orders = { name: "test" };
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test("should successfully update order status", async () => {
    orderModel.findByIdAndUpdate = jest.fn().mockResolvedValue(orders);

    await orderStatusController(req, res);
    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1", { status: "Paid" }, { new: true }
    );
    expect(res.json).toHaveBeenCalledWith({ name: "test" })
  });

  test("should log error when getting all orders error thrown", async () => {
    orderModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error("Testing Error"));
    await orderStatusController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Updateing Order",
      error: Error("Testing Error"),
    })
  });
});

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
