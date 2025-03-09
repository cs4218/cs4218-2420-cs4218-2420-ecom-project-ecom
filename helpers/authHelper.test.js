import { hashPassword, comparePassword } from "./authHelper.js";

describe("authHelper", () => {
  it("should hash a password", async () => {
    const password = "test123";
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
  });

  it("should successfully compare matching passwords", async () => {
    const password = "test123";
    const hashedPassword = await hashPassword(password);
    const result = await comparePassword(password, hashedPassword);
    expect(result).toBe(true);
  });

  it("should fail to compare different passwords", async () => {
    const password = "test123";
    const wrongPassword = "wrong123";
    const hashedPassword = await hashPassword(password);
    const result = await comparePassword(wrongPassword, hashedPassword);
    expect(result).toBe(false);
  });
});
