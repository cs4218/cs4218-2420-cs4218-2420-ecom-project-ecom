import { relatedProductController } from "./productController";
import productModel from "../models/productModel";

jest.mock("../models/productModel");

describe('Related Product Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("return related products", async () => {
        const mockProducts = [
            { id: '1', name: 'Product 1', category: 'category1' },
            { id: '2', name: 'Product 2', category: 'category1' },
            { id: '3', name: 'Product 3', category: 'category1' }
        ];

        const req = {
            params : {
                pid: 'product123',
                cid: 'category1'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }

        productModel.find.mockReturnValue(
            {
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockProducts),
            }
        );

        await relatedProductController(req, res);
        expect(productModel.find).toHaveBeenCalledWith({
            category: 'category1',
            _id: { $ne: 'product123' }
        });
        expect(productModel.find().select).toHaveBeenCalledWith('-photo');
        expect(productModel.find().limit).toHaveBeenCalledWith(3);
        expect(productModel.find().populate).toHaveBeenCalledWith('category');

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        })
    });

    test("handle errors appropriately", async () => {
        const req = {
            params: {
                pid: 'product123',
                cid: 'category1'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }

        const mockError = new Error('Database error');
        productModel.find.mockReturnValue(
            {
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockRejectedValue(mockError),
            }
        );

        jest.spyOn(console, "log").mockImplementation(() => {}); 

        await relatedProductController(req, res);

        expect(console.log).toHaveBeenCalledWith(expect.any(Error));
        expect(console.log).toHaveBeenCalledWith(expect.objectContaining({ message : "Database error"}));
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "error while geting related product",
            error: mockError
        });
    });

});