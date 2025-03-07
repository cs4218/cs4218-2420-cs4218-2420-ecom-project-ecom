import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter } from "react-router-dom";
import CategoryProduct from "./CategoryProduct";
import axios from "axios";
import userEvent from "@testing-library/user-event";

// Mocks
jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ slug: "test-category" }),
    useNavigate: () => mockNavigate,
}));

jest.mock("./../components/Layout", () => {
    return ({ children }) => <div data-testid="mock-layout">{children}</div>;
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

const mockProducts = [
    {
        _id: "1",
        name: "Test Product 1",
        slug: "test-product-1",
        description: "This is test product 1 description that is long enough to be truncated",
        price: 99.99
    },
    {
        _id: "2",
        name: "Test Product 2",
        slug: "test-product-2",
        description: "This is test product 2 description that is long enough to be truncated",
        price: 149.99
    }
];

const mockCategory = {
    name: "Test Category"
};

const renderWithRouter = (component) => {
    return render(component, { wrapper: BrowserRouter });
};

describe("CategoryProduct Component", () => {
    beforeEach(() => {
        cleanup();
        jest.clearAllMocks();
        axios.get.mockResolvedValue({ 
            data: { products: mockProducts, category: mockCategory } 
        });
    });

    afterEach(() => {
        cleanup();
    });

    // TEST #1
    it("renders Layout component", () => {
        renderWithRouter(<CategoryProduct />);
        expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
    });

    // TEST #2
    it("makes API call and displays products", async () => {
        renderWithRouter(<CategoryProduct />);
        
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                "/api/v1/product/product-category/test-category"
            );
        });

        const categoryTitle = await screen.findByText("Category - Test Category");
        expect(categoryTitle).toBeInTheDocument();
        
        const resultCount = await screen.findByText("2 result found");
        expect(resultCount).toBeInTheDocument();

        for (const product of mockProducts) {
            const productName = await screen.findByText(product.name);
            expect(productName).toBeInTheDocument();
            
            const productDesc = await screen.findByText(product.description.substring(0, 60) + "...");
            expect(productDesc).toBeInTheDocument();
            
            const productPrice = await screen.findByText("$" + product.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }));
            expect(productPrice).toBeInTheDocument();
        }
    });

    // TEST #3
    it("handles More Details button correctly", async () => {
        renderWithRouter(<CategoryProduct />);
        
        const moreDetailsButtons = await screen.findAllByText("More Details");
        const moreDetailsButton = moreDetailsButtons[0];
        await userEvent.click(moreDetailsButton);
        
        expect(mockNavigate).toHaveBeenCalledWith("/product/test-product-1");
    });

    // TEST #4
    it("displays product images correctly", async () => {
        renderWithRouter(<CategoryProduct />);
        
        const images = await screen.findAllByRole("img");
        expect(images).toHaveLength(mockProducts.length);
        
        images.forEach((img, index) => {
            expect(img).toHaveAttribute("src", `/api/v1/product/product-photo/${mockProducts[index]._id}`);
            expect(img).toHaveAttribute("alt", mockProducts[index].name);
            expect(img).toHaveClass("card-img-top");
        });
    });

    // TEST #5
    it("handles API errors gracefully", async () => {
        const consoleLogSpy = jest.spyOn(console, "log");
        const error = new Error("API Error");
        axios.get.mockRejectedValueOnce(error);
        
        renderWithRouter(<CategoryProduct />);
        
        await waitFor(() => 
            expect(consoleLogSpy).toHaveBeenCalledWith(error)
        );
        
        const emptyResult = await screen.findByText("0 result found");
        expect(emptyResult).toBeInTheDocument();
        
        consoleLogSpy.mockRestore();
    });

    // TEST #6
    it("does not make API call when slug is undefined", async () => {
        // Override the mock to return undefined slug
        jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ slug: undefined });
        
        renderWithRouter(<CategoryProduct />);
        
        // Wait for API calls
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(axios.get).not.toHaveBeenCalled();
    });
});
