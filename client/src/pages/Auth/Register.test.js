import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Register from './Register';

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
      

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form', () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('REGISTER FORM')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Name')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Phone')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Address')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your DOB')).toBeInTheDocument();
    expect(getByPlaceholderText('What is Your Favorite sports')).toBeInTheDocument();
  });

  it('should register the user successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login');
  });

  it('should navigate user to login page upon successful registration', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });

  it('should display error message on failed registration', async () => {
    axios.post.mockRejectedValueOnce({ message: 'User already exists' });

    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('should display an error if a future date is entered for DOB regardless of other fields', async () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
  
    const dobInput = getByPlaceholderText('Enter Your DOB');
    
    fireEvent.change(dobInput, { target: { value: '2100-01-01' } });
    fireEvent.blur(dobInput);
  
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Date of Birth cannot be in the future"));
  });

  it('should display an error if a future date is entered for DOB regardless of other fields', async () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
  
    const dobInput = getByPlaceholderText('Enter Your DOB');
    
    fireEvent.change(dobInput, { target: { value: '2100-01-01' } });
    fireEvent.blur(dobInput);
  
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Date of Birth cannot be in the future"));
  });

  it("should be able to input today's date as DOB" , async () => {
    const today = new Date().toISOString().split("T")[0];
  
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
  
    const dobInput = getByPlaceholderText('Enter Your DOB');
    
    fireEvent.change(dobInput, { target: { value: today } });
    fireEvent.blur(dobInput);
    
    // Ensure that the DOB field correctly accepts today's date
    expect(dobInput.value).toBe(today);
    // Ensure no error message is displayed
    await waitFor(() => expect(toast.error).not.toHaveBeenCalled());
  });


  // Phone Number Field Tests
  it('should allow only numeric values in the phone number field', () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const phoneInput = getByPlaceholderText('Enter Your Phone');

    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    
    expect(phoneInput.value).toBe('1234567890'); 
  });

  it('should not allow non-numeric characters in the phone number field', () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const phoneInput = getByPlaceholderText('Enter Your Phone');

    fireEvent.change(phoneInput, { target: { value: 'abc123' } });

    expect(phoneInput.value).not.toBe('abc123'); 
    expect(phoneInput.value).toBe(''); 
    expect(toast.error).toHaveBeenCalledWith('Phone number must contain only numbers'); 
  });

  it('should not allow more than 15 digits in the phone number field', () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const phoneInput = getByPlaceholderText('Enter Your Phone');

    fireEvent.change(phoneInput, { target: { value: '1234567890123456' } }); // 16 digits

    expect(phoneInput.value.length).toBeLessThanOrEqual(15); 
  });
});
