import React from "react";
import { render, fireEvent, within, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Orders from "./Orders";
import moment from "moment";
import { useAuth } from "../../context/auth";


// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

const mockAuthUser = {
  user: {
    email: "Test@test.com",
    name: "Tester Test",
    phone: "+65test",
    address: "Blk Testing"
  },
  token: "test-token"
}

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [mockAuthUser, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

const mockProducts1 = [
  {
    _id: "1", name: "TV", slug: "tv", description: "Bestselling TV",
    price: 109.99, category: "Electronics", quantity: 2
  },
  {
    _id: "2", name: "Shoes", slug: "shoes", description: "Bestselling Sports Shoes",
    price: 19.99, category: "Clothing", quantity: 5
  },
]

const mockProducts2= [
  {
    _id: "3", name: "PS5 Controller", slug: "controller", description: "PS5 white controller",
    price: 60.99, category: "Gaming", quantity: 6
  },
  {
    _id: "4", name: "Socks", slug: "socks", description: "White ankle socks",
    price: 4.99, category: "Clothing", quantity: 10
  },
]

const mockOrders = {data : [{
  products: mockProducts1,
  payment: { success: true },
  createAt: new Date('2023-01-01T00:00:00Z'),
  status: "Shipped",
  buyer: { name: "Tester Test" }
}, 
{
  products: mockProducts2,
  payment: { success: false },
  createAt: new Date('2024-01-01T00:00:00Z'),
  status: "Shipped",
  buyer: { name: "Tester Test2" }
}, 
]};

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe("Orders Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  })

  it("renders orders page", async () => {
    axios.get.mockResolvedValue(mockOrders)
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
      mockOrders.data.forEach((order, i) => {
        const orderId = getByTestId(`order-${i}`);
        const orderSegment = within(orderId);
        
        expect(orderSegment.getByText(order.buyer.name)).toBeInTheDocument();
        expect(orderSegment.getAllByText(i + 1).length).toBeGreaterThan(0);
        expect(orderSegment.getByText(order.status)).toBeInTheDocument();
        expect(orderSegment.getByText(moment(order.createAt).fromNow())).toBeInTheDocument();
        expect(orderSegment.getByText(order.payment.success ? "Success" : "Failed"))
        expect(orderSegment.getAllByText(order.products.length).length).toBeGreaterThan(0);
        order.products.forEach((product, ind) => {
          const productId = getByTestId(`product-${i}-${ind}`);
          const productSegment = within(productId);
  
          expect(productSegment.getByText(product.name)).toBeInTheDocument();
          expect(productSegment.getByText(product.description)).toBeInTheDocument();
          expect(productSegment.getByText(`Price : ${product.price}`)).toBeInTheDocument();
        })
  
      })
    });
  });

  it("should log error if error gets thrown", async () => {
    axios.get.mockRejectedValue(new Error("Testing Error"));
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"))
    });
  });

  it("should have no orders if not authenticated", async () => {
    const mockSetAuth = jest.fn();
    useAuth.mockReturnValue([null, mockSetAuth]);    
    render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith("/api/v1/auth/orders");
    });
  });
});