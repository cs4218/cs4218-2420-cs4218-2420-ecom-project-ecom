import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import path from 'path';
import userModel from '../../../../models/userModel';
import toast from 'react-hot-toast';
import '@testing-library/jest-dom/extend-expect';

jest.mock("react-hot-toast");

const serverPath = path.join(__dirname, '../../../../server.js');

const mockNavigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigateFunction,
}));

jest.setTimeout(20000);
axios.defaults.baseURL = 'http://localhost:6060';

// Render Login component
const renderLoginComp = () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );
};

// Sample user input for login
const loginSampleInput = {
    email: "test@example.com",
    password: "password123",
};

// Integration Test Suite
describe('Login Component Integration with Auth API', () => {
    let memMongoDB;
    let serverProcess;

    beforeEach(async () => {
        jest.clearAllMocks();

        // Initialize in-memory MongoDB
        memMongoDB = await MongoMemoryServer.create();
        const mongoUri = memMongoDB.getUri();
        process.env.MONGO_URL = mongoUri;
        await mongoose.connect(mongoUri);

        // Create a sample user in the database
        await userModel.create({
            name: "John Doe",
            email: loginSampleInput.email,
            password: "password123", // In a real scenario, this should be hashed
        });

        // Start the server
        serverProcess = spawn('node', [serverPath], {
            stdio: 'inherit',
            env: { 
                ...process.env,
                MONGO_URL: mongoUri 
            }
        });
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for the server to start
    });

    afterEach(async () => {
        // Clean up
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await memMongoDB.stop();
        serverProcess.kill();
    });

    it("should login the user successfully and redirect to the home page", async () => {
        renderLoginComp();
        
        // Fill in the login form
        fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
            target: { value: loginSampleInput.email },
        });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
            target: { value: loginSampleInput.password },
        });
        fireEvent.click(screen.getByText("LOGIN"));

        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
        expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/login", loginSampleInput);

        // Check for success toast
        expect(toast.success).toHaveBeenCalledTimes(1);
        expect(mockNavigateFunction).toHaveBeenCalledWith('/'); // Assuming home page is the default redirect

        // Verify user is stored in localStorage
        const storedAuth = JSON.parse(window.localStorage.getItem("auth"));
        expect(storedAuth).toBeTruthy();
        expect(storedAuth.user.email).toBe(loginSampleInput.email);
    });

    it("should display error message on failed login", async () => {
        // Mocking the API call to simulate failed login
        axios.post.mockRejectedValueOnce({ response: { data: { message: "Invalid credentials" } } });

        renderLoginComp();
        
        // Fill in the login form
        fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
            target: { value: loginSampleInput.email },
        });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
            target: { value: loginSampleInput.password },
        });
        fireEvent.click(screen.getByText("LOGIN"));

        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
});
