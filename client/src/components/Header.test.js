import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Header from "./Header";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";

// Mock the necessary hooks
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../hooks/useCategory", () => jest.fn());

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

jest.mock("./Form/SearchInput", () => jest.fn());

// Helper function to wrap component with router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Header Component", () => {
    test("renders Home link", () => {
        useAuth.mockReturnValue([null, jest.fn()]); // No user authenticated
        useCart.mockReturnValue([[]]); // Empty cart
        useCategory.mockReturnValue([
            { _id: "1", name: "Category 1", slug: "category-1" }, // Mock a category
        ]);
        renderWithRouter(<Header />);
    
        const homeLink = screen.getByText(/Home/i);
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute("href", "/");
    });
      
    test("renders Register and Login links when user is not authenticated", () => {
        useAuth.mockReturnValue([null, jest.fn()]); // No user authenticated
        useCart.mockReturnValue([[]]); // Empty cart
        useCategory.mockReturnValue([
            { _id: "1", name: "Category 1", slug: "category-1" }, // Mock a category
        ]);
        renderWithRouter(<Header />);
    
        const registerLink = screen.getByText(/Register/i);
        const loginLink = screen.getByText(/Login/i);
    
        expect(registerLink).toBeInTheDocument();
        expect(loginLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute("href", "/register");
        expect(loginLink).toHaveAttribute("href", "/login");
    });
  
    test("renders Cart link with badge showing 0 when cart is empty", () => {
        useAuth.mockReturnValue([null, jest.fn()]); // No user authenticated
        useCart.mockReturnValue([[]]); // Empty cart
        useCategory.mockReturnValue([
            { _id: "1", name: "Category 1", slug: "category-1" }, // Mock a category
        ]);
        renderWithRouter(<Header />);
    
        const cartLink = screen.getByText(/Cart/i);
        expect(cartLink).toBeInTheDocument();
        expect(cartLink).toHaveAttribute("href", "/cart");
    
        const badge = screen.getByText(/0/i); // Cart is empty
        expect(badge).toBeInTheDocument();
    });
  
    test("renders Cart link with badge showing correct number of items when cart is not empty", () => {
        useAuth.mockReturnValue([null, jest.fn()]); // No user authenticated
        useCart.mockReturnValue([["item1", "item2"]]); // Mock 2 items in the cart
        useCategory.mockReturnValue([
            { _id: "1", name: "Category 1", slug: "category-1" }, // Mock a category
        ]);
        renderWithRouter(<Header />);
    
        const cartLink = screen.getByText(/Cart/i);
        expect(cartLink).toBeInTheDocument();
        expect(cartLink).toHaveAttribute("href", "/cart");
    
        const badge = screen.getByText(/2/i); // Cart has 2 items
        expect(badge).toBeInTheDocument();
    });
  
    test("links have correct CSS classes", () => {
        useAuth.mockReturnValue([null, jest.fn()]); // No user authenticated
        useCart.mockReturnValue([[]]); // Empty cart
        useCategory.mockReturnValue([
            { _id: "1", name: "Category 1", slug: "category-1" }, // Mock a category
        ]);
        renderWithRouter(<Header />);
    
        const navLinks = screen.getAllByRole("link");
        
        // Loop through all links and check for specific classes
        navLinks.forEach((link) => {
            if (link.classList.contains("navbar-brand")) {
                // Expect the navbar-brand link to have the "navbar-brand" class
                expect(link).toHaveClass("navbar-brand");
            } else if (link.classList.contains("nav-link")){
                // Expect all other links to have the "nav-link" class
                expect(link).toHaveClass("nav-link");
            } else {
                expect(link).toHaveClass("dropdown-item")
            }
        });
    });
    
  
    test("renders user-specific links when authenticated", () => {
        useAuth.mockReturnValue([{ user: { name: "John Doe", role: 1 } }, jest.fn()]); // Mock authenticated user
        useCart.mockReturnValue([[]]); // Empty cart
        useCategory.mockReturnValue([
            { _id: "1", name: "Category 1", slug: "category-1" }, // Mock a category
        ]);
        renderWithRouter(<Header />);
    
        const dashboardLink = screen.getByText(/Dashboard/i);
        expect(dashboardLink).toBeInTheDocument();
        expect(dashboardLink).toHaveAttribute("href", "/dashboard/admin");
    
        const logoutLink = screen.getByText(/Logout/i);
        expect(logoutLink).toBeInTheDocument();
        expect(logoutLink).toHaveAttribute("href", "/login");
    });
  });
