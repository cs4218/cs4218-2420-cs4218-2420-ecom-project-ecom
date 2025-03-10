import React from "react";
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import CartPage from './CartPage';
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import DropIn from "braintree-web-drop-in-react";
import { describe, mock } from "node:test";

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

jest.mock('braintree-web-drop-in-react', () => ({
  __esModule: true,
  default: ({ onInstance }) => {
      setTimeout(() => {
          const mockInstance = {
              requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: 'mock-nonce' }),
          };

          onInstance(mockInstance); // Call onInstance with the mock instance
      }, 0);
      return null; // Return a mock component
  },
}));

jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => <div>mock</div>),
}));



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

describe('CartPage Component', () => {

    let mockCartFilled, mockCartEmpty, setCartMock, mockAuthUser, mockAuthNoUser;
    beforeEach(() => {
    jest.clearAllMocks();

    mockCartFilled = [
        {
          "_id": {
            "$oid": "66db427fdb0119d9234b27f1"
          },
          "name": "Textbook",
          "slug": "textbook",
          "description": "A textbook",
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
          "description": "A laptop",
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

    mockCartEmpty = [];
    setCartMock = jest.fn(); 
    mockAuthUser = { user: { name: "Jamie Tan", address: "1 Computing Drive" }, token: "token123" };
    mockAuthNoUser = {}
    axios.get.mockResolvedValue({ data: { clientToken: "mockClientToken" } });
  });

  describe('User logged in and cart is not empty', () => {
  it('should display header correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);

    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    expect(screen.getByText("Hello Jamie Tan")).toBeInTheDocument(); //header greets user
    expect(screen.getByText(`You Have ${mockCartFilled.length} items in your cart`)).toBeInTheDocument(); //header shows number of items 
  });

  it('should display cart items correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });

    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Textbook")).toBeInTheDocument();
    expect(removeButtons.length).toBe(2);

  });

   it("removes item from cart when remove button is clicked", async () => {

    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );

    const removeButton = await screen.findAllByRole('button', { name: "Remove" });
    fireEvent.click(removeButton[1]);
    await waitFor(() => expect(setCartMock).toHaveBeenCalled());
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([mockCartFilled[0]]
    ));
  });

  it('should display total price correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
    expect(screen.getByText("Total : $1,579.98")).toBeInTheDocument(); //calculates total price correctly
  });

  it('display user address correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
    expect(screen.getByText("1 Computing Drive")).toBeInTheDocument(); //displays address
  });

  it('update address button displays and navigates correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    useNavigate.mockReturnValue(jest.fn());
    let mockNavigate = jest.fn();;
    useNavigate.mockReturnValue(mockNavigate);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
    const updateAddressButton = await screen.findByRole('button', { name: "Update Address" });
    expect(updateAddressButton).toBeInTheDocument();  
    fireEvent.click(updateAddressButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
    });
  });

  it("should correctly handle payment", async () => {

    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    await axios.get.mockResolvedValue({ data: { clientToken: "token" } });

    DropIn.mockImplementationOnce(({ onInstance }) => {
        setTimeout(() => {
            onInstance({
                requestPaymentMethod: jest
                    .fn()
                    .mockResolvedValue({ nonce: "nonce" }),
            });
        }, 1);
        return <div>dropin</div>;
    });

    await axios.post.mockResolvedValueOnce({ data: null });
    localStorage.setItem("cart", JSON.stringify(setCartMock));

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText("Make Payment")).not.toBeDisabled();
    })

    fireEvent.click(screen.getByText("Make Payment"));

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
            "/api/v1/product/braintree/payment",
            {
                nonce: "nonce",
                cart: mockCartFilled,
            }
        );
    });

    await expect(setCartMock).toHaveBeenCalledWith([]);
    await expect(localStorage.removeItem).toHaveBeenCalledWith("cart");
    await expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    await expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully ");
  });

