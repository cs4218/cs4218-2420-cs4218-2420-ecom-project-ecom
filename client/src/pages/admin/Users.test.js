import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Users from './Users';
import Layout from '../../components/Layout';
import AdminMenu from '../../components/AdminMenu';
import "@testing-library/jest-dom/extend-expect";

// Mocking necessary components
jest.mock('../../components/Layout', () => {
    return ({ children, title }) => (
        <div data-testid="layout">
            <h1>{title}</h1>
            {children}
        </div>
    );
});

jest.mock('../../components/AdminMenu', () => {
    return () => <div data-testid="admin-menu">Admin Menu</div>;
});

describe('Users Component', () => {
    it('renders Users component with layout and admin menu', () => {
        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        // Check if Layout is rendered with the correct title
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByText('Dashboard - All Users')).toBeInTheDocument();

        // Check if AdminMenu is rendered
        expect(screen.getByTestId('admin-menu')).toBeInTheDocument();

        // Check if "All Users" heading is present
        expect(screen.getByText('All Users')).toBeInTheDocument();
    });
});
