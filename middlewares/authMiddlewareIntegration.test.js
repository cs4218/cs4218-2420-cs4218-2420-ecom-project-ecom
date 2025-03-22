import {isAdmin} from '../middlewares/authMiddleware';
import userModel from '../models/userModel';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('isAdmin integration with user model', () => {
    let userCollection = 'users';
    let memMongoDB;
    let serverProcess;
    const uid = new mongoose.Types.ObjectId().toHexString();
    let req;
    let res;
    let next;


    beforeEach(async () => {
        jest.clearAllMocks();

        req = {
            headers: { authorization: '12345' },
            user: { _id: uid }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();

        // Init in-memory MongoDB 
        memMongoDB = await MongoMemoryServer.create();
        const mongoUri = memMongoDB.getUri();
        process.env.MONGO_URL = mongoUri;
        await mongoose.connect(mongoUri);
        await mongoose.connection.createCollection(userCollection);
    });


    afterEach(async () => {
        // Close all connection
        await mongoose.connection.dropCollection(userCollection);
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await memMongoDB.stop();
    });

    it("should return 401 for non admin user", async () => {
        //Save nonAdminUser into db
        const nonAdminUser = new userModel({
            name: "John Doe",
            email: "test@example.com",
            password: "password123",
            phone: "1234567890",
            address: "123 Street",
            answer: "Football",
            role: 0,
            _id: uid
        })
        await nonAdminUser.save();

        //Call isAdmin middleware
        const result = await isAdmin(req, res, next);

        expect(result).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(({
            success: false,
            message: 'UnAuthorized Access'
        }))
        expect(next).toHaveBeenCalledTimes(0);
    });

});