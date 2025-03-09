import React from "react";
import { render} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Dashboard from "./Dashboard.js";
import { useAuth } from "../../context/auth";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => [{ _id: "1", name: "pen", slug: "pen", __v: 0 }]));

describe("Dashboard Component", () => {
    let setAuthMock;

    beforeEach(() => {
      setAuthMock = jest.fn();
      useAuth.mockReturnValue([{ 
        user: {
            name: "testing user",
            email: "testinguser@gmail.com",
            address: "1 Computing Drive"

      } }, setAuthMock]);
    });
  it("renders Dashboard", async () => {

    const {getByText, queryAllByText } = render(
      <MemoryRouter initialEntries={["/user"]}>
        <Routes>
          <Route path="/user" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );    
  
    expect(queryAllByText(/testing user/i).length).toBeGreaterThan(0);
    expect(getByText(/testinguser@gmail.com/i)).toBeInTheDocument();
    expect(getByText(/1 Computing Drive/i)).toBeInTheDocument();
})

it("No renders Dashboard if no user", async () => {
    useAuth.mockReturnValue([null, setAuthMock]);
    
    const {queryByText, queryAllByText } = render(
      <MemoryRouter initialEntries={["/user"]}>
        <Routes>
          <Route path="/user" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );    
  
    expect(queryAllByText(/testing user/i).length).toBe(0);
    expect(queryByText(/testinguser@gmail.com/i)).not.toBeInTheDocument();
    expect(queryByText(/1 Computing Drive/i)).not.toBeInTheDocument();
});
});

