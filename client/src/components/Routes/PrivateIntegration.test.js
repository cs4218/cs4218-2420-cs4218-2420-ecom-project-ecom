import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/auth";
import PrivateRoute from "./Private";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
let authToken;

beforeAll(async () => {
  axios.defaults.baseURL = 'http://localhost:6060'; 
});


const mockAuth = { user : {
    name : "John Doe",
    email : "mockemail@email.com",
    phone : "90123456",
    role : 1
  },
  token: 1
}

describe("Private Route Integration Test", () => {
  test("renders spinner when not authenticated", async() => {
      render(
        <AuthContext.Provider value={[mockAuth]}>
          <MemoryRouter>
            <PrivateRoute />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      }, { timeout: 10000 });
  }, 15000)

  test("renders outlet when authenticated", async() => {
      try {
        const loginResponse = await axios.post('/api/v1/auth/login', {
          email: process.env.TEST_NORMAL_USER, 
          password: process.env.TEST_NORMAL_PASS    
        });
        
        authToken = loginResponse.data.token;
        axios.defaults.headers.common['Authorization'] = authToken;
        
        console.log("Successfully authenticated with token");
      } catch (error) {
        console.error("Authentication failed:", error.response?.data || error.message);
      }
      render(
        <AuthContext.Provider value={[mockAuth]}>
          <MemoryRouter>
            <PrivateRoute />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
  }, 15000)

});