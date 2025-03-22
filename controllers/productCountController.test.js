import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { productCountController } from "./productController";
import productModel from "../models/productModel";

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

describe("Product Count Controller Test", () => {
    test("should get correct count", async () => {
      mockFind = jest.fn().mockReturnThis()
      mockFind.estimatedDocumentCount = jest.fn().mockResolvedValue(12)
      productModel.find = jest.fn().mockReturnValue(mockFind)
  
      await productCountController(mockReq, mockRes)
  
      // Verify query chain methods were called
      expect(productModel.find).toHaveBeenCalledWith({})
      mockFindResult = productModel.find()
      expect(mockFindResult.estimatedDocumentCount).toHaveBeenCalled()
  
      // Verify response
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        total: 12
      })
    })
  
    test("should handle database error", async () => {
      mockFind = jest.fn().mockReturnThis()
      mockFind.estimatedDocumentCount = jest.fn().mockRejectedValue(dbError)
      productModel.find = jest.fn().mockReturnValue(mockFind)
      await productCountController(mockReq, mockRes)
      
      // Verify query chain methods were called
      expect(productModel.find).toHaveBeenCalledWith({})
      mockFindResult = productModel.find()
      expect(mockFindResult.estimatedDocumentCount).toHaveBeenCalled()
  
      // Verify response
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.send).toHaveBeenCalledWith({
        message: "Error in getting product count",
        error: dbError,
        success: false,
      })
    })
  })
