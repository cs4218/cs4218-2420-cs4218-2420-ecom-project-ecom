import mongoose from "mongoose";
import connectDB from "./db";

jest.mock("mongoose");

describe("Test ConnectDB", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Successful Connection", async () => {
        mongoose.connect = jest.fn().mockResolvedValue({connection: {host: "localhost"}});
        const consoleLogSpy = jest.spyOn(console, "log");

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Connected To Mongodb Database localhost"));

        // Resets the spy of console log
        consoleLogSpy.mockRestore();
    });

    test("Failed Connection", async () => {
        mongoose.connect = jest.fn().mockRejectedValue(new Error("Connection Error"));
        const consoleLogSpy = jest.spyOn(console, "log");

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Error in Mongodb Error: Connection Error"));
        consoleLogSpy.mockRestore();

    })
})