import mongoose from "mongoose";
import mockingoose from 'mockingoose';
import userModel from "./userModel";

// Reset mocks before each test to avoid interference
beforeEach(() => {
  mockingoose.resetAll();
});

describe("User Model", () => {
  
  it("should create a new user with default role 0", async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dan Ling",
      email: "xxx@gmail.com",
      password: "password123",
      phone: "1234567890",
      address: {},
      answer: "My answer",
      role: 0, // Default role is 0
    };

    mockingoose(userModel).toReturn(mockUser, "save");

    const user = new userModel(mockUser);
    const savedUser = await user.save();

    expect(savedUser.role).toBe(0);
    expect(savedUser.name).toBe("Dan Ling");
    expect(savedUser.email).toBe("xxx@gmail.com");  
  });

  it("should throw an error if the email is not unique", async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dan Ling",
      email: "xxx@gmail.com",
      password: "password123",
      phone: "1234567890",
      address: {},
      answer: "My answer",
    };

    // Simulate duplicate key error
    mockingoose(userModel).toReturn(new Error("duplicate key error collection: users index: email_1 dup key"), "save");

    const user = new userModel(mockUser);
    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeTruthy();
    expect(error.message).toContain("duplicate key error collection: users index: email_1 dup key");
  });

  it("should throw an error if 'email' is missing", async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dan Ling",
      password: "password123",
      phone: "1234567890",
      address: {},
      answer: "My answer",
      role: 0,
    };

    const user = new userModel(mockUser);
    let error;
    try {
      await user.validate(); 
    } catch (err) {
      error = err;
    }

    expect(error).toBeTruthy();
    expect(error.message).toContain("Path `email` is required.");
  });

  it("should throw an error if 'phone' is missing", async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dan Ling",
      email: "xxx@gmail.com",  
      password: "password123",
      address: {},
      answer: "My answer",
      role: 0,
    };

    const user = new userModel(mockUser);
    let error;
    try {
      await user.validate(); 
    } catch (err) {
      error = err;
    }

    expect(error).toBeTruthy();
    expect(error.message).toContain("Path `phone` is required.");
  });

  it("should retrieve a user from the database by email", async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dan Ling",
      email: "xxx@gmail.com",  
      password: "password123",
      phone: "1234567890",
      address: {},
      answer: "My answer",
      role: 0,
    };

    mockingoose(userModel).toReturn(mockUser, "findOne");

    const foundUser = await userModel.findOne({ email: mockUser.email });

    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe(mockUser.email);
    expect(foundUser.name).toBe(mockUser.name);
  });

  it("should update a user's name", async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dan Ling",
      email: "xxx@gmail.com",  
      password: "password123",
      phone: "1234567890",
      address: {},
      answer: "My answer",
      role: 0,
    };
  
    const updatedMockUser = {
      ...mockUser,
      name: "Dan Ling X",
    };
  
    // Mock the findOneAndUpdate method to return the updated user
    mockingoose(userModel).toReturn(updatedMockUser, "findOneAndUpdate");
  
    const updatedUser = await userModel.findByIdAndUpdate(
      mockUser._id,
      { name: "Dan Ling X" },
      { new: true }
    );
  
    expect(updatedUser.name).toBe("Dan Ling X");
  });

  it("should delete a user from the database", async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dan Ling",
      email: "xxx@gmail.com",  
      password: "password123",
      phone: "1234567890",
      address: {},
      answer: "My answer",
    };

    mockingoose(userModel).toReturn(mockUser, "findOneAndDelete");

    const deletedUser = await userModel.findByIdAndDelete(mockUser._id);

    expect(deletedUser).not.toBeNull();
    expect(deletedUser._id.toString()).toBe(mockUser._id.toString());
  });

});
