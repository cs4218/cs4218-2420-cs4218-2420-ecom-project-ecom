const bcrypt = require('bcrypt');
const authHelper = require('../helpers/authHelper');

describe('Integration Tests for authHelper with bcrypt ', () => {
    // Test case for successful password comparison
    it('should return true for matching passwords', async () => {
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await authHelper.comparePassword(password, hashedPassword);

        expect(result).toBe(true);
    });

    // Test case for unsuccessful password comparison
    it('should return false for non-matching passwords', async () => {
        const password = 'password123';
        const wrongPassword = 'wrongpassword';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await authHelper.comparePassword(wrongPassword, hashedPassword);

        expect(result).toBe(false);
    });
});