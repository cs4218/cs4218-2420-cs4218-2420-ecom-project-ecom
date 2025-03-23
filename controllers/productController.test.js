import { expect, jest } from "@jest/globals";
import { getProductController, getSingleProductController, searchProductController, relatedProductController, productFiltersController, productCategoryController, productListController } from "./productController";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";

// mock the models for mongoose 
jest.mock("../models/productModel.js");
jest.mock("../models/categoryModel.js");
jest.mock("../models/orderModel.js");

describe("Get Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // Test for getProductController 
    test("should return all products available in the database", async () => {
        const mockProducts = [
            {_id: "1", name: "Test1", slug: "t1"},
            {_id: "2", name: "Test2", slug: "t2"},
        ]  

        // Create a mock Mongoose query object
        const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts),
        }
        

        // Make find return mock query object
        productModel.find.mockReturnValue(mockQuery);

        await getProductController(req, res);
        
        expect(productModel.find).toHaveBeenCalledTimes(1);
        expect(mockQuery.populate).toHaveBeenCalledWith("category");
        expect(mockQuery.select).toHaveBeenCalledWith("-photo");
        expect(mockQuery.limit).toHaveBeenCalledWith(12);
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            counTotal: mockProducts.length,
            message: "All Products",
            products: mockProducts,
        });
    });

    test("should handle errors in getProductController", async () => {

        // Mock find() to throw error
        productModel.find.mockImplementation(() => {
            throw new Error("Database Connection Failed");
        })

        await getProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error in getting products",
            error: expect.any(Error),
        });
    });

});

describe("Get Single Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // Test for getSingleProductController
    test("should return a single product by slug", async () => {
        req.params = { slug: "product-1" };
        const mockProduct = {_id: "1",  name: "Product 1", slug: "product-1"};

        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(mockProduct),
        }
        productModel.findOne.mockReturnValue(mockQuery);

        await getSingleProductController(req, res);

        expect(productModel.findOne).toHaveBeenCalledWith({ slug: "product-1" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Single Product Fetched",
            product: mockProduct,
        });
    });

    test("should handle errors in getSingleProductController", async () => {
        // set a fake request
        req.params = { slug: "test-slug" };

        // Mock findOne() to throw an error
        productModel.findOne.mockImplementation(() => {
            throw new Error("Failed to fetch product");
        })

        await getSingleProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error while getting single product",
            error: expect.any(Error), // allow any error 
        });
    });
});

describe("Search Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // test for searchProductController
    test("should return products matching search keyword", async () => {
        req.params = { keyword: "phone" };
        const mockResults = [{ name: "iPhone" }, { name: "Samsung Galaxy"}]

        const mockQuery = {
            select: jest.fn().mockResolvedValue(mockResults),
        }
        productModel.find.mockReturnValue(mockQuery);

        await searchProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            $or: [
                { name: { $regex: "phone", $options: "i" } },
                { description: { $regex: "phone", $options: "i" } },
            ],
        });
        expect(res.json).toHaveBeenCalledWith(mockResults);
    });


    test("should handle errors in searchProductController", async () => {

        // set a fake request
        req.params = { keyword: "test-keyword" };

        // Mock find to throw an error
        productModel.find.mockImplementation(() => {
            throw new Error("Failed to search any products");
        });

        await searchProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error In Search Product API",
            error: expect.any(Error), // allow any error 
        });

    });

});

describe("Related Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // test for relatedProductController
    test("should return related products when called", async () => {
        req.params = { pid: "123", cid: "456" };
        const mockRelatedProducts = [
            { name: "Related Product 1"},
            { name: "Related Product 2"} 
        ];
        
        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(mockRelatedProducts),
        }
        productModel.find.mockReturnValue(mockQuery);

        await relatedProductController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            category: "456",
            _id: { $ne: "123" },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Related Products Fetched",
            products: mockRelatedProducts
        });
    });

    test("should handle errors in relatedProductController", async () => {
        req.params = { pid: "000", cid: "999" };

        productModel.find.mockImplementation(() => {
            throw new Error("Failed to get any related Products");
        });

        await relatedProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error while geting related product",
            error: expect.any(Error), // allow any error 
        });
    });

});

