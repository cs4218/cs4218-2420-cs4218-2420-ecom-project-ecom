import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import Register from './Register';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import path from 'path';
import userModel from '../../../../models/userModel';
import '@testing-library/jest-dom/extend-expect';

jest.mock("react-hot-toast");

jest.mock('./../../components/Layout', () => ({ children }) => <div><h1>Mocked Register - Ecommerce App</h1><div>{ children }</div></div>);

const mockNavigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigateFunction,
}));

jest.setTimeout(20000);
axios.defaults.baseURL = 'http://localhost:6060';
const serverPath = path.join(__dirname, '../../../../server.js');

//Render Register component
const renderRegisterComp = () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
} 

// Registration Input
const registerSampleInput = {
    name: "John Doe",
    email: "test@example.com",
    password: "password123",
    phone: "1234567890",
    address: "123 Street",
    DOB: "2000-01-01",
    answer: "Football",
}

//Fill in registration fields and submit register form
const fillInRegisterForm = (registerInput) => {
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: registerInput.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: registerInput.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: registerInput.password },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: registerInput.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: registerInput.address },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your DOB"), {
      target: { value: registerInput.DOB },
    });
    fireEvent.change(screen.getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: registerInput.answer },
    });
}

describe('Register Component integration with registerController', () => {
    let userCollection = 'users';
    let memMongoDB;
    let serverProcess;


    beforeEach(async () => {
        jest.clearAllMocks();

        // Init in-memory MongoDB 
        memMongoDB = await MongoMemoryServer.create();
        const mongoUri = memMongoDB.getUri();
        process.env.MONGO_URL = mongoUri;
        await mongoose.connect(mongoUri);
        await mongoose.connection.createCollection(userCollection);

        // Start the server
        serverProcess = spawn('node', [serverPath], {
            stdio: 'inherit',
            env: { 
                ...process.env,
                MONGO_URL: mongoUri 
            }
        });
        await new Promise(resolve => setTimeout(resolve, 10000)); 
    });


    afterEach(async () => {
        // Close all connection
        await mongoose.connection.dropCollection(userCollection);
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await memMongoDB.stop();

        serverProcess.kill();
    });

    it("should register the user successfully and redirect to login page", async () => {
        renderRegisterComp();
        fillInRegisterForm(registerSampleInput);
        fireEvent.click(screen.getByText("REGISTER"));

        await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
        expect(toast.success).toHaveBeenCalledWith("Register Successfully, please login");
        expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
        expect(mockNavigateFunction).toHaveBeenCalledWith('/login');

        const user = await userModel.findOne({ email: registerSampleInput.email });
        expect(user).toBeTruthy();
        expect(user.name).toBe(registerSampleInput.name);
        expect(user.email).toBe(registerSampleInput.email);
        expect(user.phone).toBe(registerSampleInput.phone);
        expect(user.address).toBe(registerSampleInput.address);
        expect(user.answer).toBe(registerSampleInput.answer);
    });

});