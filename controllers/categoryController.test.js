import { jest } from "@jest/globals";
import { categoryController } from "./categoryController";
import categoryModel from "../models/categoryModel.js";

jest.mock("../models/categoryModel.js");

describe("Test Category Controller", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("sucessfully retrieve all categories", async () => {
    categoryModel.find = jest.fn().mockResolvedValueOnce([]);
    await categoryController(req, res);
    expect(categoryModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: [],
    });
  });
  test("category not created when category already exists", async () => {
    const error = new Error("Database Error");
    categoryModel.find = jest.fn().mockRejectedValueOnce(error);

    await categoryController(req, res);

    expect(categoryModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: "Error while getting all categories",
    });
  });
});
