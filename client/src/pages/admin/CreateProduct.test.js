import React from "react";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateProduct from "./CreateProduct";

jest.mock("axios");

jest.mock("./../../components/Layout", () => ({ children }) => {
  return (
    <>
      <h1>Mock Layout</h1>
      {children}
    </>
  );
});
jest.mock("./../../components/AdminMenu", () => () => {
  return <>Mock Admin Menu</>;
});

describe("Create Product Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockCategories = [
    { _id: 1, name: "cat_1" },
    { _id: 2, name: "cat_2" },
    { _id: 3, name: "cat_3" },
    { _id: 4, name: "cat_4" },
  ];
  it("Renders the create product page sucessfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: mockCategories },
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <Routes>
          <Route
            path="/dashboard/admin/create-product"
            element={<CreateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      expect(screen.getByText("Upload Photo")).toBeInTheDocument();
      expect(screen.getByText("Select Shipping")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("write a quantity")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("write a description")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
      expect(screen.getByText("Select a category")).toBeInTheDocument();
      expect(screen.getByText("Mock Layout")).toBeInTheDocument();
      expect(screen.getByText("Mock Admin Menu")).toBeInTheDocument();
      expect(screen.getByText("CREATE PRODUCT")).toBeInTheDocument();
    });
  });
});
