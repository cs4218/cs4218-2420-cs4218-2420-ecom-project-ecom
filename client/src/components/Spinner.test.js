import React from "react";
import { render, screen, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { MemoryRouter } from 'react-router-dom';
import Spinner from "./Spinner";
import '@testing-library/jest-dom';
import { useLocation } from "react-router-dom";

// Mock the navigate function
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe("Spinner Component", () => {
    
    test("should render the countdown and spinner", async () => {
        render(
            <Router>
                <Spinner />
            </Router>
        );
        const countdownText = screen.getByText(/redirecting to you in 3 second/i);
        expect(countdownText).toBeInTheDocument();
        // Check if the spinner is displayed
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
    });

    it("should navigate to the correct path when countdown reaches 0", () => {
        const mockNavigate = jest.fn();
        useLocation.mockReturnValue({
            pathname: '/', // Set the mocked pathname here
        });
        require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);

        jest.useFakeTimers(); // Use fake timers

        render(
        <Router>
            <Spinner path="dashboard" />
        </Router>
        );

        // Simulate countdown reaching 0
        act(() => {
        jest.advanceTimersByTime(3000); // Advance time by 3 seconds (countdown completes)
        });

        // Expect navigate to be called with the correct path
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", expect.objectContaining({ state: "/" }));
    });

    it("should navigate to the default path if no path is provided", () => {
        const mockNavigate = jest.fn();
        useLocation.mockReturnValue({
            pathname: '/', // Set the mocked pathname here
        });
        require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);

        jest.useFakeTimers(); // Use fake timers

        render(
        <Router>
            <Spinner />
        </Router>
        );

        // Simulate countdown reaching 0
        act(() => {
        jest.advanceTimersByTime(3000); // Advance time by 3 seconds (countdown completes)
        });

        // Expect navigate to be called with the default path ("/login")
        expect(mockNavigate).toHaveBeenCalledWith("/login", expect.objectContaining({ state: "/" }));
    });
});
