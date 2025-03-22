import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, waitFor } from "@testing-library/react";
import Users from "../../pages/admin/Users";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

jest.mock("../../components/Layout", () => ({ children }) => <div>{ children }</div>);
jest.mock("../../components/AdminMenu", () => () => <div>Mock Admin Menu</div>);
jest.mock("axios");

describe("Users Component", () => {
    test("Renders the Users page", async () => {
        const mockUsers = [
            { _id: "1", name: "User Test 1", email: "usertest1@email.com"},
            { _id: "2", name: "User Test 2", email: "usertest2@email.com"}
        ]
        axios.get.mockReturnValue({ data : mockUsers });

        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        expect(screen.getByText("All Users")).toBeInTheDocument();
        expect(screen.getByText("Mock Admin Menu")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText("User Test 1")).toBeInTheDocument();
            expect(screen.getByText("User Test 2")).toBeInTheDocument();
            expect(screen.getByText("usertest1@email.com")).toBeInTheDocument();
            expect(screen.getByText("usertest2@email.com")).toBeInTheDocument();
        })
    });

    test("handles API errors", async () => {
        axios.get.mockRejectedValue(new Error("Mock API Error"));
        jest.spyOn(console, "error").mockImplementation(() => {}); 
        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );
    
        await waitFor(() => {
            expect(console.error).toHaveBeenCalled();
        });
    });
})
