import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper"; 

jest.mock("bcrypt"); // Mock bcrypt for unit tests

describe("Auth Helper Functions", () => {
    
    describe("hashPassword", () => {
        it("should hash a password successfully", async () => {
            bcrypt.hash.mockResolvedValue("hashedPassword123");

            const result = await hashPassword("mypassword");
            expect(result).toBe("hashedPassword123");
            expect(bcrypt.hash).toHaveBeenCalledWith("mypassword", 10);
        });

        it("should return null if hashing fails", async () => {
            bcrypt.hash.mockRejectedValue(new Error("Hashing error"));

            const result = await hashPassword("mypassword");
            expect(result).toBeNull();
            expect(bcrypt.hash).toHaveBeenCalled();
        });
    });

    describe("comparePassword", () => {
        it("should return true for a correct password", async () => {
            bcrypt.compare.mockResolvedValue(true);

            const result = await comparePassword("mypassword", "hashedPassword123");
            expect(result).toBe(true);
            expect(bcrypt.compare).toHaveBeenCalledWith("mypassword", "hashedPassword123");
        });

        it("should return false for an incorrect password", async () => {
            bcrypt.compare.mockResolvedValue(false);

            const result = await comparePassword("wrongpassword", "hashedPassword123");
            expect(result).toBe(false);
            expect(bcrypt.compare).toHaveBeenCalledWith("wrongpassword", "hashedPassword123");
        });

        it("should return false if bcrypt.compare throws an error", async () => {
            bcrypt.compare.mockRejectedValue(new Error("Comparison error"));

            const result = await comparePassword("mypassword", "hashedPassword123");
            expect(result).toBe(false);
            expect(bcrypt.compare).toHaveBeenCalled();
        });
    });
});