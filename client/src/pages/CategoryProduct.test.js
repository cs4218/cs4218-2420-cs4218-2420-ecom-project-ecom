import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from "axios";
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import CategoryProduct from './CategoryProduct';

const mockNavigate = jest.fn();

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

jest.mock('../hooks/useCategory', () => jest.fn(() => []));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderComponent = (slug) => {
  render(
    <MemoryRouter initialEntries={[`/category/${slug}`]}>
      <Routes>
        <Route path='/category/:slug' element={<CategoryProduct />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CategoryProduct Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty CategoryProduct page correctly', async () => {
    const testCategorySlug = 'emptyTestCategory';
    axios.get.mockResolvedValue({
      data: {
        category: {
          name: testCategorySlug
        },
        products: []
      }
    });

    renderComponent(testCategorySlug);

    await waitFor(() => {
      expect(screen.getByText(`Category - ${testCategorySlug}`)).toBeInTheDocument();
    });
    expect(screen.getByText("0 result found")).toBeInTheDocument();
  });

  it('renders CategoryProduct page correctly', async () => {
    const testCategorySlug = 'testCategory';
    const testProductSlug = "product-1";
    const expectedProducts = [
      {
        _id: "1",
        name: "TestProduct",
        price: 100,
        description: "Test Product Description",
        slug: testProductSlug
      },
    ];
  
    axios.get.mockResolvedValue({
      data: {
        category: {
          name: testCategorySlug
        },
        products: expectedProducts
      }
    });
    renderComponent(testCategorySlug);

    await waitFor(() => {
      expect(screen.getByText(`${expectedProducts.length} result found`)).toBeInTheDocument();
    });

    expect(screen.getByText("TestProduct")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More Details" })).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole("button", { name: "More Details" }));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/product/${testProductSlug}`);
  });

  it('handles API errors gracefully', async () => {
    const apiError = new Error('Mock API Error');
    const testCategorySlug = 'testCategory';
    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {}); // silence log outputs in test
    axios.get.mockRejectedValue(apiError);

    renderComponent(testCategorySlug);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(apiError);
    })
  });
})