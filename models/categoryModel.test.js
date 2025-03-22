import categoryModel from "./categoryModel";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

describe("Test categoryModel", () => {
  let categoryData;

  beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
  });

  beforeEach(async () => {
    categoryData = {};
  });

  afterEach(async () => {
      await categoryModel.deleteMany({});
  });

  afterAll(async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongoServer.stop();
  });

  test("Save correctly", async () => {
    categoryData.name = "Mock Category";
    categoryData.slug = "slug";
    const category = new categoryModel(categoryData);
    const savedCategory = await category.save();

    expect(savedCategory._id).toBeDefined();
    expect(savedCategory.name).toBe("Mock Category");
    expect(savedCategory.slug).toBe("slug");
  });
});
