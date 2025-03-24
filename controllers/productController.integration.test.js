import "dotenv/config";
import express from "express";
import fs from "fs";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import slugify from "slugify";
import request from "supertest";
import categoryModel from "../models/categoryModel";
import productModel from "../models/productModel";
import router from "../routes/productRoutes";
import {
  createProductController,
  deleteProductController,
  getProductController,
  updateProductController,
} from "./productController";

import TEST_CATEGORIES from "../utils/data/test.categories.json" with { type: "json" };
import TEST_PRODUCTS from "../utils/data/test.products.json" with { type: "json" };

import {
  getTestProduct,
  mustMigrateUp,
  startInMemDB
} from "../utils/testUtils";

//Ivan's Code
const app = express();
app.use(express.json());
app.use("/", router);
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

const categories = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: "cat A",
    slug: "cat-a"
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "cat B",
    slug: "cat-b"
  },
];


const products = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Product A",
    slug: "product-a",
    description: "AAAA",
    price: 8,
    category: categories[0]._id,
    quantity: 10,
    shipping: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Product B",
    slug: "product-b",
    description: "BBBB",
    price: 200,
    category: categories[0]._id,
    quantity: 5,
    shipping: false,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Product D",
    slug: "product-d",
    description: "DDDD",
    price: 300,
    category: categories[1]._id,
    quantity: 1,
    shipping: false,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Product C",
    slug: "product-c",
    description: "CCCC",
    price: 7,
    category: categories[1]._id,
    quantity: 2,
    shipping: false,
  },
];

const extendedProducts = [{
  _id: new mongoose.Types.ObjectId(),
  name: "Product E",
  slug: "product-e",
  description: "EEEE",
  price: 200,
  category: categories[0]._id,
  quantity: 5,
  shipping: false,
},
{
  _id: new mongoose.Types.ObjectId(),
  name: "Product F",
  slug: "product-f",
  description: "FFFF",
  price: 300,
  category: categories[1]._id,
  quantity: 1,
  shipping: false,
},
{
  _id: new mongoose.Types.ObjectId(),
  name: "Product G",
  slug: "product-g",
  description: "GGGG",
  price: 7,
  category: categories[1]._id,
  quantity: 2,
  shipping: false,
},
];

