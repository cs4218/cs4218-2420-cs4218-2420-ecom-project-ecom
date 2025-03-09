import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import Dashboard from './Dashboard'; 

// Mock UserMenu component
jest.mock('../../components/UserMenu', () => () => <div>User Menu</div>);

// Mock Layout component
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);

// Mock useAuth hook
jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(),
}));

describe('Dashboard', () => {
    const renderDashboard = () => {
        return render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
    };

    it('renders user information when authenticated', () => {
        useAuth.mockReturnValue([{
            user: {
                name: 'ABC Tan',
                email: '123@gmail.com',
                address: '123 CCC St'
            }
        }, jest.fn()]);

        renderDashboard();

        // Check if user information is rendered
        expect(screen.getByText(/ABC Tan/i)).toBeInTheDocument();
        expect(screen.getByText(/123@gmail.com/i)).toBeInTheDocument();
        expect(screen.getByText(/123 CCC St/i)).toBeInTheDocument();
    });

    it('renders "User Menu" component', () => {
        useAuth.mockReturnValue([{
            user: {
                name: 'ABC Tan',
                email: '123@gmail.com',
                address: '123 CCC St'
            }
        }, jest.fn()]);

        renderDashboard();

        // Check if UserMenu is rendered
        expect(screen.getByText(/user menu/i)).toBeInTheDocument();
    });

    it('renders nothing if user is not authenticated', () => {
        useAuth.mockReturnValue([{ user: null }, jest.fn()]);

        renderDashboard();

        // Check if user information is not rendered
        expect(screen.queryByText(/ABC Tan/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/123@gmail.com/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/123 CCC St/i)).not.toBeInTheDocument();
    });

});
