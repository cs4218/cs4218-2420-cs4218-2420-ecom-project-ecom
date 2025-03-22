import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { createProductController } from "./productController";
import productModel from "../models/productModel";
import fs from "fs"

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

describe("Create Product Controller Test", () => {
  beforeEach(() => {
    productModel.mockImplementation(() => mockProduct)
    fs.readFileSync.mockReturnValue(Buffer.from("fakeImageData"))
  })

  test("should create product with image successfully", async () => {
    const mockImageBuffer = Buffer.from("fakeImageData");
    fs.readFileSync.mockReturnValue(mockImageBuffer)

    await createProductController(mockReq, mockRes)

    // Verify product model was initialize with correct data
    expect(productModel).toHaveBeenCalledWith({
      ...mockReq.fields,
      slug: expect.any(String)
    })

    // Verify image was read
    expect(fs.readFileSync).toHaveBeenCalledWith(mockReq.files.photo.path)

    // Verify image data was set correctly
    expect(mockProduct.photo.data).toEqual(mockImageBuffer);
    expect(mockProduct.photo.contentType).toBe("image/jpeg");

    // Verify product was saved
    expect(mockProduct.save).toHaveBeenCalled();

    // Verify Response
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product created successfully",
      products: expect.any(Object),
    });
  })

  test("should create product without image if no photo provided", async () => {
    mockReq.files = {};

    await createProductController(mockReq, mockRes);

    // Verify no image operations occurred
    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(mockProduct.photo.data).toBeNull();
    expect(mockProduct.photo.contentType).toBeNull();

    // Verify product was saved
    expect(mockProduct.save).toHaveBeenCalled();

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product created successfully",
      products: mockProduct,
    });
  });

  test("should return error if photo size exceeds 1000000", async () => {
    mockReq.files.photo.size = 1000001;

    await createProductController(mockReq, mockRes);

    // Verify error response
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Photo is required and should be less then 1mb"
    });

    // Verify no product was created
    expect(productModel).not.toHaveBeenCalled();
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  test("should return error if name is missing", async () => {
    mockReq.fields.name = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Name is required"
    });
  });

  test("should return error if description is missing", async () => {
    mockReq.fields.description = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Description is required"
    });
  });

  test("should return error if price is missing", async () => {
    mockReq.fields.price = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Price is required"
    });
  });

  test("should return error if price is negative", async () => {
    mockReq.fields.price = -1;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Price must be positive"
    });
  });

  test("should return error if category is missing", async () => {
    mockReq.fields.category = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Category is required"
    });
  });

  test("should return error if quantity is missing", async () => {
    mockReq.fields.quantity = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Quantity is required"
    });
  });

  test("should return error if quantity is negative", async () => {
    mockReq.fields.quantity = -1;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Quantity must be positive"
    });
  });

  test("should handle file read error", async () => {
    jest.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("Error reading image data");
    });

    await createProductController(mockReq, mockRes);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in creating product",
    });
  })

  test("should handle save product error", async () => {
    mockProduct.save.mockRejectedValue(dbError);

    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: dbError,
      message: "Error in creating product",
    });
  });
})
