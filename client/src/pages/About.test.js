import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import About from "../pages/About"; // Adjust the import path if needed
import '@testing-library/jest-dom';

jest.mock("../components/Layout", () => {
    const React = require("react");
    const { Helmet } = require("react-helmet");
  
    return ({ title, children }) => {
      console.log("Mocked Layout received title:", title);
      return (
        <div data-testid="layout">
          <Helmet>
            <title>{title}</title>
          </Helmet>
          {children}
        </div>
      );
    };
  });
  
  

describe("About Page", () => {
  test("should render About component without crashing", () => {
    render(<About />);
    
    // Ensure Layout is rendered
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  test("should display the correct title in Layout", async () => {
    render(<About />);
    
    // Wait for Helmet to update the title
    await waitFor(() => {
      expect(document.title).toBe("About us - Ecommerce app");
    });
  });

  test("should render the image with the correct src and alt attributes", () => {
    render(<About />);
    
    const image = screen.getByRole("img", { name: /contactus/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/about.jpeg");
    expect(image).toHaveAttribute("alt", "contactus");
  });

  test("should render the paragraph with expected text", () => {
    render(<About />);
    
    const paragraph = screen.getByText(/Add text/i);
    expect(paragraph).toBeInTheDocument();
  });
});
