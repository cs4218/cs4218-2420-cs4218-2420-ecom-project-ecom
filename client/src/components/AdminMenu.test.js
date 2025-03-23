import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminMenu from "./AdminMenu";

describe("AdminMenu", () => {
  it("renders the admin panel title", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("renders the correct navigation links", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );

    // Check if each link exists
    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("checks that the NavLinks point to the correct paths", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );

    // Check if the NavLink paths are correct
    expect(screen.getByText("Create Category").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/create-category"
    );
    expect(screen.getByText("Create Product").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/create-product"
    );
    expect(screen.getByText("Products").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/products"
    );
    expect(screen.getByText("Orders").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/orders"
    );
  });
});
