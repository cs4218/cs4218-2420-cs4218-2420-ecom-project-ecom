import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import { beforeEach, afterEach, describe, jest, it, expect } from '@jest/globals';

import braintree from "braintree";

import { 
    createProductController, 
    getProductController, 
    getSingleProductController, 
    productPhotoController,
    deleteProductController,
    updateProductController,
    productFiltersController,
    productCountController,
    productListController,
    searchProductController,
    realtedProductController,
    productCategoryController,
    braintreeTokenController,
    brainTreePaymentController, 
} from "../controllers/productController.js";

const mockValidProduct = {
    _id: 4321,
    name: "mockProduct",
    slug: "mock-product",
    description: "mock description",
    price: 20,
    category: {
        _id: 1234,
        name: "mockCategory",
    },
    quantity: 100,
    shipping: true,
}

const mockPhotoData = {
    path: 'client/public/images/l3.png',
    type: 'png',
    size: 1000000
}

const res = {
    send: jest.fn(),
    set: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
}

// TODO: uncomment once debugging done
jest.spyOn(console, 'log').mockImplementation(() => {});

afterEach(() => {
    jest.clearAllMocks();
})

describe('createProductController tests', () => {
    const reqBuilder = (product, photo) => {
        return {
            fields: { ...product },
            files: {
                photo: photo ? { ...photo } : undefined,
            },
            user: {
                _id: 999,
            }
        }
    };

    describe('Given that a valid product is received', () => {
        it('should create product successfully', async () => {
            jest.spyOn(productModel.prototype, 'save').mockResolvedValue();
            const req = reqBuilder(mockValidProduct, mockPhotoData);
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should create product without photo successfully', async () => {
            jest.spyOn(productModel.prototype, 'save').mockResolvedValue();
            const req = reqBuilder(mockValidProduct, undefined);
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should raise error if creating product fails', async () => {
            jest.spyOn(productModel.prototype, 'save').mockRejectedValue('mocked error');
            const req = reqBuilder(mockValidProduct, undefined);
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ 
                success: false,
                error: 'mocked error',
                message: 'Error in crearing product',
            });
        });
    });

    describe('Given that an invalid product is received', () => {
        let req;
        beforeEach(() => {
            req = reqBuilder(mockValidProduct, mockPhotoData);
        })
        it('should raise error if name is undefined', async () => {
            req.fields.name = undefined;
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
        });

        it('should raise error if description is undefined', async () => {
            req.fields.description = undefined;
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
        });

        it('should raise error if price is undefined', async () => {
            req.fields.price = undefined;
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
        });

        it('should raise error if category is undefined', async () => {
            req.fields.category = undefined;
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
        });

        it('should raise error if quantity is undefined', async () => {
            req.fields.quantity = undefined;
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
        });

        it('should raise error if photo size is too big', async () => {
            req.files.photo.size = 1000001;
            await createProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "photo is Required and should be less then 1mb" });
        });
    });
});

describe('getProductController tests', () => {
    const mockProducts = [
        { _id: 1, name: 'mockProduct1' },
        { _id: 2, name: 'mockProduct2' },
        { _id: 3, name: 'mockProduct3' },
    ]
    jest.spyOn(productModel, 'find').mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts),
    }));

    it('should correctly retrieve all products', async () => {
        await getProductController(undefined, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            counTotal: mockProducts.length,
            message: 'ALlProducts ',
            products: mockProducts
        });
    });

    it('should raise error if retrieving all products fails', async () => {
        jest.spyOn(productModel, 'find').mockImplementationOnce(() => ({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockRejectedValue(new Error('mocked error')),
        }));
        await getProductController(undefined, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Erorr in getting products',
            error: 'mocked error',
        });
    });
});

describe('getSingleProductController tests', () => {
    const mockProduct = { _id: 1, name: 'mockProduct1', slug: 'mock-product-one' };
    jest.spyOn(productModel, 'findOne').mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockProduct),
    }));

    it('should correctly retrieve single products', async () => {
        await getSingleProductController({ params: { slug: mockProduct.slug } }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: 'Single Product Fetched',
            product: mockProduct,
        });
    });

    it('should raise error if retrieving single products fails', async () => {
        jest.spyOn(productModel, 'findOne').mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockRejectedValue('mocked error'),
        }));
        await getSingleProductController({ params: { slug: mockProduct.slug } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Eror while getitng single product',
            error: 'mocked error',
        });
    });
});

