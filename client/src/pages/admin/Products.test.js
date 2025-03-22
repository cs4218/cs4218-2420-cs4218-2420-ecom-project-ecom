import React from 'react'
import "@testing-library/react";
import '@testing-library/jest-dom';
import axios from "axios"
import { MemoryRouter } from 'react-router-dom';
import Products from './Products';
import { render, waitFor, screen } from '@testing-library/react';
import toast from "react-hot-toast";

jest.mock("axios")
jest.mock("../../components/Layout", () => jest.fn(({children}) => <div>{children}</div>))

jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
    error: jest.fn()
}))

const generateMockProducts = (count) => {
    const products = [];
    for (let i = 1; i <= count; i++) {
        products.push({
        _id: `${i}`,
        name: `Product ${i}`,
        description: `Description ${i}`,
        slug: `product-${i}`,
        });
    }
    return { data: { products } };
}

describe("Products", () => {
    test("renders all products successfully", async () => {
        const mockProducts = generateMockProducts(5);
        axios.get.mockResolvedValueOnce(mockProducts)

        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        )
        
        expect(screen.getByText("All Products List")).toBeInTheDocument();

        await waitFor(() => {
            mockProducts.data.products.forEach((product) => {
              expect(screen.getByText(product.name)).toBeInTheDocument();
            });
          });
    })

    test("renders zero products successfully", async () => {
        const mockProducts = generateMockProducts(0);
        axios.get.mockResolvedValueOnce(mockProducts)

        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        )
        
        expect(screen.getByText("All Products List")).toBeInTheDocument();
        
        await waitFor(() => {
            mockProducts.data.products.forEach((product) => {
              expect(screen.getByText(product.name)).toBeInTheDocument();
            });
          });
    })

    test("handles API errors gracefully", async () => {
        axios.get.mockResolvedValueOnce(new Error("Database error"))
        jest.spyOn(console, 'log').mockImplementation(() => {})

        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(console.log).toHaveBeenCalledWith(expect.any(Error)); // Check if error is logged
            expect(toast.error).toHaveBeenCalledWith("Something Went Wrong")
        });
    })
})
