import React, { useState, useEffect } from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CartPage from "./CartPage";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import axios from "axios";

jest.mock("axios");
jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));
jest.mock("../components/Layout", () => ({ children }) => <div data-testid="layout">{children}</div>);
jest.mock("../context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  }
}));
jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock API responses
axios.get.mockImplementation((url) => {
    if (url.includes("braintree/token")) return Promise.resolve({ data: { clientToken: "testToken" } });
});

axios.post.mockImplementation((url) => {
    if (url.includes("braintree/payment")) return Promise.resolve({ data: { success: true } });
});

describe("CartPage Page Unauthenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([[], jest.fn()]);
    useAuth.mockReturnValue([{}, jest.fn()]);
  });

  it("Should show guest when unauthenticated", async () => {
    // Test
    await act(async () => render(<CartPage />));
    expect(screen.getByText("Hello Guest")).toBeInTheDocument();
  });
});

describe("CartPage Page Authenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([[], jest.fn()]);
    useAuth.mockReturnValue([{
      token: "testToken",
      user: {
        name: "testName",
        email: "test@email.com",
        address: "testAddress",
      }
    }, jest.fn()]);
  });

  it("Should show name when authenticated", async () => {
    // Test
    await act(async () => render(<CartPage />));
    expect(screen.getByText("Hello testName")).toBeInTheDocument();
  });
});

describe("CartPage Cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([[], jest.fn()]);
    useAuth.mockReturnValue([{
      token: "testToken",
      user: {
        name: "testName",
        email: "test@email.com",
        address: "testAddress",
      }
    }, jest.fn()]);
  });

  it("Should show cart items", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" },
    ], jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    expect(screen.getByText("Paper")).toBeInTheDocument();
    expect(screen.getByText("Pencil")).toBeInTheDocument();
  });

  it("Should show total price as $0.00 when no items in cart", async () => {
    // Test
    await act(async () => render(<CartPage />));
    expect(screen.getByText("Total : $0.00")).toBeInTheDocument();
  });

  it("Should show total price as single item price", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" },
    ], jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    expect(screen.getByText("Total : $2.50")).toBeInTheDocument();
  });

  it("Should show total price as sum", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" },
    ], jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    expect(screen.getByText("Total : $3.50")).toBeInTheDocument();
  });

  it("Should throw error when single price is invalid", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: "invalid", description: "A4" },
    ], jest.fn()]);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Test
    await act(async () => render(<CartPage />));
    expect(consoleSpy).toHaveBeenCalledWith(new Error("Price is not a number"));

    // Cleanup
    consoleSpy.mockRestore();
  });

  it("Should throw error when any price is invalid", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: "invalid", description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" },
    ], jest.fn()]);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Test
    await act(async () => render(<CartPage />));
    expect(consoleSpy).toHaveBeenCalledWith(new Error("Price is not a number"));

    // Cleanup
    consoleSpy.mockRestore();
  });

  it("Should throw error when single price is negative", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: -2.5, description: "A4" },
    ], jest.fn()]);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Test
    await act(async () => render(<CartPage />));
    expect(consoleSpy).toHaveBeenCalledWith(new Error("Price is negative"));

    // Cleanup
    consoleSpy.mockRestore();
  });

  it("Should throw error when any price is negative", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: -2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" },
    ], jest.fn()]);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Test
    await act(async () => render(<CartPage />));
    expect(consoleSpy).toHaveBeenCalledWith(new Error("Price is negative"));

    // Cleanup
    consoleSpy.mockRestore();
  });

  it("Should show correct number of items in cart", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" },
    ], jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    expect(screen.queryByText(/You have 2 items/i)).toBeInTheDocument();
  });

  it("Should show correct number of items in single item cart", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" },
    ], jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    expect(screen.queryByText(/You have 1 item/i)).toBeInTheDocument();
  });

  it("Should show correct number of items in empty cart", async () => {
    // Setup
    useCart.mockReturnValue([[], jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    expect(screen.queryByText(/Empty/i)).toBeInTheDocument();
  });

  it("Should not show login button when token is present", async () => {
    // Setup
    useAuth.mockReturnValue([{ token: "testToken" }, jest.fn()]);
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" }
    ], jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    expect(screen.queryByText("You have 2 items in your cart. Please login to checkout!")).not.toBeInTheDocument();
  });

  it("Should show login button when token is absent", async () => {
    // Setup
    useAuth.mockReturnValue([{}, jest.fn()]);
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" }
    ], jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    expect(screen.queryByText("You have 2 items in your cart. Please login to checkout!")).toBeInTheDocument();
  });
});

