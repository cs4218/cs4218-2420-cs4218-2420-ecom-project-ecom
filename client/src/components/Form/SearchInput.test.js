import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(),
}));

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("SearchInput Component", () => {
  it("should call axios with correct arguments and navigate on form submit", async () => {
    const mockSetValues = jest.fn();
    const mockNavigate = jest.fn();
    const mockKeyword = "test";

    useSearch.mockReturnValue([
      { keyword: mockKeyword, results: [] },
      mockSetValues,
    ]);
    useNavigate.mockReturnValue(mockNavigate);
    axios.get.mockResolvedValue({ data: ["result1", "result2"] });

    render(<SearchInput />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, {
      target: mockKeyword,
    });

    await waitFor(() => {
      expect(input).toHaveValue(mockKeyword);
      const submitButton = screen.getByText("Search");
      fireEvent.click(submitButton);
      expect(axios.get).toHaveBeenCalled();

      expect(mockSetValues).toHaveBeenCalledWith({
        keyword: mockKeyword,
        results: ["result1", "result2"],
      });
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
