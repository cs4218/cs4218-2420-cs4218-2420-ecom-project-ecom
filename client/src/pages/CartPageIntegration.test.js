import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import CartPage from './CartPage';
import { CartProvider } from '../context/cart';
import { AuthProvider } from '../context/auth';
import { SearchProvider } from '../context/search';

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

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

window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('CartPage Integration tests', () => {
  let mockCartFilled, mockAuthUser;
  beforeEach(() => {
    jest.clearAllMocks();

    mockCartFilled = [
      {
        "_id": "66db427fdb0119d9234b27f1",
        "name": "Textbook",
        "slug": "textbook",
        "description": "A textbook",
        "price": 79.99,
        "category": "66db427fdb0119d9234b27ef",
        "quantity": 50,
        "shipping": false,
        "createdAt": "2024-09-06T17:57:19.963Z",
        "updatedAt": "2024-09-06T17:57:19.963Z",
        "__v": 0
      },
      {
        "_id": "66db427fdb0119d9234b27f3",
        "name": "Laptop",
        "slug": "laptop",
        "description": "A laptop",
        "price": 1499.99,
        "category": "66db427fdb0119d9234b27ed",
        "quantity": 30,
        "shipping": true,
        "createdAt": "2024-09-06T17:57:19.971Z",
        "updatedAt": "2024-09-06T17:57:19.971Z",
        "__v": 0
      }
    ];

    mockAuthUser = { user: { name: "Jamie Tan", address: "1 Computing Drive" }, token: "token123" };
    axios.get.mockResolvedValue({ data: { clientToken: "mockClientToken" } });
  });

  describe('User logged in and cart is not empty', () => {
    it('should display header correctly', async () => {
      localStorage.setItem('auth', JSON.stringify(mockAuthUser));
      localStorage.setItem('cart', JSON.stringify(mockCartFilled));

      render(
        <MemoryRouter initialEntries={["/cart"]}> 
          <AuthProvider>
            <CartProvider>
              <SearchProvider>
                <CartPage />
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText("Hello Jamie Tan")).toBeInTheDocument(); //header greets user
      expect(screen.getByText(`You Have ${mockCartFilled.length} items in your cart`)).toBeInTheDocument(); //header shows number of items 
    });

    it('should display cart items correctly', async () => {
      localStorage.setItem('auth', JSON.stringify(mockAuthUser));
      localStorage.setItem('cart', JSON.stringify(mockCartFilled));

      render(
        <MemoryRouter initialEntries={["/cart"]}> 
          <AuthProvider>
            <CartProvider>
              <SearchProvider>
                <CartPage />
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      const removeButtons = screen.getAllByRole("button", { name: "Remove" });

      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Textbook")).toBeInTheDocument();
      expect(removeButtons.length).toBe(2);
    });

    it("removes item from cart when remove button is clicked", async () => {
      localStorage.setItem('auth', JSON.stringify(mockAuthUser));
      localStorage.setItem('cart', JSON.stringify(mockCartFilled));

      render(
        <MemoryRouter initialEntries={["/cart"]}> 
          <AuthProvider>
            <CartProvider>
              <SearchProvider>
                <CartPage />
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      const removeButton = await screen.findAllByRole('button', { name: "Remove" });
      fireEvent.click(removeButton[1]);
      expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
    });

    it('should display total price correctly', async () => {
      localStorage.setItem('auth', JSON.stringify(mockAuthUser));
      localStorage.setItem('cart', JSON.stringify(mockCartFilled));

      render(
        <MemoryRouter initialEntries={["/cart"]}> 
          <AuthProvider>
            <CartProvider>
              <SearchProvider>
                <CartPage />
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText("Total : $1,579.98")).toBeInTheDocument(); //calculates total price correctly
    });

});
})   