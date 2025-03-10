import bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from './authHelper';

jest.mock('bcrypt');

describe('Hash Password', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return hashed password from bcrypt', async () => {
        const numberOfSaltRounds = 10;
        const password = 'password123';
        const hashedPassword = 'hashedpassword';

        bcrypt.hash.mockResolvedValueOnce(hashedPassword);

        const result = await hashPassword(password, numberOfSaltRounds);

        expect(result).toBe(hashedPassword);
    });
});


describe('Compare Password', () => {
    const password = "password123";
    const hashedPassword = 'hashedpassword';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return true if hashed password tallies with password', async () => {
        bcrypt.compare.mockResolvedValueOnce(true);

        const result = await comparePassword(password, hashedPassword);

        expect(result).toBe(true);
    });
});