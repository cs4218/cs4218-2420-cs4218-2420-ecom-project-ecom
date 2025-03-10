//Ivan
import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import productModel from '../models/productModel.js';
import {
  getSingleProductController,
  productCategoryController,
  productPhotoController,
  realtedProductController,
  createProductController,
  deleteProductController,
  updateProductController,
  getProductController,
  braintreeTokenController,
  brainTreePaymentController, 
  createProductController, 
  deleteProductController, 
  productFiltersController,
  productListController, 
  productCountController, 
  searchProductController
} from './productController';
import fs from 'fs';
import slugify from 'slugify';
import braintree from 'braintree';

jest.mock('../models/categoryModel.js');
jest.mock('../models/productModel.js');

jest.mock('../models/orderModel.js');
//Arkar

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

//Jamie
jest.mock('fs');
jest.mock('slugify');

jest.mock("braintree", () => {
  const clientToken = { generate: jest.fn() };
  const transaction = { sale: jest.fn() };
  return {
    BraintreeGateway: jest.fn(() => ({
      clientToken,
      transaction
    })),
    Environment: {
      Sandbox: "Sandbox",
    },
  };
});

describe('createProductController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      fields: {
        name: 'Test Create Product',
        description: 'A description',
        price: 100,
        category: 'test category',
        quantity: 10,
        shipping: true,
      },
      files: {
        photo: {
          size: 500000,
          path: 'test/path',
          type: 'image/jpeg',
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    productModel.mockImplementation((field) => ({
        ...field,
        photo: { data: null, contentType: null },
        save: jest.fn(),
      }));
  });

  it('should create a product successfully', async () => {
    slugify.mockReturnValue('test-product');
    productModel.prototype.save = jest.fn().mockResolvedValue({});

    await createProductController(req, res);

    expect(slugify).toHaveBeenCalledWith('Test Create Product');
    expect(fs.readFileSync).toHaveBeenCalledWith('test/path');
    expect(productModel).toHaveBeenCalledWith({
      ...req.fields,
      slug: 'test-product',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Created Successfully',
      products: expect.any(Object),
    });
  });

  it('should give error if name is missing', async () => {
    req.fields.name = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Name is Required' });
  });

  it('should give error if description is missing', async () => {
    req.fields.description = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Description is Required' });
  });

  it('should give error if price is missing', async () => {
    req.fields.price = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Price is Required' });
  });

  it('should give error if category is missing', async () => {
    req.fields.category = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Category is Required' });
  });

  it('should give error if quantity is missing', async () => {
    req.fields.quantity = '';

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Quantity is Required' });
  });

  it('should give error if photo size is greater than the size limit', async () => {
    req.files.photo.size = 2000000;

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'photo is Required and should be less then 1mb' });
  });

  it('should handle errors', async () => {
    const error = new Error('Test Error');
    productModel.mockImplementation((field) => ({
        ...field,
        photo: { data: null, contentType: null },
        save: jest.fn().mockRejectedValue(error)
      }));

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error,
      message: 'Error in crearing product',
    });
  });
});


describe('deleteProductController', () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        params: {
          pid: 'test-product-id',
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

    });

    it('should delete a product successfully', async () => {

        productModel.findByIdAndDelete.mockImplementation((id) => ({
            _id: id,
            select: jest.fn(),
            }));
      await deleteProductController(req, res);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('test-product-id');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Product Deleted successfully',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      productModel.findByIdAndDelete.mockImplementation((id) => ({
        _id: id,
        select: jest.fn().mockRejectedValue(error)
      }));
      await deleteProductController(req, res);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('test-product-id');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Error while deleting product',
        error: error
      });
    });
  });


