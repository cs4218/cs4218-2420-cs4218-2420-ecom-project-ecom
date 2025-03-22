import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { deleteProductController } from "./productController";
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

describe("Delete Product Controller Test", () => {
  let mockFindByIdAndDelete
  let mockSelect

  beforeEach(() => {
    jest.clearAllMocks()

    mockFindByIdAndDelete = jest.fn().mockReturnThis()
    mockSelect = jest.fn().mockResolvedValue({})
    mockFindByIdAndDelete.select = mockSelect

    productModel.findByIdAndDelete = jest.fn().mockReturnValue(mockFindByIdAndDelete)
  })

  test("should delete product if exists or not", async () => {
    await deleteProductController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("someProductId")

    const findByIdAndDeleteResult = productModel.findByIdAndDelete()
    expect(findByIdAndDeleteResult.select).toHaveBeenCalledWith("-photo")

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product deleted successfully",
    })
  })

  test("should handle database error", async () => {
    mockFindByIdAndDelete.select = jest.fn().mockRejectedValue(dbError);

    await deleteProductController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("someProductId")

    const findByIdAndDeleteResult = productModel.findByIdAndDelete()
    expect(findByIdAndDeleteResult.select).toHaveBeenCalledWith("-photo")

    // Verify response
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while deleting product",
    })
  })
})
