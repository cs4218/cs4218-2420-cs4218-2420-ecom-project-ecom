import { jest } from "@jest/globals";
import { categoryController, singleCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel";

jest.mock("../models/categoryModel.js");

describe("Category Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = { params: { slug: "" }, body: {} }; // reset request
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        }; // mock response 
        jest.clearAllMocks();
    })

    test("should return all categories from database", async () => {
        const mockCategories = [
            {_id: "1", name: "Electronics", slug: "electronics"},
            {_id: "2", name: "Books", slug: "books"}
        ];

        categoryModel.find.mockResolvedValue(mockCategories); // mock return value from MongoDB

        await categoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "All Categories List",
            category: mockCategories,
        });
        expect(categoryModel.find).toHaveBeenCalledTimes(1);
    });

    test("should handle errors when fetching all categories from database", async () => {
        categoryModel.find.mockRejectedValue(new Error("Database Error"));

        await categoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error while getting all categories",
        });
    });

    test("should return a single category by slug", async () => {
        const mockCategory = {_id: "1", name: "Electronics", slug: "electronics"};

        req.params.slug = "electronics";
        categoryModel.findOne.mockResolvedValue(mockCategory);

        await singleCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Get Single Category Successfully",
            category: mockCategory,
        });
        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "electronics" });
    });

    test("should return success true but category as null if not found", async () => {
        req.params.slug = "nonexistent"
        categoryModel.findOne.mockResolvedValue(null);

        await singleCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Get Single Category Successfully",
            category: null,
        })
    });

    test("should handle errors when getting single category", async () => {
        req.params.slug = "some-category";
        categoryModel.findOne.mockRejectedValue(new Error("Database Error"));

        await singleCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Error),
            message: "Error While getting Single Category",
        });
    });

});