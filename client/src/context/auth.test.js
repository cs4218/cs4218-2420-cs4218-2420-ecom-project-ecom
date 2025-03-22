import React from "react";
import { useAuth, AuthProvider } from "./auth";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";

jest.mock("axios");

describe("Auth Context", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("AuthProvider", () => {
		it("Should render the provider with children", async () => {
			await act(async () => render(<AuthProvider><div>Test</div></AuthProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
		});

		it("Should retrieve from localStorage", async () => {
			localStorage.setItem("auth", JSON.stringify({
					user: {
						name: "Neale",
						role: "Admin"
					},
					token: "authToken"
				}));
			await act(async () => render(<AuthProvider><div>Test</div></AuthProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
			localStorage.removeItem("auth");
		});
	});

	describe("useAuth", () => {
		it("Should return auth and setAuth", async () => {
			// Setup
			localStorage.setItem("auth", JSON.stringify({
				user: {
					name: "Neale",
					role: "Admin"
				},
				token: "authToken"
			}));
			const TestComponent = () => {
				const [auth, setAuth] = useAuth();
				expect(setAuth).toBeInstanceOf(Function);
				return <div>
					<h1>Test</h1>
					<h2>{auth.user?.name}</h2>
					<h3>{auth.user?.role}</h3>
				</div>;
			};

			// Test
			await act(async () => render(<AuthProvider><TestComponent /></AuthProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
			expect(screen.getByText("Neale")).toBeInTheDocument();
			expect(screen.getByText("Admin")).toBeInTheDocument();

			// Cleanup
			localStorage.removeItem("auth");
		});

		it("Should not render auth.user if not in localStorage", async () => {
			// Setup
			const TestComponent = () => {
				const [auth, setAuth] = useAuth();
				expect(setAuth).toBeInstanceOf(Function);
				return <div>
					<h1>Test</h1>
					<h2>{auth.user?.name}</h2>
					<h3>{auth.user?.role}</h3>
				</div>;
			};

			// Test
			await act(async () => render(<AuthProvider><TestComponent /></AuthProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
			expect(screen.getAllByRole("heading")[1]).toBeEmptyDOMElement();
			expect(screen.getAllByRole("heading")[2]).toBeEmptyDOMElement();
		});

		it("Should log to console if auth is not JSON parsable", async () => {
			// Setup
			localStorage.setItem("auth", "Not JSON");
			const consoleSpy = jest.spyOn(console, "log").mockImplementation();

			// Test
			expect(() => render(<AuthProvider><div>Test</div></AuthProvider>)).not.toThrow();
			expect(consoleSpy).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining("Unexpected token")
    	}));

			// Cleanup
			localStorage.removeItem("auth");
		});

		it("Should log to console if auth is not object", async () => {
			// Setup
			localStorage.setItem("auth", JSON.stringify("Not an object"));
			const consoleSpy = jest.spyOn(console, "log").mockImplementation();

			// Test
			expect(() => render(<AuthProvider><div>Test</div></AuthProvider>)).not.toThrow();
			expect(consoleSpy).toHaveBeenCalledWith(expect.objectContaining({
				message: expect.stringContaining("Auth is not an object")
			}));

			// Cleanup
			localStorage.removeItem("auth");
		});

		it("Should set axios headers", async () => {
			// Setup
			localStorage.setItem("auth", JSON.stringify({
				user: {
					name: "Neale",
					role: "Admin"
				},
				token: "authToken"
			}));
			const TestComponent = () => {
				const [auth, setAuth] = useAuth();
				expect(setAuth).toBeInstanceOf(Function);
				return <div>
					<h1>Test</h1>
					<h2>{auth.user?.name}</h2>
					<h3>{auth.user?.role}</h3>
				</div>;
			};

			// Test
			await act(async () => render(<AuthProvider><TestComponent /></AuthProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
			expect(axios.defaults.headers.common["Authorization"]).toBe("authToken");

			// Cleanup
			localStorage.removeItem("auth");
		});
	});
});