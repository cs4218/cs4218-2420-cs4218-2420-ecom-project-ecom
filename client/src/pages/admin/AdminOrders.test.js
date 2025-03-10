import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import AdminOrders from './AdminOrders';
import { useAuth } from '../../context/auth';

// Mocking dependencies
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [{ token: 'mockToken' }, jest.fn()]), // Mock useAuth hook
}));
jest.mock('../../components/AdminMenu', () => () => <div>AdminMenu</div>);
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);

// Mock moment.js
jest.mock('moment', () => () => ({
  fromNow: jest.fn(() => '2 days ago'), // Mock the fromNow function
}));

describe('AdminOrders Component', () => {
  const mockOrders = [
    {
      _id: 'order1',
      status: 'Not Process',
      buyer: { name: 'Dan Ling' },
      createAt: '2023-10-01T00:00:00Z',
      payment: { success: true },
      products: [
        {
          _id: 'product1',
          name: 'Product 1',
          description: 'Description of Product 1',
          price: 100,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValueOnce({ data: mockOrders }); // Mock successful fetch
  });

  // Test 1: Renders the AdminOrders component
  it('renders the AdminOrders component', async () => {
    // Given
    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );

    // When / Then
    expect(await screen.findByText('All Orders')).toBeInTheDocument();
    expect(await screen.findByText('Dan Ling')).toBeInTheDocument();
    expect(await screen.findByText('Success')).toBeInTheDocument();
    expect(await screen.findByText('2 days ago')).toBeInTheDocument();
  });

  // Test 2: Fetches and displays orders
  it('fetches and displays orders', async () => {
    // Given
    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );

    // When / Then
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
    });
  
    await waitFor(() => {
      expect(screen.getByText('Dan Ling')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });

  // Test 3: Updates order status
  it('updates order status when dropdown is changed', async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dan Ling')).toBeInTheDocument();
    });

    
    const statusDropdown = screen.getByTestId('status');
    fireEvent.mouseDown(statusDropdown);
    // Find and interact with the "Processing" option
    const processingOption = await screen.findByText('Processing');

    fireEvent.click(processingOption);
  
    // Then
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/auth/order-status/order1',
        { status: 'Processing' }
      );
    }); 
  });

  it("should update order status when changed", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByRole } = render(
        <MemoryRouter>
            <AdminOrders />
        </MemoryRouter>
    );

    await waitFor(() => {
        const select = getByRole("combobox");
        expect(select).toHaveValue("Processing");
    });

    fireEvent.mouseDown(select);

    const shippedOption = await waitFor(() => getByText("Shipped"));
    fireEvent.click(shippedOption);

    await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/order1", { status: "Shipped" });
    });
  });
  
});
