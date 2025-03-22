import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, fireEvent } from "@testing-library/react";
import Pagenotfound from "./Pagenotfound";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");
jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
  }));
  
  jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
  }));
  
  jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
  }));
  
  jest.mock("../hooks/useCategory", () => jest.fn(() => []));

describe("Test Render of Pagenotfound", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Render Pagenotfound main text", () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={["/Pagenotfound"]}>
              <Routes>
                <Route path="/Pagenotfound" element={<Pagenotfound />} />
              </Routes>
            </MemoryRouter>
          );
      
          expect(getByText("404")).toBeInTheDocument();
          expect(getByText("Oops ! Page Not Found")).toBeInTheDocument();
    });
    
    test("Render Pagenotfound button", () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={["/Pagenotfound"]}>
              <Routes>
                <Route path="/Pagenotfound" element={<Pagenotfound />} />
              </Routes>
            </MemoryRouter>
          );
      
          expect(getByText("Go Back")).toBeInTheDocument();
          expect(getByText("Go Back")).toHaveAttribute("href", "/");
    });
})