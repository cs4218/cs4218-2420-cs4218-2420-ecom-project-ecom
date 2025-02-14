const mongoose = jest.createMockFromModule('mongoose');

const mockModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
};

mongoose.Schema = class {}; // Prevent schema initialization
mongoose.model = jest.fn(() => mockModel);
mongoose.connect = jest.fn(); // Prevent actual DB connection

export default mongoose;