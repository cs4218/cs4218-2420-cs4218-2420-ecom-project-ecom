import express from "express";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";

import TEST_CATEGORIES from "../utils/data/test.categories.json" with { type: "json" };

import router from "../routes/categoryRoutes";
import {
  getAdminUserId,
  getTestCategory,
  mustMigrateDown,
  mustMigrateUp,
  startInMemDB
} from "../utils/testUtils";

jest.spyOn(console, 'log').mockImplementation(() => {});

const addAuthorization = (request, userId) => {
  const token = JWT.sign({ _id: userId }, process.env.JWT_SECRET)
  request.set("Authorization", `${token}`);
  return request
}

const app = express();
app.use(express.json());
app.use("/", router);

describe("categoryController integration test", () => {
  let cleanUp

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    await mustMigrateUp()
    cleanUp = shutdownAll;
  });

  afterAll(async () => {
    await cleanUp();
  });

  it("GET /get-category should return 200 with all categories", async () => {
    const response = await request(app).get("/get-category");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      category: expect.arrayContaining([
        expect.objectContaining({ name: TEST_CATEGORIES[0].name, slug: TEST_CATEGORIES[0].slug }),
        expect.objectContaining({ name: TEST_CATEGORIES[1].name, slug: TEST_CATEGORIES[1].slug }),
        expect.objectContaining({ name: TEST_CATEGORIES[2].name, slug: TEST_CATEGORIES[2].slug }),
      ]),
      success: true,
      message: "All Categories List"
    });
  });

  it("GET /get-category should return empty categories", async () => {
    await mustMigrateDown(); 
    
    const response = await request(app).get("/get-category");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "All Categories List",
      category: []
    })
  })
});

describe("singleCategoryController Integration Test", () => {
  let cleanUp;

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    await mustMigrateUp();
    cleanUp = shutdownAll;
  });

  afterAll(async () => {
    await cleanUp();
  });

  it("GET /single-category/:slug should return 200", async () => {
    const expectedCategory = TEST_CATEGORIES[0]
    const response = await request(app).get(`/single-category/${expectedCategory.slug}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: "Get Single Category Successfully",
        category: expect.objectContaining({
          name: expectedCategory.name,
          slug: expectedCategory.slug,
        }),
      })
    );
  });

  it("GET /single-category/:slug should return null category", async () => {
    const nonExistentCategory = "non-existent"
    const response = await request(app).get(`/single-category/${nonExistentCategory.slug}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: "Get Single Category Successfully",
        category: null,
      })
    );
  })
});

describe("createCategoryController Integration Test", () => {
  let cleanUp, adminUserId;

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    cleanUp = shutdownAll;
  });

  beforeEach(async () => {
    await mustMigrateUp();
    adminUserId = await getAdminUserId();
  });

  afterEach(async () => {
    await mustMigrateDown();
  });

  afterAll(async () => {
    await cleanUp();
  });

  const testCases = [
    {
      name: "Successfully Creates Category",
      inputData: { name: "Kitchen" },
      setupAuth: (req) => addAuthorization(req, adminUserId),
      expectedStatus: 201,
      expectedBody: {
        message: "new category created"
      }
    },
    {
      name: "Unauthorized Request",
      inputData: { name: "Kitchen" },
      setupAuth: (req) => addAuthorization(req, "invalid-auth"),
      expectedStatus: 401,
      expectedBody: {
        success: false,
        error: expect.any(Object), // mongoose errors are objects
        message: "Error in admin middleware",
    }
    },
    {
      name: "Malformed category name",
      inputData: { name: "  " },
      setupAuth: (req) => addAuthorization(req, adminUserId),
      expectedStatus: 400,
      expectedBody: {
        message: "Name is required"
      }
    },
    {
      name: "Duplicate Category",
      inputData: { name: "Electronics" },
      setupAuth: (req) => addAuthorization(req, adminUserId),
      expectedStatus: 200,
      expectedBody: {
        success: false,
        message: "Category Already Exisits"
      }
    },
  ]

  it.each(testCases)
    ("$name", async ({ inputData, setupAuth, expectedStatus, expectedBody }) => {
      let req = request(app).post("/create-category")
      req = setupAuth(req);

      const response = await req.send(inputData);

      expect(response.status).toBe(expectedStatus);
      expect(response.body).toEqual(expect.objectContaining(expectedBody))
    });
})

