import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import toast from "react-hot-toast";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Header from './Header';
import { useAuth } from '../context/auth';


// Mocking axios.post
jest.mock('axios');
jest.mock("react-hot-toast");

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));

jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));

const mockCategories = [
    { _id: 1, name: "mockCategory1", slug: "category-one" },
    { _id: 2, name: "mockCategory2", slug: "category-two" },
];

jest.mock("../hooks/useCategory", () => jest.fn(() => mockCategories));

const renderHeaderPage = () => {
    render(
        <MemoryRouter initialEntries={["/"]}>
            <Routes>
                <Route path="/" element={<Header />} />
                <Route path="/categories" element={<Header />} />
                <Route path="/register" element={<div>mock register page</div>} />
                <Route path="/login" element={<div>mock login page</div>} />
                <Route path="/cart" element={<div>mock cart page</div>} />
                <Route path="/dashboard/user" element={<div>mock user dashboard</div>} />
                <Route path="/dashboard/admin" element={<div>mock admin dashboard</div>} />
            </Routes>
        </MemoryRouter>
    );
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('Header component - logged out', () => {
    it('should render header correctly', async () => {
        renderHeaderPage();
        await waitFor(() => {
            expect(screen.getByRole('link', { name: /Virtual Vault/ })).toBeInTheDocument();
            expect(screen.getByLabelText('Search')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Search/ })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument();
        });
    });

    it('Virtual Vault homepage button should redirect to homepage', async () => {
        renderHeaderPage();
        await waitFor(() => {
            const homeButton = screen.getByRole('link', { name: /Virtual Vault/ });
            expect(homeButton).toHaveAttribute('href', '/');
        });    
    });

    it('home button should redirect to homepage', async () => {
        renderHeaderPage();
        await waitFor(() => {
            const homeButton = screen.getByRole('link', { name: 'Home' });
            expect(homeButton).toHaveAttribute('href', '/');
        });    
    });

    it('categories button should display all categories on click', async () => {
        renderHeaderPage();
        const categoriesButton = await screen.findByRole('link', { name: 'Categories' });
        fireEvent.click(categoriesButton);
        await waitFor(() => {
            expect(screen.getByText('All Categories')).toBeInTheDocument();
            expect(screen.getByText('mockCategory1')).toBeInTheDocument();
            expect(screen.getByText('mockCategory2')).toBeInTheDocument();
        });    
    });

    it('register button should redirect to register page', async () => {
        renderHeaderPage();
        const registerButton = screen.getByRole('link', { name: 'Register' });
        fireEvent.click(registerButton);
        await waitFor(() => {    
            expect(screen.getByText('mock register page')).toBeInTheDocument();
        });   
    });

    it('login button should redirect to login page', async () => {
        renderHeaderPage();
        const loginButton = screen.getByRole('link', { name: 'Login' });
        fireEvent.click(loginButton);
        await waitFor(() => {    
            expect(screen.getByText('mock login page')).toBeInTheDocument();
        });   
    });

    it('cart button should redirect to cart page', async () => {
        renderHeaderPage();
        const cartButton = screen.getByRole('link', { name: 'Cart' });
        fireEvent.click(cartButton);
        await waitFor(() => {    
            expect(screen.getByText('mock cart page')).toBeInTheDocument();
        });   
    });
});

describe('Header component - logged in as user', () => {
    beforeEach(() => {
        const setAuth = jest.fn();
        useAuth.mockReturnValue([{
            success: true,
            user: { id: 1, name: 'mockUser', email: 'mockUser@example.com', role: 0 },
            token: 'mockToken'
          }, setAuth])
    });

    it('user name should be rendered correctly', async () => {
        renderHeaderPage();
        await waitFor(() => {    
            expect(screen.getByText('mockUser')).toBeInTheDocument();
        });   
    });

    it('user name button should display dashboard and logout options', async () => {
        renderHeaderPage();
        const usernameButton = screen.getByRole('button', { name: 'mockUser' });
        fireEvent.click(usernameButton);
        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });   
    });

    it('dashboard button should navigate to user dashboard', async () => {
        renderHeaderPage();
        fireEvent.click(screen.getByRole('button', { name: 'mockUser' }));
        
        const dashboardButton = await screen.findByText('Dashboard');
        fireEvent.click(dashboardButton);
        await waitFor(() => {
            expect(screen.getByText('mock user dashboard')).toBeInTheDocument();
        });   
    });

    it('logout button should handle logout', async () => {
        renderHeaderPage();
        fireEvent.click(screen.getByRole('button', { name: 'mockUser' }));
        
        const logoutButton = await screen.findByText('Logout');
        fireEvent.click(logoutButton);
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
        });   
    });
});

describe('Header component - logged in as admin', () => {
    beforeEach(() => {
        const setAuth = jest.fn();
        useAuth.mockReturnValue([{
            success: true,
            user: { id: 1, name: 'mockUser', email: 'mockUser@example.com', role: 1 },
            token: 'mockToken'
          }, setAuth])
    });

    it('dashboard button should navigate to admin dashboard', async () => {
        renderHeaderPage();
        fireEvent.click(screen.getByRole('button', { name: 'mockUser' }));
        
        const dashboardButton = await screen.findByText('Dashboard');
        fireEvent.click(dashboardButton);
        await waitFor(() => {
            expect(screen.getByText('mock admin dashboard')).toBeInTheDocument();
        });   
    });
});