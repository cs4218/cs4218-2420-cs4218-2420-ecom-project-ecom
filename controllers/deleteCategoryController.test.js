import { jest } from "@jest/globals";
import { deleteCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel.js";

jest.mock("../models/categoryModel.js");

describe("Test Delete Category Controller", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("sucessfully delete a category", async () => {
    req = { params: { id: 1 } };
    categoryModel.findByIdAndDelete = jest.fn().mockResolvedValueOnce(true);
    await deleteCategoryController(req, res);
    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Categry Deleted Successfully",
    });
  });
  test("error code 500 returned when error thrown", async () => {
    const error = new Error("Database Error");
    req = { params: { id: 1 } };
    categoryModel.findByIdAndDelete = jest.fn().mockRejectedValueOnce(error);

    await deleteCategoryController(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error while deleting category",
      error,
    });
  });
});
