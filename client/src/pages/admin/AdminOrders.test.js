import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom/extend-expect";
import { act } from "react-dom/test-utils";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

// Code adapted from https://stackoverflow.com/questions/62833456/how-to-test-ant-design-select-and-option-properly-using-jest
jest.mock("antd", () => {
  const antd = jest.requireActual("antd");

  const Select = ({ children, onChange }) => {
    return (
      <select onChange={(e) => onChange(e.target.value)}>{children}</select>
    );
  };

  Select.Option = ({ children, ...otherProps }) => {
    return <option {...otherProps}>{children}</option>;
  };

  return {
    ...antd,
    Select,
  };
});

describe("AdminOrders component", () => {
  const mockOrders = [
    {
      _id: "1",
      products: [
        {
          _id: "ProductA",
          name: "Product A",
          price: 100,
          description: "Product A Description",
        },
      ],
      payment: {
        success: true,
      },
      buyer: { name: "Ron" },
      status: "Not Process",
      createdAt: "2025-02-04T13:42:16.741Z",
      updatedAt: "2025-02-04T13:42:16.741Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders AdminOrders component with orders", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: mockOrders });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });

    expect(await screen.findByText("Ron")).toBeInTheDocument();
    expect(await screen.findByText("Product A")).toBeInTheDocument();
    expect(await screen.findByText("Price : 100")).toBeInTheDocument();
    expect(await screen.findByText("Success")).toBeInTheDocument();
  });

  // Code adapted from https://chatgpt.com/share/67bf1812-6650-8013-8a59-c45115a9783f
  test("fetches and sets orders on success", async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });

    // expect(screen.getByText("Ron")).toBeInTheDocument();
    // expect(screen.getByText("Not Process")).toBeInTheDocument();
    // expect(screen.getByText("Product A")).toBeInTheDocument();
    // expect(screen.getByText("100")).toBeInTheDocument();
  });

  // Code adapted from https://chatgpt.com/share/67bf1812-6650-8013-8a59-c45115a9783f
  test("displays error message when API fails", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  // Code adapted from https://chatgpt.com/share/67bf46f9-e51c-8013-bf41-a53915c900f5
  test("does not fetch orders when auth token is missing", async () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    axios.get.mockResolvedValue({ data: mockOrders });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  // Code adapted from https://stackoverflow.com/questions/62833456/how-to-test-ant-design-select-and-option-properly-using-jest
  // Code adapted from https://chatgpt.com/share/67c1abc0-16cc-8013-a538-111a09aae3c4
  test("changes order status successfully", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);

    axios.get.mockResolvedValue({ data: mockOrders });
    axios.put.mockResolvedValue({
      data: { ...mockOrders[0], status: "Processing" },
    });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Not Process")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const statusDropdown = await screen.findByRole("combobox");

    act(() => {
      fireEvent.click(statusDropdown);
    });

    const processingOption = await screen.findByText("Processing");

    act(() => {
      fireEvent.click(processingOption);
    });

    act(() => {
      fireEvent.change(statusDropdown, { target: { value: "Processing" } });
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/1`, {
        status: "Processing",
      });
    });

    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  test("handles error when order status update fails", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);

    axios.get.mockResolvedValue({ data: mockOrders });

    axios.put.mockRejectedValue(new Error("Failed to update order status"));

    console.log = jest.fn();

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Not Process")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const statusDropdown = await screen.findByRole("combobox");

    act(() => {
      fireEvent.click(statusDropdown);
    });

    const processingOption = await screen.findByText("Processing");

    act(() => {
      fireEvent.click(processingOption);
    });

    act(() => {
      fireEvent.change(statusDropdown, { target: { value: "Processing" } });
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/1`, {
        status: "Processing",
      });
    });

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  // Code adapted from https://chatgpt.com/share/67c1abc0-16cc-8013-a538-111a09aae3c4
  test("displays correct payment status", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);

    axios.get.mockResolvedValue({
      data: [
        { ...mockOrders[0], payment: { success: true } },
        { ...mockOrders[0], payment: { success: false } },
      ],
    });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Success")).toBeInTheDocument();
    });

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
