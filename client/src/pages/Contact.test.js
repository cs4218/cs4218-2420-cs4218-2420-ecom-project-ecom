import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import Contact from "./Contact";

jest.mock("./../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

jest.mock("react-icons/bi", () => ({
    BiMailSend: () => <span>BiMailSend Icon</span>,
    BiPhoneCall: () => <span>BiPhoneCall Icon</span>,
    BiSupport: () => <span>BiSupport Icon</span>,
  }));

describe("Contact Component", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the Contact component correctly", () => {
    render(<Contact />);

    const contact_image = screen.getByAltText("contactus");
    expect(screen.getByText("Contact us")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "CONTACT US" })).toBeInTheDocument();
    expect(screen.getByText(/For any query or info about product, feel free to call anytime/i)).toBeInTheDocument();
    expect(screen.getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
    expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
    expect(screen.getByText(/1800-0000-0000/i)).toBeInTheDocument();
    expect(contact_image).toBeInTheDocument();
    expect(contact_image).toHaveAttribute("src", "/images/contactus.jpeg");
  });
});
