import React, { useState, useEffect } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render , waitFor, screen, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import CategoryProduct from "./CategoryProduct";

jest.mock("axios");

jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
  }));
  
  jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
  }));
  
  jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
  }));
  
  jest.mock("../hooks/useCategory", () => jest.fn(() => []));

  describe("Test Render of Category Product", () => {
    const mockProducts = [
        {
            _id: "1",
            name: "Mock Product",
            price: 10.00,
            slug: "mock-product",
            description: "A Mock Product",
        }
    ]
    const mockCategory = { name: "Test Category" };
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("Render Category Product main text", async () => {

        axios.get.mockResolvedValue({
            data: { products: mockProducts, category: mockCategory },
          });
        render(
            <MemoryRouter initialEntries={["/category/test-category"]}>
              <Routes>
                <Route path="/category/:slug" element={<CategoryProduct />} />
              </Routes>
            </MemoryRouter>
        );
      
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        await waitFor(() => {
            expect(screen.getByText("Category - Test Category")).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText("1 result found")).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText("More Details")).toBeInTheDocument();
        });
    });
    test("Click More Details Button redirects", async () => {
        axios.get.mockResolvedValue({
            data: { products: mockProducts, category: mockCategory },
          });
        render(
            <MemoryRouter initialEntries={["/category/test-category"]}>
              <Routes>
                <Route path="/category/:slug" element={<CategoryProduct />} />
                <Route path="/product/:slug" element={<div>Mock Product Page</div>} />
              </Routes>
            </MemoryRouter>
        );
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        let button = null;
        await waitFor(() => {
            button = screen.getByText("More Details");
            expect(button).toBeInTheDocument();
        });
        fireEvent.click(button);
        await waitFor(() => {
            expect(screen.getByText("Mock Product Page")).toBeInTheDocument();
        });
        
    });

})