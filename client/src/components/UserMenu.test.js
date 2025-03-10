import React from "react";
import { render, screen } from "@testing-library/react";
import UserMenu from "./UserMenu";
import "@testing-library/jest-dom/extend-expect";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  NavLink: ({ to, children, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe("UserMenu Component", () => {
  it("renders the dashboard heading", () => {
    render(<UserMenu />);
    const heading = screen.getByText("Dashboard");
    expect(heading).toBeInTheDocument();
  });

  it("renders the Profile link", () => {
    render(<UserMenu />);
    const profileLink = screen.getByText("Profile");
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/dashboard/user/profile");
  });

  it("renders the Orders link", () => {
    render(<UserMenu />);
    const ordersLink = screen.getByText("Orders");
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute("href", "/dashboard/user/orders");
  });

  it("applies the correct class to NavLink items", () => {
    render(<UserMenu />);
    const profileLink = screen.getByText("Profile");
    const ordersLink = screen.getByText("Orders");

    expect(profileLink).toHaveClass("list-group-item list-group-item-action");
    expect(ordersLink).toHaveClass("list-group-item list-group-item-action");
  });
});