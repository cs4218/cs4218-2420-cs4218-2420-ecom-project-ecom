import categoryModel from "../models/categoryModel.js";
import userModel from "../models/userModel.js";
import categories from "./data/test.categories.json" with { type: "json" };
import adminUser from "./data/test.users.json" with { type: "json" };

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

export const startInMemDB = async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
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
    await categoryModel.collection.insertMany(categories);
    await userModel.collection.insertOne(adminUser);
  } catch (error) {
    console.error("Error in migrateUp:", error);
    process.exit(1);
  }
}

export const mustMigrateDown = async () => {
  try {
    await categoryModel.collection.deleteMany({});
    await userModel.collection.deleteMany({});
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