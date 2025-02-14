import categoryModel from "../models/categoryModel";
import { categoryControlller, singleCategoryController } from "./categoryController";

jest.mock('../models/categoryModel.js');

const internalError = new Error("Mock internal error");
jest.spyOn(console, 'log').mockImplementation(jest.fn()); // silence error log outputs in test

describe('singleCategoryController', () => {
  let res, req;
  const testSlug = 'test-slug';

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {
        slug: testSlug,
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };    
  });

  it('should return 500 for internal server error', async () => {
    categoryModel.findOne = jest.fn().mockRejectedValueOnce(internalError);

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toBeCalledWith({ slug: testSlug });
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      success: false,
      error: internalError,
      message: "Error While getting Single Category",
    });
  });

  it('should return 200 with a single category', async () => {
    const singleCategory = {
      _id: "1",
      name: "Test Category",
      slug: testSlug,
    }
    categoryModel.findOne = jest.fn().mockResolvedValueOnce(singleCategory);

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toBeCalledWith({ slug: testSlug });
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      message: "Get Single Category Successfully",
      category: singleCategory
    })
  })
});

describe('categoryController', () => {
  let res, req;

  beforeEach(() => {
    jest.clearAllMocks();
    
    categoryModel.find = jest.fn();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return 500 for internal server errors', async () => {
    categoryModel.find.mockRejectedValueOnce(internalError);
    
    await categoryControlller(req, res);

    expect(categoryModel.find).toBeCalledWith({});
    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Error while getting all categories",
      error: internalError
    }) 
  });

  it('should return 200 and send a list of categories', async () => {
    const expectedCategories = [
      {_id: "1", name: "Category 2", slug: "category2"},
      {_id: "2", name: "Category 1", slug: "category1"},
      {_id: "3", name: "Category 3", slug: "category3"},
    ]
    categoryModel.find.mockResolvedValueOnce(expectedCategories);

    await categoryControlller(req, res);

    expect(categoryModel.find).toBeCalledWith({});
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      message: "All Categories List",
      category: expectedCategories,
    })
  });

  it('should return 200 and empty list for no data', async () => {
    const expectedCategories = []
    categoryModel.find.mockResolvedValueOnce(expectedCategories);

    await categoryControlller(req, res);

    expect(categoryModel.find).toBeCalledWith({});
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      message: "All Categories List",
      category: expectedCategories,
    });
  });
})