describe('productPhotoController tests', () => {
    const mockProduct = { 
        _id: 1, name: 'mockProduct1', 
        slug: 'mock-product-one', 
        photo: { data: mockPhotoData, contentType: 'mockType' } 
    };
    jest.spyOn(productModel, 'findById').mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockProduct),
    }));

    it('should correctly retrieve product photo', async () => {
        await productPhotoController({ params: { pid: mockProduct._id } }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(mockPhotoData);
        expect(res.set).toHaveBeenCalledWith('Content-type', mockProduct.photo.contentType);
    });

    it('should raise error if retrieving product photo fails', async () => {
        jest.spyOn(productModel, 'findById').mockImplementation(() => ({
            select: jest.fn().mockRejectedValue('mocked error'),
        }));
        await productPhotoController({ params: { pid: mockProduct._id } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Erorr while getting photo',
            error: 'mocked error',
        });
    });
});

describe('deleteProductController tests', () => {
    jest.spyOn(productModel, 'findByIdAndDelete').mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(),
    }));

    it('should correctly delete product', async () => {
        await deleteProductController({ params: { pid: 1 } }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Product Deleted successfully",
        });
    });

    it('should raise error if deleting product fails', async () => {
        jest.spyOn(productModel, 'findByIdAndDelete').mockImplementation(() => ({
            select: jest.fn().mockRejectedValue('mocked error'),
        }));
        await deleteProductController({ params: { pid: 1 } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error while deleting product',
            error: 'mocked error',
        });
    });
});

describe('updateProductController tests', () => {
    const reqBuilder = (product, photo) => {
        return {
            fields: { ...product },
            files: {
                photo: photo ? { ...photo } : undefined,
            },
            params: {
                pid: 999,
            }
        }
    };

    describe('Given that a valid product is received', () => {
        const mockReturnedProduct = {
            ...mockValidProduct,
            photo: {
                data: 'mockData',
                contentType: 'mockType',
            },
            save: jest.fn().mockReturnValue(),
        }
        
        it('should update product successfully', async () => {
            jest.spyOn(productModel, 'findByIdAndUpdate').mockResolvedValue(mockReturnedProduct);

            const req = reqBuilder(mockValidProduct, mockPhotoData);
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: 'Product Updated Successfully',
                products: mockReturnedProduct,
            });
        });

        it('should update product without photo successfully', async () => {
            jest.spyOn(productModel, 'findByIdAndUpdate').mockResolvedValue(mockReturnedProduct);            
            const req = reqBuilder(mockValidProduct, undefined);
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: 'Product Updated Successfully',
                products: mockReturnedProduct,
            });
        });

        it('should raise error if updating product fails', async () => {
            jest.spyOn(productModel, 'findByIdAndUpdate').mockRejectedValue('mocked error');
            const req = reqBuilder(mockValidProduct, undefined);
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ 
                success: false,
                error: 'mocked error',
                message: 'Error in Updte product',
            });
        });
    });

    describe('Given that an invalid product is received', () => {
        let req;
        beforeEach(() => {
            req = reqBuilder(mockValidProduct, mockPhotoData);
        })
        it('should raise error if name is undefined', async () => {
            req.fields.name = undefined;
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
        });

        it('should raise error if description is undefined', async () => {
            req.fields.description = undefined;
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
        });

        it('should raise error if price is undefined', async () => {
            req.fields.price = undefined;
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
        });

        it('should raise error if category is undefined', async () => {
            req.fields.category = undefined;
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
        });

        it('should raise error if quantity is undefined', async () => {
            req.fields.quantity = undefined;
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
        });

        it('should raise error if photo size is too big', async () => {
            req.files.photo.size = 1000001;
            await updateProductController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "photo is Required and should be less then 1mb" });
        });
    });
});

describe('productFiltersController tests', () => {
    const mockProducts = [
        { _id: 1, name: 'mockProduct1' },
        { _id: 2, name: 'mockProduct2' },
        { _id: 3, name: 'mockProduct3' },
    ]

    const req = {
        body: {
            checked: [1,2,3,4],
            radio: [1,20],
        }
    }

    it('should correctly filter and return products', async () => {
        const findSpy = jest.spyOn(productModel, 'find').mockResolvedValue(mockProducts);
        await productFiltersController(req, res);
        expect(findSpy).toHaveBeenCalledWith({
            category: req.body.checked,
            price: {
                $gte: req.body.radio[0],
                $lte: req.body.radio[1],
            }
        })
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
        findSpy.mockRestore();
    });

    it('should raise error if filtering products fails', async () => {
        jest.spyOn(productModel, 'find').mockRejectedValue('mocked error');
        await productFiltersController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error WHile Filtering Products',
            error: 'mocked error',
        });
    });
});

