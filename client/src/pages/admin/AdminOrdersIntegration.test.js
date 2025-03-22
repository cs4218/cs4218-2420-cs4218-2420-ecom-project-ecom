import React from "react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminOrders from "./AdminOrders";
import { AuthContext, AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";

import dotenv from "dotenv";

dotenv.config();
let authToken;

beforeAll(async () => {
  axios.defaults.baseURL = 'http://localhost:6060';
  try {
    const loginResponse = await axios.post('/api/v1/auth/login', {
      email: process.env.TEST_ADMIN_USER, 
      password: process.env.TEST_ADMIN_PASS    
    });
    
    authToken = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = authToken;
  } catch (error) {
    console.error("Authentication failed:", error.response?.data || error.message);
  }

});


const mockAuth = { 
    user : {
        name : "John Doe",
        email : "mockemail@email.com",
        phone : "90123456",
        role : 1,
    },
    token: 1
}

describe("AdminOrders ", () => {
    test("get orders upon valid auth token and successful api", async () => {
        render(
            <AuthContext.Provider value={[mockAuth]}>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <AdminOrders />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthContext.Provider>
        );

        // orders
        await waitFor(() => {
            expect(screen.getByText("Book")).toBeInTheDocument();
            expect(screen.getByText("Status")).toBeInTheDocument();
            expect(screen.getByText("NUS T-shirt")).toBeInTheDocument();
        }, { timeout: 10000 });


         // admin menu
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
        expect(screen.getByText("Create Category")).toHaveAttribute('href', "/dashboard/admin/create-category");
        expect(screen.getByText("Create Product")).toHaveAttribute('href', "/dashboard/admin/create-product");
        expect(screen.getByText("Products")).toHaveAttribute('href', "/dashboard/admin/products");
        expect(screen.getByText("Orders")).toHaveAttribute('href', "/dashboard/admin/orders");
        expect(screen.getByText("Users")).toHaveAttribute('href', "/dashboard/admin/users");

        // layout
        expect(screen.getByText("🛒 Virtual Vault")).toHaveAttribute('href', "/");
        expect(screen.getByText("Home")).toHaveAttribute('href', "/");
        expect(screen.getByText("Categories")).toHaveAttribute('href', "/categories");
        expect(screen.getByText("All Categories")).toHaveAttribute('href', "/categories");
        expect(screen.getByText(mockAuth.user.name)).toHaveAttribute('href', "/");
        expect(screen.getByText("All Categories")).toHaveAttribute('href', "/categories");
        expect(screen.getByText("Dashboard")).toHaveAttribute('href', "/dashboard/admin");    
        expect(screen.getByText("Cart")).toHaveAttribute('href', "/cart");    
    }, 15000);

})