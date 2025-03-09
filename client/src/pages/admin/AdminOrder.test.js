import React from "react";
import { render, fireEvent, waitFor} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("antd", () => {
  const actualAntd = jest.requireActual("antd");
  const MockSelect = ({
    children,
    onChange,
    "data-testid": testId,
    defaultValue,
  }) => (
    <select
      data-testid={testId}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );

  MockSelect.Option = ({ children, value }) => (
    <option value={value}>{children}</option>
  );

  return {
    ...actualAntd,
    Select: MockSelect,
  };
});

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => [{ _id: "1", name: "pen", slug: "pen", __v: 0 }]));

jest.mock("moment", () => {
    const actualMoment = jest.requireActual("moment");
    return (timestamp) => {
      return {
        fromNow: () => "1 minute ago", // Mock fixed output
        format: (formatStr) => actualMoment(timestamp).format(formatStr),
      };
    };
  });

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
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


describe("AdminOrders Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValue({
        data: [
          {
            _id: "1",
            status: "Not Process",
            buyer: { name: "CS 4218 Test Account" },
            createAt: "2025-02-04T09:30:00.000Z",
            payment: { success: false },
            products: [
              {
                _id: "product1",
                name: "Product 1",
                description: "Product 1 description",
                price: 100,
              },
              {
                _id: "product2",
                name: "Product 2",
                description: "Product 2 description",
                price: 100,
              },
            ],
          },
        ],
      });
      
  });

  it("renders AdminOrder form", async () => {

    const {findByText} = render(
      <MemoryRouter initialEntries={["/orders"]}>
        <Routes>
          <Route path="/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
        
  });

    expect(await findByText('CS 4218 Test Account')).not.toBeNull();
    expect(await findByText('Not Process')).not.toBeNull();
    expect(await findByText('Failed')).not.toBeNull();
    expect(await findByText('1')).not.toBeNull();
    expect(await findByText('2')).not.toBeNull();
    expect(await findByText('1 minute ago')).not.toBeNull();

  
})

it("should not fetch orders when not authenticated", async () => {
  useAuth.mockReturnValue([
    {
      token: ""
    }, jest.fn()
  ]); 
  const {} = render(
    <MemoryRouter initialEntries={["/orders"]}>
      <Routes>
        <Route path="/orders" element={<AdminOrders />} />
      </Routes>
    </MemoryRouter>
  );    
  expect(axios.get).not.toHaveBeenCalled();

})

it("Change order status to Processing", async () => {
    axios.put.mockResolvedValue({
        data: { success: true },
      });
    const {findByText, getByTestId} = render(
      <MemoryRouter initialEntries={["/orders"]}>
        <Routes>
          <Route path="/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
        
  });

  expect(await findByText('CS 4218 Test Account')).not.toBeNull();
  
  const select = getByTestId(`selectElement`);
  
  fireEvent.change(select, { target: { value: "Processing" } });


  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/1", {
      status: "Processing",
    });
  });  
  
})

it("Error when Change order status to Processing", async () => {
  axios.put.mockRejectedValueOnce(
    new Error("Failed to update order status")
    );
  const {findByText, getByTestId} = render(
    <MemoryRouter initialEntries={["/orders"]}>
      <Routes>
        <Route path="/orders" element={<AdminOrders />} />
      </Routes>
    </MemoryRouter>
  );    
  await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
      
});

expect(await findByText('CS 4218 Test Account')).not.toBeNull();

const select = getByTestId(`selectElement`);

fireEvent.change(select, { target: { value: "Processing" } });


await waitFor(() => {
  expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/1", {
    status: "Processing",
  });
});  
expect(toast.error).toHaveBeenCalledWith("Failed to update order status");



})

it("Error when get order", async () => {
  axios.get.mockRejectedValueOnce(
    new Error("Failed to get order")
    );
  const {queryByText} = render(
    <MemoryRouter initialEntries={["/orders"]}>
      <Routes>
        <Route path="/orders" element={<AdminOrders />} />
      </Routes>
    </MemoryRouter>
  );    
  await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
      
});

expect(await queryByText('CS 4218 Test Account')).toBeNull();



})
 


})