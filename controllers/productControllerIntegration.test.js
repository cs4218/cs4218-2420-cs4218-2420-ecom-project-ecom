import mongoose from "mongoose";
import jest from 'jest-mock';
import { MongoMemoryServer } from "mongodb-memory-server";
import {
    createProductController,
    updateProductController,
    deleteProductController,
    getProductController,
    brainTreePaymentController,
    braintreeTokenController
} from "./productController"; 
import productModel from "../models/productModel";
import categoryModel from "../models/categoryModel";
import slugify from "slugify";
import fs from "fs";

describe('Test integration of product controllers and dependencies', () => {
    let mongoServer, req, res;
    const testCategory = new mongoose.Types.ObjectId();

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

    });

    beforeEach(async () => {
        await productModel.deleteMany({});
        await categoryModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('should create a product', async () => {
        req = {
            fields: {
                name: 'Test Create Product',
                description: 'A description',
                price: 100,
                category: testCategory,
                quantity: 10,
                shipping: true,
            },
            files: {
                photo: {
                    size: 500000,
                    path: 'client/public/images/Virtual.png',
                    type: 'image/jpeg',
                },
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await createProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Product Created Successfully',
            products: expect.any(Object),
        }));
        const product = await productModel.findOne({ name: 'Test Create Product' });
        expect(product).not.toBeNull();
        expect(product.name).toBe('Test Create Product');

    }, 30000);

    test('should update a product', async () => {
        const existingProduct = await new productModel({
            name: 'Test Create Product',
            description: 'A description',
            price: 100,
            category: testCategory,
            quantity: 10,
            shipping: true,
            slug: slugify('Test Create Product'),
            photo: {
                data: fs.readFileSync('client/public/images/Virtual.png'),
                contentType:'image/jpeg'
            }
        }).save();
    
            req = {
                params: {
                    pid: existingProduct._id.toString(),
                },
                fields: {
                    name: 'Test Update Product',
                    description: 'Updated description',
                    price: 150,
                    category: testCategory,
                    quantity: 20,
                    shipping: false,
                },
                files: {
                    photo: {
                        path: 'client/public/images/Virtual.png',
                        type: 'image/jpeg',
                        size: 50000,
                    },
                },
            };
    
    
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await updateProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Product Updated Successfully',
            products: expect.any(Object),
        }));
        const product = await productModel.findOne({ name: 'Test Update Product' });
        expect(product).not.toBeNull();
        expect(product.name).toBe('Test Update Product');

    }, 30000);

    test('should delete a product', async () => {
        const existingProduct = await new productModel({
            name: 'Delete Product',
            description: 'A description',
            price: 100,
            category: testCategory,
            quantity: 10,
            shipping: true,
            slug: slugify('Test Create Product'),
            photo: {
                data: fs.readFileSync('client/public/images/Virtual.png'),
                contentType:'image/jpeg'
            }
        }).save();
    
            req = {
                params: {
                    pid: existingProduct._id.toString(),
                }
            };
    
    
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await deleteProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Product Deleted successfully',
        }));
        const product = await productModel.findOne({ name: 'Delete Product' });
        expect(product).toBeNull();

    }, 30000);

    test('should get all products', async () => {
        const existingProduct = await new productModel({
            name: 'Product 1',
            description: 'A description',
            price: 100,
            category: testCategory,
            quantity: 10,
            shipping: true,
            slug: slugify('Test Create Product'),
            photo: {
                data: fs.readFileSync('client/public/images/Virtual.png'),
                contentType:'image/jpeg'
            }
        }).save();
        const existingProduct2 = await new productModel({
            name: 'Product 2',
            description: 'A description',
            price: 100,
            category: testCategory,
            quantity: 10,
            shipping: true,
            slug: slugify('Test Create Product'),
            photo: {
                data: fs.readFileSync('client/public/images/Virtual.png'),
                contentType:'image/jpeg'
            }
        }).save();
        req = {};
    
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await getProductController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "ALlProducts ",
            counTotal: 2,
            products: expect.any(Array)
        });
        const product1 = await productModel.findOne({ name: 'Product 1' });
        const product2 = await productModel.findOne({ name: 'Product 2' });
        expect(product1).not.toBeNull();
        expect(product2).not.toBeNull();
    }, 30000);

   
});


