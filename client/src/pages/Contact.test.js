import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import Contact from "../pages/Contact";

// Mock react-icons to avoid errors in tests
jest.mock("react-icons/bi", () => ({
  BiMailSend: () => <span data-testid="bi-mail"></span>,
  BiPhoneCall: () => <span data-testid="bi-phone"></span>,
  BiSupport: () => <span data-testid="bi-support"></span>,
}));

// Mock Layout to isolate Contact component
jest.mock("../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

describe("Contact Page", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it("renders Contact page correctly", () => {
    render(
      <MemoryRouter initialEntries={["/contact"]}>
        <Routes>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    );

    // Check if heading is displayed
    expect(screen.getByText("CONTACT US")).toBeInTheDocument();

    // Check if contact details exist
    expect(screen.getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
    expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
    expect(screen.getByText(/1800-0000-0000/i)).toBeInTheDocument();

    // Check if image is rendered
    const contactImage = screen.getByAltText("contactus");
    expect(contactImage).toBeInTheDocument();
    expect(contactImage).toHaveAttribute("src", "/images/contactus.jpeg");

    // Check if layout renders correctly
    expect(screen.getByTestId("layout")).toBeInTheDocument();

    // Check if icons are rendered (mocked)
    expect(screen.getByTestId("bi-mail")).toBeInTheDocument();
    expect(screen.getByTestId("bi-phone")).toBeInTheDocument();
    expect(screen.getByTestId("bi-support")).toBeInTheDocument();
  });
});
