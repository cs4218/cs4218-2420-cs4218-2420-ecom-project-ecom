import mongoose from "mongoose";
import connectDB from "./db";

jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

describe("Database Connection", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should connect to MongoDB successfully", async () => {
    const mockConnection = { connection: { host: "localhost" } };
    mongoose.connect.mockResolvedValue(mockConnection);

    console.log = jest.fn(); // Mock console.log to suppress actual logs

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/Connected To Mongodb Database localhost/i)
    );
  });

  test("should handle MongoDB connection errors", async () => {
    const mockError = new Error("MongoDB connection failed");
    mongoose.connect.mockRejectedValue(mockError);

    console.log = jest.fn(); // Mock console.log to suppress actual logs

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/Error in Mongodb/i)
    );
  });
});