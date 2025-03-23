import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "./HomePage";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [[], jest.fn()]), // Mock useCart hook
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../components/Layout", () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("HomePage Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('renders HomePage', () => {
    const {getByText} = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(getByText('All Products')).toBeInTheDocument(); // Adjust to match actual text or element in HomePage
  });

  it("initially fetches categories and renders checkboxes", async () => {
    // Mock axios.get to return categories
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [
          { _id: "1", name: "Electronics" },
          { _id: "2", name: "Book" },
          { _id: "3", name: "Clothing" },
        ],
      },
    });

    // Render the HomePage component with MemoryRouter and Routes
    const { getByText, getByLabelText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for categories to be rendered
    await waitFor(() => expect(getByText("Electronics")).toBeInTheDocument());
    await waitFor(() => expect(getByText("Book")).toBeInTheDocument());
    await waitFor(() => expect(getByText("Clothing")).toBeInTheDocument());

    // Check that checkboxes for categories are rendered
    expect(getByLabelText("Electronics")).toBeInTheDocument();
    expect(getByLabelText("Book")).toBeInTheDocument();
    expect(getByLabelText("Clothing")).toBeInTheDocument();
  });

  it("fetches products and displays name and price", async () => {
    // Mock API response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        products: [
          { _id: "1", name: "Textbook", price: 79.99, description: "A comprehensive textbook", slug: "textbook-slug" },
          { _id: "2", name: "Laptop", price: 999.99, description: "A high-performance laptop", slug: "laptop-slug" },
        ],
      },
    });


    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              { _id: "1", name: "Textbook", price: 79.99, description: "A comprehensive textbook", slug: "textbook-slug" },
              { _id: "2", name: "Laptop", price: 999.99, description: "A high-performance laptop", slug: "laptop-slug" },
            ],
          },
        });
      }
      return Promise.resolve({ data: { success: false, products: [] } });
    });
    
  
    // Render HomePage
    const { getByTestId} = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    // console.log(axios.get.mock.calls);
    // screen.debug();


  
    // Wait for individual product elements to render
    await waitFor(() => expect(getByTestId("product-1")).toBeInTheDocument());
    await waitFor(() => expect(getByTestId("product-name-1")).toHaveTextContent("Textbook"));
  
    await waitFor(() => expect(getByTestId("product-2")).toBeInTheDocument());
    await waitFor(() => expect(getByTestId("product-name-2")).toHaveTextContent("Laptop"));
  
    // Wait for individual price elements to render
    await waitFor(() => expect(getByTestId("product-1")).toHaveTextContent("$79.99"));
    await waitFor(() => expect(getByTestId("product-2")).toHaveTextContent("$999.99"));
  });
  
  it("filters products by category and displays only the filtered results", async () => {
    // Mock initial API response for all products
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              { 
                _id: "1", 
                name: "Textbook", 
                price: 79.99, 
                description: "A comprehensive textbook", 
                slug: "textbook-slug", 
                category: "Books" // Use string category
              },
              { 
                _id: "2", 
                name: "Laptop", 
                price: 999.99, 
                description: "A high-performance laptop", 
                slug: "laptop-slug", 
                category: "Electronics" // Use string category
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { success: false, products: [] } });
    });
  
    // Mock axios.get to return categories
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [
          { _id: "1", name: "Electronics" },
          { _id: "2", name: "Books" },
          { _id: "3", name: "Clothing" },
        ],
      },
    });
  
    // Mock API response for filtering by category (Books category)
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/product-filters") {
        const response = {
          data: {
            success: true,
            products: [
              { 
                _id: "1", 
                name: "Textbook", 
                price: 79.99, 
                description: "A comprehensive textbook", 
                slug: "textbook-slug", 
                category: "Books" // Use string category for filtering
              },
            ],
          },
        };
        return Promise.resolve(response);
      }
      return Promise.resolve({ data: { success: false, products: [] } });
    });
  
    // Render HomePage
    const { getByLabelText, getByTestId, queryByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );
  
    // Wait for the initial product list to render
    await waitFor(() => expect(getByTestId("product-1")).toBeInTheDocument());
    await waitFor(() => expect(getByTestId("product-2")).toBeInTheDocument());
  
    // Simulate clicking the checkbox for "Books" category
    const booksCheckbox = getByLabelText("Books");
    fireEvent.click(booksCheckbox);
  
    // Wait for the filtered products to render
    await waitFor(() => expect(getByTestId("product-1")).toBeInTheDocument());
    await waitFor(() => expect(getByTestId("product-name-1")).toHaveTextContent("Textbook"));
    await waitFor(() => expect(getByTestId("product-1")).toHaveTextContent("$79.99"));
  
    // Ensure the Laptop product is not rendered after filtering
    await waitFor(() => expect(queryByTestId("product-2")).toBeNull());
  });

  it("resets filters and displays all products", async () => {
    // Mock initial API response for all products
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              { 
                _id: "1", 
                name: "Textbook", 
                price: 79.99, 
                description: "A comprehensive textbook", 
                slug: "textbook-slug", 
                category: "Books" // Use string category
              },
              { 
                _id: "2", 
                name: "Laptop", 
                price: 999.99, 
                description: "A high-performance laptop", 
                slug: "laptop-slug", 
                category: "Electronics" // Use string category
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { success: false, products: [] } });
    });
  
    // Mock axios.get to return categories
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [
          { _id: "1", name: "Electronics" },
          { _id: "2", name: "Books" },
          { _id: "3", name: "Clothing" },
        ],
      },
    });
  
    // Mock API response for filtering by category (Books category)
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/product-filters") {
        const response = {
          data: {
            success: true,
            products: [
              { 
                _id: "1", 
                name: "Textbook", 
                price: 79.99, 
                description: "A comprehensive textbook", 
                slug: "textbook-slug", 
                category: "Books" // Use string category for filtering
              },
            ],
          },
        };
        return Promise.resolve(response);
      }
      return Promise.resolve({ data: { success: false, products: [] } });
    });
  
    // Render HomePage
    const { getByLabelText, getByTestId, queryByTestId, getByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );
  
    // Wait for initial product list to render (both Textbook and Laptop)
    await waitFor(() => expect(getByTestId("product-1")).toBeInTheDocument());
    await waitFor(() => expect(getByTestId("product-2")).toBeInTheDocument());
  
    // Simulate filtering by category (e.g., "Books")
    const booksCheckbox = getByLabelText("Books");
    fireEvent.click(booksCheckbox);
  
    // Wait for filtered products (only Textbook should appear)
    await waitFor(() => expect(getByTestId("product-1")).toBeInTheDocument());
    await waitFor(() => expect(getByTestId("product-name-1")).toHaveTextContent("Textbook"));
    await waitFor(() => expect(queryByTestId("product-2")).toBeNull()); // Laptop should not be present
  
    // Simulate clicking the RESET FILTERS button
    const resetButton = getByText("RESET FILTERS");
    fireEvent.click(resetButton);


    // Mock the API call after resetting filters
  axios.get.mockResolvedValueOnce({
    data: {
      success: true,
      products: [
        { 
          _id: "1", 
          name: "Textbook", 
          price: 79.99, 
          description: "A comprehensive textbook", 
          slug: "textbook-slug", 
          category: "Books" 
        },
        { 
          _id: "2", 
          name: "Laptop", 
          price: 999.99, 
          description: "A high-performance laptop", 
          slug: "laptop-slug", 
          category: "Electronics" 
        },
      ],
    },
  });
  
    // Wait for the reset to complete and all products to reappear
    await waitFor(() => expect(getByTestId("product-1")).toBeInTheDocument()); // Textbook should appear
    await waitFor(() => expect(getByTestId("product-2")).toBeInTheDocument()); // Laptop should appear
  
    // Ensure that the correct API call was made when resetting
    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
  });
  


});

