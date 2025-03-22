import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Contact from "./Contact";

jest.mock("../components/Layout", () => ({ title, children }) => <div data-testid="layout-test" data-title={title}>{children}</div>);

jest.mock("react-icons/bi", () => ({
    BiMailSend: () => <span data-testid="BiMailSend" />,
    BiPhoneCall: () => <span data-testid="BiPhoneCall" />,
    BiSupport: () => <span data-testid="BiSupport" />,
  }));

describe("Contact Page", () => {
  test("Should render the Layout component with title", () => {
    render(<Contact />);
    const layout = screen.getByTestId("layout-test");
    expect(layout).toBeInTheDocument();
    expect(layout.getAttribute("data-title")).toMatch(/contact/gi);
  });

  test("Should display the correct heading", () => {
    render(<Contact />);
    const heading = screen.getByText("CONTACT US");
    expect(heading).toBeInTheDocument();
  });

  test("Should render the contact details", () => {
    render(<Contact />);
    expect(screen.getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
    expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
    expect(screen.getByText(/1800-0000-0000/i)).toBeInTheDocument();
  });

  test("Should display the contact image", () => {
    render(<Contact />);
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image.getAttribute("src")).toMatch(/contactus.jpeg/gi);
  });
});
