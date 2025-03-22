import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Orders from "./Orders";
import { useAuth } from "../../context/auth";
import axios from "axios";

jest.mock("axios");
jest.mock("../../components/Layout", () => ({ children }) => <div data-testid="layout">{children}</div>);
jest.mock("../../context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("../../components/UserMenu", () => () => <div data-testid="user-menu" />);

describe("Orders Component", () => {
	beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{}, jest.fn()]);
  });
			
	it("Should render the Orders component text", async () => {
		await act(async () => render(<Orders />));
		expect(screen.getByText(/All Orders/i)).toBeInTheDocument();
		expect(screen.getByTestId("layout")).toBeInTheDocument();
		expect(screen.getByTestId("user-menu")).toBeInTheDocument();
	});

	it("Should show no Orders when user is not authenticated", async () => {
		await act(async () => render(<Orders />));

		// No table
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.queryByText(/Status/i)).not.toBeInTheDocument();
	});

	it("Should show no Orders when there's no orders", async () => {
		useAuth.mockReturnValue([{ token: "123" }, jest.fn()]);
		axios.get.mockResolvedValue({ data: [] });
		await act(async () => render(<Orders />));

		// No table
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.queryByText(/Status/i)).not.toBeInTheDocument();
	});

	it("Should show Orders when there are orders", async () => {
		useAuth.mockReturnValue([{ token: "authToken" }, jest.fn()]);
		axios.get.mockResolvedValue({ data: [{
			status: "Delivered",
			buyer: { name: "Neale" },
			createAt: "2022-02-14",
			payment: { success: true },
			products: [{
				_id: "4218",
				name: "Paper",
				description: "A4 Paper",
				price: 4.2
			}] }]
		});
		await act(async () => render(<Orders />));

		// Table
		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByText(/Status/i)).toBeInTheDocument();
		expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
		expect(screen.getByText(/Neale/i)).toBeInTheDocument();
		expect(screen.getByText(/3 years/i)).toBeInTheDocument();
		expect(screen.getByText(/Success/i)).toBeInTheDocument();
		expect(screen.getByText(/4\.2/i)).toBeInTheDocument();
		expect(screen.queryByText(/Failed/i)).not.toBeInTheDocument();
	});

	it("Should show Orders when there are multiple orders", async () => {
		useAuth.mockReturnValue([{ token: "authToken" }, jest.fn()]);
		axios.get.mockResolvedValue({ data: [{
			status: "Delivered",
			buyer: { name: "Neale" },
			createAt: "2022-02-14",
			payment: { success: true },
			products: [{
				_id: "4218",
				name: "Paper",
				description: "A4 Paper",
				price: 4.2
			}]
		}, {
			status: "Processing",
			buyer: { name: "Tham" },
			createAt: "2023-02-14",
			payment: { success: false },
			products: [{
				_id: "4218",
				name: "Pencil",
				description: "2B Pencil",
				price: 0.4
			}]
		}] });
		await act(async () => render(<Orders />));

		// Table
		expect(screen.getAllByRole("table")).toHaveLength(2);
		expect(screen.getAllByText(/Status/i)).toHaveLength(2);
		expect(screen.getAllByText(/Success/i)).toHaveLength(1);
		expect(screen.getAllByText(/Failed/i)).toHaveLength(1);
		expect(screen.getAllByText(/Processing/i)).toHaveLength(1);
		expect(screen.getAllByText(/Delivered/i)).toHaveLength(1);
		expect(screen.getAllByText(/Neale/i)).toHaveLength(1);
		expect(screen.getAllByText(/Tham/i)).toHaveLength(1);
		expect(screen.getAllByText(/3 years/i)).toHaveLength(1);
		expect(screen.getAllByText(/2 years/i)).toHaveLength(1);
	});

	it("Should show Orders when there are multiple products", async () => {
		useAuth.mockReturnValue([{ token: "authToken" }, jest.fn()]);
		axios.get.mockResolvedValue({ data: [{
			status: "Delivered",
			buyer: { name: "Neale" },
			createAt: "2022-02-14",
			payment: { success: true },
			products: [{
				_id: "4218",
				name: "Paper",
				description: "A4 Paper",
				price: 4.2
			}, {
				_id: "4219",
				name: "Pencil",
				description: "2B Pencil",
				price: 0.4
			}]
		}] });
		await act(async () => render(<Orders />));

		// Table
		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByText(/Status/i)).toBeInTheDocument();
		expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
		expect(screen.getByText(/Neale/i)).toBeInTheDocument();
		expect(screen.getByText(/3 years/i)).toBeInTheDocument();
		expect(screen.getByText(/Success/i)).toBeInTheDocument();
		expect(screen.getByText(/4\.2/i)).toBeInTheDocument();
		expect(screen.getByText(/0\.4/i)).toBeInTheDocument();
		expect(screen.queryByText(/Failed/i)).not.toBeInTheDocument();
	});

	it("Should show Orders when there are no products", async () => {
		useAuth.mockReturnValue([{ token: "authToken" }, jest.fn()]);
		axios.get.mockResolvedValue({ data: [{
			status: "Delivered",
			buyer: { name: "Neale" },
			createAt: "2022-02-14",
			payment: { success: true },
			products: []
		}] });
		await act(async () => render(<Orders />));

		// Table
		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByText(/Status/i)).toBeInTheDocument();
		expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
		expect(screen.getByText(/Neale/i)).toBeInTheDocument();
		expect(screen.getByText(/3 years/i)).toBeInTheDocument();
		expect(screen.getByText(/Success/i)).toBeInTheDocument();
		expect(screen.queryByText(/Failed/i)).not.toBeInTheDocument();
	});

	it("Should show Orders when products field is missing", async () => {
		useAuth.mockReturnValue([{ token: "authToken" }, jest.fn()]);
		axios.get.mockResolvedValue({ data: [{
			status: "Delivered",
			buyer: { name: "Neale" },
			createAt: "2022-02-14",
			payment: { success: true }
		}] });
		await act(async () => render(<Orders />));

		// Table
		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByText(/Status/i)).toBeInTheDocument();
		expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
		expect(screen.getByText(/Neale/i)).toBeInTheDocument();
		expect(screen.getByText(/3 years/i)).toBeInTheDocument();
		expect(screen.getByText(/Success/i)).toBeInTheDocument();
		expect(screen.queryByText(/Failed/i)).not.toBeInTheDocument();
	});

	it("Should throw Error when axios.get fails", async () => {
		// Setup
		const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
		useAuth.mockReturnValue([{ token: "authToken" }, jest.fn()]);

		// Test
		axios.get.mockRejectedValue(new Error("Axios Error"));
		await act(async () => render(<Orders />));
		expect(consoleSpy).toHaveBeenCalledWith(new Error("Axios Error"));

		// Cleanup
		consoleSpy.mockRestore();
	});
});