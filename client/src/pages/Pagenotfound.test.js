import React from 'react';
import { render, screen, fireEvent, waitFor, window } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Pagenotfound from './Pagenotfound';

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');

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

describe('When the pagenotfound page is visited', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('then the pagenotfound page should be correctly displayed', () => {
        const { getByText, getByRole } = render(
            <MemoryRouter initialEntries={['/wrongpath']}>
              <Routes>
                <Route path="/wrongpath" element={<Pagenotfound />} />
              </Routes>
            </MemoryRouter>
          );

        const error404Message = getByText('404');
        const errorMessage = getByText('Oops ! Page Not Found')
    
        expect(error404Message).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();

        const goBackButton = getByRole('link', { name: 'Go Back' });
        expect(goBackButton).toBeInTheDocument();
      });

    it('then the go back button should redirect to root path', () => {
        render(
            <MemoryRouter initialEntries={['/wrongpath']}>
              <Routes>
                <Route path="/wrongpath" element={<Pagenotfound />} />
              </Routes>
            </MemoryRouter>
          );

        const goBackButton = screen.getByRole('link', { name: 'Go Back' });

        expect(goBackButton).toHaveAttribute('href', '/');
      });

});