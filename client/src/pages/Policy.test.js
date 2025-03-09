import React from "react";
import { render, screen } from "@testing-library/react";
import Policy from "./Policy";
import '@testing-library/jest-dom/extend-expect'; 

jest.mock("./../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

describe('Privacy Policy Component', () => {
  it('should render the content in Privacy Policy page', () => {
    render(<Policy />);
    const call_photo = screen.getByAltText("contactus");
    
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(call_photo).toBeInTheDocument();
    expect(call_photo).toHaveAttribute('src', '/images/contactus.jpeg');
    expect(screen.getAllByText("add privacy policy")).toHaveLength(7);
  });
});