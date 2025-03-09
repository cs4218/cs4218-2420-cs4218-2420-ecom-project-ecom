import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../../context/auth";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/AdminMenu", () => () => <div>MockAdminMenu</div>);
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>MockLayout {children}</div>
));

describe("AdminDashboard", () => {
  it("renders the admin information correctly", () => {
    useAuth.mockReturnValue([
      {
        user: {
          name: "Test Admin",
          email: "admin@test.com",
          phone: "1234567890",
        },
      },
    ]);
    render(<AdminDashboard />);
    expect(screen.getByText(/Test Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@test\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/1234567890/i)).toBeInTheDocument();
  });

  it("renders AdminMenu and Layout components", () => {
    useAuth.mockReturnValue([{ user: {} }]);
    render(<AdminDashboard />);
    expect(screen.getByText("MockAdminMenu")).toBeInTheDocument();
    expect(screen.getByText("MockLayout")).toBeInTheDocument();
  });
});
