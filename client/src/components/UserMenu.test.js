import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import UserMenu from "./UserMenu";

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	NavLink: ({ children }) => <div>{children}</div>,
}));

describe("UserMenu Component", () => {
	it("Should render the UserMenu component", () => {
		render(<UserMenu />);
		expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
		expect(screen.getByText(/Profile/i)).toBeInTheDocument();
		expect(screen.getByText(/Orders/i)).toBeInTheDocument();
	});
});