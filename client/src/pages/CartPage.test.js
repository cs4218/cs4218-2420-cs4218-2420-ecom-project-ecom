import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import CartPage from './CartPage';
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import DropIn from "braintree-web-drop-in-react";

// Mocking axios.post
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

jest.mock("braintree-web-drop-in-react", () => {
    return jest.fn(() => <div data-testid="braintree-dropin"></div>);
  });



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
      

describe('CartPage Component', () => {

    let mockCart, setCartMock;
  beforeEach(() => {
    jest.clearAllMocks();
    mockCart = [
      {
        "_id": {
          "$oid": "66db427fdb0119d9234b27f1"
        },
        "name": "Textbook",
        "slug": "textbook",
        "description": "A comprehensive textbook",
        "price": 79.99,
        "category": {
          "$oid": "66db427fdb0119d9234b27ef"
        },
        "quantity": 50,
        "shipping": false,
        "createdAt": {
          "$date": "2024-09-06T17:57:19.963Z"
        },
        "updatedAt": {
          "$date": "2024-09-06T17:57:19.963Z"
        },
        "__v": 0
      },
      {
        "_id": {
          "$oid": "66db427fdb0119d9234b27f3"
        },
        "name": "Laptop",
        "slug": "laptop",
        "description": "A powerful laptop",
        "price": 1499.99,
        "category": {
          "$oid": "66db427fdb0119d9234b27ed"
        },
        "quantity": 30,
        "shipping": true,
        "createdAt": {
          "$date": "2024-09-06T17:57:19.971Z"
        },
        "updatedAt": {
          "$date": "2024-09-06T17:57:19.971Z"
        },
        "__v": 0
      }
    ];

    setCartMock = jest.fn(); 
    const mockAuth = { user: { name: "John Doe", address: "123 Street" }, token: "token123" };
    useCart.mockReturnValue([mockCart, setCartMock]);
    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    axios.get.mockResolvedValue({ data: { clientToken: "mockClientToken" } });
  });

  it('should display cart items correctly', async () => {
    const { getByText } = render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );

    // Wait for the component to update and render async data
    await waitFor(() => {
      expect(getByText("Hello John Doe")).toBeInTheDocument();
      expect(getByText("Laptop")).toBeInTheDocument();
      expect(getByText("Textbook")).toBeInTheDocument();
    });
 
    //   expect(getByText("Hello John Doe")).toBeInTheDocument();
    //   expect(getByText("Laptop")).toBeInTheDocument();
    //   expect(getByText("Textbook")).toBeInTheDocument();
  });

  it("calculates cart total price correctly", async () => {
    const { getByText } = render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    await waitFor(() => {
        expect(getByText("Total : $1,579.98")).toBeInTheDocument();
    });
    
  });

  it("removes item from cart when remove button is clicked", async () => {

    const {getAllByText} = render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    const removeButton = getAllByText("Remove")[0];
    fireEvent.click(removeButton);
    await waitFor(() => expect(setCartMock).toHaveBeenCalled());

    
  });
});



