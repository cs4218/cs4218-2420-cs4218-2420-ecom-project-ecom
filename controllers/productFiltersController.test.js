import { productFiltersController } from "./productController";
import productModel from "../models/productModel";

jest.mock("../models/productModel");

describe("Product Filters Controller", () => {
    let req, res;
    const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, category: 'category1' },
        { id: '2', name: 'Product 2', price: 200, category: 'category2' }
      ];
    
    beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
        body: {
        checked: [],
        radio: []
        }
    };
    
    res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    };

    productModel.find.mockResolvedValue(mockProducts);
    });

    it("filters products with no filters applied", async () => {
        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts
        });

    });

    it("filters products by category", async () => {
        req.body.checked = ['category1', 'category2'];

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
        category: { $in: ['category1', 'category2'] }
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts
        });
    })

    it("filters products by price range", async () => {
        req.body.radio = [100, 300];
    
        await productFiltersController(req, res);
    
        expect(productModel.find).toHaveBeenCalledWith({
          price: { $gte: 100, $lte: 300 }
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          success: true,
          products: mockProducts
        });
      });

    it('should filter products by both category and price range', async () => {
        req.body.checked = ['category1'];
        req.body.radio = [100, 300];

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
        category: { $in: ['category1'] },
        price: { $gte: 100, $lte: 300 }
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts
        });
    });
    
    it("handles errors appropriately", async () => {
        const mockError = new Error('Database error');
        productModel.find.mockRejectedValue(mockError);
        jest.spyOn(console, "log").mockImplementation(() => {}); 

        await productFiltersController(req, res);

        expect(console.log).toHaveBeenCalledWith(expect.any(Error));
        expect(console.log).toHaveBeenCalledWith(expect.objectContaining({ message : "Database error"}));
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error While Filtering Products",
            error: mockError
        });
    });
})