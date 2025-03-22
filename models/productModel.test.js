import productModel from "./productModel";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

describe("Test productModel", () => {
  let productData;
  beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
  });

  
  beforeEach(async () => {
    
    productData = {
      slug: "slug",
      description: "description",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
    };
  });
  
  afterEach(async () => {
      await productModel.deleteMany({});
  });
  
  afterAll(async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongoServer.stop();
  });

  test("Save correctly", async () => {
    productData.name = "Mock Product";
    const product = new productModel(productData);
    const savedProduct = await product.save();

    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe("Mock Product");
    expect(savedProduct.slug).toBe("slug");
    expect(savedProduct.description).toBe("description");
    expect(savedProduct.price).toBe(100);
    expect(savedProduct.quantity).toBe(1);
  });

  test("Error occurs upon missing name field", async () => {
    let error;
    try {
      const product = new productModel(productData);
      const savedProduct = await product.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
