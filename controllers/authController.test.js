import { expect, jest } from "@jest/globals";

import userModel from "../models/userModel.js";
import { GiHeartStake } from "react-icons/gi";
jest.mock("../models/userModel.js");
jest.unstable_mockModule("../helpers/authHelper.js", () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

const { comparePassword, hashPassword } = await import(
  "../helpers/authHelper.js"
);

const {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
} = await import("./authController");

describe("Register Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test("returns error if name is missing", async () => {
    req.body = {
      email: "test@example.com",
      password: "password",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  test("returns error if email is missing", async () => {
    req.body = {
      name: "Foo",
      password: "password",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  test("returns error if password is missing", async () => {
    req.body = {
      name: "Foo",
      email: "email",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  test("returns error if phone is missing", async () => {
    req.body = {
      name: "Foo",
      password: "password",
      email: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });
  test("returns error if address is missing", async () => {
    req.body = {
      name: "Foo",
      password: "password",
      phone: "123",
      email: "email",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });
  test("returns error if answer is missing", async () => {
    req.body = {
      name: "Foo",
      password: "password",
      phone: "123",
      address: "Addr",
      email: "email",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  test("returns error if user already exists", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({});
    req.body = {
      name: "Foo",
      email: "existing@example.com",
      password: "pwd",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  test("registers new user successfully", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    let userObject = {
      id: "123",
      name: "Foo",
      email: "new@example.com",
      phone: "123",
      address: "Addr",
      password: "hashedPwd",
      answer: "Ans",
    };
    jest.spyOn(userModel.prototype, "save").mockResolvedValue(userObject);

    req.body = {
      name: "Foo",
      email: "new@example.com",
      password: "pwd",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Register Successfully",
      user: userObject,
    });
  });

  test("returns error if there's an unexpected server error", async () => {
    let err = new Error("Database Error");
    userModel.findOne = jest.fn().mockImplementation(() => {
      throw err;
    });
    req.body = {
      name: "Test",
      email: "test@example.com",
      password: "pass",
      phone: "123",
      address: "Addr",
      answer: "Ans",
    };
    console.log = jest.fn().mockImplementation();
    await registerController(req, res);
    expect(console.log).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Login Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test("returns error if email is missing", async () => {
    req.body = { password: "pass" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns error if password is missing", async () => {
    req.body = { email: "test@example.com" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns error if user not found", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    req.body = { email: "nope@example.com", password: "pass" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("logs in successfully if credentials are correct", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({
      password: "hashedPassword",
    });
    req.body = { email: "test@example.com", password: "pass" };
    comparePassword.mockResolvedValue(true);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("cannot log in successfully if credentials are not correct", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({
      password: "hashedPassword",
    });
    req.body = { email: "test@example.com", password: "pass" };
    comparePassword.mockResolvedValue(false);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("handles unexpected DB error gracefully", async () => {
    let err = new Error("DB error");
    userModel.findOne = jest.fn().mockImplementationOnce(() => {
      throw err;
    });
    req.body = { email: "test@example.com", password: "pass" };
    console.log = jest.fn().mockImplementation();
    await loginController(req, res);

    expect(console.log).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Forgot Password Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "test@example.com",
        answer: "someAnswer",
        newPassword: "1234",
      },
    };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  });

  test("fails if newPassword is missing", async () => {
    req.body.newPassword = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fails if answer is missing", async () => {
    req.body.answer = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fails if email is missing", async () => {
    req.body.email = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fails if no user is found", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(undefined);
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("successfully resets", async () => {
    req.body.newPassword = "brandNewPassword";
    req.body.answer = "someAnswer";
    userModel.findOne = jest.fn().mockResolvedValue({
      email: "test@example.com",
      answer: "someAnswer",
      password: "oldPassword",
    });
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      email: "test@example.com",
      answer: req.body.answer,
      password: req.body.newPassword,
    });
    hashPassword.mockImplementation((password) => password + "hash");
    await forgotPasswordController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      answer: req.body.answer,
    });
    expect(hashPassword).toHaveBeenCalledWith("brandNewPassword");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("handles unexpected DB error gracefully", async () => {
    let err = new Error("DB error");
    userModel.findOne = jest.fn().mockImplementationOnce(() => {
      throw err;
    });
    console.log = jest.fn().mockImplementation();

    await forgotPasswordController(req, res);
    expect(console.log).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Test Controller Tests", () => {
  test("does not throw error", () => {
    expect(() => testController({}, { send: jest.fn() })).not.toThrow();
  });
});
