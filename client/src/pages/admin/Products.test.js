import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { useSearch } from "../../context/search";
import axios from "axios";
import Products from "./Products";
import { Toaster, toast } from "react-hot-toast";
import "@testing-library/jest-dom";
import { beforeEach } from "node:test";

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn().mockReturnValue([
    {
      token: "mockToken",
      user: { name: "John Doe", address: "123 Main St" },
    },
    jest.fn(),
  ]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn().mockReturnValue([[], jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [[], jest.fn()]),
}));

describe("Products Component", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it("renders without crashing", () => {
    render(
      <Router>
        <Products />
        <Toaster />
      </Router>
    );
    expect(screen.getByText("All Products List")).toBeInTheDocument();
  });

  it("fetches and displays products", async () => {
    const mockData = {
      products: [
        {
          _id: "1",
          name: "Product 1",
          slug: "product-1",
          description: "Description of Product 1",
        },
        {
          _id: "2",
          name: "Product 2",
          slug: "product-2",
          description: "Description of Product 2",
        },
      ],
    };

    // Mock the axios GET request
    axios.get.mockResolvedValue({ data: mockData });

    render(
      <Router>
        <Products />
        <Toaster />
      </Router>
    );

    // Wait for the products to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
      expect(screen.getByText("Description of Product 1")).toBeInTheDocument();
      expect(screen.getByText("Description of Product 2")).toBeInTheDocument();
    });
  });

  it("displays an error message if the request fails", async () => {
    // Mock the axios GET request to simulate an error
    axios.get.mockRejectedValue(new Error("Something Went Wrong"));

    render(
      <Router>
        <Products />
        <Toaster />
      </Router>
    );

    // Wait for the error to be handled and toast to appear
    await waitFor(() => {
      const errorMessages = screen.queryAllByText("Something Went Wrong");
      expect(errorMessages[0]).toBeInTheDocument();
    });
  });

  it("renders correct links for each product", async () => {
    const mockData = {
      products: [
        {
          _id: "1",
          name: "Product 1",
          slug: "product-1",
        },
        {
          _id: "2",
          name: "Product 2",
          slug: "product-2",
        },
      ],
    };

    // Mock the axios GET request
    axios.get.mockResolvedValue({ data: mockData });

    render(
      <Router>
        <Products />
        <Toaster />
      </Router>
    );

    // Wait for products to be displayed
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    // Check the links
    expect(screen.getByText("Product 1").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/product/product-1"
    );
    expect(screen.getByText("Product 2").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/product/product-2"
    );
  });
});
