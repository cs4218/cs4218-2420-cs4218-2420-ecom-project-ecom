import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Policy from './Policy'
import Layout from "../components/Layout";

jest.mock("../components/Layout", () => ({ title, children }) => (
  <div data-testid="layout" title={title}>{children}</div>
));

describe("Policy Page", () => {
  
  test("renders without crashing", () => {
    render(<Policy />);
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  test("Layout receives correct title prop", () => {
    render(<Policy />);
    expect(screen.getByTestId("layout").getAttribute("title")).toBe("Privacy Policy");
  });

  test("renders some text content", () => {
    render(<Policy />);
    const textElements = screen.queryAllByText(/./);
    expect(textElements.length).toBeGreaterThan(0);
  });

  test("renders the image with correct alt text", () => {
    render(<Policy />);
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
  });

});