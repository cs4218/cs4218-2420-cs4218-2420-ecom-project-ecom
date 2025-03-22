import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import { useAuth } from '../../context/auth';
import axios from 'axios';
import PrivateRoute from "./Private";

jest.mock('axios');
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), 
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual("react-router-dom"),
  Outlet: jest.fn(() => <div data-testid="outlet">Outlet Content</div>)
}));

jest.mock('../Spinner', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="spinner">Loading...</div>)
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Private Route ", () => {
  test("uses Spinner when authenticating", () => {
    useAuth.mockReturnValue([{ token: 'test-token' }, jest.fn()]);
    
    // Don't resolve axios request yet
    axios.get.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
          <PrivateRoute />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

  });

  test("render Outlet when authentication succeeds", async() => {
    useAuth.mockReturnValue([{ token: 'test-token' }, jest.fn()]);
    
    // Mock successful auth check
    axios.get.mockResolvedValueOnce({ data: { ok: true } });

    render(
      <MemoryRouter>
          <PrivateRoute />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Should show Outlet after successful auth
    await waitFor(() => {
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
  });

  test("show Spinner when authentication fails", async () => {
    useAuth.mockReturnValue([ {token : 'test-token' }, jest.fn()]);

    axios.get.mockReturnValue({ data : { ok : false }});

    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
        
    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  test("show Spinner when no auth token is present", () => {
    useAuth.mockReturnValue([{}, jest.fn()]);
    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  })
})