import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSearch } from "../../context/search";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SearchInput from "../../components/Form/SearchInput";
import toast from 'react-hot-toast';

// Mock axios post 
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

jest.mock("../../hooks/useCategory", () => jest.fn(() => [])); // Mock the use Category hook 

describe("SearchInput Component", () => {
    let mockSetValues, mockNavigate, mockSearchState;

    beforeEach(() => {
        mockNavigate = jest.fn();
        mockSearchState = { keyword: "", results: [] };

        mockSetValues = jest.fn((newValues) => {
            Object.assign(mockSearchState, newValues); // manually update the state
        })

        useSearch.mockImplementation(() => [mockSearchState, mockSetValues]);
        useNavigate.mockReturnValue(mockNavigate);
    });

    it("renders the search input and button", () => {
        render(<SearchInput />);

        expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });

    it("updates search keyword when typing", () => {
        render(<SearchInput />);
        
        const searchInput = screen.getByPlaceholderText("Search");
        // change the search input to have the keyword book 
        fireEvent.change(searchInput, { target: {value: "book" } });

        expect(mockSetValues).toHaveBeenCalledWith({ keyword: "book", results: [] });
    });

    it("submits form and triggers API call and navigation", async () => {
        axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: "Product 1"}]});

        render(<SearchInput />);

        const searchInput = screen.getByPlaceholderText("Search");
        const searchButton = screen.getByRole("button", { name: /search/i });

        fireEvent.change(searchInput, { target: { value: "book" }});

        // wait for react state updates before proceeding
        await waitFor(() => expect(mockSetValues).toHaveBeenCalledWith({ keyword: "book", results: []}));
        fireEvent.click(searchButton);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        expect(mockNavigate).toHaveBeenCalledWith("/search");
    });

    it ("handles search API error gracefully", async () => {
        axios.get.mockRejectedValueOnce(new Error("No Products Could Be Found!"));

        render(<SearchInput />);

        const searchInput = screen.getByPlaceholderText("Search");
        const searchButton = screen.getByRole("button", { name: /search/i });

        fireEvent.change(searchInput, { target: { value: "book" }});

        // wait for react state updates before proceeding
        await waitFor(() => expect(mockSetValues).toHaveBeenCalledWith({ keyword: "book", results: []}));
        fireEvent.click(searchButton);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());
        expect(mockNavigate).not.toHaveBeenCalled();

    })

    it("handles blank search input", async () => {

        render(<SearchInput />);

        const searchButton = screen.getByRole("button", { name: /search/i });
        fireEvent.click(searchButton);

        expect(mockNavigate).not.toHaveBeenCalled();
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Please enter at least one character.", {"duration": 800}))

    })
});