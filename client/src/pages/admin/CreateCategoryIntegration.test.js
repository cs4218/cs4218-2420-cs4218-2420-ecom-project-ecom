import React from "react";
import axios from "axios";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateCategory from "./CreateCategory";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";

// Mock axios
jest.mock("axios");

// Mock the useSearch hook
jest.mock("../../context/search", () => ({
  useSearch: () => [[], jest.fn()],
}));

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("CreateCategory Integration Test", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it("should call the create category API and update the UI on success", async () => {
    // Mock successful API response
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Category created successfully",
        category: { name: "Test Category", slug: "test-category" },
      },
    });

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <CreateCategory />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    // Simulate user input and form submission
    const nameInput = screen.getByPlaceholderText("Enter new category");
    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(nameInput, { target: { value: "Test Category" } });
    fireEvent.click(submitButton);

    // Wait for the success toast
    await waitFor(() =>
      expect(screen.getByText("Test Category is created")).toBeInTheDocument()
    );

    // Verify the API call
    expect(axios.post).toHaveBeenCalledWith(
      "/api/v1/category/create-category",
      {
        name: "Test Category",
      }
    );
  });

  it("should handle errors when the create category API call fails", async () => {
    // Mock failed API response
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          message: "Error creating category",
        },
      },
    });

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <CreateCategory />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    // Simulate user input and form submission
    const nameInput = screen.getByPlaceholderText("Enter new category");
    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(nameInput, { target: { value: "Test Category" } });
    fireEvent.click(submitButton);

    // Wait for the error toast
    await waitFor(() =>
      expect(
        screen.getByText("somthing went wrong in input form")
      ).toBeInTheDocument()
    );

    // Verify the API call
    expect(axios.post).toHaveBeenCalledWith(
      "/api/v1/category/create-category",
      {
        name: "Test Category",
      }
    );
  });
});
