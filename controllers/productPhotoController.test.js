import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { productPhotoController } from "./productController";
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

describe("Get Single Product Photo Controller Test", () => {
  let mockFindById
  beforeEach(() => {
    // Set up the mock query chain that actually returns the mock products
    mockFindById = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockResolvedValue({
      photo: {
        data: Buffer.from("fakeImageData"),
        contentType: "image/jpeg"
      }
    });

    // Attach all methods to the find method
    mockFindById.select = mockSelect;

    productModel.findById = jest.fn().mockReturnValue(mockFindById);
  })

  test("should get photo if product photo exists", async () => {
    await productPhotoController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findById).toHaveBeenCalledWith("someProductId")

    const findByIdResult = productModel.findById();
    expect(findByIdResult.select).toHaveBeenCalledWith("photo")

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.set).toHaveBeenCalledWith("Content-type", "image/jpeg")
    expect(mockRes.send).toHaveBeenCalledWith(Buffer.from("fakeImageData"))
  })

  test("should handle case if product has no photo", async () => {
    jest.spyOn(productModel, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ photo: { data: null } }),
    });

    await productPhotoController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findById).toHaveBeenCalledWith("someProductId")

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Photo not found for this product",
    });
  })

  test("should handle database error", async () => {
    mockFindById.select = jest.fn().mockRejectedValue(dbError);
    await productPhotoController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findById).toHaveBeenCalledWith("someProductId")

    // Verify response
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting photo",
      error: dbError
    })
  })
})
