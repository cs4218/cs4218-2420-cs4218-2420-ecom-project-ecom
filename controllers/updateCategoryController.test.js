import { jest } from "@jest/globals";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import { updateCategoryController } from "./categoryController.js";

jest.mock("../models/categoryModel.js");
jest.mock("slugify", () => jest.fn(() => "mock-slug"));

describe("Test Create Category Controller", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("category updates sucessfully", async () => {
    categoryModel.findByIdAndUpdate = jest
      .fn()
      .mockResolvedValue("Mock Old Category");
    req = { body: { name: "Mock New Category" }, params: { id: 1 } };
    await updateCategoryController(req, res);
    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      1,
      { name: "Mock New Category", slug: "mock-slug" },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Updated Successfully",
      category: "Mock Old Category",
    });
  });
  test("status 500 on error", async () => {
    const error = new Error("Database Error");
    categoryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(error);
    req = { body: { name: "Mock New Category" }, params: { id: 1 } };
    await updateCategoryController(req, res);
    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      1,
      { name: "Mock New Category", slug: "mock-slug" },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: "Error while updating category",
    });
  });
});
