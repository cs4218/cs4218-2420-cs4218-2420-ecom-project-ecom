import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { AuthContext } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import { AuthProvider } from "../../context/auth";

const mockAuth = { user : {
    name : "John Doe",
    email : "mockemail@email.com",
    phone : "90123456",
    role : 1
}}


describe("Admin Dashboard Integration Test", () => {
    test("renders admin dashboard with related components", async() => {
        localStorage.setItem('auth', JSON.stringify(mockAuth));
        render(
            <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <AdminDashboard />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );
        
        // dashboard components
        expect(screen.getByText("Admin Name : " + mockAuth.user.name)).toBeInTheDocument();
        expect(screen.getByText("Admin Email : " + mockAuth.user.email)).toBeInTheDocument();
        expect(screen.getByText("Admin Contact : " + mockAuth.user.phone)).toBeInTheDocument();
        
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
    })

    test("renders admin dashboard with no user details when auth is null", async () => {
        render(
            <AuthContext.Provider value={[null]}>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <AdminDashboard />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthContext.Provider>
        );

        expect(screen.getByText("Admin Name :")).toBeInTheDocument();
        expect(screen.getByText("Admin Email :")).toBeInTheDocument();
        expect(screen.getByText("Admin Contact :")).toBeInTheDocument();
    })
});