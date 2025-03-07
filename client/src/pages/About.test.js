import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import About from "./About";

// Mocks
jest.mock("./../components/Layout", () => {
    const PropTypes = require('prop-types');
    const MockLayout = ({ children, title }) => {
        return <div data-testid="mock-layout" data-title={title}>{children}</div>;
    };
    
    MockLayout.propTypes = {
        children: PropTypes.node.isRequired,
        title: PropTypes.string.isRequired
    };
    
    return MockLayout;
});

window.matchMedia =
    window.matchMedia ||
    function () {
        return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
    };
};

describe("About Component", () => {
    // TEST #1
    it("renders about page container with correct classes", () => {
        render(<About />);
        const container = screen.getByTestId("about-container");
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass("row", "contactus");
    });

    // TEST #2
    it("renders image column with correct image", () => {
        render(<About />);
        const imageColumn = screen.getByTestId("image-column");
        const image = screen.getByAltText("contactus");

        expect(imageColumn).toBeInTheDocument();
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "/images/about.jpeg");
        expect(image).toHaveStyle({ width: "100%" });
    });

    // TEST #3
    it("renders text column with content", () => {
        render(<About />);
        const textColumn = screen.getByTestId("text-column");
        const paragraph = screen.getByText("Add text");
        
        expect(textColumn).toBeInTheDocument();
        expect(textColumn).toHaveClass("col-md-4");
        expect(paragraph).toHaveClass("text-justify mt-2");
    });

    // TEST #4
    it("uses Layout component with correct title", () => {
        render(<About />);
        const layout = screen.getByTestId("mock-layout");
        expect(layout).toBeInTheDocument();
        expect(layout).toHaveAttribute("data-title", "About us - Ecommerce app");
    });
});
