import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import Categories from "../pages/Categories";
import useCategory from "../hooks/useCategory";
import { MemoryRouter, Routes, Route } from "react-router-dom";

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));

jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

jest.mock("../hooks/useCategory", () => jest.fn(() => [])); // Mock useCategory hook to return an empty array 

describe("Categories Component", () => {
    
    it("renders categories page correctly", () => {

        // mock category data
        const mockCategories = [
            {_id: "1", name: "Electronics", slug: "electronics"},
            {_id: "2", name: "Books", slug: "books"}
        ]

        useCategory.mockReturnValue(mockCategories); // mock return value to be the mock category data

        const { container } = render(
            <MemoryRouter initialEntries={['/categories']}>
                <Routes>
                    <Route path="/categories" element={<Categories />} />
                </Routes>
            </MemoryRouter>
        )

        // check all categories are displayed in dropdown menu
        const dropdown = screen.getByRole("navigation");

        expect(within(dropdown).getByText("Electronics")).toBeInTheDocument();
        expect(within(dropdown).getByText("Books")).toBeInTheDocument();

        // check if the category links in dropdown menu have correct paths
        expect(within(dropdown).getByRole("link", { name: "Electronics" })).toHaveAttribute("href", "/category/electronics");
        expect(within(dropdown).getByRole("link", { name: "Books" })).toHaveAttribute("href", "/category/books");

        // check all categories within main are displayed as buttons
        const mainPage = screen.getByTestId("category-container");

        expect(within(mainPage).getByText("Electronics")).toBeInTheDocument();
        expect(within(mainPage).getByText("Books")).toBeInTheDocument();

        // check if the category links in main have correct paths
        expect(within(mainPage).getByRole("link", { name: "Electronics" })).toHaveAttribute("href", "/category/electronics");
        expect(within(mainPage).getByRole("link", { name: "Books" })).toHaveAttribute("href", "/category/books");


        // ensure correct number of category buttons 
        expect(within(mainPage).getAllByRole("link")).toHaveLength(mockCategories.length);
    })
})