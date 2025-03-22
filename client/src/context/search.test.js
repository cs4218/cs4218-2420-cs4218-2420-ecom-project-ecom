import { fireEvent, render, screen } from "@testing-library/react";
import { SearchProvider, useSearch } from "./search";
import "@testing-library/jest-dom/extend-expect";
import React from "react";

describe("SearchProvider and useSearch", () => {
  // Test component that uses the context
  const TestComponent = () => {
    const [search, setSearch] = useSearch();

    return (
      <div>
        <p data-testid="search-val">{search.keyword}</p>
        <button
          onClick={() =>
            setSearch({
              keyword: "new search val",
              results: ["Mock result 1", "Mock result 2"],
            })
          }
        >
          Update Search
        </button>
      </div>
    );
  };

  test("provides context value correctly", async () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    // Verify default value
    expect(screen.getByTestId("search-val")).toHaveTextContent("");
  });
  test("updates context value correctly", async () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    fireEvent.click(screen.getByText("Update Search"));
    // Verify updated value
    expect(screen.getByTestId("search-val")).toHaveTextContent(
      "new search val"
    );
  });
});
