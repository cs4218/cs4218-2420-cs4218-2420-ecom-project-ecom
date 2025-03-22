import { jest } from "@jest/globals";
import { singleCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel.js";

jest.mock("../models/categoryModel.js");

describe("Test Single Category Controller", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test.failing("sucessfully retrieve single categories", async () => {
    req = { params: { slug: "Mock Slug" } };
    categoryModel.findOne = jest
      .fn()
      .mockResolvedValueOnce("Mock retrieved category");
    await singleCategoryController(req, res);
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "Mock Slug" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get single category successfully",
      category: "Mock retrieved category",
    });
  });
  test.failing("error code 500 returned when error thrown", async () => {
    const error = new Error("Database Error");
    req = { params: { slug: "Mock Slug" } };
    categoryModel.findOne = jest.fn().mockRejectedValueOnce(error);

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "Mock Slug" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: "Error while getting single category",
    });
  });
});
