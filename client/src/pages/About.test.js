import React from "react";
import { render, screen } from "@testing-library/react";
import About from "./About";
import '@testing-library/jest-dom/extend-expect'; 

jest.mock("./../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

describe('About Component', () => {
  it('should render the content in About page', () => {
    render(<About />);
    const about_photo = screen.getByAltText("aboutus");
    
    expect(screen.getByText("About us - Ecommerce app")).toBeInTheDocument();
    expect(screen.getByText("Add text")).toBeInTheDocument();
    expect(about_photo).toBeInTheDocument();
    expect(about_photo).toHaveAttribute('src', '/images/about.jpeg');
  });
});