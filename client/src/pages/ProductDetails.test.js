import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from "axios";
import React from 'react';
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ProductDetails from './ProductDetails';

const mockNavigate = jest.fn();
const mockSetCart = jest.fn();

jest.mock('axios');

jest.mock("react-hot-toast");

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));
  
jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [[], mockSetCart]) // Mock useCart hook to return null state and a mock function
}));
      
jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock('../hooks/useCategory', () => jest.fn(() => []));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ slug: "mock-product" })
}));

jest.spyOn(console, 'log').mockImplementation(() => {}); // silence log outputs in test

Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/product/mock-product']}>
      <Routes>
        <Route path='/product/:slug' element={<ProductDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

const mockProduct = {
  _id: "67a21772a6d9e00ef2ac022a",
  name: "Mock Product",
  slug: "mock-product",
  description: "Mock Product Description",
  price: 100,
  category: {
    _id: "67b060821bc32f81ba199f8a",
    name: "Mock Category"
  },
};

const mockSimilarProducts = [
  {
    _id: "67a21772a6d9e00ef2ac0345",
    name: "Similar Product 1",
    slug: "similar-product-1",
    description: "Description for Similar Product 1",
    price: 50,
  },
  {
    _id: "67a21772a6d9e00ef2ac0678",
    name: "Similar Product 2",
    slug: "similar-product-2",
    description: "Description for Similar Product 2",
    price: 75,
  },
];

describe('ProductDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    axios.get.mockImplementation((url) => {
        if (url === "/api/v1/product/get-product/mock-product") {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url === `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`) {
          return Promise.resolve({ data: { products: mockSimilarProducts } });
        }
        return Promise.reject(new Error("Internal error"));
      });
    });

  it('renders Product details correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
    });
    expect(screen.getByText(`Description : ${mockProduct.description}`)).toBeInTheDocument();
    expect(screen.getByText(`Price :$100.00`)).toBeInTheDocument();
    expect(screen.getByText(`Category : ${mockProduct.category.name}`)).toBeInTheDocument();
  });

  
  it('should allow users to add item to cart', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
    });
    const addButton = screen.getByText("ADD TO CART");
    fireEvent.click(addButton);
    
    expect(mockSetCart).toBeCalledWith([mockProduct]);
  });

  it('should not allow users to add empty obj to cart', async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/get-product/mock-product") {
        return Promise.resolve({ data: { product: {} } });
      }
      if (url === `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.reject(new Error("Internal error"));
    });

    renderComponent();
    const addButton = screen.getByText("ADD TO CART");

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(toast.success).not.toHaveBeenCalled();
    });
    expect(mockSetCart).not.toBeCalled();
  });

  it('renders similar products when similar products are found', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
    });
    expect(screen.getByText(mockSimilarProducts[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockSimilarProducts[1].name)).toBeInTheDocument();
  });

  it('should redirect to similar product on click', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Similar Product 1')).toBeInTheDocument();
    });
    const similarProducts = within(screen.getByTestId("similar-container"));
    const similarProduct = similarProducts.getAllByText("More Details")[0];

    fireEvent.click(similarProduct);
    expect(mockNavigate).toBeCalledWith(`/product/${mockSimilarProducts[0].slug}`);
  });

  it('renders message when there are no similar products', async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/get-product/mock-product") {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url === `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.reject(new Error("Internal error"));
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
    });
    expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
  });

  it('should redirect on non-existent product', async () => {
    axios.get.mockRejectedValue({
      response: { status: 404 }
    });

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toBeCalled();
    });
  });

  it('should present error toast on get-product errors', async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/get-product/mock-product") {
        return Promise.reject(new Error("get-product Internal Error"));
      }
      if (url === `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`) {
        return Promise.reject(new Error("related-product Internal Error"));
      }
      return Promise.reject(new Error("Internal error"));
    });

    renderComponent();

    await waitFor(() => {
      expect(toast.error).toBeCalledWith("Something went wrong");
    })
  });

  it('should present error toast on related-product errors', async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/get-product/mock-product") {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url === `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`) {
        return Promise.reject(new Error("related-product Internal Error"));
      }
      return Promise.reject(new Error("Internal error"));
    });

    renderComponent();

    await waitFor(() => {
      expect(toast.error).toBeCalledWith("Could not get similar products");
    })
  });
});