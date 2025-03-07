import React from 'react';
import { render, screen, fireEvent, waitFor, window } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import ProductDetails from './ProductDetails';
import { mock } from 'node:test';
import { useCart } from "../context/cart";

// Mocking axios.post
jest.mock('axios');

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
    useParams: jest.fn(),
}));

Object.defineProperty(global, "location", {
    value: { reload: jest.fn() },
    writable: true,
});

// mocked api responses
const generateMockProducts = (count) => {
    const products = [];
    for (let i = 1; i <= count; i++) {
      products.push({
        _id: i.toString(),
        name: `Product${i}`,
        slug: `product-${i}`,
        description: `Description of product ${i}`,
        price: (i + 1) * 10,
        quantity: (i + 1) * 10,
        category: {
            _id: 1,
            name: 'mockCategory1',
        },
      });
    }
    return products;
};

const mockProduct = {
    _id: (0).toString(),
    name: 'Product0',
    slug: 'product-0',
    description: 'Description of product 0',
    price: 10,
    quantity: 10,
    category: {
        _id: 1,
        name: 'mockCategory1',
    },
}

const mockRelatedProducts = generateMockProducts(3);

const renderProductDetailsPage = () => {
    render(
        <MemoryRouter initialEntries={["/product/product-0"]}>
            <Routes>
                <Route path="/product/product-0" element={<ProductDetails />} />
            </Routes>
        </MemoryRouter>
    );
};

const mockResponse = (
    url,
    product,
    relatedProducts,
) => {
    if (url == `/api/v1/product/get-product/${mockProduct.slug}`) {
        return Promise.resolve({
            data: { success: true, product: product },
        });
    } else if (url == `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`) {
        return Promise.resolve({ data: { products: relatedProducts } });
    } else {
        return null;
    }
};

const mockErrorResponse = (url) => {
    if (url == `/api/v1/product/get-product/${mockProduct.slug}`) {
        return Promise.reject(new Error('Error retrieving selected product'));
    } else if (url == `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`) {
        return Promise.reject(new Error('Error retrieving related products'));
    } else {
        return null;
    }
};

beforeEach(() => {
    axios.get.mockImplementation((url) => mockResponse(url, mockProduct, mockRelatedProducts));
    useParams.mockReturnValue({ slug: mockProduct.slug })
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
    console.log.mockRestore();
    jest.clearAllMocks();
})

describe('ProductDetails - Actual product', () => {

    it('should retrieve current product details', async () => {
        renderProductDetailsPage();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${mockProduct.slug}`);
        });        
      });

    it('should correctly render current product details', async () => {
        renderProductDetailsPage();

        await waitFor(() => {
            expect(screen.getByText(new RegExp('Product Details'))).toBeInTheDocument();
            expect(screen.getByText(new RegExp(mockProduct.name))).toBeInTheDocument();
            expect(screen.getByText(new RegExp(mockProduct.description))).toBeInTheDocument();
            expect(screen.getByText(new RegExp(mockProduct.price))).toBeInTheDocument();
            expect(screen.getByText(new RegExp(mockProduct.category.name))).toBeInTheDocument();
        });        
      });
    
    // actual add to cart button seems to do nothing? ProductDetails.js:65
    it('should correctly render add to cart button', async () => {
        renderProductDetailsPage();

        await waitFor(() => {
            expect(screen.getByText(new RegExp('ADD TO CART'))).toBeInTheDocument();
        }); 
    });

    it('should handle errors when retrieving product details fails', async () => {
        axios.get.mockImplementation((url) => mockErrorResponse(url));
        renderProductDetailsPage();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${mockProduct.slug}`);
            expect(console.log).toHaveBeenCalledWith(new Error('Error retrieving selected product'));
        }); 
    });

    it('should not retrive product details if params or slug is null', async () => {
        useParams.mockReturnValue(null);
        renderProductDetailsPage();
        await waitFor(() => {
            expect(axios.get).not.toHaveBeenCalledWith();
        }); 
    })

});

describe('ProductDetails - Related products', () => {

    it('should retrieve related product details', async () => {
        renderProductDetailsPage();

        await waitFor(() => {
            expect(axios.get)
                .toHaveBeenCalledWith(`/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`);
        });        
      });
    
    it('should correctly render related product details', async () => {
        renderProductDetailsPage();

        await waitFor(() => {
            expect(screen.getByText(new RegExp('Similar Products'))).toBeInTheDocument();
            mockRelatedProducts.forEach((product => {
                expect(screen.getByText(new RegExp(product.name))).toBeInTheDocument();
                expect(screen.getByText(new RegExp(product.description))).toBeInTheDocument();
                expect(screen.getByText(new RegExp(product.price))).toBeInTheDocument();
            }))
            expect(screen.queryAllByText(new RegExp('More Details'))).toHaveLength(mockRelatedProducts.length);
        });        
      });

    it('should correctly render more details buttons for related products', async () => {
        renderProductDetailsPage();

        await waitFor(() => {
            expect(screen.queryAllByText(new RegExp('More Details'))).toHaveLength(mockRelatedProducts.length);
        });        
      });

    it('should lead to another product detail page upon clicking more details', async () => {
        const firstRelatedProduct = mockRelatedProducts.slice(0,1)
        axios.get.mockImplementation((url) => mockResponse(url, mockProduct, firstRelatedProduct));
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
        
        renderProductDetailsPage();

        await waitFor(() => {
            const goBackButton = screen.queryAllByText(new RegExp('More Details'));
            expect(goBackButton.length).toEqual(1);
            fireEvent.click(goBackButton[0]);
            expect(mockNavigate).toHaveBeenCalledWith(`/product/${firstRelatedProduct[0].slug}`);
        });
      });

    it('should handle errors when retrieving related products fails', async () => {
        renderProductDetailsPage();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${mockProduct.slug}`);
            axios.get.mockImplementation((url) => mockErrorResponse(url));
            expect(axios.get)
                .toHaveBeenCalledWith(`/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`);
            expect(console.log).toHaveBeenCalledWith(new Error('Error retrieving related products'));
        }); 
    })
});