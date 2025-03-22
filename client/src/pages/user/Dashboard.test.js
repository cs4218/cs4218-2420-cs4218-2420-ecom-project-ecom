import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/auth";

// Mock the useAuth hook
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../components/Layout.js", () => ({ children }) => {
  return (
    <>
      <h1>Mock Layout</h1>
      {children}
    </>
  );
});
describe("Dashboard Component", () => {
  it("renders user information correctly", () => {
    useAuth.mockReturnValue([
      {
        user: {
          name: "mock name",
          email: "mock email",
          address: "mock address",
        },
        token: "mock token",
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/dashboard/user"]}>
        <Routes>
          <Route path="/dashboard/user" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("mock name")).toBeInTheDocument();
    expect(screen.getByText("mock email")).toBeInTheDocument();
    expect(screen.getByText("mock address")).toBeInTheDocument();
  });

  it("renders nothing if user is null", () => {
    useAuth.mockReturnValue([
      {
        user: null,
        token: "",
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/user"]}>
        <Routes>
          <Route path="/user" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("123 Test Street")).not.toBeInTheDocument();
  });
});
