import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import Search from "../pages/Search";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// mock axios get /api/v1/search/..
jest.mock('axios');

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));

jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

describe("Search Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders 'No Products Found' when there are no search results", () => {
        // mock no results returned from useSearch
        const mockUseSearch = require("../context/search").useSearch;
        mockUseSearch.mockReturnValue([{ keyword: "", results: [] }, jest.fn()]);

        render(
            <MemoryRouter initialEntries={['/search']}>
                <Routes>
                    <Route path="/search" element={<Search />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("No Products Found")).toBeInTheDocument();

    });

    it("renders correct number of search results when there are search results", () => {
        // mock results returned from useSearch
        const mockUseSearch = require("../context/search").useSearch;
        const mockResults = [
            {_id: "1", name: "Product 1", description: "Description 1", price: 10 },
            {_id: "2", name: "Product 2", description: "Description 2", price: 20}
        ];

        mockUseSearch.mockReturnValue([{ keyword: "Product", results: mockResults }, jest.fn()]);

        render(
            <MemoryRouter initialEntries={['/search']}>
                <Routes>
                    <Route path="/search" element={<Search />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Found 2")).toBeInTheDocument(); // check there are only 2 products displayed
        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    })

    it("renders product name, price, description, Add to cart button and More Details button for each search result", () => {
        // mock one result returned from useSearch
        const mockUseSearch = require("../context/search").useSearch;
        const mockResults = [
            {_id: "1", name: "Product 1", description: "This is a very long product description that needs truncation.", price: 10},
        ];

        mockUseSearch.mockReturnValue([{ keyword: "Product", results: mockResults }, jest.fn()]);

        render(
            <MemoryRouter initialEntries={["/search"]}>
                <Routes>
                    <Route path="/search" element={<Search />} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("$ 10")).toBeInTheDocument();
        expect(screen.getByText("This is a very long product de...")).toBeInTheDocument(); // check if the description is truncated
        expect(screen.getByRole("button", { name: "More Details"})).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "ADD TO CART"})).toBeInTheDocument();

    });


});
