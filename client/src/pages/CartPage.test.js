import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  getAllByText,
} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";
import CartPage from "./CartPage";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useSearch } from "../context/search";
import { describe } from "node:test";

// Mocking axios and other hooks
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: jest.fn(() => <div>DropIn Component</div>),
}));

// Mocking context hooks
jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [[], jest.fn()]),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Mocking localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(() =>
      JSON.stringify([{ _id: "1", name: "Product 1", price: 100 }])
    ),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe("CartPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the cart page with the correct items", () => {
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product 1",
          price: 100,
          description: "Product 1 description",
          imageUrl: "img.jpg",
        },
        {
          _id: "2",
          name: "Product 2",
          price: 150,
          description: "Product 2 description",
          imageUrl: "img2.jpg",
        },
      ],
      jest.fn(),
    ]);

    useAuth.mockReturnValue([
      {
        token: "mockToken",
        user: { name: "John Doe", address: "123 Main St" },
      },
      jest.fn(),
    ]);

    const { getByText, getByAltText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Hello John Doe")).toBeInTheDocument();
    expect(getByText("You Have 2 items in your cart")).toBeInTheDocument();
    expect(getByAltText("Product 1")).toBeInTheDocument();
    expect(getByAltText("Product 2")).toBeInTheDocument();
  });

  it("should remove an item from the cart", () => {
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product 1",
          price: 100,
          description: "Product 1 description",
          imageUrl: "img.jpg",
        },
        {
          _id: "2",
          name: "Product 2",
          price: 150,
          description: "Product 2 description",
          imageUrl: "img2.jpg",
        },
      ],
      jest.fn(),
    ]);

    const { getAllByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    const removeButtons = getAllByText("Remove");
    expect(removeButtons.length).toBe(2);
    fireEvent.click(removeButtons[0]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([
        {
          _id: "2",
          name: "Product 2",
          price: 150,
          description: "Product 2 description",
          imageUrl: "img2.jpg",
        },
      ])
    );
  });

  it("should display the total price correctly", () => {
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product 1",
          price: 100,
          description: "Product 1 description",
          imageUrl: "img.jpg",
        },
        {
          _id: "2",
          name: "Product 2",
          price: 150,
          description: "Product 2 description",
          imageUrl: "img2.jpg",
        },
      ],
      jest.fn(),
    ]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Total : $250.00")).toBeInTheDocument();
  });

  it.skip("should handle payment successfully", async () => {
    useAuth.mockReturnValue([
      {
        token: "mockToken",
        user: { name: "John Doe", address: "123 Main St" },
      },
      jest.fn(),
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product 1",
          price: 100,
          description: "Product 1 description",
          imageUrl: "img.jpg",
        },
      ],
      jest.fn(),
    ]);

    const mockPaymentResponse = { success: true };
    axios.post.mockResolvedValueOnce(mockPaymentResponse);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => getByText("Make Payment"));

    // Find the button and assert that it is clickable
    const button = getByText("Make Payment");
    expect(button).toBeEnabled();

    // Trigger the button click
    fireEvent.click(button);
    expect(toast.success).toHaveBeenCalledWith(
      "Payment Completed Successfully"
    );
  });

  it.skip("should display error message on payment failure", async () => {
    useAuth.mockReturnValue([
      {
        token: "mockToken",
        user: { name: "John Doe", address: "123 Main St" },
      },
      jest.fn(),
    ]);
    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Product 1",
          price: 100,
          description: "Product 1 description",
          imageUrl: "img.jpg",
        },
      ],
      jest.fn(),
    ]);

    const mockPaymentError = { message: "Payment failed" };
    axios.post.mockRejectedValueOnce(mockPaymentError);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => getByText("Make Payment"));

    // Find the button and assert that it is clickable
    const button = getByText("Make Payment");
    expect(button).toBeEnabled();

    // Trigger the button click
    fireEvent.click(button);
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("should show 'Please login to checkout' when user is not logged in", () => {
    useAuth.mockReturnValue([null, jest.fn()]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      getByText((content) => content.includes("please login to checkout"))
    ).toBeInTheDocument();
  });

  it("should show update address button if user has address", () => {
    useAuth.mockReturnValue([
      {
        token: "mockToken",
        user: { name: "John Doe", address: "123 Main St" },
      },
      jest.fn(),
    ]);
    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(getByText("Update Address")).toBeInTheDocument();
  });

  it("should navigate to login page when user is not logged in", () => {
    const navigate = jest.fn();
    useAuth.mockReturnValue([null, jest.fn()]);
    useNavigate.mockReturnValue(navigate);
    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByText("Please Login to checkout"));
    expect(navigate).toHaveBeenCalledWith("/login", { state: "/cart" });
  });
});
