import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import toast from "react-hot-toast";
import '@testing-library/jest-dom/extend-expect';

jest.mock('../context/auth');

jest.mock('../context/cart');

jest.mock('../hooks/useCategory');

jest.mock('react-hot-toast');

jest.mock('./Form/SearchInput', () => () => (
    <div data-testid='mock-search-input'>
        Search
    </div>
));

jest.mock('antd', () => ({
    Badge: ({ count, children }) => (
        <span data-testid='mock-badge' badge-count={count}>
            {children}
        </span>
    ),
}));

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});

describe('Header component', () => {
    const setAuthMock = jest.fn();
    const renderHeaderComponent = () => {
        render(
            <Router>
                <Header />
            </Router>
        )
    };

    beforeEach(() => {
        jest.clearAllMocks();

        useAuth.mockReturnValue([{ user: null, token: "" }, setAuthMock]);
        useCategory.mockReturnValue([]);
        useCart.mockReturnValue([[]]);
    });

    describe('for users not logged in', () => {
        it('should render Header with empty cart', () => {
            const categories = [
                { 
                    name: 'category-a', 
                    slug: 'category-a-slug' 
                },
                { 
                    name: 'category-b', 
                    slug: 'category-b-slug' 
                }
            ]
            useCategory.mockReturnValue(categories);

            renderHeaderComponent();

            expect(screen.getByText('🛒 Virtual Vault')).toHaveAttribute('href', '/');
            expect(screen.getByTestId('mock-search-input')).toBeInTheDocument();
            expect(screen.getByText('Home')).toHaveAttribute('href', '/');
            expect(screen.getByText('Categories')).toBeInTheDocument();
            expect(screen.getByText('All Categories')).toBeInTheDocument();
            expect(screen.getByText('category-a')).toBeInTheDocument();
            expect(screen.getByText('category-a')).toHaveAttribute('href', '/category/category-a-slug');
            expect(screen.getByText('category-b')).toBeInTheDocument();
            expect(screen.getByText('category-b')).toHaveAttribute('href', '/category/category-b-slug');
            expect(screen.getByText('Register')).toHaveAttribute('href', '/register');
            expect(screen.getByText('Login')).toHaveAttribute('href', '/login');
            expect(screen.getByText('Cart')).toHaveAttribute('href', '/cart');
            expect(screen.getByTestId('mock-badge')).toHaveAttribute('badge-count', '0');
        });
    })

    describe('for users logged in', () => {
        it('should render Header with user details & item in cart', () => {
            useAuth.mockReturnValue([{
                user: { name: 'username', role: 0 },
                token: 'user-token',
            },
                setAuthMock,
            ]);
            useCart.mockReturnValue([[{ id: 1 }, { id: 2 }, { id: 3 }]]);
            
            renderHeaderComponent();

            expect(screen.getByText('username')).toHaveAttribute('href', '/');;
            expect(screen.getByText('Cart')).toHaveAttribute('href', '/cart');
            expect(screen.getByTestId('mock-badge')).toHaveAttribute('badge-count', '3');
            expect(screen.getByText('Dashboard')).toHaveAttribute('href', '/dashboard/user');
            expect(screen.getByText('Logout')).toHaveAttribute('href', '/login');

        });

        it('should be able to logout the user', () => {
            useAuth.mockReturnValue([{
                user: { name: 'username', role: 0 },
                token: 'user-token',
            },
                setAuthMock,
            ]);

            renderHeaderComponent();

            fireEvent.click(screen.getByText('Logout'));

            expect(setAuthMock).toHaveBeenCalledWith({
                user: null,
                token: ''
            })
            expect(toast.success).toHaveBeenCalledWith('Logout Successfully');
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth');
        })
    });
});