describe('productCountController tests', () => {

    const mockTotal = 8;

    it('should correctly retrieve product count', async () => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            estimatedDocumentCount: jest.fn().mockReturnValue(mockTotal),
        }));

        await productCountController(undefined, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            total: mockTotal,
        });
    });

    it('should raise error if retrieving product count fails', async () => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            estimatedDocumentCount: jest.fn().mockRejectedValue('mocked error'),
        }));
        await productCountController(undefined, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error in product count',
            error: 'mocked error',
        });
    });
});

describe('productListController tests', () => {
    const mockProducts = [
        { _id: 1, name: 'mockProduct1' },
        { _id: 2, name: 'mockProduct2' },
        { _id: 3, name: 'mockProduct3' },
    ]

    const reqBuilder = (page) => {
        return {
            params: {
                page: page
            }
        }
    }

    const perPage = 6;

    const findMock = {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnValue(mockProducts),
    }

    beforeEach(() => {
        jest.spyOn(productModel, 'find').mockImplementation(() => findMock);
    })

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('Given that page number is received', () => {

        it('should correctly retrieve product list', async () => {
            await productListController(reqBuilder(1), res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                products: mockProducts,
            });
        });

        it('should correctly retrieve empty product list', async () => {
            jest.spyOn(productModel, 'find').mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnValue([]),
            }));
            await productListController(reqBuilder(1), res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                products: [],
            });
        });

        it('should correctly retrieve products list after page 1', async () => {
            await productListController(reqBuilder(2), res);
            expect(findMock.skip).toHaveBeenCalledWith((2-1) * perPage);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                products: mockProducts,
            });
        });

        it('should raise error if retrieving product list fails', async () => {
            jest.spyOn(productModel, 'find').mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockRejectedValue('mocked error'),
            }));
            await productListController(reqBuilder(1), res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'error in per page ctrl',
                error: 'mocked error',
            });
        });
    });

    describe('Given that page number is not received', () => {

        it('should default to page 1 and retrieve product list', async () => {
            await productListController(reqBuilder(undefined), res);
            expect(findMock.skip).toHaveBeenCalledWith((1-1) * perPage);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                products: mockProducts,
            });
        });

        it('should raise error if retrieving product list fails', async () => {
            jest.spyOn(productModel, 'find').mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockRejectedValue('mocked error'),
            }));
            await productListController(reqBuilder(undefined), res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: 'error in per page ctrl',
                error: 'mocked error',
            });
        });
    });
});

describe('searchProductController tests', () => {
    const mockProducts = [
        { _id: 1, name: 'mockProduct1' },
        { _id: 2, name: 'mockProduct2' },
        { _id: 3, name: 'mockProduct3' },
    ]

    const reqBuilder = (keyword) => {
        return {
            params: {
                keyword: keyword
            }
        }
    }

    beforeEach(() => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            select: jest.fn().mockReturnValue(mockProducts),
        }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    })

    it('should correctly retrieve search results', async () => {
        await searchProductController(reqBuilder('keyword'), res);
        expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should correctly retrieve empty search results', async () => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            select: jest.fn().mockReturnValue([]),
        }));
        await searchProductController(reqBuilder('keyword'), res);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should raise error if retrieving search results fails', async () => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            select: jest.fn().mockRejectedValue('mocked error'),
        }));
        await searchProductController(reqBuilder('keyword'), res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error In Search Product API',
            error: 'mocked error',
        });
    });
});

describe('realtedProductController tests', () => {
    const mockProducts = [
        { _id: 1, name: 'mockProduct1' },
        { _id: 2, name: 'mockProduct2' },
        { _id: 3, name: 'mockProduct3' },
    ]

    const reqBuilder = (pid, cid) => {
        return {
            params: {
                pid: pid,
                cid: cid,
            }
        }
    }

    beforeEach(() => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnValue(mockProducts),
        }));
    })
    
    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should query for related products with correct params', async () => {
        const findSpy = jest.spyOn(productModel, 'find').mockImplementationOnce(() => {});
        await realtedProductController(reqBuilder(1, 2), res);
        expect(findSpy).toHaveBeenCalledWith({
            category: 2,
            _id: { $ne: 1 },
        });
        findSpy.mockRestore();
    });

    it('should correctly retrieve related products', async () => {
        await realtedProductController(reqBuilder(1, 2), res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
        });
    });

    it('should correctly retrieve empty related products', async () => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnValue([]),
        }));
        await realtedProductController(reqBuilder(1, 2), res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: [],
        });
    });

    it('should raise error if retrieving related products fails', async () => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockRejectedValue('mocked error'),
        }));
        await realtedProductController(reqBuilder(1, 2), res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'error while geting related product',
            error: 'mocked error',
        });
    });
});

