import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Products from './Products';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';

// Mocks
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../components/Layout', () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

jest.mock('../../components/AdminMenu', () => {
  return () => <div data-testid="mock-admin-menu">Admin Menu</div>;
});

// Mock products
const mockProducts = [
  { _id: '66db427fdb0119d9234b27f3', name: 'Laptop', description: 'A powerful laptop', slug: 'laptop' },
  { _id: '66db427fdb0119d9234b27f4', name: 'Smartphone', description: 'A high-end smartphone', slug: 'smartphone' },
  { _id: '66db427fdb0119d9234b27f5', name: 'Textbook', description: 'An educational textbook', slug: 'textbook' },
];

describe('Products Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST #1
  it('renders Layout and AdminMenu components', async () => {
    axios.get.mockResolvedValue({ data: { products: [] } });
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
          <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-admin-menu')).toBeInTheDocument();
  });

  // TEST #2
  it('renders products list correctly', async () => {
    axios.get.mockResolvedValue({ data: { products: mockProducts } });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
          <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product');

    const productLinks = screen.getAllByRole('link');
    expect(productLinks.length).toBe(mockProducts.length);

    mockProducts.forEach((product, index) => {
      expect(productLinks[index]).toHaveAttribute('href', `/dashboard/admin/product/${product.slug}`);
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(product.description)).toBeInTheDocument();
      expect(screen.getByAltText(product.name)).toHaveAttribute('src', `/api/v1/product/product-photo/${product._id}`);
    });
  });

  // TEST #3
  it('handles no products', async () => {
    axios.get.mockResolvedValue({ data: { products: [] } });
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
          <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  // TEST #4
  it('handles API errors', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('Network Error'));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
          <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(consoleSpy).toHaveBeenCalledWith(new Error('Network Error'));
    expect(toast.error).toHaveBeenCalledWith('Something Went Wrong');

    consoleSpy.mockRestore();
  });
});