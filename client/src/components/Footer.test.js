import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Footer from './Footer';

// Mocking axios.post
jest.mock('axios');

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));

const renderFooterPage = () => {
    render(
        <MemoryRouter initialEntries={["/"]}>
            <Routes>
                <Route path="/" element={<Footer />} />
                <Route path="/about" element={<div>mock about page</div>} />
                <Route path="/contact" element={<div>mock contact page</div>} />
                <Route path="/policy" element={<div>mock policy page</div>} />
            </Routes>
        </MemoryRouter>
    );
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('Footer component', () => {
    it('should render footer text correctly', async () => {
        renderFooterPage();
        await waitFor(() => {
            expect(screen.getByText(new RegExp('All Rights Reserved © TestingComp'))).toBeInTheDocument();
            expect(screen.getByText(new RegExp('About'))).toBeInTheDocument();
            expect(screen.getByText(new RegExp('Contact'))).toBeInTheDocument();
            expect(screen.getByText(new RegExp('Privacy Policy'))).toBeInTheDocument();
        });
    });

    it('should navigate to About page upon clicking About button', async () => {
        renderFooterPage();
        const aboutButton = screen.getByText('About');
        fireEvent.click(aboutButton);
        await waitFor(() => {    
            expect(screen.getByText('mock about page')).toBeInTheDocument();
        });
    });

    it('should navigate to Contact page upon clicking Contact button', async () => {
        renderFooterPage();
        const contactButton = screen.getByText('Contact');
        fireEvent.click(contactButton);
        await waitFor(() => {    
            expect(screen.getByText('mock contact page')).toBeInTheDocument();
        });
    });

    it('should navigate to Policy page upon clicking Policy button', async () => {
        renderFooterPage();
        const policyButton = screen.getByText('Privacy Policy');
        fireEvent.click(policyButton);
        await waitFor(() => {    
            expect(screen.getByText('mock policy page')).toBeInTheDocument();
        });
    });
});