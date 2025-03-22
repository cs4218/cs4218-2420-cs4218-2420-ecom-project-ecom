import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { isAdmin, requireSignIn } from "./authMiddleware.js";

jest.mock("jsonwebtoken")
jest.mock("../models/userModel.js");

describe("Test requireSignIn Function", () => {
    let req, res, next;
    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            headers: {
                authorization: "Authorized"
            },
            user: {
                _id: 1
              },
            };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();
    })

    test("requireSignIn no error", async () => {
        JWT.verify = jest.fn().mockResolvedValue(null);
        await requireSignIn(req, res, next);
        expect(next).toBeCalledTimes(1);
    });

    test("requireSignIn error occurs", async () => {
        JWT.verify.mockImplementation(() => {
            throw new Error("JWT Error");
        });
        let consoleLogSpy = jest.spyOn(console, "log");
        await requireSignIn(req, res, next);
        expect(consoleLogSpy).toBeCalledWith(new Error("JWT Error"));
    });
});

describe("Test isAdmin Function", () => {
    let req, res, next;
    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            headers: {
                authorization: "Authorized"
            },
            user: {
                _id: 1
              },
            };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();
    });

    test("Successful exectution of next", async () => {
        userModel.findById = jest.fn().mockResolvedValue({role: 1});
        await isAdmin(req, res, next);
        expect(next).toBeCalledTimes(1);
    });

    test("User Role is not 1", async () => {
        userModel.findById = jest.fn().mockResolvedValue({role: 0});
        await isAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "UnAuthorized Access",
        });
    });

    test("Error during userModel Access", async () => {
        let error = new Error("UserModel Error");
        userModel.findById = jest.fn().mockRejectedValue(error);
        await isAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error,
            message: "Error in admin middleware",
        });
    })
});
