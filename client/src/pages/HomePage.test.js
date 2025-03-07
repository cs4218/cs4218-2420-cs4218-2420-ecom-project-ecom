import React from 'react';
import { render, screen, fireEvent, waitFor, window } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import HomePage from './HomePage';
import { mock } from 'node:test';
import { useCart } from "../context/cart";
import { Prices } from "../components/Prices";

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('react-icons/ai');

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
}));

Object.defineProperty(global, "location", {
    value: { reload: jest.fn() },
    writable: true,
});

// mocked api responses
const mockCategories = [
    { _id: 1, name: "mockCategory1", slug: "category-one" },
    { _id: 2, name: "mockCategory2", slug: "category-two" },
]

const generateMockProducts = (count) => {
    const products = [];
    for (let i = 0; i < count; i++) {
      products.push({
        _id: i.toString(),
        name: `Product${i}`,
        slug: `product-${i}`,
        description: `Description of product ${i}`,
        price: (i + 1) * 10,
        quantity: (i + 1) * 10,
        category: ((i % 2) + 1).toString(),
      });
    }
    return products;
};

const mockResponse = (
    url,
    category,
    products,
    additionalProducts,
    total
) => {
    if (url == '/api/v1/category/get-category') {
        return Promise.resolve({
            data: { success: true, category: category },
        });
    } else if (url == '/api/v1/product/product-list/1') {
        return Promise.resolve({ data: { products: products } });
    } else if (url == '/api/v1/product/product-list/2') {
        return Promise.resolve({ data: { products: additionalProducts } });
    } else if (url == '/api/v1/product/product-count') {
        return Promise.resolve({ data: { total } });
    } else {
        return null;
    }
};

const mockErrorResponse = (url) => {
    if (url == '/api/v1/category/get-category') {
        return Promise.reject(new Error('Error retrieving categories'));
    } else if (url == '/api/v1/product/product-list/1') {
        return Promise.reject(new Error('Error retrieving product list page 1'));
    } else if (url == '/api/v1/product/product-list/2') {
        return Promise.reject(new Error('Error retrieving product list page 2'));
    } else if (url == '/api/v1/product/product-count') {
        return Promise.reject(new Error('Error retrieving product count'));
    } else {
        return null
    }
};

const renderHomePage = () => {
    render(
        <MemoryRouter initialEntries={["/"]}>
            <Routes>
                <Route path="/" element={<HomePage />} />
            </Routes>
        </MemoryRouter>
    );
};

beforeEach(() => {
    axios.get.mockImplementation((url) => mockResponse(url, mockCategories, [], [], 0));
    axios.post.mockResolvedValue({
        data: {
            products: [],
        }
    });
});

afterEach(() => {
    jest.clearAllMocks();
})

describe('HomePage - Category related tests', () => {
    
    it('should retrieve categories', async () => {
        renderHomePage();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
        });        
      });

    it('should display categories correctly', async () => {
        axios.get.mockImplementation((url) => mockResponse(url, mockCategories, [], [], 0));

        renderHomePage();

        await waitFor(() => {
            const categoryCheckboxes = screen.getAllByRole('checkbox');
            expect(categoryCheckboxes).toHaveLength(2);
            
            const checkbox1 = screen.getByText('mockCategory1');
            const checkbox2 = screen.getByText('mockCategory2');
            expect(checkbox1).toBeInTheDocument();
            expect(checkbox2).toBeInTheDocument();
        });
      });

    it('should be able to filter products by selected category', async () => {
        const sixProducts = generateMockProducts(6);
        axios.get.mockImplementation((url) => mockResponse(url, mockCategories, sixProducts, [], sixProducts.length));

        renderHomePage();
        const category1Checkbox = screen.findByText('mockCategory1')
        expect(await category1Checkbox).toBeInTheDocument();
        fireEvent.click(screen.getByText('mockCategory1'));

        await waitFor(() => {
            sixProducts
                .filter(product => product.category == 1)
                .forEach(product => {
                    expect(screen.getByText(product.name)).toBeInTheDocument();
                })
        });
    });

    it('should be able to unfilter products by unselecting category', async () => {
        const sixProducts = generateMockProducts(6);
        axios.get.mockImplementation((url) => mockResponse(url, mockCategories, sixProducts, [], sixProducts.length));

        renderHomePage();
        const category1Checkbox = screen.findByText('mockCategory1')
        expect(await category1Checkbox).toBeInTheDocument();
        fireEvent.click(screen.getByText('mockCategory1'));
        fireEvent.click(screen.getByText('mockCategory1'));
        await waitFor(() => {
            sixProducts
                .forEach(product => {
                    expect(screen.getByText(product.name)).toBeInTheDocument();
                })
        });
    });

});


