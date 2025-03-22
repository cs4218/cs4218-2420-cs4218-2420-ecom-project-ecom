import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import SearchInput from './SearchInput';
import { SearchProvider } from '../../context/search';
import { useSearch } from '../../context/search';

// Mock the axios module
jest.mock('axios');

// Mock the Layout component
jest.mock('../Layout', () => {
  const React = require('react');
  return function Layout({ children }) {
    return <div>{children}</div>;
  };
});

// Mock the useCart hook
jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [[], jest.fn()]),
}));

// Mock react-toastify 
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

const mockNavigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigateFunction,
}));

describe('Integration tests for SearchInput and Search components', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

	describe('SearchInput and Search components', () => {
		describe('When the user submits a valid search query through SearchInput', () => {
			// Mock search results
			const products = [
				{ _id: '1', name: 'Product A', description: 'Description for Product A', price: 50 },
				{ _id: '2', name: 'Product B', description: 'Description for Product B', price: 100 },
			];

			// Mock the API call to return the products
			axios.get.mockResolvedValue({ data: products });
			it('should update the search context value when search is performed', async () => {
				const TestComponent = () => {
					const [auth] = useSearch();
					return (
						<div>
							<p>Keyword: {auth.keyword}</p>
							<p>Results: {auth.results.map((result) => result.name).join(', ')}</p>
						</div>
					);
				};
				render(
					<SearchProvider>
						<SearchInput />
						<TestComponent />
					</SearchProvider>
				);

				fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Product' } });
				fireEvent.click(screen.getByText('Search'));

				await waitFor(() => {
					expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/Product");
				});
				expect(screen.getByText('Keyword: Product')).toBeInTheDocument();
				expect(screen.getByText('Results: Product A, Product B')).toBeInTheDocument();
			});
		});
	});
});
