import React from "react";
import { render, waitFor} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Products from "./Products";

// Mocking axios.post
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

jest.mock("../../hooks/useCategory", () => jest.fn(() => [{ _id: "1", name: "pen", slug: "pen", __v: 0 }]));

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


describe("CreateProduct Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
    
  });

  it("renders Products form", async () => {
    axios.get.mockResolvedValue({
        data: {
          success: true,
          counTotal: 6,
          message: "ALlProducts ",
          products: [
        {
            "_id": "1",
            "name": "productname1",
            "slug": "productname1",
            "description": "product1 description",
            "price": 54.99,
            "category": "History",
            "quantity": 200,
            "shipping": true,
            "createdAt": "2024-09-06T17:57:19.992Z",
            "updatedAt": "2024-09-06T17:57:19.992Z",
            "__v": 0
        },
        {
            "_id": "2",
            "name": "productname2",
            "slug": "prodcutname2",
            "description": "product2 description",
            "price": 4.99,
            "category": "Fiction",
            "quantity": 200,
            "shipping": true,
            "createdAt": "2024-09-06T17:57:19.992Z",
            "updatedAt": "2025-02-25T08:24:07.496Z",
            "__v": 0
        }
        ],
      }
  });
    const {getByText } = render(
      <MemoryRouter initialEntries={["/products"]}>
        <Routes>
          <Route path="/products" element={<Products />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
    expect(getByText(/productname1/i)).toBeInTheDocument();
    expect(getByText(/product1 description/i)).toBeInTheDocument();
    expect(getByText(/productname2/i)).toBeInTheDocument();
    expect(getByText(/product2 description/i)).toBeInTheDocument();
  });
})

it("Error when render Products form", async () => {

    axios.get.mockRejectedValueOnce(
        new Error("Error fetching products")
      );   

    const {getByText } = render(
      <MemoryRouter initialEntries={["/products"]}>
        <Routes>
          <Route path="/products" element={<Products />} />
        </Routes>
      </MemoryRouter>
    );    

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Someething Went Wrong");
  })
}) 



});