describe("CartPage Remove Items", () => {
  let mockSetCart;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetCart = jest.fn();
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" },
    ], mockSetCart]);
    useAuth.mockReturnValue([{
      token: "testToken",
      user: {
        name: "testName",
        address: "testAddress",
      }
    }, jest.fn()]);
  });

  it("Should not be able to remove from empty cart", async () => {
    // Setup
    useCart.mockReturnValue([[], jest.fn()]);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Test
    await act(async () => render(<CartPage />));

    // Assert
    let removeButtons = screen.queryAllByRole("button", { name: "Remove" });
    expect(removeButtons).toHaveLength(0);
    expect(mockSetCart).not.toHaveBeenCalled();

    // Cleanup
    consoleSpy.mockRestore();
  });

  it("Should remove item from cart", async () => {
    // Test
    await act(async () => render(<CartPage />));

    // Assert
    expect(screen.queryByText("Paper")).toBeInTheDocument();
    expect(screen.queryByText("Pencil")).toBeInTheDocument();

    // Test
    let removeButtons = screen.getAllByRole("button", { name: "Remove" });
    fireEvent.click(removeButtons[0]);

    // Assert
    expect(removeButtons).toHaveLength(2);
    expect(mockSetCart).toHaveBeenCalledWith([{ _id: "2", name: "Pencil", price: 1, description: "2B" }]);
  });

  it("Should throw error when item _id is null", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: null, name: "Paper", price: 2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" },
    ], mockSetCart]);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Test
    await act(async () => render(<CartPage />));
    let removeButtons = screen.getAllByRole("button", { name: "Remove" });
    fireEvent.click(removeButtons[0]);
    expect(consoleSpy).toHaveBeenCalledWith(new Error("Product id is invalid"));

    // Cleanup
    consoleSpy.mockRestore();
  });

  it("Should throw error when item _id is falsy", async () => {
    // Setup
    useCart.mockReturnValue([[
      { _id: "", name: "Paper", price: 2.5, description: "A4" },
      { _id: "2", name: "Pencil", price: 1, description: "2B" },
    ], mockSetCart]);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Test
    await act(async () => render(<CartPage />));
    let removeButtons = screen.getAllByRole("button", { name: "Remove" });
    fireEvent.click(removeButtons[0]);
    expect(consoleSpy).toHaveBeenCalledWith(new Error("Product id is invalid"));

    // Cleanup
    consoleSpy.mockRestore();
  });
});

describe("CartPage Token", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([[], jest.fn()]);
    useAuth.mockReturnValue([{
      token: "testToken",
      user: {
        name: "testName",
        address: "testAddress",
      }
    }, jest.fn()]);
  });

  it("Should log error when token retrieval fails", async () => {
    // Setup
    axios.get.mockImplementation(() => Promise.reject(new Error("Client Token Error")));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Test
    await act(async () => render(<CartPage />));
    expect(consoleSpy).toHaveBeenCalledWith(new Error("Client Token Error"));

    // Cleanup
    consoleSpy.mockRestore();
  });
});

describe("CartPage Navigation", () => {
  let mockNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useCart.mockReturnValue([[], jest.fn()]);
    axios.get.mockImplementation(() => Promise.resolve({ data: { clientToken: "testToken" } }));
  });

  it("Should navigate when Update Address is clicked with token with user address", async () => {
    // Setup
    useAuth.mockReturnValue([{ token: "fakeToken", user: { address: "testAddress" } }, jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    const button = screen.getByRole("button", { name: "Update Address" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("Should navigate when Update Address is clicked without token with user address", async () => {
    // Setup
    useAuth.mockReturnValue([{ user: { address: "testAddress" } }, jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    const button = screen.getByRole("button", { name: "Update Address" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("Should navigate when Update Address is clicked with token without user address", async () => {
    // Setup
    useAuth.mockReturnValue([{ token: "fakeToken" }, jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    const button = screen.getByRole("button", { name: "Update Address" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("Should navigate to /login when Please Login to checkout is clicked without token without user address", async () => {
    // Setup
    useAuth.mockReturnValue([{}, jest.fn()]);

    // Test
    await act(async () => render(<CartPage />));
    const button = screen.getByRole("button", { name: "Please Login to checkout" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/login", {"state": "/cart"});
  });
})

describe("Braintree DropIn Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([[
      { _id: "1", name: "Paper", price: 2.5, description: "A4" }
    ], jest.fn()]);
    useAuth.mockReturnValue([{
      token: "testToken",
      user: {
        name: "testName",
        email: "testEmail",
        address: "testAddress",
      }}, jest.fn()]);
    axios.get.mockImplementation(() => Promise.resolve({ data: { clientToken: "fakeToken" } }));
  });

  it("Should call handlePayment successfully", async () => {
    // Setup
    const mockInstance = { requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: "fake-nonce" }) };
    
    DropIn.mockImplementation(({ onInstance }) => {
      useEffect(() => {
        onInstance(mockInstance);
      }, []);
      return <div data-testid="mock-dropin">Mock DropIn</div>;
    });
  
    // Test
    await act(async () => render(<CartPage />));
    const makePaymentButton = screen.getByRole("button", { name: "Make Payment" });
    await act(async () => fireEvent.click(makePaymentButton));

    expect(screen.getByTestId("mock-dropin")).toBeInTheDocument();
    await waitFor(() => expect(mockInstance.requestPaymentMethod).toHaveBeenCalled());
  });

  it("Should call handlePayment unsuccessfully if post request fails", async () => {
    // Setup
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const mockInstance = { requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: "fake-nonce" }) };
    axios.post.mockImplementation(() => Promise.reject(new Error("Payment Error")));
    
    DropIn.mockImplementation(({ onInstance }) => {
      useEffect(() => {
        onInstance(mockInstance);
      }, []);
      return <div data-testid="mock-dropin">Mock DropIn</div>;
    });
  
    // Test
    await act(async () => render(<CartPage />));

    const makePaymentButton = screen.getByRole("button", { name: "Make Payment" });
    await act(async () => fireEvent.click(makePaymentButton));
  
    expect(screen.getByTestId("mock-dropin")).toBeInTheDocument();
    await waitFor(() => expect(mockInstance.requestPaymentMethod).toHaveBeenCalled());
    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(new Error("Payment Error")));

    // Cleanup
    consoleSpy.mockRestore();
  }); 
});
