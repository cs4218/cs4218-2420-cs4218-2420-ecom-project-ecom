import { createProductController, deleteProductController, productFiltersController, 
  productListController, productCountController, searchProductController } from './productController';
import productModel from '../models/productModel';
import fs from 'fs';
import slugify from 'slugify';

jest.mock('../models/productModel');
jest.mock('fs');
jest.mock('slugify');
jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn(() => ({
    clientToken: {
      generate: jest.fn((_, cb) => cb(null, { clientToken: "mockToken" })),
    },
    transaction: {
      sale: jest.fn((_, cb) => cb(null, { success: true })),
    },
  })),
  Environment: {
    Sandbox: "sandbox",
  },
}));

describe('Product Filter Controller Test', () => {
  let req, res, mockArgs;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
    req = {
      body: {
        checked: ['1', '2'],
        radio: [1, 10]
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    mockArgs = {
      category: ['1', '2'],
      price: { $gte: 1, $lte: 10 }
    };
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test("should filter product when only check filters applied", async () => {
    req = {
      body: {
        checked: ['1', '2'],
        radio: []
      }
    };
    mockArgs = {
      category: ['1', '2']
    };
    productModel.find.mockResolvedValue({ products: "Test" });
    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith(mockArgs);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: { products: "Test" },
    })
  });

  test("should filter product when only radio filters applied", async () => {
    req = {
      body: {
        checked: [],
        radio: [1, 10]
      }
    };
    mockArgs = {
      price: { $gte: 1, $lte: 10 }
    };
    productModel.find.mockResolvedValue({ products: "Test" });
    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith(mockArgs);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: { products: "Test" },
    })
  });

  test("should filter product when radio and check filters applied", async () => {
    productModel.find.mockResolvedValue({ products: "Test" });
    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith(mockArgs);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: { products: "Test" },
    })
  });

  test("should log error when error thrown", async () => {
    productModel.find.mockRejectedValue(new Error("Testing Error"));
    await productFiltersController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Filtering Products",
      error: Error("Testing Error"),
    })
  });
});

describe('Product Count Controller Test', () => {
  let req, res, mockTotal;
  beforeEach(() => {
    jest.clearAllMocks();
    mockTotal = {
      total: "Test"
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test("should provide product count ", async () => {
    productModel.find = jest.fn(() => ({
      estimatedDocumentCount: jest.fn().mockResolvedValue(mockTotal),
    }));
    await productCountController(req, res);
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      total: mockTotal,
    })
  });

  test("should log error when error thrown", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
    productModel.find = jest.fn(() => ({
      estimatedDocumentCount: jest.fn().mockRejectedValue(new Error("Testing Error")),
    }));
    await productCountController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Error in product count",
      error: Error("Testing Error"),
      success: false,
    })
    consoleLogSpy.mockRestore();
  });
});

describe('Product List Controller Test', () => {
  let req, res, mockProducts;
  beforeEach(() => {
    jest.clearAllMocks();
    mockProducts = {
      products: "Test"
    };
    req = {
      params: {
        page: 1
      }
    }
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test("should provide a list of products ", async () => {
    productModel.find = jest.fn(() => ({
      select: jest.fn(() => ({
        skip: jest.fn(() => ({
          limit: jest.fn(() => ({
            sort: jest.fn().mockResolvedValue(mockProducts)
          }))
        })),
      })),
    }));

    await productListController(req, res);
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    })
  });

  test("should log error when error thrown", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    productModel.find = jest.fn(() => ({
      select: jest.fn(() => ({
        skip: jest.fn(() => ({
          limit: jest.fn(() => ({
            sort: jest.fn().mockRejectedValue(new Error("Testing Error"))
          }))
        })),
      })),
    }));

    await productListController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"));
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in per page ctrl",
      error: Error("Testing Error"),
    });
    consoleLogSpy.mockRestore();
  });

});

describe('Search Product Controller Test', () => {
  let req, res, mockResults;
  beforeEach(() => {
    jest.clearAllMocks();
    mockResults = {
      results: "Test"
    };
    req = {
      params: {
        keyword: "key_test"
      }
    }
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test("should successfully return filtered products based on keyword", async () => {
    productModel.find = jest.fn(() => ({
      select: jest.fn().mockResolvedValue(mockResults)
    }))

    await searchProductController(req, res);
    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "key_test", $options: "i" } },
        { description: { $regex: "key_test", $options: "i" } },
      ],
    });
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  test("should log error when error thrown", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    productModel.find = jest.fn(() => ({
      select: jest.fn().mockRejectedValue(new Error ("Testing Error"))
    }))

    await searchProductController(req, res);
    expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error In Search Product API",
      error: Error("Testing Error"),
    });
    consoleLogSpy.mockRestore();
  });

});
