import '@testing-library/jest-dom/extend-expect';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import useCategory from '../hooks/useCategory';
import Categories from './Categories';

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));
    
jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock('../hooks/useCategory', () =>  jest.fn(() => []));

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/categories']}>
      <Routes>
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Categories Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Categories pages', () => {
    renderComponent();

    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('renders multiple Categories correctly', () => {
    const expectedCategories = [
      {_id: "1", slug: "cat1", name: "Cat1"},
      {_id: "2", slug: "cat2", name: "Cat2"},
      {_id: "3", slug: "cat3", name: "Cat3"},
    ];
    useCategory.mockReturnValue(expectedCategories);

    renderComponent();
    
    const mainContainer = screen.getByTestId('categories-container');
    const allLinks = within(mainContainer).getAllByRole('link');

    expect(allLinks).toHaveLength(expectedCategories.length);

    expectedCategories.forEach((expectedCategory) => {
      expect(within(mainContainer).getByText(expectedCategory.name)).toBeInTheDocument();
    });

    expectedCategories.forEach((category) => {
      const link = within(mainContainer).getByRole("link", { name: category.name });
      expect(link).toHaveAttribute("href", `/category/${category.slug}`);
    });
  });
})