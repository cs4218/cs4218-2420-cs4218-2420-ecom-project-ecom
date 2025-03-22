import React from "react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import { render, screen, waitFor, fireEvent} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";
import userEvent from '@testing-library/user-event';

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../components/AdminMenu", () => jest.fn(() => <div>Mock Admin menu</div>));
jest.mock("../../components/Layout", () => jest.fn(({ children }) => <div>{ children }</div>));
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), 
}));
beforeEach(() => {
    jest.clearAllMocks();
})

describe("AdminOrders ", () => {
    test("get orders upon valid auth token and successful api", async () => {
        useAuth.mockReturnValue([{token : 1}, jest.fn()])
        axios.get.mockResolvedValueOnce({ data : {} });
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        })
    });

    test("get orders upon valid auth token but api fails", async () => {
        useAuth.mockReturnValue([{token : 1}, jest.fn()])
        axios.get.mockRejectedValueOnce({ message: "Mock API failure to get all orders"});
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );
        const spy = jest.spyOn(console, 'log');
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
        })
    });

    test("not get orders upon invalid auth token", async () => {
        useAuth.mockReturnValue([{}, jest.fn()])
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(axios.get).not.toHaveBeenCalled();
        })
    });

    test("renders orders correctly", async () => {
        useAuth.mockReturnValue([{token : 1}, jest.fn()]);
        axios.get.mockResolvedValueOnce({
            data : [
                {
                    _id: "order1",
                    status: "Processing",
                    buyer: { name: "John Doe" },
                    createAt: "2023-12-01T10:00:00Z",
                    payment: { success: true },
                    products: [
                        { _id: "product1", name: "Laptop", description: "Powerful laptop", price: 1000 }
                    ]
                }
            ]
        });
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );
        await waitFor(() => {
            // omitted testing of createAt field as output is based on time of testing

            expect(screen.getByText("All Orders")).toBeInTheDocument();
            expect(screen.getByText("Processing")).toBeInTheDocument();
            
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("Success")).toBeInTheDocument();

            expect(screen.getByText("Laptop")).toBeInTheDocument();
            expect(screen.getByText("Powerful laptop")).toBeInTheDocument();
            expect(screen.getByText("Price : 1000")).toBeInTheDocument();
        })
    });

    // ideally test for order status to update but I am
    // unable to test Ant Select component with Jest
    
    // test("updates order status when changed", async () => {
    // })
})