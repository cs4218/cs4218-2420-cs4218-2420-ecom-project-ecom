import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import productModel from '../models/productModel.js';
import {
  getSingleProductController,
  productCategoryController,
  productPhotoController,
  realtedProductController
} from './productController';

jest.mock('../models/categoryModel.js');
jest.mock('../models/productModel.js');

const internalError = new Error("Mock internal error");
jest.spyOn(console, 'log').mockImplementation(jest.fn()); // silence error log outputs in test

/**
 * decision tables
 * 2 params -- pid, cid
 * 2 actions -- 200, 400 (not ObjectId)
 *    (missing is handled by express router to return 404)
 * Total: 4 test cases + 1 (500)
 */
describe('realtedProductController', () => {
  let res, req;
  const mockRelatedProds =[{_id: "p2"}, {_id: "p3"}, {_id: "p4"}] ;
  const internalError = new Error("Internal Error");

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  const testCases = [
    [
      "returns 200 for valid PID and valid CID",
      {
        testReq: { pid: "66db427fdb0119d9234b27f2", cid: "96db427fdb0119d9234b27f2" },
        setupMock: () => {
          productModel.find.mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(mockRelatedProds),
          }));
        },
        expectedStatus: 200,
        expectedReturn: { success: true, products: mockRelatedProds }
      }
    ],
    [
      "returns 400 for valid PID and invalid CID",
      {
        testReq: { pid: "66db427fdb0119d9234b27f2", cid: "notObjectId" },
        setupMock: () => {
          productModel.find.mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockRejectedValueOnce(new mongoose.Error.CastError()),
          }));
        },
        expectedStatus: 400,
        expectedReturn: {
          success: false,
          message: "Invalid product id or category id format"
        }
      }
    ],
    [
      "returns 400 for invalid PID and valid CID",
      {
        testReq: { pid: "notObjectId", cid: "66db427fdb0119d9234b27f2" },
        setupMock: () => {
          productModel.find.mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockRejectedValueOnce(new mongoose.Error.CastError()),
          }));
        },
        expectedStatus: 400,
        expectedReturn: {
          success: false,
          message: "Invalid product id or category id format"
        }
      }
    ],
    [
      "returns 400 for invalid PID and invalid CID",
      {
        testReq: { pid: "notObjectId", cid: "notObjectId" },
        setupMock: () => {
          productModel.find.mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockRejectedValueOnce(new mongoose.Error.CastError()),
          }));
        },
        expectedStatus: 400,
        expectedReturn: {
          success: false,
          message: "Invalid product id or category id format"
        }
      }
    ],
    [
      "returns 500 for internal server error",
      {
        testReq: { pid: "66db427fdb0119d9234b27f2", cid: "96db427fdb0119d9234b27f2" },
        setupMock: () => {
          productModel.find.mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockRejectedValueOnce(internalError),
          }));
        },
        expectedStatus: 500,
        expectedReturn: { success: false, message: "error while geting related product", error: internalError }
      }        
    ]
  ];

  it.each(testCases)(
    "%s",
    async (testcase, { testReq, setupMock, expectedStatus, expectedReturn }) => {
      req.params = testReq;
      setupMock();

      await realtedProductController(req, res);
  
      expect(res.status).toBeCalledWith(expectedStatus);
      expect(res.send).toBeCalledWith(expectedReturn);
    }
  )
});

describe('productCategoryController', () => {
  let res, req;
  const testSlug = 'test-slug';

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {
        slug: testSlug
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return 500 for internal server error', async () => {
    categoryModel.findOne = jest.fn().mockRejectedValueOnce(internalError);

    await productCategoryController(req, res);

    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Error While Getting products",
      error: internalError
    }) 
  })

  it('should return 200 and send category and list of products', async () => {
    const mockCategory = {_id: "1", name: "Test Category", slug: "test-slug"};
    const mockProducts = [
      {_id: "1", name: "Test Product", category: mockCategory},
    ]
    categoryModel.findOne = jest.fn().mockResolvedValueOnce(mockCategory);
    productModel.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnValue(mockProducts)
    }))

    await productCategoryController(req, res);

    expect(categoryModel.findOne).toBeCalledWith({ slug: testSlug });
    expect(productModel.find).toBeCalledWith({ category: mockCategory });
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true,
      category: mockCategory,
      products: mockProducts
    });
  });

  it('should return 404 when category does not exist', async () => {
    categoryModel.findOne = jest.fn().mockResolvedValue(null);

    await productCategoryController(req, res);

    expect(categoryModel.findOne).toBeCalledWith({ slug: testSlug });
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Category does not exist",
    });
  });
});

describe('getSingleProductController', () => {
  let res, req;
  const testSlug = 'test-product';

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {
        slug: testSlug
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return 200 with a single product', async () => {
    const mockProduct = {
      name: "Test Product",
      slug: testSlug,
    };
    productModel.findOne = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnValue(mockProduct)
    }));

    await getSingleProductController(req, res);

    expect(productModel.findOne).toBeCalledWith({ slug: testSlug });
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
      success: true, 
      message: "Single Product Fetched",
      product: mockProduct,
    })
  });

  it('should return 500 for internal server error', async () => {
    productModel.findOne = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockRejectedValueOnce(internalError)
    }));

    await getSingleProductController(req, res);

    expect(res.status).toBeCalledWith(500);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Eror while getitng single product",
      error: internalError,
    });
  });

  it('should return 404 for invalid products', async () => {
    productModel.findOne = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(null)
    }));

    await getSingleProductController(req, res);

    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith({
      success: false,
      message: "Product not found",
    });
  });
});

describe('productPhotoController', () => {
  let req, res;
  const mockPhoto = {
    data: Buffer.from("mockImageData"),
    contentType: "image/png",
  }

  beforeEach(() => {
    req = {
      params: {
        pid: "66db427fdb0119d9234b27f3",
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn(),
    };
  });

  it('should return 200 with valid photo', async () => {
    productModel.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ photo: mockPhoto }),
    }));

    await productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.set).toHaveBeenCalledWith("Content-type", "image/png");
    expect(res.send).toHaveBeenCalledWith(mockPhoto.data);
  });

  it('should return 404 for non-existent product', async () => {
    productModel.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));

    await productPhotoController(req, res);

    expect(res.status).toBeCalledWith(404);
  });

  it('should return 400 for invalid ObjectId', async () => {
    productModel.findById.mockImplementation(() => ({
      select: jest.fn().mockRejectedValueOnce(new mongoose.Error.CastError()),
    })); 

    await productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should handle internal errors gracefully", async () => {
    productModel.findById.mockImplementation(() => ({
      select: jest.fn().mockRejectedValueOnce(new Error("Internal Error")),
    }));
    await productPhotoController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Erorr while getting photo",
      })
    );
  });
})