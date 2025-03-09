import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Pagenotfound from "../pages/Pagenotfound";
import '@testing-library/jest-dom';

// Mock Layout to isolate component rendering
jest.mock("../components/Layout", () => ({ title, children }) => (
  <div data-testid="layout">
    <title>{title}</title>
    {children}
  </div>
));

describe("Pagenotfound Component", () => {
  test("renders the PageNotFound component", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    // Check if the component is rendered
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  test("displays the correct page title", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    // Ensure Helmet sets the correct title
    expect(document.title).toBe("go back- page not found");
  });

  test("displays 404 and error message", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
  });

  test("renders the 'Go Back' link with correct destination", () => {
    render(
      <BrowserRouter>
        <Pagenotfound />
      </BrowserRouter>
    );

    const linkElement = screen.getByRole("link", { name: /go back/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "/");
  });
});
