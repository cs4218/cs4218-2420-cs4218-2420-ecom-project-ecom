import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from "../context/auth";
import { CartProvider, useCart } from "../context/cart";
import { useSearch } from "../context/search";
import "@testing-library/jest-dom";
import CartPage from "../pages/CartPage";
import Login from "../pages/Auth/Login";

// Mock the useSearch hook
jest.mock("../context/search", () => ({
  useSearch: () => [[], jest.fn()],
}));

// Mock the axios post method
jest.mock("axios");

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("CartPage and Login integration test", () => {
  const mockProduct = {
    _id: "1",
    name: "Product 1",
    price: 100,
    description: "Description of Product 1",
  };

  beforeEach(() => {
    // Mock the localStorage cart data
    localStorage.setItem("cart", JSON.stringify([mockProduct]));
  });

  it("should navigate to login page when user is not logged in", async () => {
    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter initialEntries={["/cart"]}>
            <Routes>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    // Simulate clicking "Please Login to checkout"
    fireEvent.click(screen.getByText("Please Login to checkout"));

    // Assert that the navigation happens to the login page
    await waitFor(() => {
      expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
    });

    // Verify the login page's email input is visible
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter Your Password")
    ).toBeInTheDocument();
  });

  it("should navigate to login page and back to cart", async () => {
    // Mock the successful login response
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Login successful",
        user: { name: "John Doe", email: "johndoe@email.com" },
        token: "fake-jwt-token",
      },
    });

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter initialEntries={["/cart"]}>
            <Routes>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    // Assert that the product is in the cart page initially
    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    // Simulate clicking "Please Login to checkout"
    fireEvent.click(screen.getByText("Please Login to checkout"));

    // Wait for the login page to be rendered
    await waitFor(() => {
      expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
    });

    // Simulate a login action (you may need to adjust this based on your Login component)
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "johndoe@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByText("LOGIN"));

    // Ensure that after clicking login, the user is redirected back to /cart
    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });
  });
});
