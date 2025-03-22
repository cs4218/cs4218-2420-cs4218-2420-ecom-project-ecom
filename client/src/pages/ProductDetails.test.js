import React from "react";
import "@testing-library/react";
import '@testing-library/jest-dom';
import axios from "axios"
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductDetails from "./ProductDetails";

jest.mock("axios")
jest.mock("../components/Layout", () => jest.fn(({children}) => <div>{children}</div>))

const mockNavigate = jest.fn();

const mockProduct = {
    product: {
        _id: "1",
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        category: {_id: "1", name: "Test Category"}
    }
}

const mockRelatedProducts = {
    products: [
        {
          _id: "456",
          name: "Related Product",
          description: "Related product description",
          price: 49.99,
          slug: "related-product",
        },
      ]
}

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useNavigate: () => mockNavigate
}))

describe("ProductDetails", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValue({ slug: "test-product" })
    })

    test("renders product details after fetching data", async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct })
        axios.get.mockResolvedValueOnce({ data: { products: [] }});
        
        render(
            <MemoryRouter>
                <ProductDetails/>
            </MemoryRouter>
        )

        expect(screen.getByText("Product Details")).toBeInTheDocument();
    
        await waitFor(() => {
            expect(screen.getByText("Name : Test Product")).toBeInTheDocument();
            expect(screen.getByText("Description : Test Description")).toBeInTheDocument();
            expect(screen.getByText("Price :$99.99")).toBeInTheDocument();
            expect(screen.getByText("Category : Test Category")).toBeInTheDocument();
            expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
        });
    })

    // could afford to test more vigorously e.g. on price, description etc.
    test("renders related products after fetching data", async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct })
        axios.get.mockResolvedValueOnce({ data: mockRelatedProducts });
        
        render(
            <MemoryRouter>
                <ProductDetails/>
            </MemoryRouter>
        )

        expect(screen.getByText("Product Details")).toBeInTheDocument();
    
        await waitFor(() => {
            expect(screen.getByText("Name : Test Product")).toBeInTheDocument();
            expect(screen.getByText("Description : Test Description")).toBeInTheDocument();
            expect(screen.getByText("Price :$99.99")).toBeInTheDocument();
            expect(screen.getByText("Category : Test Category")).toBeInTheDocument();

            expect(screen.getByText("Related Product")).toBeInTheDocument();
            expect(screen.getByText("More Details")).toBeInTheDocument();
        });
    })

    test("handles API errors gracefully", async () => {
        axios.get.mockRejectedValue(new Error("Database error"));
        jest.spyOn(console, 'log').mockImplementation(() => {})

        render(
            <MemoryRouter>
                <ProductDetails/>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(console.log).toHaveBeenCalledWith(expect.any(Error)); // Check if error is logged
        });
    })

    test("handles API error in getting related products", async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct })
        axios.get.mockRejectedValue(new Error("Database error"));

        jest.spyOn(console, 'log').mockImplementation(() => {})

        render(
            <MemoryRouter>
                <ProductDetails/>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(console.log).toHaveBeenCalledWith(expect.any(Error)); // Check if error is logged
        });
    })

    test("navigates when clicking on related product details", async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct })
        axios.get.mockResolvedValueOnce({ data: mockRelatedProducts });

        render(
            <MemoryRouter>
                <ProductDetails/>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText("Related Product"));
        
        const moreDetailsButton = screen.getByText("More Details");
        await userEvent.click(moreDetailsButton)

        expect(mockNavigate).toHaveBeenCalledWith("/product/related-product")
    })
})
