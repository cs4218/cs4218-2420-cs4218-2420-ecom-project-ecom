import JWT from 'jsonwebtoken';
import { requireSignIn, isAdmin } from './authMiddleware.js';
import userModel from "../models/userModel.js";

jest.mock('jsonwebtoken');
jest.mock('../models/userModel.js', () => ({
    findById: jest.fn()
}));


describe('requireSignIn', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            headers: { authorization: '12345' },
            user: { name: 'null' }
        };
        res = {};
        next = jest.fn();
    });


    it('should update req.user & call next() upon successful verification', async () => {
        JWT.verify.mockImplementationOnce(() => ({ name: 'John' }));
        
        await requireSignIn(req, res, next);

        expect(req.user).toEqual(({ name: 'John' }));
        expect(next).toHaveBeenCalledTimes(1);
    });
});


describe('isAdmin', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            user: { _id: '' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(), 
        };

        next = jest.fn();
    });


    it('should not return res.status for admin user & call next()', async () => {
        userModel.findById.mockImplementation(() => {
            // admin user has role 1
            return { role: 1 };
        });

        await isAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledTimes(0);
        expect(next).toHaveBeenCalledTimes(1);
    });


    it('should return 401 for non admin user', async () => {
        userModel.findById.mockImplementation(() => {
            // non-admin user has role != 1
            return { role: 0 };
        });
       
        await isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(({
            success: false,
            message: 'UnAuthorized Access'
        }));
        expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 401 for error in admin middleware', async () => {
        userModel.findById.mockImplementation(() => {
            throw new Error('Database error');
        });

        await isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(({
            success: false,
            error: new Error('Database error'),
            message: 'Error in admin middleware'
            
        }));
        expect(next).toHaveBeenCalledTimes(0);
    });
});