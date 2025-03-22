import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import userModel from "./userModel";
import dotenv from "dotenv";

// dotenv.config();

let mongoServer;

describe("User Model ", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
        await userModel.createIndexes();
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    const validUserData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: { street: '123 Street', city: 'Test City' },
        answer: 'Test answer'
        };

    test("creates and saves user successfully", async () => {
        const validUser = new userModel(validUserData);
        const savedUser = await validUser.save();
        
        // Verify saved user
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(validUserData.name);
        expect(savedUser.email).toBe(validUserData.email);
        expect(savedUser.phone).toBe(validUserData.phone);
        expect(savedUser.address).toEqual(validUserData.address);
        expect(savedUser.answer).toBe(validUserData.answer);
        expect(savedUser.role).toBe(0);  // Default role
        expect(savedUser.createdAt).toBeDefined();
        expect(savedUser.updatedAt).toBeDefined();
    }); 

    test("fails to save user without required fields", async () => {
        const invalidUser = new userModel({});
        let err;

        try {
            await invalidUser.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.name).toBeDefined();
        expect(err.errors.email).toBeDefined();
        expect(err.errors.password).toBeDefined();
        expect(err.errors.phone).toBeDefined();
        expect(err.errors.address).toBeDefined();
        expect(err.errors.answer).toBeDefined();
    });

    test("fails to save user with duplicate email", async () => {
        const firstUser = new userModel(validUserData);
        await firstUser.save();
    
        const duplicateUser = new userModel({
          ...validUserData,
          name: 'Another User'  
        });
    
        let err;
        try {
          await duplicateUser.save();
        } catch (error) {
          err = error;
        }
    
        expect(err).toBeDefined();
        expect(err.code).toBe(11000);  
    });

    test("trims name field", async () => {
        const userWithUntrimmedName = new userModel({
            ...validUserData,
            name: '  Test User  '
        });
        
        const savedUser = await userWithUntrimmedName.save();
        expect(savedUser.name).toBe('Test User');
    });
    
    test("sets default role to user and not admin", async () => {
        const userWithoutRole = new userModel(validUserData);
        const savedUser = await userWithoutRole.save();
        expect(savedUser.role).toBe(0);
    });
    
    test("allows custom role value", async () => {
        const adminUser = new userModel({
            ...validUserData,
            role: 1
        });
        
        const savedUser = await adminUser.save();
        expect(savedUser.role).toBe(1);
    });
    
    test("saves and retrieve address object correctly", async () => {
        const complexAddress = {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '12345',
            coordinates: {
                lat: 123.456,
                lng: 789.012
            }
        };

        const userWithComplexAddress = new userModel({
            ...validUserData,
            address: complexAddress
        });

        const savedUser = await userWithComplexAddress.save();
        expect(savedUser.address).toEqual(complexAddress);
    });
})