describe('HomePage - Price related tests', () => {
    const priceRegex = new RegExp("\\$.+\\...");
    const sixProducts = generateMockProducts(6);

    const mockPriceFilter = (
        products,
        priceArray
    ) => {
        let filteredProducts;
        if (priceArray.length == 0) {
            filteredProducts = products;
        } else {
            filteredProducts = products.filter((product) => 
                product.price >= priceArray[0] && product.price <= priceArray[1]
            );
        }
        return Promise.resolve({
            data: {
                products: filteredProducts
            }
        })
    }

    beforeEach(() => {
        axios.get.mockImplementation((url) => mockResponse(url, mockCategories, sixProducts, [], sixProducts.length));
    })

    it('should display price filters correctly', async () => {
        renderHomePage();

        await waitFor(() => {
            Prices.forEach(price => {
                expect(screen.getByText(price.name)).toBeInTheDocument();
            });
        });
      });

    it('should be able to filter products by selected price', async () => {
        renderHomePage();

        for (const price of Prices) {
            axios.post.mockImplementation(() => mockPriceFilter(sixProducts, price.array));

            const filteredProducts = sixProducts.filter((product) => 
                product.price >= price.array[0] && product.price <= price.array[1]
            );

            fireEvent.click(screen.getByText(price.name));
            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters',
                    {
                        checked: [],
                        radio: price.array,
                    }
                );

                const foundProducts = screen.queryAllByText(priceRegex);
                expect(foundProducts.length).toEqual(filteredProducts.length);
            });
        };
    });

    it('should reload page after resetting filters', async () => {
        renderHomePage();

        axios.post.mockImplementationOnce(() => mockPriceFilter(sixProducts, Prices[0].array));

        fireEvent.click(screen.getByText(Prices[0].name));
        await waitFor(() => {
            const foundProducts = screen.queryAllByText(priceRegex);
            expect(foundProducts.length).toBeLessThan(sixProducts.length);
        });

        fireEvent.click(screen.getByText('RESET FILTERS'));
        await waitFor(() => {
            expect(global.location.reload).toHaveBeenCalled();
        });
      });

});

describe('HomePage - with 6 or fewer products', () => {

    const sixProducts = generateMockProducts(6);
    beforeEach(() => {
        axios.get.mockImplementation((url) => mockResponse(url, mockCategories, sixProducts, [], sixProducts.length));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should retrieve products', async () => {
        renderHomePage();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
        });   
      });

    it('should display all products without option to load more', async () => {
        renderHomePage();

        await waitFor(() => {
            for (let i = 0; i < sixProducts.length; i++) {
                const productName = 'Product' + i.toString();
                const product = screen.getByText(productName);
                expect(product).toBeInTheDocument();
            }
            const loadmore = screen.queryByText('Loadmore');
            expect(loadmore).not.toBeInTheDocument();
        });
      });

    it('when more details is clicked, should navigate to specific product page', async () => {
        const product = sixProducts.slice(0,1);
        axios.get.mockImplementation((url) => mockResponse(url, mockCategories, product, [], 1));

        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        renderHomePage();

        await waitFor(() => {
            expect(screen.queryAllByText('More Details')).toHaveLength(1);
        });

        await screen.findByText('More Details');
        fireEvent.click(screen.getByText('More Details'));

        expect(mockNavigate).toHaveBeenCalledWith(`/product/${product[0].slug}`);
    });

    it('when add to cart is clicked, should be able to add product to cart', async () => {
        const product = sixProducts.slice(0,1);
        axios.get.mockImplementation((url) => mockResponse(url, mockCategories, product, [], 1));

        const mockSetCart = jest.fn();
        useCart.mockReturnValue([[], mockSetCart]); 

        renderHomePage();

        await waitFor(() => {
            expect(screen.queryAllByText('ADD TO CART')).toHaveLength(1);
        });

        await screen.findByText('ADD TO CART');
        fireEvent.click(screen.getByText('ADD TO CART'));

        await waitFor(() => {
            expect(mockSetCart).toHaveBeenCalledWith(product);
        });
    });
});

describe('HomePage - with 7 or more products', () => {

    const eightProducts = generateMockProducts(8);
    beforeEach(() => {
        axios.get.mockImplementation((url) => 
            mockResponse(url, mockCategories, eightProducts.slice(0,6), eightProducts.slice(6,8), eightProducts.length));
    })

    it('should display 6 products with option to load more', async () => {
        renderHomePage();

        await waitFor(() => {
            for (let i = 0; i < 6; i++) {
                const productName = 'Product' + i.toString();
                const product = screen.getByText(productName);
                expect(product).toBeInTheDocument();
            }

            const loadmore = screen.queryByText('Loadmore');
            expect(loadmore).toBeInTheDocument();
        });
      });

    it('load more button should load more products on click', async () => {
        renderHomePage();
        await screen.findByText("Loadmore");
        fireEvent.click(screen.getByText("Loadmore"));

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
            const product6 = screen.getByText('Product6');
            const product7 = screen.getByText('Product7');
            expect(product6).toBeInTheDocument();
            expect(product7).toBeInTheDocument();
        });
      });
});

describe('HomePage - Error handling tests', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    })

    afterEach(() => {
        console.log.mockRestore();
        jest.clearAllMocks();
    })
    
    it('should handle errors when api calls fail upon initial render', async () => {
        axios.get.mockImplementation((url) => mockErrorResponse(url));
        renderHomePage();
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-count');
            expect(console.log).toHaveBeenCalledWith(new Error('Error retrieving categories'));
            expect(console.log).toHaveBeenCalledWith(new Error('Error retrieving product list page 1'));
            expect(console.log).toHaveBeenCalledWith(new Error('Error retrieving product count'));
        });        
    });

    it('should handle errors when api call fails upon retrieving additional products', async () => {
        const eightProducts = generateMockProducts(8);
        axios.get.mockImplementation((url) => 
            mockResponse(url, mockCategories, eightProducts.slice(0,6), eightProducts.slice(6,8), eightProducts.length));
        renderHomePage();
        
        axios.get.mockImplementation((url) => mockErrorResponse(url)); 
        await screen.findByText("Loadmore");
        fireEvent.click(screen.getByText("Loadmore"));
        
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
            expect(console.log).toHaveBeenCalledWith(new Error('Error retrieving product list page 2'));
        });      
    });

    it('should handle errors when api call fails to filter products', async () => {
        axios.post.mockImplementation(() => Promise.reject(new Error('Error filtering products')));

        renderHomePage();

        fireEvent.click(screen.getByText(Prices[0].name));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters',
                {
                    checked: [],
                    radio: Prices[0].array,
                }
            );
            expect(console.log).toHaveBeenCalledWith(new Error('Error filtering products'));
        });
    });

});