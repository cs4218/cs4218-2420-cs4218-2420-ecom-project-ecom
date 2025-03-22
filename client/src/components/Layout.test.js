import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Layout from "./Layout";

jest.mock("./Footer", () => jest.fn());
jest.mock("./Header", () => jest.fn());
jest.mock("react-helmet", () => ({ Helmet: ({ children }) => children }));
jest.mock("react-hot-toast", () => ({ Toaster: () => null }));

describe("Layout Component", () => {
  it("Should render the Layout component with default props", () => {
    // Test
    render(<Layout/>);
    expect(document.title).toBe("Ecommerce app - shop now");
    expect(document.querySelector('meta[name="description"]').getAttribute("content")).toBe("MERN stack project");
    expect(document.querySelector('meta[name="keywords"]').getAttribute("content")).toBe("MERN, React, Node, MongoDB");
    expect(document.querySelector('meta[name="author"]').getAttribute("content")).toBe("Techinfoyt");
  });
  
  it("Should render changed props", () => {
    // Test
    render(<Layout title="Test title" description="Test description" keywords="Test keywords" author="Test author"/>);
    expect(document.title).toBe("Test title");
    expect(document.querySelector('meta[name="description"]').getAttribute("content")).toBe("Test description");
    expect(document.querySelector('meta[name="keywords"]').getAttribute("content")).toBe("Test keywords");
    expect(document.querySelector('meta[name="author"]').getAttribute("content")).toBe("Test author");
  });

  it("Should render children", () => {
    // Setup
    const fakeChild = <div data-testid="fake-child">Fake Child</div>;

    // Test
    render(<Layout>{fakeChild}</Layout>);
    expect(screen.getByTestId("fake-child")).toBeInTheDocument();
  })
});