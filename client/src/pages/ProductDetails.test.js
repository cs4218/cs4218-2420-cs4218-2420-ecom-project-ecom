import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import axios from "axios";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProductDetails from "../pages/ProductDetails";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import toast from 'react-hot-toast';

jest.mock('axios');
jest.mock('react-hot-toast');

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

describe("ProductDetails Component", () => {

  const mockProduct = {
    _id: "123",
    name: "Test Product",
    slug: "test-product",
    description: "A great test product",
    price: 99.99,
    category: { _id: "456", name: "Test Category" },
  };

  const mockRelatedProducts = [
    {
      _id: "789",
      name: "Related Product 1",
      slug: "related-product-1",
      description: "Similar products",
      price: 49.99,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches product details on mount", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    render(
      <MemoryRouter initialEntries={["/product/test-product"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product/test-product");

    await waitFor(() => {
      expect(screen.getByText("Name : Test Product")).toBeInTheDocument();
      expect(screen.getByText("Description : A great test product")).toBeInTheDocument();
      expect(screen.getByText("Price : $99.99")).toBeInTheDocument();
      expect(screen.getByText("Category : Test Category")).toBeInTheDocument();
    });

  });

  test("fetches and displays related products", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    render(
      <MemoryRouter initialEntries={["/product/test-product"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Related Product 1")).toBeInTheDocument();
      expect(screen.getByText("Similar products...")).toBeInTheDocument();
      expect(screen.getByText("$49.99")).toBeInTheDocument();
    });
  });

  test("displays no related products if no related products found", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    render(
      <MemoryRouter initialEntries={["/product/test-product"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
    });
  });

  test("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Error"));
    
    render(
      <MemoryRouter initialEntries={["/product/test-product"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  test('should display success toast on add to cart click', async () => {

    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    render(
      <MemoryRouter initialEntries={["/product/test-product"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the product to load
    await waitFor(() => expect(screen.getByText("Name : Test Product")).toBeInTheDocument());

    fireEvent.click(screen.getByText('ADD TO CART'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
    });

  });

  test("should display more details when clicking 'More Details'", async () => { 
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    render(
      <MemoryRouter initialEntries={["/product/test-product"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Name : Test Product")).toBeInTheDocument());

    const moreDetailsButton = screen.getByText("More Details");
    fireEvent.click(moreDetailsButton);

    await waitFor(() => {
      expect(screen.getByText("Full Product Specifications")).toBeInTheDocument();
    });
  }); 

});