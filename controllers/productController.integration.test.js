import express from "express";
import mongoose from "mongoose";
import request from "supertest";

import TEST_CATEGORIES from "../utils/data/test.categories.json" with { type: "json" };
import TEST_PRODUCTS from "../utils/data/test.products.json" with { type: "json" };

import router from "../routes/productRoutes";
import {
  getTestProduct,
  mustMigrateUp,
  startInMemDB
} from "../utils/testUtils";

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