describe("productController in home page integration test", () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  let mongoServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await productModel.create(products);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("POST /product-filters should return filtered products when both filters used", async () => {
    const filter = {
      checked: [categories[0]._id],
      radio: [1, 10],
    };
    const res = await request(app).post("/product-filters").send(filter);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe("Product A");
  })

  it("POST /product-filters should return filtered products when only categories filter used", async () => {
    const filter = {
      checked: [categories[0]._id],
      radio: []
    };
    let expectedProducts = new Set(["Product A", "Product B"]);
    const res = await request(app).post("/product-filters").send(filter);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    res.body.products.forEach(p => expectedProducts.delete(p.name));
    expect(expectedProducts.size).toBe(0);
  })

  it("POST /product-filters should return filtered products when only prices filter used", async () => {
    const filter = {
      checked: [],
      radio: [1, 10],
    };
    let expectedProducts = new Set(["Product A", "Product C"]);
    const res = await request(app).post("/product-filters").send(filter);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    res.body.products.forEach(p => expectedProducts.delete(p.name));
    expect(expectedProducts.size).toBe(0);
  })

  it("POST /product-filters should return empty when no products from filtered", async () => {
    const filter = {
      checked: [],
      radio: [1000, 2000],
    };
    const res = await request(app).post("/product-filters").send(filter);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  it("POST /product-filters should return error 400 if wrong body format sent", async () => {
    const filter = {};
    const res = await request(app).post("/product-filters").send(filter);
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Error While Filtering Products",
      })
    );
  });

  it("POST /product-filters should return error 404 if no body sent", async () => {
    const res = await request(app).post("/product-filters");
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Error While Filtering Products",
      })
    );
  });

  it("GET /product-count should return count", async () => {
    const res = await request(app).get("/product-count");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      total: 4,
    });
  });

  it("GET /product-count should return count", async () => {
    const res = await request(app).get("/product-count");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      total: 4,
    });
  });

  it("GET /product-list should return product list on first page", async () => {
    const res = await request(app).get("/product-list/1");
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(4);
  });

  it("GET /product-list should return product list on second page", async () => {
    await productModel.create(extendedProducts);
    const res = await request(app).get("/product-list/2");
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    await productModel.deleteMany({});
    await productModel.create(products);
  });

  it("GET /product-list should return empty if page defined does not exist", async () => {
    const res = await request(app).get("/product-list/2");
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  it("GET /product-list should return error", async () => {
    const res = await request(app).get("/product-list/-1");
    expect(res.status).toBe(400);
  });

  it("GET /search should return all successfully for similar name", async () => {
    const res = await request(app).get("/search/Product");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });
  it("GET /search should return for unique description", async () => {
    const res = await request(app).get("/search/AA");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Product A");
  });
  it("GET /search should empty for non existent search", async () => {
    const res = await request(app).get("/search/123");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
  it("GET /search should return for similar description and name", async () => {
    const extraProduct =   {
      _id: new mongoose.Types.ObjectId(),
      name: "Product AA",
      slug: "product-aa",
      description: "XXXX",
      price: 300,
      category: categories[1]._id,
      quantity: 1,
      shipping: false,
    };
    await productModel.create(extraProduct);
    const res = await request(app).get("/search/AA");
    expect(res.status).toBe(200);
    let expectedProducts = new Set(["Product A", "Product AA"]);
    expect(res.body).toHaveLength(2);
    res.body.forEach(p => expectedProducts.delete(p.name));
    expect(expectedProducts.size).toBe(0);
    await productModel.deleteMany({});
    await productModel.create(products);
  });
});

//Jamie's Code
describe('Test integration of product controllers and dependencies', () => {
  let mongoServer, req, res;
  const testCategory = new mongoose.Types.ObjectId();

  beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();

      await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });

  });

  beforeEach(async () => {
      await productModel.deleteMany({});
      await categoryModel.deleteMany({});
  });

  afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
  });

  test('should create a product', async () => {
      req = {
          fields: {
              name: 'Test Create Product',
              description: 'A description',
              price: 100,
              category: testCategory,
              quantity: 10,
              shipping: true,
          },
          files: {
              photo: {
                  size: 500000,
                  path: 'client/public/images/Virtual.png',
                  type: 'image/jpeg',
              },
          },
      };

      res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
      };

      await createProductController(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
          success: true,
          message: 'Product Created Successfully',
          products: expect.any(Object),
      }));
      const product = await productModel.findOne({ name: 'Test Create Product' });
      expect(product).not.toBeNull();
      expect(product.name).toBe('Test Create Product');

  }, 30000);

  test('should update a product', async () => {
      const existingProduct = await new productModel({
          name: 'Test Create Product',
          description: 'A description',
          price: 100,
          category: testCategory,
          quantity: 10,
          shipping: true,
          slug: slugify('Test Create Product'),
          photo: {
              data: fs.readFileSync('client/public/images/Virtual.png'),
              contentType:'image/jpeg'
          }
      }).save();
  
          req = {
              params: {
                  pid: existingProduct._id.toString(),
              },
              fields: {
                  name: 'Test Update Product',
                  description: 'Updated description',
                  price: 150,
                  category: testCategory,
                  quantity: 20,
                  shipping: false,
              },
              files: {
                  photo: {
                      path: 'client/public/images/Virtual.png',
                      type: 'image/jpeg',
                      size: 50000,
                  },
              },
          };
  
  
      res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
      };

      await updateProductController(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
          success: true,
          message: 'Product Updated Successfully',
          products: expect.any(Object),
      }));
      const product = await productModel.findOne({ name: 'Test Update Product' });
      expect(product).not.toBeNull();
      expect(product.name).toBe('Test Update Product');

  }, 30000);

  test('should delete a product', async () => {
      const existingProduct = await new productModel({
          name: 'Delete Product',
          description: 'A description',
          price: 100,
          category: testCategory,
          quantity: 10,
          shipping: true,
          slug: slugify('Test Create Product'),
          photo: {
              data: fs.readFileSync('client/public/images/Virtual.png'),
              contentType:'image/jpeg'
          }
      }).save();
  
          req = {
              params: {
                  pid: existingProduct._id.toString(),
              }
          };
  
  
      res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
      };

      await deleteProductController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
          success: true,
          message: 'Product Deleted successfully',
      }));
      const product = await productModel.findOne({ name: 'Delete Product' });
      expect(product).toBeNull();

  }, 30000);

  test('should get all products', async () => {
      const existingProduct = await new productModel({
          name: 'Product 1',
          description: 'A description',
          price: 100,
          category: testCategory,
          quantity: 10,
          shipping: true,
          slug: slugify('Test Create Product'),
          photo: {
              data: fs.readFileSync('client/public/images/Virtual.png'),
              contentType:'image/jpeg'
          }
      }).save();
      const existingProduct2 = await new productModel({
          name: 'Product 2',
          description: 'A description',
          price: 100,
          category: testCategory,
          quantity: 10,
          shipping: true,
          slug: slugify('Test Create Product'),
          photo: {
              data: fs.readFileSync('client/public/images/Virtual.png'),
              contentType:'image/jpeg'
          }
      }).save();
      req = {};
  
      res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
      };

      await getProductController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
          success: true,
          message: "ALlProducts ",
          counTotal: 2,
          products: expect.any(Array)
      });
      const product1 = await productModel.findOne({ name: 'Product 1' });
      const product2 = await productModel.findOne({ name: 'Product 2' });
      expect(product1).not.toBeNull();
      expect(product2).not.toBeNull();
  }, 30000);

 
});

