import React from "react";
import { render, screen } from "@testing-library/react";
import PrivateRoute from "./Private";
import "@testing-library/jest-dom/extend-expect";
import { useAuth } from "../../context/auth";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";
// Mock the useAuth context
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));

// Mock axios
jest.mock("axios");

// Mock the Spinner component
jest.mock('../Spinner', () => () => <div>Loading...</div>);

describe("PrivateRoute", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders the Outlet when user is authenticated", async () => {
        // Mock the useAuth to return a token
        useAuth.mockReturnValue([{ token: "test-token", user: { name: "Dan Ling" } }]);

        // Mock the API response for authenticated user
        axios.get.mockResolvedValueOnce({ data: { ok: true } });

        render(
            <MemoryRouter>
                <Routes>
                    <Route path="/" element={<PrivateRoute />}>
                        <Route path="/" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        // Check that the protected content is displayed
        expect(await screen.findByText("Protected Content")).toBeInTheDocument();
    });

    test("renders Spinner when user is not authenticated", async () => {
        // Mock the useAuth to return no token
        useAuth.mockReturnValue([{}]);

        // Mock the API response for unauthenticated user
        axios.get.mockResolvedValueOnce({ data: { ok: false } });

        render(
            <MemoryRouter>
                <Routes>
                    <Route path="/" element={<PrivateRoute />}>
                        <Route path="/" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        // Check that the Spinner is displayed
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});
