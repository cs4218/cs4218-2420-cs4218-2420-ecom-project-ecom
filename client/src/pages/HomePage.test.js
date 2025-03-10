import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, BrowserRouter, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import HomePage from './HomePage';
import { Prices } from "../components/Prices";
import toast from 'react-hot-toast';
import { query } from 'express';
import { afterEach } from 'node:test';


jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock('../hooks/useCategory', () => ({
  __esModule: true,
  default: jest.fn(() => [])
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'location', {
  writable: true,
  value: { reload: jest.fn() },
});

const mockCategories = [
  { _id: "1", name: "Electronics", slug: "electronics" },
  { _id: "2", name: "Clothing", slug: "clothing" },
  { _id: "3", name: "Gaming", slug: "gaming" },
];
const mockProductsFirst = [
  {
    _id: "1", name: "TV", slug: "tv", description: "Bestselling TV",
    price: 109.99, category: "Electronics", quantity: 2
  },
  {
    _id: "2", name: "Shoes", slug: "shoes", description: "Bestselling Sports Shoes",
    price: 19.99, category: "Clothing", quantity: 5
  },
]
const mockProductsSecond = [
  {
    _id: "3", name: "PS5 Controller", slug: "controller", description: "PS5 white controller",
    price: 60.99, category: "Gaming", quantity: 6
  },
  {
    _id: "4", name: "Socks", slug: "socks", description: "White ankle socks",
    price: 4.99, category: "Clothing", quantity: 10
  },
]
const mockCategoriesRes = {
  data: {
    success: true,
    category: mockCategories,
  }
}
const mockFirstProductsRes = {
  data: {
    success: true,
    products: mockProductsFirst
  }
}
const mockSecondProductsRes = {
  data: {
    success: true,
    products: mockProductsSecond
  }
}

const mockMoreTotalRes = {
  data: {
    success: true,
    total: 4
  }
}

const mockAllClothingProductRes = {
  data: {
    success: true,
    products: [{
      _id: "2", name: "Shoes", slug: "shoes", description: "Bestselling Sports Shoes",
      price: 19.99, category: "Clothing", quantity: 5
    },
    {
      _id: "4", name: "Socks", slug: "socks", description: "White ankle socks",
      price: 4.99, category: "Clothing", quantity: 10
    },]
  }
};

const mockElectronicProductRes = {
  data: {
    success: true,
    products: [{
      _id: "1", name: "TV", slug: "tv", description: "Bestselling TV",
      price: 109.99, category: "Electronics", quantity: 2
    },]
  }
};

const mockElectronicAndGamingProductRes = {
  data: {
    success: true,
    products: [{
      _id: "1", name: "TV", slug: "tv", description: "Bestselling TV",
      price: 109.99, category: "Electronics", quantity: 2
    },
    {
      _id: "3", name: "PS5 Controller", slug: "controller", description: "PS5 white controller",
      price: 60.99, category: "Gaming", quantity: 6
    },]
  }
};

const mockCheapestClothingProductRes = {
  data: {
    success: true,
    products: [
      {
        _id: "4", name: "Socks", slug: "socks", description: "White ankle socks",
        price: 4.99, category: "Clothing", quantity: 10
      },]
  }
};

const getFirstProductsEndpoint = "/api/v1/product/product-list/1"
const getSecondProductsEndpoint = "/api/v1/product/product-list/2"
const getCategoriesEndpoint = "/api/v1/category/get-category"
const getTotalEndpoint = "/api/v1/product/product-count"
const getProductsFilterEndpoint = "/api/v1/product/product-filters"

describe('Home page component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((req) => {
      switch (req) {
        case getCategoriesEndpoint:
          return Promise.resolve(mockCategoriesRes);
        case getFirstProductsEndpoint:
          return Promise.resolve(mockFirstProductsRes);
        case getTotalEndpoint:
          return Promise.resolve(mockMoreTotalRes);
        case getSecondProductsEndpoint:
          return Promise.resolve(mockSecondProductsRes)
      }
    });
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("should render default home page", async () => {
    const { getByRole, getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      mockCategories.forEach(({ name }) => {
        expect(getByRole('checkbox', { name })).toBeInTheDocument();
      })
      Prices.forEach(({ name }) => {
        expect(getByRole('radio', { name })).toBeInTheDocument();
      });
      mockProductsFirst.forEach(({ name }) => {
        expect(getByText(name)).toBeInTheDocument();
      })
      expect(getByText('Loadmore')).toBeInTheDocument();
    });

  });

  it("should display more products after clicking load more", async () => {
    const { getByText, queryByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByText('Loadmore')).toBeInTheDocument();
    });
    const loadButton = getByText('Loadmore');
    fireEvent.click(loadButton);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("2"));
    await waitFor(() => {
      expect(queryByText('Loading ...')).not.toBeInTheDocument();
    });
    mockProductsSecond.forEach(({ name }) => {
      expect(getByText(name)).toBeInTheDocument();
    });
    mockProductsFirst.forEach(({ name }) => {
      expect(getByText(name)).toBeInTheDocument();
    });
    expect(queryByText('Loadmore')).not.toBeInTheDocument();
  });

  it("should filter based on single category", async () => {
    axios.post.mockResolvedValueOnce(mockAllClothingProductRes);
    const { getByRole, getByText, queryByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      var clothingCheck = getByRole('checkbox', { name: "Clothing" });
      fireEvent.click(clothingCheck);
    });
    expect(getByRole('checkbox', { name: "Clothing" })).toBeChecked();
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(getProductsFilterEndpoint,
        {
          checked: ['2'],
          radio: []
        });
      expect(queryByText("TV")).not.toBeInTheDocument();
    });
    mockProductsFirst.forEach(({ name, category }) => {
      if (category != 'Clothing') {
        expect(queryByText(name)).not.toBeInTheDocument();
      } else {
        expect(getByText(name)).toBeInTheDocument();
      }
    });
    mockProductsSecond.forEach(({ name, category }) => {
      if (category != 'Clothing') {
        expect(queryByText(name)).not.toBeInTheDocument();
      } else {
        expect(getByText(name)).toBeInTheDocument();
      }
    });
  });

  it("should cancel filter when uncheck category", async () => {
    axios.post.mockResolvedValueOnce(mockElectronicProductRes)
    var { getByRole, getByText, queryByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      var catCheck = getByRole('checkbox', { name: "Electronics" });
      fireEvent.click(catCheck);
    });
    expect(getByRole('checkbox', { name: "Electronics" })).toBeChecked();
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(getProductsFilterEndpoint,
        {
          checked: ['1'],
          radio: []
        });
      expect(queryByText("Shoes")).not.toBeInTheDocument();
    });
    fireEvent.click(getByRole('checkbox', { name: "Electronics" }));
    expect(getByRole('checkbox', { name: "Electronics" })).not.toBeChecked();
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(getFirstProductsEndpoint);
      expect(queryByText("Loading ...")).not.toBeInTheDocument();
    });
    mockProductsFirst.forEach(({ name }) => {
      expect(getByText(name)).toBeInTheDocument();
    });
  });

  it("should filter based on price", async () => {
    axios.post.mockResolvedValueOnce(mockCheapestClothingProductRes);
    var { getByRole, getByText, queryByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      var priceCheck = getByRole('radio', { name: "$0 to 19" });
      fireEvent.click(priceCheck);
    });
    expect(getByRole('radio', { name: "$0 to 19" })).toBeChecked();
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(getProductsFilterEndpoint,
        {
          checked: [],
          radio: [0, 19]
        });
      expect(getByText("Socks")).toBeInTheDocument();
    });
    mockProductsFirst.forEach(({ name, price }) => {
      if (price > 19) {
        expect(queryByText(name)).not.toBeInTheDocument();
      } else {
        expect(getByText(name)).toBeInTheDocument();
      }
    });
    mockProductsSecond.forEach(({ name, price }) => {
      if (price > 19) {
        expect(queryByText(name)).not.toBeInTheDocument();
      } else {
        expect(getByText(name)).toBeInTheDocument();
      }
    });
  });

  it("should filter based on price and category", async () => {
    axios.post.mockResolvedValueOnce(mockAllClothingProductRes)
      .mockResolvedValueOnce(mockCheapestClothingProductRes);
    const { getByRole, getByText, queryByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      var clothingCheck = getByRole('checkbox', { name: "Clothing" });
      fireEvent.click(clothingCheck);
      var priceCheck = getByRole('radio', { name: "$0 to 19" });
      fireEvent.click(priceCheck);
    });
    expect(getByRole('radio', { name: "$0 to 19" })).toBeChecked();
    expect(getByRole('checkbox', { name: "Clothing" })).toBeChecked();
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.post).toHaveBeenCalledWith(getProductsFilterEndpoint,
        {
          checked: ["2"],
          radio: [0, 19]
        });
      expect(getByText("Socks")).toBeInTheDocument();
    });
    mockProductsFirst.forEach(({ name, price, category }) => {
      if (price > 19 || category != "Clothing") {
        expect(queryByText(name)).not.toBeInTheDocument();
      } else {
        expect(getByText(name)).toBeInTheDocument();
      }
    });
    mockProductsSecond.forEach(({ name, price, category }) => {
      if (price > 19 || category != "Clothing") {
        expect(queryByText(name)).not.toBeInTheDocument();
      } else {
        expect(getByText(name)).toBeInTheDocument();
      }
    });
  });

  it("should reset filtered content when reset filter is clicked", async () => {
    const { getByRole, getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      var clothingCheck = getByRole('checkbox', { name: "Clothing" });
      fireEvent.click(clothingCheck);
    });
    expect(getByText("Shoes")).toBeInTheDocument();
    var resetButton = getByRole('button', { name: "RESET FILTERS" });
    fireEvent.click(resetButton);
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("should redirect to details page when more details clicked", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    const { getByTestId } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId('product-1')).toBeInTheDocument();
    });
    const productCard = getByTestId('product-1');
    var detailsButton = within(productCard).getByRole('button', { name: "More Details" });
    fireEvent.click(detailsButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/product/${mockProductsFirst[0].slug}`)
    });
  });

  it("should display toast when add to cart clicked", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId('product-1')).toBeInTheDocument();
    });
    const productCard = getByTestId('product-1');
    var cartButton = within(productCard).getByRole('button', { name: "ADD TO CART" });
    fireEvent.click(cartButton);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([mockProductsFirst[0]])
    );
  });

  it("should log error when initial category data throws error", async () => {
    axios.get.mockImplementation((req) => {
      switch (req) {
        case getCategoriesEndpoint:
          return Promise.reject(new Error("Failed to fetch category"));
        case getFirstProductsEndpoint:
          return Promise.resolve(mockFirstProductsRes);
        case getTotalEndpoint:
          return Promise.resolve(mockMoreTotalRes);
        case getSecondProductsEndpoint:
          return Promise.resolve(mockSecondProductsRes)
      }
    });
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(Error("Failed to fetch category"));
    });
  });

  it("should log error when initial products data throws error", async () => {
    axios.get.mockImplementation((req) => {
      switch (req) {
        case getCategoriesEndpoint:
          return Promise.resolve(mockCategoriesRes);
        case getFirstProductsEndpoint:
          return Promise.reject(new Error("Failed to fetch products"));
        case getTotalEndpoint:
          return Promise.resolve(mockMoreTotalRes);
        case getSecondProductsEndpoint:
          return Promise.resolve(mockSecondProductsRes)
      }
    });
    const { getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(Error("Failed to fetch products"));
    });
  });

  it("should log error when initial total data throws error", async () => {
    axios.get.mockImplementation((req) => {
      switch (req) {
        case getCategoriesEndpoint:
          return Promise.resolve(mockCategoriesRes);
        case getFirstProductsEndpoint:
          return Promise.resolve(mockFirstProductsRes);
        case getTotalEndpoint:
          return Promise.reject(new Error("Failed to fetch total count"));
        case getSecondProductsEndpoint:
          return Promise.resolve(mockSecondProductsRes)
      }
    });
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(Error("Failed to fetch total count"));
    });
  });

  it("should log error when second page data throws error", async () => {
    axios.get.mockImplementation((req) => {
      switch (req) {
        case getCategoriesEndpoint:
          return Promise.resolve(mockCategoriesRes);
        case getFirstProductsEndpoint:
          return Promise.resolve(mockFirstProductsRes);
        case getTotalEndpoint:
          return Promise.resolve(mockMoreTotalRes);
        case getSecondProductsEndpoint:
          return Promise.reject(new Error("Failed to fetch second page"));
      }
    });
    const { getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('Loadmore')).toBeInTheDocument();
    });
    const loadButton = getByText('Loadmore');
    fireEvent.click(loadButton);
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(Error("Failed to fetch second page"));
    });
  });

  it("should have no categories if categories api fail", async () => {
    axios.get.mockImplementation((req) => {
      switch (req) {
        case getCategoriesEndpoint:
          return Promise.resolve({
            data: {
              success: false,
              category: mockCategories
            }
          });
        case getFirstProductsEndpoint:
          return Promise.resolve(mockFirstProductsRes);
        case getTotalEndpoint:
          return Promise.resolve(mockMoreTotalRes);
        case getSecondProductsEndpoint:
          return Promise.resolve(mockSecondProductsRes)
      }
    });
    const { queryByText, getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('Shoes')).toBeInTheDocument();
    })
    mockCategories.forEach(({ name }) => {
      expect(queryByText(name)).not.toBeInTheDocument();
    });
  });
});
