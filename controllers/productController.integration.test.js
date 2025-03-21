import express from "express";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import router from "../routes/productRoutes";
import productModel from "../models/productModel";
import request from "supertest";
import "dotenv/config";

jest.spyOn(console, 'log').mockImplementation(() => {});
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
