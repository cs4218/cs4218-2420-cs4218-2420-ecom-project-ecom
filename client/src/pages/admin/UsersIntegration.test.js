import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, waitFor } from "@testing-library/react";
import Users from "./Users";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
let authToken, mockAuth;

beforeAll(async () => {
  axios.defaults.baseURL = 'http://localhost:6060';
  try {
    const loginResponse = await axios.post('/api/v1/auth/login', {
      email: process.env.TEST_ADMIN_USER, 
      password: process.env.TEST_ADMIN_PASS    
    });
    authToken = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = authToken;
    console.log("User Integration Test")
    console.log(axios.defaults.headers.common['Authorization']);
    console.log("Successfully authenticated with token");
  } catch (error) {
    console.error("Authentication failed:", error.response?.data || error.message);
  }

  mockAuth = {
    user: {
        email: "john@example.com", 
        name: "John Doe", 
        phone: "90123456", 
        address: "Test address"
    },
    token : 1
  };  
  
})
describe("Users Integration Test", () => {
    test("Renders the Users page and show all users", async () => {
       
        localStorage.setItem('auth', JSON.stringify(mockAuth));

        render(
            <AuthProvider>
            <CartProvider>
              <SearchProvider>
                <MemoryRouter>
                    <Users />
                </MemoryRouter>
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        );

        expect(screen.getByText("All Users")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText("Daniel")).toBeInTheDocument();
            expect(screen.getByText("Daniel@gmail.com")).toBeInTheDocument();

            expect(screen.getByText("Test 3")).toBeInTheDocument();
            expect(screen.getByText("hello@test.com")).toBeInTheDocument();

            expect(screen.getAllByText("test@test123.com")[0]).toBeInTheDocument();
            expect(screen.getAllByText("test@test123.com")[1]).toBeInTheDocument();

            expect(screen.getByText("Test")).toBeInTheDocument();
            expect(screen.getByText("test@admin.com")).toBeInTheDocument();

            expect(screen.getByText("asdf")).toBeInTheDocument();
            expect(screen.getByText("asdf@gmail.com")).toBeInTheDocument();

            expect(screen.getAllByText("admin@test.sg")[0]).toBeInTheDocument();
            expect(screen.getAllByText("admin@test.sg")[1]).toBeInTheDocument();

            expect(screen.getByText("MyAdmin")).toBeInTheDocument();
            expect(screen.getByText("admin@admin.com")).toBeInTheDocument();

            expect(screen.getByText("user@test.comuser@test.com")).toBeInTheDocument();
            expect(screen.getByText("usertest.comuser@test.com")).toBeInTheDocument();

            expect(screen.getAllByText("test@gmail.com")[0]).toBeInTheDocument();
            expect(screen.getAllByText("test@gmail.com")[1]).toBeInTheDocument();

            expect(screen.getAllByText("user@test.com")[0]).toBeInTheDocument();
            expect(screen.getAllByText("user@test.com")[1]).toBeInTheDocument();

            expect(screen.getByText("CS 4218 Test Account")).toBeInTheDocument();
            expect(screen.getByText("cs4218@test.com")).toBeInTheDocument();
        }, {timeout: 8000})
    }, 10000);

})
