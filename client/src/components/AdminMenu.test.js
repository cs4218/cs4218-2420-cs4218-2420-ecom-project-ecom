import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";

describe("Admin Menu Components", () => {
    // Test NavLinks titles exists
    test("renders all NavLinks", () => {
        render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        )

        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
        expect(screen.getByText("Create Category")).toBeInTheDocument();
        expect(screen.getByText("Create Product")).toBeInTheDocument();
        expect(screen.getByText("Products")).toBeInTheDocument();
        expect(screen.getByText("Orders")).toBeInTheDocument();
    });

    // Test the routing link of NavLinks are correct
    test("NavLinks has correct links", () => {
        render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
          
        expect(screen.getByRole('link', { name : 'Create Category' })).toHaveAttribute(
            "href",
            "/dashboard/admin/create-category"
        );
        expect(screen.getByRole('link', { name : 'Create Product' })).toHaveAttribute(
            "href",
            "/dashboard/admin/create-product"
        );
        expect(screen.getByRole('link', { name : 'Products' })).toHaveAttribute(
            "href",
            "/dashboard/admin/products"
        );
        expect(screen.getByRole('link', { name : 'Orders' })).toHaveAttribute(
            "href",
            "/dashboard/admin/orders"
        );
    })
})
