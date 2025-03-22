import React from 'react';
import AdminDashboard from './AdminDashboard';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/auth';
import { CartProvider } from '../../context/cart';
import { SearchProvider } from '../../context/search';
import '@testing-library/jest-dom/extend-expect';

const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
describe("AdminDashboard integration test with dependency components", () => {

  it("should render if user is an admin ", () => {
    const mockAuthUser = { user: {
        name: "Jamie Tan",
        email: "jamie@test.com",
        phone: "12345678",
        role: 1
      }, token: "token123" };
    localStorage.setItem('auth', JSON.stringify(mockAuthUser));
    render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter>
              <AdminDashboard />
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );

    //integration with layout
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();

    //integration with admin menu 
    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();

    expect(screen.getByText("Admin Name : Jamie Tan")).toBeInTheDocument();
    expect(screen.getByText("Admin Email : jamie@test.com")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact : 12345678")).toBeInTheDocument();
   
  });
});