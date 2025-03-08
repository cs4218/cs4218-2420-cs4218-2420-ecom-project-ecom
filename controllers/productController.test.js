import { createProductController, deleteProductController, updateProductController, getProductController } from './productController';
import productModel from '../models/productModel';
import fs from 'fs';
import slugify from 'slugify';
import gateway from 'braintree';
import braintree from 'braintree';
import { braintreeTokenController } from './productController';

jest.mock('../models/productModel');
jest.mock('fs');
jest.mock('slugify');

jest.mock("braintree", () => {
  const clientToken = { generate: jest.fn() };
  return {
    BraintreeGateway: jest.fn(() => ({
      clientToken,
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
    braintree.BraintreeGateway().clientToken.generate.mockImplementationOnce((_, cb) => cb(mockResponse, null));
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