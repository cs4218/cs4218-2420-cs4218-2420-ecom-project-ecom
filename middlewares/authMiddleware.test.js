import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn, isAdmin } from "./authMiddleware.js";
import { jest } from "@jest/globals";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

describe("Auth Middleware", () => {
  describe("requireSignIn", () => {
    it("should decode token and attach user to req", () => {
      const mockReq = { headers: { authorization: "valid_token" } };
      const mockRes = {};
      const mockNext = jest.fn();
      JWT.verify = jest.fn().mockReturnValue({ _id: "123" });

      requireSignIn(mockReq, mockRes, mockNext);
      expect(JWT.verify).toHaveBeenCalledWith(
        "valid_token",
        process.env.JWT_SECRET
      );
      expect(mockReq.user).toEqual({ _id: "123" });
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle errors gracefully", () => {
      const mockReq = { headers: { authorization: "invalid_token" } };
      const mockRes = {};
      const mockNext = jest.fn();
      console.log = jest.fn().mockImplementation();
      let err = new Error("Invalid token");
      JWT.verify = jest.fn().mockImplementation(() => {
        throw err;
      });

      requireSignIn(mockReq, mockRes, mockNext);
      expect(console.log).toHaveBeenCalledWith(err);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("isAdmin", () => {
    it("should let admin pass", async () => {
      const mockReq = { user: { _id: "adminId" } };
      const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const mockNext = jest.fn();
      userModel.findById = jest.fn().mockResolvedValue({ role: 1 });

      await isAdmin(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should block non-admin", async () => {
      const mockReq = { user: { _id: "userId" } };
      const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const mockNext = jest.fn();
      userModel.findById = jest.fn().mockResolvedValue({ role: 0 });

      await isAdmin(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
