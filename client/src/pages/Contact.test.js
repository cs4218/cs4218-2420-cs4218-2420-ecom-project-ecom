import React from "react";
import { render, screen } from "@testing-library/react";
import Contact from "../pages/Contact";
import { BrowserRouter as Router } from "react-router-dom";
import '@testing-library/jest-dom';

// Mock Layout to avoid unnecessary rendering of its children
jest.mock("../components/Layout", () => ({ title, children }) => {
    // Directly destructure the props
    return (
      <div data-testid="layout">
        <h1>{title}</h1>
        {children}
      </div>
    );
});

// Mock react-icons
jest.mock('react-icons/bi', () => ({
    BiMailSend: () => <span>Mail Icon</span>,
    BiPhoneCall: () => <span>Phone Icon</span>,
    BiSupport: () => <span>Support Icon</span>,
  }));

describe("Contact Page Tests", () => {
  
  test("should render the Layout component with correct title", () => {
    render(
      <Router>
        <Contact />
      </Router>
    );

    // Check if Layout component has the correct title
    expect(screen.getByText("Contact us")).toBeInTheDocument();
  });

  test("should display the contact image and text", () => {
    render(
      <Router>
        <Contact />
      </Router>
    );

    // Check if the image is displayed
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");

    // Check if the text content is rendered
    expect(screen.getByText(/For any query or info about product/i)).toBeInTheDocument();
  });

  test("should display the correct contact details", () => {
    render(
      <Router>
        <Contact />
      </Router>
    );

    // Check email, phone, and support details
    expect(screen.getByText(/www\.help@ecommerceapp\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
    expect(screen.getByText(/1800-0000-0000 \(toll free\)/i)).toBeInTheDocument();

  });

  test("should render Layout and Contact component", () => {
    render(
      <Router>
        <Contact />
      </Router>
    );

    // Check if the Layout component is rendered
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

});
