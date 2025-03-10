import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProvider, useSearch } from "./search";
import '@testing-library/jest-dom';

const renderSearchContextChild = () => {
    render(
        <SearchProvider>
          <SearchContextChild />
        </SearchProvider>
    );
};


const SearchContextChild = () => {
  const [searchValues, setSearchValues] = useSearch();

  const handleChange = (newKeyword) => {
    setSearchValues({ ...searchValues, keyword: newKeyword });
  };

  return (
    <div>
      <h1>Search Context Child</h1>
      <p data-testid="keyword">{searchValues.keyword}</p>
      <button onClick={() => handleChange("updated keyword")}>Update Keyword</button>
      <button onClick={() => handleChange("another keyword")}>Update to Another Keyword</button>

    </div>
  );
};

describe("SearchProvider", () => {
  it("should initialise context values for child", () => {
    renderSearchContextChild();

    const keywordElement = screen.getByTestId("keyword");
    expect(keywordElement).toHaveTextContent("");
  });

  it("should update context values", () => {
    renderSearchContextChild();

    const button = screen.getByRole("button", { name: "Update Keyword" });
    fireEvent.click(button); 

    const keywordElement = screen.getByTestId("keyword");
    expect(keywordElement).toHaveTextContent("updated keyword"); 
  });

  it("should update context values to another keyword", () => {
    renderSearchContextChild();

    const button = screen.getByRole("button", { name: "Update to Another Keyword" });
    fireEvent.click(button); 

    const keywordElement = screen.getByTestId("keyword");
    expect(keywordElement).toHaveTextContent("another keyword"); 
  });

  it("should handle multiple updates", () => {
    renderSearchContextChild();

    const updateButton = screen.getByRole("button", { name: "Update Keyword" });
    const anotherUpdateButton = screen.getByRole("button", { name: "Update to Another Keyword" });

    fireEvent.click(updateButton);
    fireEvent.click(anotherUpdateButton);

    const keywordElement = screen.getByTestId("keyword");
    expect(keywordElement).toHaveTextContent("another keyword"); 
  });
});