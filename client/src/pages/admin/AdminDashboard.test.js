import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

jest.mock("../../components/AdminMenu", () => jest.fn(() => <div>Mock Admin Menu</div>));
jest.mock("./../../components/Layout", () => jest.fn(({ children }) => <div>{ children }</div>));
const mockAuth = { user : {
    name : "John Doe",
    email : "mockemail@email.com",
    phone : "90123456"
}}
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [mockAuth, jest.fn()])
}));


describe("Admin Dashboard Components", () => {
    test("renders fields correctly", () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        
        expect(screen.getByText("Admin Name : " + mockAuth.user.name)).toBeInTheDocument();
        expect(screen.getByText("Admin Email : " + mockAuth.user.email)).toBeInTheDocument();
        expect(screen.getByText("Admin Contact : " + mockAuth.user.phone)).toBeInTheDocument();
    })

    test("renders other components correctly", () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        
        expect(screen.getByText("Mock Admin Menu")).toBeInTheDocument();
    })
});