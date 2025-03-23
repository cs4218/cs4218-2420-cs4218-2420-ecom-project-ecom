import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import ForgotPassword from './ForgotPassword';

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

  jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

  Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };  

describe('ForgotPassword Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders forgot password form', () => {
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/forgot-password']}>
            <Routes>
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </MemoryRouter>
        );
    
        expect(getByText('Forgot Password')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter your security answer')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter new password')).toBeInTheDocument();
      });
      it('inputs should be initially empty', () => {
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/forgot-password']}>
            <Routes>
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </MemoryRouter>
        );
    
        expect(getByText('Forgot Password')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter your email').value).toBe('');
        expect(getByPlaceholderText('Enter your security answer').value).toBe('');
        expect(getByPlaceholderText('Enter new password').value).toBe('');
      });
    
      it('should allow typing email, answer and password', () => {
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/forgot-password']}>
            <Routes>
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </MemoryRouter>
        );
        fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter your security answer'), { target: { value: 'soccer' } });
        fireEvent.change(getByPlaceholderText('Enter new password'), { target: { value: 'newpassword' } });

        expect(getByPlaceholderText('Enter your email').value).toBe('test@example.com');
        expect(getByPlaceholderText('Enter your security answer').value).toBe('soccer');
        expect(getByPlaceholderText('Enter new password').value).toBe('newpassword');
      });
      
    it('should reset password successfully', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                success: true,
                message: "Password Reset Successfully"
            }
        });

        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/forgot-password']}>
                <Routes>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter your security answer'), { target: { value: 'soccer' } });
        fireEvent.change(getByPlaceholderText('Enter new password'), { target: { value: 'newpassword' } });
        fireEvent.click(getByText('Reset Password'));

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.success).toHaveBeenCalledWith("Password Reset Successfully");
    });

    it('should navigate user to login page upon successul password reset', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                success: true,
                message: "Password Reset Successfully"
            }
        });

        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/forgot-password']}>
                <Routes>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter your security answer'), { target: { value: 'soccer' } });
        fireEvent.change(getByPlaceholderText('Enter new password'), { target: { value: 'newpassword' } });
        fireEvent.click(getByText('Reset Password'));

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.success).toHaveBeenCalledWith("Password Reset Successfully");
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
    });
    
    it('should display error message for incorrect security answer', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: "Wrong Email Or Answer" } }
        });
    
        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/forgot-password']}>
                <Routes>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
            </MemoryRouter>
        );
    
        fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter your security answer'), { target: { value: 'wrong-answer' } });
        fireEvent.change(getByPlaceholderText('Enter new password'), { target: { value: 'newpassword' } });
        fireEvent.click(getByText('Reset Password'));
    
        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.error).toHaveBeenCalledWith("Wrong Email Or Answer");
    });

    it('should display a generic error message when the request fails', async () => {
        axios.post.mockRejectedValueOnce(new Error("Network Error"));
    
        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/forgot-password']}>
                <Routes>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
            </MemoryRouter>
        );
    
        fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter your security answer'), { target: { value: 'soccer' } });
        fireEvent.change(getByPlaceholderText('Enter new password'), { target: { value: 'newpassword' } });
        fireEvent.click(getByText('Reset Password'));
    
        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.");
    });
});
