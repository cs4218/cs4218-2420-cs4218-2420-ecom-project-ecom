import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Policy from './Policy';

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

describe('When the policy page is visited', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Then the policy image should be correctly displayed', () => {
        const { getByAltText } = render(
            <MemoryRouter initialEntries={['/policy']}>
              <Routes>
                <Route path="/policy" element={<Policy />} />
              </Routes>
            </MemoryRouter>
          );

        const image = getByAltText('contactus');
    
        expect(image.src).toContain('/images/contactus.jpeg');
      });

    it('Then the policy information should be correctly displayed', () => {
        const { getAllByText } = render(
            <MemoryRouter initialEntries={['/policy']}>
              <Routes>
                <Route path="/policy" element={<Policy />} />
              </Routes>
            </MemoryRouter>
          );
    
        expect(getAllByText('add privacy policy')[0]).toBeInTheDocument();
      });

});