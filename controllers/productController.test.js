import categoryModel from "../models/categoryModel.js";
import productModel from '../models/productModel.js';
import { getSingleProductController, productCategoryController } from './productController';

jest.mock('../models/categoryModel.js');
jest.mock('../models/productModel.js');

const internalError = new Error("Mock internal error");
// jest.spyOn(console, 'log').mockImplementation(jest.fn()); // silence error log outputs in test

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
  })
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
})