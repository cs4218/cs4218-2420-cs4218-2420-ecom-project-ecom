import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getProductController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";

jest.mock("../models/productModel.js")
jest.mock("../models/categoryModel.js")
jest.mock("fs")
jest.mock('braintree', () => ({
  BraintreeGateway: jest.fn().mockImplementation(() => ({
    transaction: {
      sale: jest.fn().mockResolvedValue({ success: true, transaction: { id: 'fake-id' } }),
    },
  })),
  Environment: {
    Sandbox: 'Sandbox',
  },
}));

let mockCategory, mockProduct, mockReq, mockRes, dbError;

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})

  mockCategory = {_id: "someCategoryId", name: "Category", slug: "test-category"}
  mockProduct = {
    photo: { data: null, contentType: null },
    slug: 'updated-product',
    save: jest.fn().mockResolvedValue(true),
  };
  mockReq = {
    params: { pid: "someProductId", slug: "updated-product" },
    fields: {
      name: "Updated product",
      description: "Updated description",
      price: 100,
      category: mockCategory._id,
      quantity: 10,
    },
    files: {
      photo: {
        size: 500000,
        path: '/temp/test-image.jpg',
        type: 'image/jpeg'
      }
    }
  }
  mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    set: jest.fn()
  }

  dbError = new Error("Database error")
})

describe("Get Product Controller Test", () => {
  let mockProducts;

  beforeEach(() => {
    jest.clearAllMocks()

    mockProducts = [
      {
        name: "Product 1",
        slug: "product-1",
        description: "Description for product 1",
        price: 100,
        category: {
          _id: new mongoose.Types.ObjectId(),
          name: "Category 1"
        },
        quantity: 10,
        photo: {
          data: Buffer.from("mock-image-1"),
          contentType: "image/jpeg"
        },
        shipping: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      },
      {
        name: "Product 2",
        slug: "product-2",
        description: "Description for product 2",
        price: 200,
        category: {
          _id: new mongoose.Types.ObjectId(),
          name: "Category 2"
        },
        quantity: 5,
        photo: {
          data: Buffer.from("mock-image-2"),
          contentType: "image/jpeg"
        },
        shipping: false,
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02")
      }
    ];

    // Set up the mock query chain that actually returns the mock products
    const mockFind = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockSort = jest.fn().mockResolvedValue(mockProducts);

    // Attach all methods to the find method
    mockFind.populate = mockPopulate;
    mockFind.select = mockSelect;
    mockFind.limit = mockLimit;
    mockFind.sort = mockSort;

    productModel.find = jest.fn().mockReturnValue(mockFind);

  })
  
  test("should get all products successfully (brittle)", async () => {
    await getProductController(mockReq, mockRes);

    // Verify query chain methods were called
    expect(productModel.find).toHaveBeenCalledWith({});
    
    const findResult = productModel.find();
    expect(findResult.populate).toHaveBeenCalledWith("category");
    expect(findResult.select).toHaveBeenCalledWith("-photo");
    expect(findResult.limit).toHaveBeenCalledWith(12);
    expect(findResult.sort).toHaveBeenCalledWith({ createdAt: -1 });

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      countTotal: mockProducts.length,
      message: "All products",
      products: mockProducts
    });
  })

  test("should get all products successfully (generic)", async () => {
    await getProductController(mockReq, mockRes);

    // Verify query chain methods were called
    expect(productModel.find).toHaveBeenCalledWith({});
    
    const findResult = productModel.find();
    expect(findResult.populate).toHaveBeenCalledWith(expect.any(String));
    expect(findResult.select).toHaveBeenCalledWith(expect.stringMatching(/^-?\w+$/));
    expect(findResult.limit).toHaveBeenCalledWith(expect.any(Number))

    const limitArg = findResult.limit.mock.calls[0][0];
    expect(limitArg).toBeGreaterThanOrEqual(0);

    expect(findResult.sort).toHaveBeenCalledWith({ createdAt: -1 });

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      countTotal: mockProducts.length,
      message: "All products",
      products: mockProducts
    });
  })

  test("should handle empty product list", async () => {
    // Mock empty results
    const emptyFind = jest.fn().mockReturnThis();
    emptyFind.populate = jest.fn().mockReturnThis();
    emptyFind.select = jest.fn().mockReturnThis();
    emptyFind.limit = jest.fn().mockReturnThis();
    emptyFind.sort = jest.fn().mockResolvedValue([]);
    
    productModel.find = jest.fn().mockReturnValue(emptyFind);

    await getProductController(mockReq, mockRes);

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      countTotal: 0,
      message: "All products",
      products: []
    });
  })

  test("should handle database error", async () => {
    const errorFind = jest.fn().mockReturnThis();
    errorFind.populate = jest.fn().mockReturnThis();
    errorFind.select = jest.fn().mockReturnThis();
    errorFind.limit = jest.fn().mockReturnThis();
    errorFind.sort = jest.fn().mockRejectedValue(dbError);
    
    productModel.find = jest.fn().mockReturnValue(errorFind);

    await getProductController(mockReq, mockRes);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in getting products",
      error: expect.any(Error),
    });
  })
})
