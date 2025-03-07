import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CartPage from "./CartPage";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Mocks
jest.mock("axios");

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("braintree-web-drop-in-react", () => {
  return function DropIn(props) {
    return (
      <div data-testid="mock-dropin">
        <button onClick={() => props.onInstance({ 
          requestPaymentMethod: async () => ({ nonce: 'fake-nonce' })
        })}>
          Mock DropIn
        </button>
      </div>
    );
  };
});

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("./../components/Layout", () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("CartPage Component", () => {
  const mockNavigate = jest.fn();
  const mockSetCart = jest.fn();
  
  const mockCartItem = {
    _id: "1",
    name: "Test Product",
    description: "Test Description",
    price: 100,
  };

  beforeEach(() => {
    // Setup default mocks
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue([{ user: null }, jest.fn()]);
    useCart.mockReturnValue([[mockCartItem], mockSetCart]);
    
    // Mock axios responses
    const mockGetResponse = { data: { clientToken: "test-token" } };
    const mockPostResponse = { data: { success: true } };
    
    axios.get.mockImplementation(() => 
      Promise.resolve(mockGetResponse)
    );
    axios.post.mockImplementation(() => 
      Promise.resolve(mockPostResponse)
    );

    // Clear localStorage before each test
    localStorage.clear();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  // TEST #1
  it("renders cart page with items", async () => {
    render(<CartPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Price : 100")).toBeInTheDocument();
    });
  });

  // TEST #2
  it("shows Update Address button for logged in users", async () => {
    // Test case 1: User with existing address
    cleanup();
    useAuth.mockReturnValue([{ 
      user: { 
        name: "Test User",
        address: "123 Test St"
      },
      token: "test-token"
    }, jest.fn()]);

    render(<CartPage />);
    
    // Verify "Current Address" section header
    await waitFor(() => {
      expect(screen.getByText("Current Address")).toBeInTheDocument();
    });
    
    // Verify actual address is displayed
    await waitFor(() => {
      expect(screen.getByText("123 Test St")).toBeInTheDocument();
    });
    
    // Verify update button is shown
    await waitFor(() => {
      expect(screen.getByText("Update Address")).toBeInTheDocument();
    });

    
    // Test case 2: User without address
    cleanup();
    useAuth.mockReturnValue([{ 
      user: { 
        name: "Test User"
      },
      token: "test-token"
    }, jest.fn()]);

    render(<CartPage />);

    // Verify update button appears
    await waitFor(() => {
      expect(screen.getByText("Update Address")).toBeInTheDocument();
    });
    
    // Verify current address section is not shown
    await waitFor(() => {
      expect(screen.queryByText("Current Address")).not.toBeInTheDocument();
    });

    // Verify clicking button navigates to profile page
    const updateButton = screen.getAllByText("Update Address")[0]; // Get first instance
    fireEvent.click(updateButton);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  // TEST #3
  it("calculates total price correctly", async () => {
    render(<CartPage />);
    await waitFor(() => {
      expect(screen.getByText("Total : $100.00")).toBeInTheDocument();
    });
  });

  // TEST #4
  it("removes item from cart when remove button is clicked", async () => {
    render(<CartPage />);
    
    // Find and click remove button
    const removeButton = await screen.findByText("Remove");
    fireEvent.click(removeButton);

    // Verify cart was updated
    await waitFor(() => {
      expect(mockSetCart).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(localStorage.getItem("cart")).toBe("[]");
    });
  });

  // TEST #5
  it("shows empty cart message when cart is empty", async () => {
    useCart.mockReturnValue([[], mockSetCart]);
    render(<CartPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Your Cart Is Empty")).toBeInTheDocument();
    });
  });

  // TEST #6
  it("shows login message for guest users", async () => {
    render(<CartPage />);
    await waitFor(() => {
      expect(screen.getByText("Hello Guest")).toBeInTheDocument();
    });
  });

  // TEST #7
  it("shows user name for logged in users", async () => {
    useAuth.mockReturnValue([{ 
      user: { name: "Test User" },
      token: "test-token"
    }, jest.fn()]);
    
    render(<CartPage />);
    await waitFor(() => {
      expect(screen.getByText(/Hello.*Test User/)).toBeInTheDocument();
    });
  });

  // TEST #8
  it("handles token fetch error gracefully", async () => {
    // Mock axios to simulate error
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch token"));
    
    render(<CartPage />);

    // Verify token fetch was attempted
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    // Verify DropIn is not rendered when token fetch fails
    await waitFor(() => {
      expect(screen.queryByTestId("mock-dropin")).not.toBeInTheDocument();
    });
  });

  // TEST #9
  it("handles payment error gracefully", async () => {
    // Mock authenticated user with address
    useAuth.mockReturnValue([{ 
      user: { 
        name: "Test User",
        address: "123 Test St"
      },
      token: "test-token"
    }, jest.fn()]);

    // Set initial cart state in localStorage
    const initialCart = JSON.stringify([mockCartItem]);
    localStorage.setItem("cart", initialCart);
    
    // Mock payment error
    axios.post.mockRejectedValueOnce(new Error("Payment failed"));

    render(<CartPage />);

    // Wait for DropIn to be rendered
    const dropIn = await screen.findByTestId("mock-dropin");
    expect(dropIn).toBeInTheDocument();

    // Click the mock DropIn button to simulate payment method selection
    const dropInButton = await screen.findByText("Mock DropIn");
    fireEvent.click(dropInButton);

    // Find and click payment button
    const paymentButton = await screen.findByText("Make Payment");
    fireEvent.click(paymentButton);

    // Verify cart was not cleared on payment failure
    await waitFor(() => {
      expect(localStorage.getItem("cart")).toBe(initialCart);
    });
    expect(mockSetCart).not.toHaveBeenCalledWith([]);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // TEST #10
  it("handles totalPrice calculation error gracefully", async () => {
    // Mock cart with invalid price
    const invalidCart = [{
      _id: "1",
      name: "Invalid Product",
      description: "Test Description",
      price: "invalid"
    }];
    useCart.mockReturnValue([invalidCart, mockSetCart]);

    render(<CartPage />);

    await waitFor(() => {
      const totalText = screen.getByText(/Total :.*/).textContent;
      expect(totalText).toMatch("Total : 0invalid ");
    });
  });

  // TEST #11
  it("verify correctness when user is not logged in and cart has items", async () => {
    useAuth.mockReturnValue([{ user: null }, jest.fn()]);
    useCart.mockReturnValue([[mockCartItem], mockSetCart]);

    render(<CartPage />);

    // Verify login button is shown
    const loginButton = await screen.findByText("Plase Login to checkout");
    expect(loginButton).toBeInTheDocument();

    // Verify clicking button navigates to login page with cart state
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/cart" });
  });

  // TEST #12
  it("handles payment process correctly for logged in users", async () => {
    // Mock authenticated user with address
    useAuth.mockReturnValue([{ 
      user: { 
        name: "Test User",
        address: "123 Test St"
      },
      token: "test-token"
    }, jest.fn()]);

    render(<CartPage />);

    // Wait for client token to be fetched and DropIn to be rendered
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    const dropIn = await screen.findByTestId("mock-dropin");
    expect(dropIn).toBeInTheDocument();

    // Click the mock DropIn button to simulate payment method selection
    const dropInButton = await screen.findByText("Mock DropIn");
    fireEvent.click(dropInButton);

    // Wait for Make Payment button and verify it's enabled
    const paymentButton = await screen.findByText("Make Payment");
    expect(paymentButton).not.toBeDisabled();

    // Test payment submission
    fireEvent.click(paymentButton);

    // Verify payment API was called with correct data
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        expect.objectContaining({
          nonce: "fake-nonce",
          cart: [mockCartItem]
        })
      );
    });

    // Verify cart was cleared after successful payment
    await waitFor(() => {
      expect(mockSetCart).toHaveBeenCalledWith([]);
    });
    await waitFor(() => {
      expect(localStorage.getItem("cart")).toBeNull();
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    });
  });
});
