import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import AdminMenu from './AdminMenu';

describe('AdminMenu Component', () => {
  it('should render without crashing', () => {
    render(
        <MemoryRouter initialEntries={['/dashboard/admin']}>
            <Routes>
                <Route path="/dashboard/admin" element={<AdminMenu />} />
            </Routes>
        </MemoryRouter>   
    );
    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('should have correct links', () => {
    render(
        <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
            <Route path="/dashboard/admin" element={<AdminMenu />} />
        </Routes>
    </MemoryRouter>   
    );

    expect(screen.getByText('Products').closest('a')).toHaveAttribute('href', '/dashboard/admin/products');
    expect(screen.getByText('Orders').closest('a')).toHaveAttribute('href', '/dashboard/admin/orders');
  });
});