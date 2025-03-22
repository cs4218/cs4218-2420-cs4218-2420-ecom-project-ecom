import { searchProductController } from './productController'; 
import productModel from '../models/productModel'; 

jest.mock("../models/productModel.js");

beforeEach(() => {
    jest.clearAllMocks(); 
  });

describe('searchProductController', () => {
  test('returns products that match the keyword', async () => {
    const mockProducts = [
      { name: 'Test Product 1', description: 'A test description' },
      { name: 'Test Product 2', description: 'Another test description' },
    ];

    const req = { params: { keyword: "test" } }; 

    const res = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn(),
        json: jest.fn().mockReturnThis(), 
      };

    productModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockProducts)
    });
    

    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  test('should return an empty array if no products are found', async () => {
    const req = {
      params: { keyword: 'test' },
    };

    const res = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn(),
        json: jest.fn().mockReturnThis(), 
      };

    productModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([])
    });

    await searchProductController(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('should return a 400 error if an error occurs', async () => {
    const req = {
      params: { keyword: 'test' },
    };

    const res = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn(), 
    };
    productModel.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
    });
    jest.spyOn(console, "log").mockImplementation(() => {}); 
    await searchProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error In Search Product API',
      error: expect.any(Error),
    });
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(console.log).toHaveBeenCalledWith(expect.objectContaining({ message : "Database error"}));
  });
});
