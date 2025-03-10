import React from "react";
import { render, waitFor, screen } from "@testing-library/react";

import { MemoryRouter, Routes, Route, } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import AdminDashboard from "./AdminDashboard";
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

describe('Admin Dashboard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([
            {
              user: {
                name: "Jamie Tan",
                email: "jamie@test.com",
                phone: "12345678",
              },
            },
          ]);
    });  
    it('should display products correctly', async () => {
    
      render(
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
            </Routes>
          </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Admin Name : Jamie Tan")).toBeInTheDocument();
            expect(screen.getByText("Admin Email : jamie@test.com")).toBeInTheDocument();
            expect(screen.getByText("Admin Contact : 12345678")).toBeInTheDocument();
        
    });
});
}
);