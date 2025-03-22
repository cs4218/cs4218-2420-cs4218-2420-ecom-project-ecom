import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import router from "../routes/productRoutes";
import productModel from "../models/productModel";
import request from "supertest";
import "dotenv/config";
import slugify from "slugify";
import fs from "fs";
import {
  createProductController,
  updateProductController,
  deleteProductController,
  getProductController,
} from "./productController"; 
import categoryModel from "../models/categoryModel";


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