/**
 * -------
 * Arkar
 * -------
 * Integration tests for
 * 
 * 1. productCategoryController   --  "/product-category/:slug"
 * 2. getSingleProductController  --  "/get-product/:slug"
 * 3. productPhotoController      --  "/product-photo/:pid"
 * 4. realtedProductController    --  "/related-product/:pid/:cid"
 */

jest.spyOn(console, 'log').mockImplementation(() => {});

const _app = express();   // _app instead of app to prevent name conflict
_app.use(express.json());
_app.use("/", router);

describe("productCategory integration test", () => {
  const testCategory = TEST_CATEGORIES[0];
  let cleanUp;

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    await mustMigrateUp()
    cleanUp = shutdownAll;
  });

  afterAll(async () => {
    await cleanUp();
  });

  const testCases = [
    {
      name: "GET products by valid cateogry",
      testCategorySlug: testCategory.slug,
      expectedStatus: 200,
      expectedBody: {
        success: true,
        category: testCategory,
        // expect 2 products
        products: expect.arrayContaining([
          expect.any(Object),
          expect.any(Object),
        ])
      }
    }, 
    {
      name: "Returns 404",
      testCategorySlug: "non-existent-category",
      expectedStatus: 404,
      expectedBody: {
        success: false,
        message: "Category does not exist",
      }
    }, 
  ]

  it.each(testCases)(
    "$name",
    async ({ testCategorySlug, expectedStatus, expectedBody }) => {
      let req = request(_app).get(`/product-category/${testCategorySlug}`)

      const response = await req.send();

      expect(response.status).toBe(expectedStatus);
      expect(response.body).toEqual(expect.objectContaining(expectedBody))
    }
  ); 
});

