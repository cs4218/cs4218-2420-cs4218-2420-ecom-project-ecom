import React from "react";
import { render, screen } from "@testing-library/react";
import Policy from "../pages/Policy";
import '@testing-library/jest-dom';

// Mock Layout to isolate component rendering
jest.mock("../components/Layout", () => ({ title, children }) => (
  <div data-testid="layout">
    <title>{title}</title>
    {children}
  </div>
));

describe("Policy Component", () => {
  test("renders the Policy component", () => {
    render(<Policy />);

    // Check if Layout is rendered
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  test("displays the correct page title", () => {
    render(<Policy />);

    // Ensure Helmet sets the correct title
    expect(document.title).toBe("Privacy Policy");
  });

  test("displays privacy policy text", () => {
    render(<Policy />);

    // Ensure at least one instance of the privacy policy text is found
    expect(screen.getAllByText("add privacy policy").length).toBeGreaterThan(0);
  });

  test("renders the contact image correctly", () => {
    render(<Policy />);

    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
  });
});
