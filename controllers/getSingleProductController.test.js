import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getSingleProductController } from "./productController";
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

describe("Get Single Product Controller Test", () => {
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
      }
    ];

    // Set up the mock query chain that actually returns the mock products
    const mockFindOne = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockResolvedValue(mockProducts);

    // Attach all methods to the find method
    mockFindOne.populate = mockPopulate;
    mockFindOne.select = mockSelect;

    productModel.findOne = jest.fn().mockReturnValue(mockFindOne);

  })

  test("should get product if exists", async () => {
    await getSingleProductController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "updated-product"});
    
    const findResult = productModel.findOne();
    expect(findResult.select).toHaveBeenCalledWith("-photo");
    expect(findResult.populate).toHaveBeenCalledWith("category");

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Single product fetched",
      product: mockProducts
    });
  })

  test("should get product if exists (generic)", async () => {
    await getSingleProductController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "updated-product"});
    
    const findResult = productModel.findOne();
    expect(findResult.select).toHaveBeenCalledWith(expect.stringMatching(/^-?\w+$/));
    expect(findResult.populate).toHaveBeenCalledWith(expect.any(String));

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Single product fetched",
      product: mockProducts
    });
  })

  test("should handle database error", async () => {
    const errorFindOne = jest.fn().mockReturnThis();
    errorFindOne.select = jest.fn().mockReturnThis();
    errorFindOne.populate = jest.fn().mockRejectedValue(dbError);
    
    productModel.findOne = jest.fn().mockReturnValue(errorFindOne);

    await getSingleProductController(mockReq, mockRes);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting single product",
      error: dbError
    });
  })
})
