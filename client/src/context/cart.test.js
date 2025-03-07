import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { CartProvider, useCart } from './cart';

// Mock localStorage
const mockCart = [
  {
    _id: "66db427fdb0119d9234b27f9",
    name: "Novel",
    slug: "novel",
    description: "A bestselling novel",
    category: "66db427fdb0119d9234b27ef",
    createdAt: "2024-09-06T17:57:19.992Z",
    price: 14.99,
    quantity: 200,
    shipping: true,
    updatedAt: "2024-09-06T17:57:19.992Z",
    __v: 0,
  },
  {
    _id: "66db427fdb0119d9234b27f3",
    name: "Laptop",
    slug: "laptop",
    description: "A powerful laptop",
    category: "66db427fdb0119d9234b27ed",
    createdAt: "2024-09-06T17:57:19.971Z",
    price: 1499.99,
    quantity: 30,
    shipping: true,
    updatedAt: "2024-09-06T17:57:19.971Z",
    __v: 0,
  },
];

const smartphone = {
  _id: "66db427fdb0119d9234b27f5",
  name: "Smartphone",
  slug: "smartphone",
  description: "A high-end smartphone",
  price: 999.99,
  category: "66db427fdb0119d9234b27ed",
  quantity: 50,
  shipping: false,
  createdAt: "2024-09-06T17:57:19.978+00:00",
  updatedAt: "202-09-06T17:57:19.978+00:00",
  __v: 0,
};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => JSON.stringify(mockCart)),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe('CartProvider', () => {
  let cart;
  const TestComponent = () => {
    cart = useCart()[0];
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST #1
  it('initializes with an empty cart if localStorage is empty or returns an empty array', () => {
    localStorage.getItem.mockReturnValueOnce(null);

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(cart).toEqual([]);

    localStorage.getItem.mockReturnValueOnce(JSON.stringify([]));
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(cart).toEqual([]);
  });

  // TEST #2
  it('loads cart from localStorage', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(cart).toEqual(mockCart);
  });

  // TEST #3
  it('updates the cart state correctly', () => {
    let setCart;
    const TestComponentWithSetCart = () => {
      [cart, setCart] = useCart();
      return (
        <button onClick={() => setCart([...cart, smartphone])}>
          Add Product
        </button>
      );
    };

    render(
      <CartProvider>
        <TestComponentWithSetCart />
      </CartProvider>
    );

    fireEvent.click(screen.getByText('Add Product'));

    expect(cart).toEqual([...mockCart, smartphone]);
  });
});

describe('useCart', () => {
  let cart, setCart;
  const TestComponent = () => {
    [cart, setCart] = useCart();
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST #4
  it('provides cart context', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(cart).toEqual(mockCart);
    expect(typeof setCart).toBe('function');
  });
});