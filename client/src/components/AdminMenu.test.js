import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import AdminMenu from "./AdminMenu";

// Helper function to wrap component with router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("AdminMenu Component", () => {
  beforeEach(() => {
    renderWithRouter(<AdminMenu />);
  });

  test("renders Admin Panel header", () => {
    const headerElement = screen.getByText(/Admin Panel/i);
    expect(headerElement).toBeInTheDocument();
    expect(headerElement.tagName).toBe("H4");
  });

  test("renders correct number of navigation links", () => {
    const navLinks = screen.getAllByRole("link");
    expect(navLinks).toHaveLength(4);
  });

  test("renders specific navigation links with correct paths", () => {
    const expectedLinks = [
      { text: "Create Category", path: "/dashboard/admin/create-category" },
      { text: "Create Product", path: "/dashboard/admin/create-product" },
      { text: "Products", path: "/dashboard/admin/products" },
      { text: "Orders", path: "/dashboard/admin/orders" },
    ];

    expectedLinks.forEach((link) => {
      const linkElement = screen.getByText(link.text);
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute("href", link.path);
    });
  });

  test("links have correct CSS classes", () => {
    const navLinks = screen.getAllByRole("link");
    navLinks.forEach((link) => {
      expect(link).toHaveClass("list-group-item");
      expect(link).toHaveClass("list-group-item-action");
    });
  });

  test("commented out Users link is not rendered", () => {
    const usersLink = screen.queryByText(/Users/i);
    expect(usersLink).not.toBeInTheDocument();
  });
});
