import slugify from "slugify";
import categoryModel from "../models/categoryModel";
import { categoryControlller, createCategoryController, deleteCategoryCOntroller, singleCategoryController, updateCategoryController } from "./categoryController";

const internalError = new Error("Mock internal error");

jest.mock('../models/categoryModel');
jest.spyOn(console, 'log').mockImplementation(jest.fn()); // silence error log outputs in test
jest.mock("slugify", () => jest.fn((name) => name.toLowerCase().replace(/ /g, "-")));

describe('createCategoryController', () => {
  let res, req;
  const mockDoc = { _id: "1", name: "Electronics", slug: "electronics" };

  beforeEach(() => {
    jest.clearAllMocks();

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };    
  });

  it("should return 201 when category is created", async () => {
    req.body = { name: "Electronics" };
    categoryModel.findOne.mockResolvedValue(null);
    categoryModel.create.mockResolvedValue(mockDoc);

    await createCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: "Electronics" });
    expect(slugify).toHaveBeenCalledWith("Electronics");
    expect(categoryModel.create).toHaveBeenCalledWith({ name: "Electronics", slug: "electronics" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "new category created",
      category: mockDoc,
    });
  });

  it("should return 200 when category already exists", async () => {
    req.body = { name: "Electronics" };
    categoryModel.findOne.mockResolvedValue(mockDoc);

    await createCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ name: "Electronics" });
    expect(categoryModel.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Already Exisits",
    });
  });

  it("should return 401 when name is empty", async () => {
    req.body = { name: "" };

    await createCategoryController(req, res);

    expect(categoryModel.findOne).not.toHaveBeenCalled();
    expect(categoryModel.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
  });

  it("should return 500 when an internal error occurs", async () => {
    req.body = { name: "Electronics" };
    categoryModel.findOne.mockRejectedValue(internalError);

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Errro in Category",
      error: internalError,
    });
  });
});

describe('updateCategoryController', () => {
  let res, req;
  const mockId = "66db427fdb0119d9234b27ee" 
  const newExpectedCategory = { _id: mockId, name: "New Category", slug: "new-category" };

  beforeEach(() => {
    jest.clearAllMocks();
    
    categoryModel.find = jest.fn();
    req = {
      body: {
        name: newExpectedCategory.name
      },
      params: {
        id: mockId
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return 200 when category is updated', async () => {
    categoryModel.findByIdAndUpdate.mockResolvedValue(newExpectedCategory);

    await updateCategoryController(req, res);
  
    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockId,
      { name: newExpectedCategory.name, slug: newExpectedCategory.slug },
      { new: true }
    );
    expect(slugify).toHaveBeenCalledWith(newExpectedCategory.name);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      message: "Category Updated Successfully",
      category: newExpectedCategory
    });
  });

  it('should return 400 when updated to empty string', async () => {
    req.body = { name: "" };

    await updateCategoryController(req, res);

    expect(categoryModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({ message: "Name is required" });
  });

  it('should return 500 for internal server error', async () => {
    categoryModel.findByIdAndUpdate.mockRejectedValue(internalError);

    await updateCategoryController(req, res);

    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      success: false,
      error: internalError,
      message: "Error while updating category",
    }); 
  })
})

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
});

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

describe('deleteCategoryController', () => {
  let res, req;
  const mockId = "66db427fdb0119d9234b27ee";
  const mockDeletedDoc = {
    _id: mockId,
    name: "Deleted Category",
    slug: "deleted-category",
  }

  beforeEach(() => {
    jest.clearAllMocks();

    req = { params: { id: mockId } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };    
  });

  it('should return 200 when category is deleted', async () => {
    categoryModel.findByIdAndDelete.mockResolvedValue(mockDeletedDoc);

    await deleteCategoryCOntroller(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Categry Deleted Successfully",
    }); 
  });

  it('should return 400 when category does not exist', async () => {
    categoryModel.findByIdAndDelete.mockResolvedValue(null);

    await deleteCategoryCOntroller(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Categry Does Not Exist",
    });  
  });

  it('should return 500 for internal server error', async () => {
    categoryModel.findByIdAndDelete.mockRejectedValue(internalError);

    await deleteCategoryCOntroller(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error while deleting category",
      error: internalError
    }); 
  })
})