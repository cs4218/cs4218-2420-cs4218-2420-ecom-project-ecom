import React from 'react';
import { render, screen, fireEvent, waitFor, window } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Search from './Search';
import * as SearchModule from "../context/search";

// Mocking axios.post
jest.mock('axios');

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
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

const mockSearchResults = generateMockProducts(3);

const renderSearchPage = () => {
    render(
        <MemoryRouter initialEntries={["/search"]}>
            <Routes>
                <Route path="/search" element={<Search />} />
            </Routes>
        </MemoryRouter>
    );
};

afterEach(() => {
    jest.clearAllMocks();
})

describe('Search results page', () => {
    it('should render search results page correctly', async () => {
        jest.spyOn(SearchModule, 'useSearch')
            .mockImplementation(() => [{keywords: "", results: []}, () => {}]);

        renderSearchPage();

        await waitFor(() => {
            expect(screen.getByText(new RegExp('Search Resuts'))).toBeInTheDocument();
        });
    });

    it('should display correct search results if found', async () => {
        jest.spyOn(SearchModule, 'useSearch')
            .mockImplementation(() => [{keywords: "", results: mockSearchResults}, () => {}]);

        renderSearchPage();

        await waitFor(() => {
            mockSearchResults.forEach((product => {
                expect(screen.getByText(new RegExp(product.name))).toBeInTheDocument();
                expect(screen.getByText(new RegExp(product.description))).toBeInTheDocument();
                expect(screen.getByText(new RegExp(product.price))).toBeInTheDocument();
            }))
            expect(screen.getByText(new RegExp('Found ' + mockSearchResults.length.toString()))).toBeInTheDocument();
            expect(screen.queryAllByText(new RegExp('More Details'))).toHaveLength(mockSearchResults.length);
            expect(screen.queryAllByText(new RegExp('ADD TO CART'))).toHaveLength(mockSearchResults.length);
        });
    })

    it('should not display any search results if nothing found', async () => {
        jest.spyOn(SearchModule, 'useSearch')
            .mockImplementation(() => [{keywords: "", results: []}, () => {}]);

        renderSearchPage();

        await waitFor(() => {
            expect(screen.getByText(new RegExp('No Products Found'))).toBeInTheDocument();
            expect(screen.queryAllByText(new RegExp('More Details'))).toHaveLength(0);
            expect(screen.queryAllByText(new RegExp('ADD TO CART'))).toHaveLength(0);
        });
    })

    // Note: more details and add to cart button does nothing

});