import connectDB from './db';
import mongoose from 'mongoose';


jest.mock("mongoose", () => ({
    connect: jest.fn(),
}));

describe('connectDB', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    })

    it('should log success message for successful db connection', async () => {
        mongoose.connect.mockResolvedValue({
            connection: { host: 'mongo-hostname' }
        });
        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
        expect(consoleLogSpy).toHaveBeenCalledWith('Connected To Mongodb Database mongo-hostname'.bgMagenta.white);
    });

    it.failing('should log error message for unsuccessful db connection', async () => {
        const err = new Error('test error');
        mongoose.connect.mockRejectedValue(err);
        await connectDB();

        expect(consoleLogSpy).toHaveBeenCalledWith('Error in Mongodb: test error'.bgRed.white);
    })
});