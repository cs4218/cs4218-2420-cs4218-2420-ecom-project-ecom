import { jest } from "@jest/globals";
import { createCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

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

  test("category not created when name is missing", async () => {
    categoryModel.prototype.save = jest.fn();
    categoryModel.findOne = jest.fn();
    req = { body: {} };
    await createCategoryController(req, res);
    expect(categoryModel.prototype.save).not.toHaveBeenCalled();
    expect(categoryModel.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
  });
  test("category not created when category already exists", async () => {
    req = { body: { name: "Test Category" } };
    categoryModel.findOne = jest
      .fn()
      .mockResolvedValueOnce({ name: "Test Category" });

    await createCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({
      name: "Test Category",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Already Exisits",
    });
  });
  test("category created when category doesnt exist yet", async () => {
    const newCatName = "New Category";
    req = { body: { name: newCatName } };

    categoryModel.findOne.mockResolvedValueOnce(null);

    const mockSave = jest.fn().mockResolvedValue({
      name: newCatName,
      slug: "mock-slug",
    });

    categoryModel.mockImplementation(() => ({ save: mockSave }));
    await createCategoryController(req, res);
    expect(categoryModel.findOne).toHaveBeenCalledWith({
      name: newCatName,
    });
    expect(slugify).toHaveBeenCalledWith(newCatName);
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "new category created",
      category: {
        name: newCatName,
        slug: "mock-slug",
      },
    });
  });
  test("should return 500 on error thrown", async () => {
    req = { body: { name: "Category Name" } };
    const error = new Error("Database error");
    categoryModel.findOne.mockRejectedValue(error);

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: "Errro in Category",
    });
  });
});
