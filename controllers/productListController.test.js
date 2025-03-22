import productModel from "../models/productModel.js";
import { productListController } from "./productController.js";

jest.mock("../models/productModel.js");

describe("productListController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { page: "1" } }; 
    res = {
      status: jest.fn().mockReturnThis(), 
      send: jest.fn(), 
    };
    jest.clearAllMocks(); 
  });

  test("return paginated products", async () => {
    const mockProducts = [
      { name: "Product 1", slug: "product-1", price: 10 },
      { name: "Product 2", slug: "product-2", price: 20 },
    ];

    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200); 
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts, 
    });
  });

  test("return an empty array if no products exist", async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: [],
    });
  });

  test("handle errors", async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(new Error("Database error")),
    });
    jest.spyOn(console, "log").mockImplementation(() => {}); 

    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "error in per page ctrl",
      })
    );
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(console.log).toHaveBeenCalledWith(expect.objectContaining({ message : "Database error"}));
  });
});
