import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import Search from "./Search";
import { useSearch } from "../context/search";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import toast from "react-hot-toast";

jest.mock('../context/search', () => ({
    useSearch: jest.fn(),
}));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [[], jest.fn()]),
}));

const mockNavigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigateFunction,
}));

jest.mock("./../components/Layout", () => ({ children }) => <div>{children}</div>);

jest.mock("react-hot-toast");

Storage.prototype.setItem = jest.fn(); // Properly mock setItem
jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null); // Return null for an empty cart

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
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
      });
      
    it("should show 'No Products Found' when 0 products are found", () => {
        useSearch.mockReturnValue([{ results: [] }, jest.fn()]);
        renderSearchComp();

        expect(screen.getByText('Search Results')).toBeInTheDocument();
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

    it("should navigate the user to the product details upon clicking 'More Details' button", () => {
        useSearch.mockReturnValue([{
            results: [mockSingleProduct]
        }, jest.fn()]);
        renderSearchComp();

        fireEvent.click(screen.getByRole("button", { name: /More Details/i }));
        expect(mockNavigateFunction).toHaveBeenCalledWith(`/product/${mockSingleProduct.slug}`);
    });

    it("should add to the cart upon clicking 'Add To Cart' button", () => {
        useSearch.mockReturnValue([{
            results: [mockSingleProduct]
        }, jest.fn()]);
        renderSearchComp();
    
        jest.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce(JSON.stringify(mockSingleProduct));
        fireEvent.click(screen.getByRole("button", { name: /ADD TO CART/i }));
        
        expect(localStorage.setItem).toHaveBeenCalledWith("cart", JSON.stringify([mockSingleProduct]));
        expect(JSON.parse(localStorage.getItem("cart"))).toEqual(mockSingleProduct);
        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
});
