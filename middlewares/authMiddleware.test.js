import JWT from "jsonwebtoken";
import { requireSignIn, isAdmin } from "./authMiddleware";
import userModel from "../models/userModel";

jest.mock("jsonwebtoken"); // Mock JWT
jest.mock("../models/userModel"); // Mock userModel

describe("Auth Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe("requireSignIn", () => {
        test("should return 401 if no token is provided", async () => {
            await requireSignIn(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Unauthorized: No token provided" });
            expect(next).not.toHaveBeenCalled();
        });

        test("should return 401 if token is invalid", async () => {
            req.headers.authorization = "invalid-token";
            JWT.verify.mockImplementation(() => { throw new Error("Invalid token"); });

            await requireSignIn(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Unauthorized: Invalid token" });
            expect(next).not.toHaveBeenCalled();
        });

        test("should call next if token is valid", async () => {
            req.headers.authorization = "valid-token";
            const decodedUser = { _id: "12345", role: 0 };
            JWT.verify.mockReturnValue(decodedUser);

            await requireSignIn(req, res, next);

            expect(req.user).toEqual(decodedUser);
            expect(next).toHaveBeenCalled();
        });
    });

    describe("isAdmin", () => {
        test("should return 401 if user is not found", async () => {
            req.user = null;

            await isAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Unauthorized: User not found" });
            expect(next).not.toHaveBeenCalled();
        });

        test("should return 403 if user is not an admin", async () => {
            req.user = { _id: "12345" };
            userModel.findById.mockResolvedValue({ _id: "12345", role: 0 });

            await isAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "UnAuthorized Access" });
            expect(next).not.toHaveBeenCalled();
        });

        test("should call next if user is an admin", async () => {
            req.user = { _id: "12345" };
            userModel.findById.mockResolvedValue({ _id: "12345", role: 1 });

            await isAdmin(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});