describe('productCategoryController tests', () => {
    const mockProducts = [
        { _id: 1, name: 'mockProduct1' },
        { _id: 2, name: 'mockProduct2' },
        { _id: 3, name: 'mockProduct3' },
    ]

    const mockCategory = { 
        _id: 1, name: "mockCategory1", slug: "category-one",
    };

    beforeEach(() => {
        jest.spyOn(categoryModel, 'findOne').mockReturnValue(mockCategory);

        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            populate: jest.fn().mockReturnValue(mockProducts), 
        }));
    })
    
    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should correctly retrieve products for category', async () => {
        await productCategoryController({ params: { slug: 'category-one' }}, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: mockProducts,
            category: mockCategory,
        });
    });

    it('should correctly retrieve empty products for category', async () => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            populate: jest.fn().mockReturnValue([]), 
        }));
        await productCategoryController({ params: { slug: 'category-one' }}, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            products: [],
            category: mockCategory,
        });
    });

    it('should raise error if retrieving products for category fails', async () => {
        jest.spyOn(productModel, 'find').mockImplementation(() => ({
            populate: jest.fn().mockRejectedValue('mocked error'), 
        }));
        await productCategoryController({ params: { slug: 'category-one' }}, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error While Getting products',
            error: 'mocked error',
        });
    });

    it('should raise error if retrieving category of product fails', async () => {
        jest.spyOn(categoryModel, 'findOne').mockRejectedValue('mocked category error');
        await productCategoryController({ params: { slug: 'category-one' }}, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: 'Error While Getting products',
            error: 'mocked category error',
        });
    });
});

describe('braintreeTokenController tests', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    })
    
    const mockCallback = jest.fn((err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(response);
        }
    });
    
    const mockResponse = { success: true, clientToken: 'mockToken' };

    it('should correctly generate token for payment gateway', async () => {
        const mockGenerate = jest.fn().mockReturnValue(mockCallback(null, mockResponse));
        braintree.BraintreeGateway = jest.fn().mockImplementation(() => ({
            clientToken: {
              generate: mockGenerate,
            },
          }));
        await braintreeTokenController(undefined, res);
        expect(res.send).toHaveBeenCalledWith(mockResponse);
    });

    it('should raise error if token generation fails', async () => {
        const mockGenerateError = jest.fn().mockReturnValue(mockCallback(new Error('mocked error'), null));
        braintree.BraintreeGateway = jest.fn().mockImplementation(() => {
            return {
                clientToken: {
                    generate: mockGenerateError
                }
            };
        });

        await braintreeTokenController(undefined, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(new Error('mocked error'));
    });
});

describe('brainTreePaymentController tests', () => {
    const mockRequest = { 
        user: { _id: 999 },
        body: {
            nonce: 'someNonce',
            cart: [
                { _id: 1, price: 10 },
                { _id: 2, price: 20 },
            ]
        }    
    };
    orderModel.prototype.save = jest.fn();

    afterEach(() => {
        jest.restoreAllMocks();
    })
    
    const mockCallback = jest.fn(async (error, result) => {
        if (result) {
            await res.json({ ok: true });
        } else {
            await res.status(500).send(error);
        }
    });

    it('should execute payment successfully', async () => {
        const mockSale = jest.fn().mockReturnThis(mockCallback(undefined, true));
        braintree.BraintreeGateway = jest.fn().mockImplementation(() => {
            return {
                transaction: {
                    sale: mockSale
                }
            };
        });

        await brainTreePaymentController(mockRequest, res);
        expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    it('should raise error if payment fails', async () => {
        const mockSale = jest.fn().mockResolvedValue(mockCallback(new Error('mocked error'), undefined));
        braintree.BraintreeGateway = jest.fn().mockImplementation(() => {
            return {
                transaction: {
                    sale: mockSale
                }
            };
        });

        await brainTreePaymentController(mockRequest, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(new Error('mocked error'));
    });
});