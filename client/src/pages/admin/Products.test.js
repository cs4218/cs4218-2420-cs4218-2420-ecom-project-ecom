import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route, } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';

import Products from './Products';
import { describe } from "node:test";
import { useAuth } from "../../context/auth";

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

  jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
  }));
  
  
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  
  window.matchMedia = window.matchMedia || function() {
      return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
      };
    };

describe('Product Component', () => {
    let mockProducts;

    beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    mockProducts = [
        {
          _id: '1',
          name: 'Mock 1',
          description: 'mock description 1',
          slug: 'mock-1',
        },
        {
          _id: '2',
          name: 'Mock 2',
          description: 'mock description 2',
          slug: 'mock-2',
        },
      ];
  
    axios.get.mockResolvedValue({ data: { products: mockProducts } });
    
  });  
    it('should display products correctly', async () => {
    
      render(
          <MemoryRouter initialEntries={['/products']}>
            <Routes>
              <Route path="/products" element={<Products />} />
            </Routes>
          </MemoryRouter>
        );
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
          });
        await expect(screen.getByText('All Products List')).toBeInTheDocument();
        await waitFor(() => {
             expect(screen.getByText('Mock 1')).toBeInTheDocument();
            expect(screen.getByText('mock description 1')).toBeInTheDocument();
                expect(screen.getByText('Mock 2')).toBeInTheDocument();
            expect(screen.getByText('mock description 2')).toBeInTheDocument();
        });
        
    });

    it('should handle errors when fetching products', async () => {
        axios.get.mockRejectedValue(new Error(''));
    
        render(
            <MemoryRouter initialEntries={['/products']}>
            <Routes>
              <Route path="/products" element={<Products />} />
            </Routes>
          </MemoryRouter>
          );
    
          await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
          });
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Someething Went Wrong');
        });
      });
})
    
