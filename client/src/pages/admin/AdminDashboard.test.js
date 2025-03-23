import React from "react";
import { render, screen } from "@testing-library/react";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import AdminDashboard from "./AdminDashboard";
import { useSearch } from "../../context/search";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mocking hooks
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [[], jest.fn()]),
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("renders the dashboard layout correctly", () => {
    // Mocking the auth and cart context
    useAuth.mockReturnValue([
      {
        user: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "123-456-7890",
        },
      },
      jest.fn(),
    ]);
    useCart.mockReturnValue([[], jest.fn()]); // Mock empty cart

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check if the admin info is displayed correctly
    expect(screen.getByText("Admin Name : John Doe")).toBeInTheDocument();
    expect(
      screen.getByText("Admin Email : john.doe@example.com")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Admin Contact : 123-456-7890")
    ).toBeInTheDocument();
  });

  it("shows the AdminMenu in the sidebar", () => {
    // Mocking the auth and cart context
    useAuth.mockReturnValue([
      {
        user: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "123-456-7890",
        },
      },
      jest.fn(),
    ]);
    useCart.mockReturnValue([[], jest.fn()]); // Mock empty cart

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check if the AdminMenu is rendered
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("handles when auth context is not available", () => {
    // Mocking the auth context to return null
    useAuth.mockReturnValue([null, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]); // Mock empty cart

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // The component should render, but with no admin details
    expect(screen.queryByText("Admin Name :")).toBeInTheDocument();
    expect(screen.queryByText("Admin Email :")).toBeInTheDocument();
    expect(screen.queryByText("Admin Contact :")).toBeInTheDocument();
  });
});