describe("getSingleProductController integration test", () => {
  const testProductSlug = "textbook";
  let cleanUp;

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    await mustMigrateUp()
    cleanUp = shutdownAll;
  });

  afterAll(async () => {
    await cleanUp();
  });

  const testCases = [
    {
      name: "GET single product details",
      testProductSlug: testProductSlug,
      expectedStatus: 200,
      expectedBody: {
        success: true,
        message: "Single Product Fetched",
        product: expect.objectContaining({
          name: "Textbook",
          slug: testProductSlug,
          price: 79.99,
          category: expect.objectContaining({ name: "Book" }),
          quantity: 50
        })
      }
    }, 
    {
      name: "Returns 404",
      testProductSlug: "non-existent-product",
      expectedStatus: 404,
      expectedBody: {
        success: false,
        message: "Product not found",
      }
    }, 
  ]

  it.each(testCases)(
    "$name",
    async ({ testProductSlug, expectedStatus, expectedBody }) => {
      let req = request(_app).get(`/get-product/${testProductSlug}`)

      const response = await req.send();

      expect(response.status).toBe(expectedStatus);
      expect(response.body).toEqual(expect.objectContaining(expectedBody))
    }
  ); 
})

describe("productPhotoController integration test", () => {
  let cleanUp, testProduct;

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    await mustMigrateUp()
    testProduct = await getTestProduct()
    cleanUp = shutdownAll;
  });

  afterAll(async () => {
    await cleanUp();
  });

  const testCases = [
    {
      name: "Returns 200 when product photo exists",
      productId: () => testProduct._id.toHexString(),
      expectedStatus: 200,
      headerMatcher: (headers) => {
        expect(headers["content-type"]).toBe(testProduct.photo.contentType);
      },
      bodyMatcher: (body) => {
        expect(Buffer.compare(body, Buffer.from(testProduct.photo.data))).toBe(0);
      },
    },
    {
      name: "Returns 404 when product does not exist",
      productId: () => new mongoose.Types.ObjectId().toHexString(),
      expectedStatus: 404,
      headerMatcher: (headers) => expect(headers).toEqual(expect.any(Object)),
      bodyMatcher: (body) => expect(body).toEqual({
        success: false,
        message: "Product does not exist",
      }),
    },
    {
      name: "Returns 400 when product ID format is invalid",
      productId: () => "invalid-id",
      expectedStatus: 400,
      headerMatcher: (headers) => expect(headers).toEqual(expect.any(Object)),
      bodyMatcher: (body) => expect(body).toEqual({
        success: false,
        message: "Invalid product id format",
      }),
    },
  ];

  it.each(testCases)(
    "$name",
    async ({ productId, expectedStatus, headerMatcher, bodyMatcher }) => {
      let req = request(_app).get(`/product-photo/${productId()}`);

      const response = await req.send();
      expect(response.status).toBe(expectedStatus);
      headerMatcher(response.headers);
      bodyMatcher(response.body);
    }
  );
})

describe("realtedProductController integration test", () => {
  const { _id, category } = TEST_PRODUCTS[0]
  const pId = _id.$oid
  const cId = category.$oid 

  let cleanUp;

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    await mustMigrateUp()
    cleanUp = shutdownAll;
  });

  afterAll(async () => {
    await cleanUp();
  });

  const testCases = [
    {
      name: "Returns 200 when related products exists",
      params: { pid: pId, cid: cId },
      expectedStatus: 200,
      bodyMatcher: (body) => {
        expect(body).toEqual(expect.objectContaining({
          success: true,
          products: expect.any(Array)
        }))
        expect(body.products.length).toBeGreaterThan(0);
        body.products.forEach((product) => {
          expect(product._id).not.toEqual(pId);
        });
      },
    },
    {
      name: "Returns 400 when product ID format is invalid",
      params: { pid: "invalid", cid: cId },
      expectedStatus: 400,
      bodyMatcher: (body) => expect(body).toEqual({
        success: false,
        message: "Invalid product id or category id format",
      }),
    },
  ];

  it.each(testCases)(
    "$name",
    async ({ params, expectedStatus, bodyMatcher }) => {
      let req = request(_app).get(`/related-product/${params.pid}/${params.cid}`);

      const response = await req.send();
      expect(response.status).toBe(expectedStatus);
      bodyMatcher(response.body);
    }
  );
})
