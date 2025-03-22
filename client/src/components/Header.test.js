import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Header from "./Header";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import SearchInput from "./Form/SearchInput";
import toast from "react-hot-toast";

jest.mock("../context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("../hooks/useCategory", () => jest.fn());
jest.mock("./Form/SearchInput", () => jest.fn());
jest.mock("react-hot-toast", () => ({ success: jest.fn() }));

describe("Header Nav Links", () => {
  beforeEach(() => {
    useAuth.mockReturnValue([{ user: null }, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);
    useCategory.mockReturnValue([]);
    SearchInput.mockReturnValue(<input />);
  });

  it("Should render the main nav links", () => {
    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    expect(screen.getByText(/Virtual Vault/)).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  it("Should render the SearchInput component", () => {
    // Setup
    SearchInput.mockImplementation(() => <input data-testid="search-input-test" />);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    expect(screen.getByTestId("search-input-test")).toBeInTheDocument();
  });

  it("Should render no categories if empty", () => {
    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    const categoryLinks = screen.getAllByRole("link").filter(link => link.getAttribute("href").includes("/category"));
    expect(categoryLinks).toHaveLength(0);
  })

  it("Should render 1 category if provided", () => {
    // Setup
    useCategory.mockReturnValue([{ slug: "test-category", name: "Test Category" }]);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    const categoryLinks = screen.getAllByRole("link").filter(link => link.getAttribute("href").includes("/category"));
    expect(categoryLinks).toHaveLength(1);
    expect(screen.getByText("Test Category")).toBeInTheDocument();
  });

  it("Should render 2 categories if provided", () => {
    // Setup
    useCategory.mockReturnValue([
      { slug: "test-category", name: "Test Category" },
      { slug: "test-category-2", name: "Test Category 2" }
    ]);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    const categoryLinks = screen.getAllByRole("link").filter(link => link.getAttribute("href").includes("/category"));
    expect(categoryLinks).toHaveLength(2);
    expect(screen.getByText("Test Category")).toBeInTheDocument();
    expect(screen.getByText("Test Category 2")).toBeInTheDocument();
  });

  it("Should href to /dashboard/admin if user is admin", () => {
    // Setup
    useAuth.mockReturnValue([{ user: { role: 1 } }, jest.fn()]);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    const dashboardLink = screen.getAllByRole("link").filter(link => link.getAttribute("href").includes("/dashboard/admin"));
    expect(dashboardLink).toHaveLength(1);
  });

  it("Should href to /dashboard/user if user is not admin", () => {
    // Setup
    useAuth.mockReturnValue([{ user: { role: 0 } }, jest.fn()]);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    const dashboardLink = screen.getAllByRole("link").filter(link => link.getAttribute("href").includes("/dashboard/user"));
    expect(dashboardLink).toHaveLength(1);
  });

  it("Should href to /dashboard/user if role is not provided", () => {
    // Setup
    useAuth.mockReturnValue([{ user: {} }, jest.fn()]);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    const dashboardLink = screen.getAllByRole("link").filter(link => link.getAttribute("href").includes("/dashboard/user"));
    expect(dashboardLink).toHaveLength(1);
  });

  it("Should not href to /dashboard/user if no user", () => {
    // Setup
    useAuth.mockReturnValue([{ user: null }, jest.fn()]);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    const dashboardLink = screen.getAllByRole("link").filter(link => link.getAttribute("href").includes("/dashboard/user"));
    expect(dashboardLink).toHaveLength(0);
  });
});

describe("Header Auth Links", () => {
  it("Should render the register and login links if no user", () => {
    // Setup
    useAuth.mockReturnValue([{}, jest.fn()]);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("Should render the user name and logout link if user", () => {
    // Setup
    useAuth.mockReturnValue([{ user: { name: "Test User" } }, jest.fn()]);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("Should logout when logout link is clicked", () => {
    // Setup
    const logout = jest.fn();
    useAuth.mockReturnValue([{ user: { name: "Test User" } }, logout]);
    const mockSuccess = jest.fn();
    toast.success.mockImplementation(mockSuccess);

    // Test
    render(<MemoryRouter><Header/></MemoryRouter>);
    act(() => screen.getByText("Logout").click());
    expect(logout).toHaveBeenCalled();
    expect(mockSuccess).toHaveBeenCalledWith("Logout Successful");
  });
});