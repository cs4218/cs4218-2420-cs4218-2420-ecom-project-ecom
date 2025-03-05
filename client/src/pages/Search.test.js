import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import Search from "./Search";
import { useSearch } from "../context/search";
import { MemoryRouter, Routes, Route } from "react-router-dom";

jest.mock('../context/search', () => ({
    useSearch: jest.fn(),
}));

jest.mock("./../components/Layout", () => ({ children }) => <div>{children}</div>);

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
    },
}));

const renderSearchComp = () => {
    render(
      <MemoryRouter initialEntries={["/search"]}>
        <Routes>
          <Route path="/search" element={<Search />} />
        </Routes>
      </MemoryRouter>
    );
  } 

const mockSingleProduct = {
    _id: "66db427fdb0119d9234b27f1",
    name: "Textbook",
    slug: "textbook",
    description: "A comprehensive textbook",
    price: 79.99,
    category: "66db427fdb0119d9234b27ef",
    quantity: 50,
    shipping: false,
    createdAt: "2024-09-06T17:57:19.963Z",
    updatedAt: "2024-09-06T17:57:19.963Z",
    __v: 0
};

const mockTwoProducts = [
    {
        _id: "66db427fdb0119d9234b27f1",
        name: "Textbook",
        slug: "textbook",
        description: "A comprehensive textbook",
        price: 79.99,
        category: "66db427fdb0119d9234b27ef",
        quantity: 50,
        shipping: false,
        createdAt: "2024-09-06T17:57:19.963Z",
        updatedAt: "2024-09-06T17:57:19.963Z",
        __v: 0
    },
    {
        _id: "66db427fdb0119d9234b27f3",
        name: "Laptop",
        slug: "laptop",
        description: "A powerful laptop",
        price: 1499.99,
        category: "66db427fdb0119d9234b27ed",
        quantity: 30,
        shipping: true,
        createdAt: "2024-09-06T17:57:19.971Z",
        updatedAt: "2024-09-06T17:57:19.971Z",
        __v: 0
    }
];


describe("Search component", () => {
    it("should show 'No Products Found' when 0 products are found", () => {
        useSearch.mockReturnValue([{ results: [] }, jest.fn()]);
        renderSearchComp();

        expect(screen.getByText('Search Resuts')).toBeInTheDocument();
        expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });
    
    it("should show 'Found 1' and render the product when 1 product is found", () => {
        useSearch.mockReturnValue([{
            results: [mockSingleProduct]
        }, jest.fn()]);
        renderSearchComp();

        expect(screen.getByText("Found 1")).toBeInTheDocument();
        expect(screen.getByText("Textbook")).toBeInTheDocument();
        expect(screen.getByText("A comprehensive textbook...")).toBeInTheDocument();
        expect(screen.getByText("$ 79.99")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: /More Details/i })).toHaveLength(1);
        expect(screen.getAllByRole("button", { name: /ADD TO CART/i })).toHaveLength(1);
    });

    it("should show 'Found 2' and render the 2 products when 2 products are found", () => {
        useSearch.mockReturnValue([{
            results: mockTwoProducts
        }, jest.fn()]);
        renderSearchComp();

        expect(screen.getByText("Found 2")).toBeInTheDocument();
        expect(screen.getByText("Textbook")).toBeInTheDocument();
        expect(screen.getByText("A comprehensive textbook...")).toBeInTheDocument();
        expect(screen.getByText("$ 79.99")).toBeInTheDocument();
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("A powerful laptop...")).toBeInTheDocument();
        expect(screen.getByText("$ 1499.99")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: /More Details/i })).toHaveLength(2);
        expect(screen.getAllByRole("button", { name: /ADD TO CART/i })).toHaveLength(2);
    });

});
