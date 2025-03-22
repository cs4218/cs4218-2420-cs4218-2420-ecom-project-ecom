import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";

jest.mock("../components/Layout", () => ({ children }) => <>{children}</>);

// Mock `useSearch` for the first test (empty results)
jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "", results: [] }, jest.fn()]),
}));

describe("Search Page", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("displays 'No Products Found' when there are no results", () => {
    const Search = require("./Search").default;

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  test("displays search results when products exist", () => {
    jest.doMock("../context/search", () => ({
      useSearch: jest.fn(() => [
        {
          keyword: "test",
          results: [
            {
              _id: "1",
              name: "Product A",
              description: "A great product",
              price: 100,
            },
          ],
        },
        jest.fn(),
      ]),
    }));

    const Search = require("./Search").default;

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getByText("Found 1")).toBeInTheDocument();
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("$ 100")).toBeInTheDocument();
  });
});