describe("Filter Product Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // Test for productFiltersController 
    test("should filter products based on category and price", async () => {
        req.body = {
            checked: ["category1"],
            radio: [10, 100],
        };

        const mockProducts = [
            {_id: "1", name: "Product1", category: "category1", price: 50},
            {_id: "2", name: "Product2", category: "category1", price: 80}
        ];

        // Mock find() to return filtered products
        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            category: ["category1"],
            price: { $gte: 10, $lte: 100 },
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Products Filtered Successfully",
            products: mockProducts
        });
    });

    test("should filter products based on category only", async () => {
        req.body = {
            checked: ["category1"],
            radio: [],
        };

        const mockProducts = [
            {_id: "1", name: "Product1", category: "category1", price: 50},
            {_id: "2", name: "Product2", category: "category1", price: 80},
            {_id: "3", name: "Product3", category: "category1", price: 110}
        ];

        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            category: ["category1"],
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Products Filtered Successfully",
            products: mockProducts
        });
    });

    test("should filter products based on radio only", async () => {
        req.body = {
            checked: [],
            radio: [10, 100],
        };

        const mockProducts = [
            {_id: "1", name: "Product1", category: "category1", price: 50},
            {_id: "2", name: "Product2", category: "category2", price: 80},
        ];

        productModel.find.mockResolvedValue(mockProducts);

        await productFiltersController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({
            price: { $gte: 10, $lte: 100 },
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Products Filtered Successfully",
            products: mockProducts
        });
    });

    test("should return error if filtering fails", async () => {
        req.body = {
            checked: [],
            radio: []
        };

        productModel.find.mockRejectedValue(new Error("Database error"));

        await productFiltersController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error While Filtering Products",
            error: expect.any(Error),
        });
    });

});

describe("Product Category Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // Test for productCategoryController
    test("should return products for a given category", async () => {
        req.params = {
            slug: "electronics",
        }

        const mockCategory = { _id: "123", name: "Electronics", slug: "electronics" };
        const mockProducts = [
            { _id: "1", name: "Laptop", category: "123" },
            { _id: "2", name: "Phone", category: "123" }, 
        ];

        categoryModel.findOne.mockResolvedValue(mockCategory);
        productModel.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockProducts),
        });

        await productCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "electronics" });
        expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Category Products Fetched",
            category: mockCategory,
            products: mockProducts,
        });
    });

    test("should return error if category fetch fails", async () => {
        req.params = {
            slug: "invalid-category",
        };

        categoryModel.findOne.mockRejectedValue(new Error("Database error"));

        await productCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error While Getting products by category"
        })
    })
});

describe("Get Product List Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test("should return paginated products", async () => {
        req.params = {
            page: "2",
        }; // test page 2
        const perPage = 6;
        const page = 2;
        const mockProducts = Array(6).fill({ name: "Product", price: 100});

        productModel.find.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts),
        });

        await productListController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(productModel.find().select).toHaveBeenCalledWith("-photo");
        expect(productModel.find().skip).toHaveBeenCalledWith((page - 1) * perPage);
        expect(productModel.find().limit).toHaveBeenCalledWith(perPage);
        expect(productModel.find().sort).toHaveBeenCalledWith({ createdAt: -1 });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "success in per page ctrl",
            products: mockProducts,
        });
    });

    test("should return default paginated products", async () => {
        req.params = {
            "page": null
        };
        const perPage = 6;
        const page = 1; // default page if no req.params.page
        const mockProducts = Array(6).fill({ name: "Product", price: 100});

        productModel.find.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockProducts),
        });

        await productListController(req, res);

        expect(productModel.find).toHaveBeenCalledWith({});
        expect(productModel.find().select).toHaveBeenCalledWith("-photo");
        expect(productModel.find().skip).toHaveBeenCalledWith((page - 1) * perPage);
        expect(productModel.find().limit).toHaveBeenCalledWith(perPage);
        expect(productModel.find().sort).toHaveBeenCalledWith({ createdAt: -1 });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "success in per page ctrl",
            products: mockProducts,
        });
    });

    test("should handle errors", async () => {
        req.params = {
            page: "2",
        };
    
        productModel.find.mockImplementation(() => {
          throw new Error("Database error");
        });
    
        await productListController(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
          success: false,
          message: "error in per page ctrl",
          error: expect.any(Error),
        });
    });

});