describe('User logged in and cart is empty', () => {
  it('should display header correctly', async () => {
    useCart.mockReturnValue([mockCartEmpty, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    expect(screen.getByText("Hello Jamie Tan")).toBeInTheDocument(); //header greets user
    expect(screen.getByText(`Your Cart Is Empty`)).toBeInTheDocument(); //header shows number of items 
  });

  it('should display no cart items', async () => {
    useCart.mockReturnValue([mockCartEmpty, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );

      const removeButton = screen.queryByText('Remove')
      expect(removeButton).not.toBeInTheDocument();
  });
  it('should display total price correctly', async () => {
    useCart.mockReturnValue([mockCartEmpty, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
    expect(screen.getByText("Total : $0.00")).toBeInTheDocument(); //display total price = 0 correctly
  });

  it('display user address correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
    expect(screen.getByText("1 Computing Drive")).toBeInTheDocument(); //displays address

  });

  it('update update button displays and navigates correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthUser, jest.fn()]);
    let mockNavigate = jest.fn();;
    useNavigate.mockReturnValue(mockNavigate);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
    const updateAddressButton = await screen.findByRole('button', { name: "Update Address" });
    expect(updateAddressButton).toBeInTheDocument();  //update address button
    fireEvent.click(updateAddressButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
    });
  });
});

describe('User not logged in and cart is not empty', () => {
  it('should display header correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthNoUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText("Hello Guest")).toBeInTheDocument(); //header greets user
      expect(screen.getByText(`You Have ${mockCartFilled.length} items in your cart please login to checkout !`)).toBeInTheDocument(); //header shows number of items 
  });

  it('should display cart items correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthNoUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });

    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Textbook")).toBeInTheDocument();
    expect(removeButtons.length).toBe(2);

  });
  it('should display total price correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthNoUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
    expect(screen.getByText("Total : $1,579.98")).toBeInTheDocument(); //calculates total price correctly
  });

  it('display and navigate login correctly', async () => {
    useCart.mockReturnValue([mockCartFilled, setCartMock]);
    useAuth.mockReturnValue([mockAuthNoUser, jest.fn()]);
    let mockNavigate = jest.fn();;
    useNavigate.mockReturnValue(mockNavigate);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
      const loginButton = await screen.findByRole('button', { name : "Plase Login to checkout"});
      expect(loginButton).toBeInTheDocument(); 
      fireEvent.click(loginButton);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login", {"state": "/cart"});
      });
  });

});
describe('User not logged in and cart is empty', () => {
  it('should display header correctly', async () => {
    useCart.mockReturnValue([mockCartEmpty, setCartMock]);
    useAuth.mockReturnValue([mockAuthNoUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText("Hello Guest")).toBeInTheDocument(); //header greets user
      expect(screen.getByText(`Your Cart Is Empty`)).toBeInTheDocument();
      });

  it('should display no cart items', async () => {
    useCart.mockReturnValue([mockCartEmpty, setCartMock]);
    useAuth.mockReturnValue([mockAuthNoUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );

      const removeButton = screen.queryByText('Remove')
      expect(removeButton).not.toBeInTheDocument();
  });

  it('should display total price correctly', async () => {
    useCart.mockReturnValue([mockCartEmpty, setCartMock]);
    useAuth.mockReturnValue([mockAuthNoUser, jest.fn()]);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
    expect(screen.getByText("Total : $0.00")).toBeInTheDocument(); //calculates total price correctly
  });

  it('display and navigate login correctly', async () => {
    useCart.mockReturnValue([mockCartEmpty, setCartMock]);
    useAuth.mockReturnValue([mockAuthNoUser, jest.fn()]);
    let mockNavigate = jest.fn();;
    useNavigate.mockReturnValue(mockNavigate);
    render(
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
      const loginButton = await screen.findByRole('button', { name : "Plase Login to checkout"});
      expect(loginButton).toBeInTheDocument(); 
      fireEvent.click(loginButton);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login", {"state": "/cart"});
      });
  });

});
  
})
}
);

