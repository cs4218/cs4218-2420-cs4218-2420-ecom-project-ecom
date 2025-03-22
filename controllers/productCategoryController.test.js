import { describe, jest } from "@jest/globals";
import { productCategoryController } from "./productController";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

jest.mock("../models/productModel");
jest.mock("../models/categoryModel");

describe("Product Category Controller", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });
  test("status 200 when category and products found", async () => {
    const mockCategory = "Mock Category";

    categoryModel.findOne = jest.fn().mockReturnValue(mockCategory);
    productModel.find = jest.fn().mockReturnThis();
    productModel.populate = jest.fn().mockResolvedValue([
      {
        name: "Mock Product 1",
        category: mockCategory,
      },
      {
        name: "Mock Product 2",
        category: mockCategory,
      },
    ]);
    req = { params: { slug: mockCategory } };
    await productCategoryController(req, res);
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: mockCategory });
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
    expect(productModel.populate).toHaveBeenCalledWith("category");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: mockCategory,
      products: [
        {
          name: "Mock Product 1",
          category: mockCategory,
        },
        {
          name: "Mock Product 2",
          category: mockCategory,
        },
      ],
    });
  });
  test("status 400 and productModel not called when category errors on find", async () => {
    const error = new Error("Database Error");
    categoryModel.findOne = jest.fn().mockRejectedValue(error);
    productModel.find = jest.fn().mockReturnThis();
    const mockCategory = "Mock category";
    req = { params: { slug: mockCategory } };
    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: mockCategory });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(productModel.find).not.toHaveBeenCalled();
    expect(productModel.populate).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: "Error While Getting products",
    });
  });
  test("status 400 when productModel errors", async () => {
    const error = new Error("Database Error");
    const mockCategory = "Mock category";
    categoryModel.findOne = jest.fn().mockReturnValue(mockCategory);
    productModel.find = jest.fn().mockReturnThis();
    productModel.populate = jest.fn().mockRejectedValue(error);

    req = { params: { slug: mockCategory } };
    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: mockCategory });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: "Error While Getting products",
    });
  });
});
