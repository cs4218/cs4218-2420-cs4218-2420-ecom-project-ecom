import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Contact from './Contact';

// Mock Layout component
jest.mock('./../components/Layout', () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
  }));
  
  jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
  }));
  
  jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
  }));  

// Mock react-icons
jest.mock('react-icons/bi', () => ({
  BiMailSend: () => <div data-testid="mock-bi-mail-send" />,
  BiPhoneCall: () => <div data-testid="mock-bi-phone-call" />,
  BiSupport: () => <div data-testid="mock-bi-support" />,
}));

describe('Contact Component', () => {
  beforeEach(() => {
    render(<Contact />);
  });

  // TEST #1
  it('renders Layout component', () => {
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
  });

  // TEST #2
  it('renders the contact image', () => {
    const contactImage = screen.getByAltText('contactus');
    expect(contactImage).toBeInTheDocument();
    expect(contactImage).toHaveAttribute('src', '/images/contactus.jpeg');
  });

  // TEST #3
  it('renders the contact title', () => {
    const title = screen.getByText('CONTACT US');
    expect(title).toBeInTheDocument();
  });

  // TEST #4
  it('renders the contact information', () => {
    const infoText = screen.getByText(
      'For any query or info about product, feel free to call anytime. We are available 24X7.'
    );
    expect(infoText).toBeInTheDocument();
  });

  // TEST #5
  it('renders the email icon and text', () => {
    const emailIcon = screen.getByTestId('mock-bi-mail-send');
    expect(emailIcon).toBeInTheDocument();
    const emailText = screen.getByText(': www.help@ecommerceapp.com');
    expect(emailText).toBeInTheDocument();
  });

  // TEST #6
  it('renders the phone icon and text', () => {
    const phoneIcon = screen.getByTestId('mock-bi-phone-call');
    expect(phoneIcon).toBeInTheDocument();
    const phoneText = screen.getByText(': 012-3456789');
    expect(phoneText).toBeInTheDocument();
  });

  // TEST #7
  it('renders the support icon and text', () => {
    const supportIcon = screen.getByTestId('mock-bi-support');
    expect(supportIcon).toBeInTheDocument();
    const supportText = screen.getByText(': 1800-0000-0000 (toll free)');
    expect(supportText).toBeInTheDocument();
  });
});