describe('updateProductController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
      req = {
        params: {
          pid: 'test-product-id',
        },
        fields: {
          name: 'Updated Product',
          description: 'Updated Description',
          price: 150,
          category: 'Updated Category',
          quantity: 20,
          shipping: true,
        },
        files: {
          photo: {
            size: 500000,
            path: 'test/path',
            type: 'image/jpeg',
          },
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      productModel.mockImplementation((field) => ({
        ...field,
        photo: { data: null, contentType: null },
        save: jest.fn(),
      }));

    });

    it('should return 500 if name is missing', async () => {
      req.fields.name = '';

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: 'Name is Required' });
    });

    it('should return 500 if description is missing', async () => {
      req.fields.description = '';

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: 'Description is Required' });
    });

    it('should return 500 if price is missing', async () => {
      req.fields.price = '';

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: 'Price is Required' });
    });

    it('should return 500 if category is missing', async () => {
      req.fields.category = '';

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: 'Category is Required' });
    });

    it('should return 500 if quantity is missing', async () => {
      req.fields.quantity = '';

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: 'Quantity is Required' });
    });

    it('should return 500 if photo size is greater than 1MB', async () => {
      req.files.photo.size = 2000000;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: 'photo is Required and should be less then 1mb' });
    });

    it('should update a product successfully', async () => {
        slugify.mockReturnValue('updated-product');
        productModel.findByIdAndUpdate.mockImplementation((id, field, isNew) => ({
            ...field,
            photo: {},
            save: jest.fn(),
          }));
        await updateProductController(req, res);

        expect(slugify).toHaveBeenCalledWith('Updated Product');
        expect(fs.readFileSync).toHaveBeenCalledWith('test/path');
        expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'test-product-id',
          { ...req.fields, slug: 'updated-product' },
          { new: true }
        );
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: 'Product Updated Successfully',
            products: expect.any(Object),
          });
        expect(res.status).toHaveBeenCalledWith(201);

      });
    it('should handle errors', async () => {
      const error = new Error('Test Error');
      productModel.findByIdAndUpdate.mockRejectedValue(error);

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error,
        message: 'Error in Updte product',
      });
    });
  });


describe('braintreeTokenController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

  });

  it('should be able to generate client token', async () => {

    const mockResponse = { clientToken : "mock" };
    braintree.BraintreeGateway().clientToken.generate.mockImplementationOnce((_, cb) => cb(null, mockResponse));
    await braintreeTokenController(req, res);
    expect(res.send).toHaveBeenCalledWith(mockResponse);
  });

  it('should be able to handle any errors when generating client token', async () => {
    const mockError = new Error('mockError');
    braintree.BraintreeGateway().clientToken.generate.mockImplementationOnce((_, cb) => cb(mockError, null));

    await braintreeTokenController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });
});

describe('brainTreePaymentController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        nonce: 'fake-nonce',
        cart: [
          { price: 100 }
        ],
      },
      user: {
        _id: 'user-id',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    orderModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({}),
  }));

  });

  it('process payment correctly', async () => {
    const mockResult = { success: true };
    braintree.BraintreeGateway().transaction.sale.mockImplementationOnce((_, callback) => {
      callback(null, mockResult);
    });
    
    await brainTreePaymentController(req, res);

    expect(braintree.BraintreeGateway().transaction.sale).toHaveBeenCalledWith(
      {
        amount: 100,
        paymentMethodNonce: 'fake-nonce',
        options: {
          submitForSettlement: true,
        },
      },
      expect.any(Function)
    );

    expect(orderModel).toHaveBeenCalledWith({
      products: req.body.cart,
      payment: mockResult,
      buyer: req.user._id,
    });

    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('should handle processing errors if there is', async () => {
    const mockError = new Error('Payment error');
    braintree.BraintreeGateway().transaction.sale.mockImplementationOnce((_, callback) => {
      callback(mockError, null);
    });

    await brainTreePaymentController(req, res);

    expect(braintree.BraintreeGateway().transaction.sale).toHaveBeenCalledWith(
      {
        amount: 100,
        paymentMethodNonce: 'fake-nonce',
        options: {
          submitForSettlement: true,
        },
      },
      expect.any(Function)
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });
});



describe('getProductController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should fetch all products successfully', async () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Product 1',
        description: 'Description 1',
        category: 'Category 1',
        price: 100,
        quantity: 10,
        shipping: true,
        createdAt: '2024-09-06T17:57:19.963Z',
        updatedAt: '2024-09-06T17:57:19.963Z',
      },
      {
        _id: '2',
        name: 'Product 2',
        description: 'Description 2',
        category: 'Category 2',
        price: 200,
        quantity: 20,
        shipping: false,
        createdAt: '2024-09-06T17:57:19.963Z',
        updatedAt: '2024-09-06T17:57:19.963Z',
      },
    ];

    productModel.find.mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    }));

    await getProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      counTotal: mockProducts.length,
      message: 'ALlProducts ',
      products: mockProducts,
    });
  });

  it('should handle errors when fetching products', async () => {
    const error = new Error('Test Error');
    productModel.find.mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(error),
    }));

    await getProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Erorr in getting products',
      error: error.message,
    });
  });
});

//Ivan
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