describe("updateCategoryController Integration Test", () => {
  let cleanUp, adminUserId, testCategory;

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    cleanUp = shutdownAll;
  });

  beforeEach(async () => {
    await mustMigrateUp();
    adminUserId = await getAdminUserId();
    testCategory = await getTestCategory();
  });

  afterEach(async () => {
    await mustMigrateDown();
  });

  afterAll(async () => {
    await cleanUp();
  });

  const testCases = [
    {
      name: "Successfully updates Category",
      inputData: { name: "Kitchen" },
      setupAuth: (req) => addAuthorization(req, adminUserId),
      expectedStatus: 200,
      expectedBody: {
        success: true,
        message: "Category Updated Successfully"
      }
    },
    {
      name: "Unauthorized Request",
      inputData: { name: "Kitchen" },
      setupAuth: (req) => addAuthorization(req, "invalid-auth"),
      expectedStatus: 401,
      expectedBody: {
        success: false,
        error: expect.any(Object), // mongoose errors are objects
        message: "Error in admin middleware",
      }
    },
    {
      name: "Prevent duplicate category",
      inputData: { name: "Book" },
      setupAuth: (req) => addAuthorization(req, adminUserId),
      expectedStatus: 400,
      expectedBody: {
        success: false,
        message: "Category already exists"
      }
    },
  ]

  it.each(testCases)
    ("$name", async ({ inputData, setupAuth, expectedStatus, expectedBody }) => {
      let req = request(app).put(`/update-category/${testCategory._id.toHexString()}`)
      req = setupAuth(req);

      const response = await req.send(inputData);

      expect(response.status).toBe(expectedStatus);
      expect(response.body).toEqual(expect.objectContaining(expectedBody))
    }); 
})

describe("deleteCategoryController Integration Test", () => {
  let cleanUp, adminUserId, testCategory;

  beforeAll(async () => {
    const { shutdownAll } = await startInMemDB();
    cleanUp = shutdownAll;
  });

  beforeEach(async () => {
    await mustMigrateUp();
    adminUserId = await getAdminUserId();
    testCategory = await getTestCategory();
  });

  afterEach(async () => {
    await mustMigrateDown();
  });

  afterAll(async () => {
    await cleanUp();
  });

  const testCases = [
    {
      name: "Successfully delete Category",
      supplyUriParam: () => testCategory._id,
      setupAuth: (req) => addAuthorization(req, adminUserId),
      expectedStatus: 200,
      expectedBody: {
        success: true,
        message: "Categry Deleted Successfully"
      }
    },
    {
      name: "Unauthorized Request",
      supplyUriParam: () => testCategory._id,
      setupAuth: (req) => addAuthorization(req, "invalid-auth"),
      expectedStatus: 401,
      expectedBody: {
        success: false,
        error: expect.any(Object), // mongoose errors are objects
        message: "Error in admin middleware",
      }
    },
    {
      name: "Throws 404",
      supplyUriParam: () => new mongoose.Types.ObjectId().toString(),
      setupAuth: (req) => addAuthorization(req, adminUserId),
      expectedStatus: 404,
      expectedBody: {
        success: false,
        message: "Categry Does Not Exist"
      }
    },
  ]

  it.each(testCases)
    ("$name", async ({ supplyUriParam, setupAuth, expectedStatus, expectedBody }) => {
      const uriParam = supplyUriParam()
      let req = request(app).delete(`/delete-category/${uriParam}`)
      req = setupAuth(req);

      const response = await req.send();

      expect(response.status).toBe(expectedStatus);
      expect(response.body).toEqual(expect.objectContaining(expectedBody))
    });
})
