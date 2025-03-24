import categoryModel from "../models/categoryModel.js";
import userModel from "../models/userModel.js";
import categories from "./data/test.categories.json" with { type: "json" };
import products from "./data/test.products.json" with { type: "json" };
import adminUser from "./data/test.users.json" with { type: "json" };

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";

let mongoServer;

export const startInMemDB = async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    // mongoose.set("debug", true);
  }

  return {
    shutdownAll: async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
      }
    }
  };
};


export const mustMigrateUp = async () => {
  try {
    await userModel.collection.insertOne(adminUser);
    await categoryModel.collection.insertMany(
      categories.map((cat) => ({
        ...cat,
        _id: new mongoose.Types.ObjectId(cat._id),
      }))
    );
    await productModel.collection.insertMany(
      products.map((prod) => ({
        ...prod,
        _id: new mongoose.Types.ObjectId(prod._id.$oid),
        category: new mongoose.Types.ObjectId(prod.category.$oid), // Ensure category ID is also converted
      }))
    );

    const product = new productModel({
      name: "Minimal product",
      slug: "minimal-product",
      description: "Test",
      price: 79.99,
      category: new mongoose.Types.ObjectId("66db427fdb0119d9234b27ef"),
      quantity: 50,
      photo: {
        data: Buffer.from("sample photo data", "utf-8"),
        contentType: "image/jpeg",
      },
      shipping: false,
    });
    await product.save();
  } catch (error) {
    console.error("Error in migrateUp:", error);
    process.exit(1);
  }
}

export const mustMigrateDown = async () => {
  try {
    await categoryModel.collection.deleteMany({});
    await userModel.collection.deleteMany({});
    await productModel.collection.deleteMany({})
  } catch (error) {
    console.error("Error in migrateDown:", error);
    process.exit(1);
  }
}

export const getAdminUserId = async () => {
  try {
    const user = await userModel.findOne({})
    return user._id
  } catch (error) {
    console.error("Error in retrieving test admin user")
  }
}

export const getTestCategory = async () => {
  try {
    const category = await categoryModel.findOne({ name: "Electronics" })
    return category
  } catch (error) {
    console.error("Error in retrieving test category")
  }
}

export const getTestProduct = async () => {
  try {
    const product = await productModel.findOne({ name: "Minimal product" })
    return product 
  } catch (error) {
    console.error("Error in retrieving test product")
  }
}