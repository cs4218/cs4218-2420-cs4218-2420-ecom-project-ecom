import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

jest.mock("axios");

const mockSetValues = jest.fn();
jest.mock("../../context/search", () => ({
	useSearch: jest.fn(),
}));

const mockNavigateFunction = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigateFunction,
}));


describe("SearchInput Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		useSearch.mockReturnValue([
			{ keyword: "", results: [] },
			mockSetValues,
		]);
	});

	it("should render the search input, button correctly and search with user input", async () => {
        const mockSearchResults = { data: [] };
		axios.get.mockResolvedValueOnce(mockSearchResults);
		render(
			<MemoryRouter>
				<SearchInput />
			</MemoryRouter>
		);

		const searchInputField = screen.getByPlaceholderText("Search");
		const searchButton = screen.getByRole("button", { name: "Search" });
        
		expect(searchInputField).toBeInTheDocument();
		expect(searchButton).toBeInTheDocument();

        fireEvent.change(searchInputField, { target: { value: "user input" } });
		userEvent.click(searchButton);

		await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/");
		expect(mockSetValues).toHaveBeenCalledWith({
			keyword: "user input",
			results: [], 
		});
        expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
        expect(mockNavigateFunction).toHaveBeenCalledWith('/search');
	});
});