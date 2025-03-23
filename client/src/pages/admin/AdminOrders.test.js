import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AdminOrders from "./AdminOrders";

// Mock dependencies
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("axios");
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

describe("AdminOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders orders and their details correctly", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);

    axios.get.mockResolvedValue({
      data: [
        {
          _id: "order1",
          status: "Processing",
          buyer: { name: "John" },
          createAt: "2024-03-01T12:00:00Z",
          payment: { success: true },
          products: [
            {
              _id: "prod1",
              name: "Product A",
              description: "Description A",
              price: 10,
            },
          ],
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });

    // Check if order details are displayed
    const johnElement = await screen.findByText("John");
    const successElement = await screen.findByText("Success");
    const productAElement = await screen.findByText("Product A");

    expect(johnElement).toBeInTheDocument();
    expect(successElement).toBeInTheDocument();
    expect(productAElement).toBeInTheDocument();
  });

  it("updates order status when changed", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);

    axios.get.mockResolvedValue({
      data: [
        {
          _id: "order1",
          status: "Processing",
          buyer: { name: "John" },
          createAt: "2024-03-01T12:00:00Z",
          payment: { success: true },
          products: [{ _id: "prod1", name: "Product A", price: 10 }],
        },
      ],
    });

    axios.put.mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    // Simulate changing status
    fireEvent.mouseDown(screen.getByText(/Processing/i));
    fireEvent.click(screen.getByText("Shipped"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/auth/order-status/order1",
        { status: "Shipped" }
      );
    });
  });

  it("handles when no orders are available", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });

    // No orders should be displayed
    expect(screen.queryByText("John")).not.toBeInTheDocument();
  });
});
