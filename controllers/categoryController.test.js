import { jest } from "@jest/globals";
import { 
    createCategoryController, 
    updateCategoryController, 
    categoryControlller,
    singleCategoryController,
    deleteCategoryCOntroller } from "./categoryController";
import categoryModel from "../models/categoryModel";

jest.mock("../models/categoryModel.js");

describe("Create Category Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "Mouse"
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("category model is saved successfully", async () => {
    // specify mock functionality
    categoryModel.findOne = jest.fn().mockResolvedValue(null);
    categoryModel.prototype.save = jest.fn();

    await createCategoryController(req, res);
    expect(categoryModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "new category created",
  })
  });

  test("duplicate category model returns message", async () => {
    // specify mock functionality
    categoryModel.findOne = jest.fn().mockResolvedValue({
        name: "Mouse",
        slug: "mouse"
  });
    categoryModel.prototype.save = jest.fn();

    await createCategoryController(req, res);
    expect(categoryModel.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Category Already Exisits",
  })
    
  });

  test("missing name in category model should return error 401", async () => {
    // specify mock functionality
    categoryModel.findOne = jest.fn().mockResolvedValue(null);
    categoryModel.prototype.save = jest.fn();

    req = {
        body: {
          slug: "cat"
        },
      };

    await createCategoryController(req, res);
    expect(categoryModel.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      message: "Name is required"
  })
    
  });

  test("Error in category model should return error", async () => {
    // specify mock functionality
    categoryModel.findOne.mockImplementation(() => {
        throw new Error("Error");
    });
    categoryModel.prototype.save = jest.fn();

    await createCategoryController(req, res);
    expect(categoryModel.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: Error("Error"),
        message: "Error in Category",
  })
    
  });

  test("Update Category Successfully", async () => {

  categoryModel.findByIdAndUpdate = jest.fn((id, name, options) => ({
    name: name.name,
    slug: name.slug,
}));

  req = {
    body: {
      name: "cat"
    },
    params: {
        id: "1"
    }
  };

    await updateCategoryController(req, res);
    /*
    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        {
            name: "cat",
            slug: "cat",
        },
        { new: true }
    );
    */
    expect(res.status).toHaveBeenCalledWith(200);
    
    expect(res.send).toHaveBeenCalledWith({
        success: true,
      message: "Category Updated Successfully",
      category: expect.objectContaining({
        name: "cat",
        slug: "cat",
    }),
  })
    
  });

  test("Error while Update Category", async () => {

  categoryModel.findByIdAndUpdate.mockImplementation(() => {
    throw new Error("Error");
});
  
    req = {
      body: {
        name: "cat"
      },
      params: {
          id: "1"
      }
    };
  
      await updateCategoryController(req, res);
  
      expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
          "1",
          {
              name: "cat",
              slug: "cat",
          },
          { new: true }
      );
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: Error("Error"),
        message: "Error while updating category",
  })
      
    });

    test("Get Category Successfully", async () => {

        categoryModel.find = jest.fn().mockResolvedValue(null);
    
        await categoryControlller(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "All Categories List",
            category: null,
      })
});

test("Error while get Category", async () => {

    categoryModel.find = jest.fn();
    categoryModel.find.mockImplementation(() => {
        throw new Error("Error");
    });

    await categoryControlller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: Error("Error"),
        message: "Error while getting all categories",
  })
});

test("get single category model successfully", async () => {
    // specify mock functionality
    categoryModel.findOne = jest.fn().mockResolvedValue(null);
    
    req = {
        params: {
            slug: "cat"
        }
      };

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get Single Category Successfully",
      category: null
  })
  });

  test("error while get single category model", async () => {
    // specify mock functionality
    categoryModel.findOne.mockImplementation(() => {
        throw new Error("Error");
    });

    req = {
        params: {
            slug: "cat"
        }
      };

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: Error("Error"),
        message: "Error While getting Single Category",
  })
  });

  test("Delete category successfully", async () => {
    // specify mock functionality
    categoryModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

    req = {
        params: {
            id: "1"
        }
      };

    await deleteCategoryCOntroller(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Deleted Successfully",
  })
  });

  test("Error when Delete category", async () => {

    categoryModel.findByIdAndDelete.mockImplementation(() => {
        throw new Error("Error");
    });

    req = {
        params: {
            id: "1"
        }
      };

    await deleteCategoryCOntroller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "error while deleting category",
        error: Error("Error"),
  })
  });

})
