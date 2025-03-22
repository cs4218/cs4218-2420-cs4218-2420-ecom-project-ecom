import { comparePassword, hashPassword } from "./authHelper";
import bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("Test Auth Helper Functions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("Test comparePassword No Errors", async () => {
        bcrypt.hash = jest.fn().mockResolvedValue("Hashed");
        const password = await hashPassword("Password");
        expect(password).toBe("Hashed");
    })

    test("Test comparePassword Error Occurred", async () => {
        bcrypt.hash = jest.fn().mockRejectedValue(new Error("Hashing Error"));
        const consoleLogSpy = jest.spyOn(console, "log");
        await hashPassword("Password");
        expect(consoleLogSpy).toBeCalledWith(Error("Hashing Error"));
        consoleLogSpy.mockRestore();
    });
})

