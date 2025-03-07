import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  within,
} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateCategory from "./CreateCategory";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

describe("CreateCategory Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show error toast if API response returns data success false", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: false, message: "Category already exists" },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
      target: { value: "Gaming" },
    });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast.error).toHaveBeenCalledWith("Category already exists");
  });

  // Code adapted from https://chatgpt.com/share/67bebe86-7d2c-8013-8f61-36f8cd5f09ef
  it("should display error message if update API returns success false", async () => {
    const category = { _id: "1", name: "Gaming" };

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [category] },
    });

    axios.put.mockResolvedValueOnce({
      data: { success: false, message: "Update failed" },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    const modal = screen.getByRole("dialog");
    const modalInput = within(modal).getByPlaceholderText("Enter new category");
    expect(modalInput).toBeInTheDocument();

    fireEvent.change(modalInput, { target: { value: "Gaming New" } });

    const submitButtons = screen.getAllByRole("button", { name: "Submit" });
    fireEvent.click(submitButtons[1]);

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast.error).toHaveBeenCalledWith("Update failed");
  });

  it("should render the component correctly", () => {
    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    expect(screen.getByText("Manage Category")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should successfully create a new category", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
      target: { value: "Gaming" },
    });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Gaming is created");
  });

  // Code adapted from https://chatgpt.com/share/67bebe86-7d2c-8013-8f61-36f8cd5f09ef
  it("should display error message if failure to create a category", async () => {
    axios.post.mockRejectedValueOnce({ message: "Failed to create category" });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
      target: { value: "Gaming" },
    });

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith(
      "somthing went wrong in input form"
    );
  });

  it("should successfully update a category", async () => {
    const category = { _id: "1", name: "Gaming" };

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [category] },
    });

    axios.put.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    // Code adapted from https://chatgpt.com/share/67bebe86-7d2c-8013-8f61-36f8cd5f09ef
    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    fireEvent.click(editButtons[0]);

    const inputs = screen.getAllByPlaceholderText("Enter new category");
    fireEvent.change(inputs[1], { target: { value: "Gaming New" } });

    const newCategoryName = "Gaming New";

    const submitButtons = screen.getAllByRole("button", { name: "Submit" });
    fireEvent.click(submitButtons[1]);

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        `${newCategoryName} is updated`
      );
    });
  });

  // Code adapted from https://chatgpt.com/share/67bebe86-7d2c-8013-8f61-36f8cd5f09ef
  it("should display error message if delete API returns success false", async () => {
    const category = { _id: "1", name: "Gaming" };

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [category] },
    });

    axios.delete.mockResolvedValueOnce({
      data: { success: false, message: "Delete failed" },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast.error).toHaveBeenCalledWith("Delete failed");
  });

  it("should display error message if failure to update a category", async () => {
    const category = { _id: "123", name: "Gaming" };

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [category] },
    });

    axios.put.mockRejectedValueOnce({ message: "Failed to update category" });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    const inputs = screen.getAllByPlaceholderText("Enter new category");
    fireEvent.change(inputs[1], { target: { value: "Gaming New" } });

    const submitButton = screen.getAllByRole("button", { name: "Submit" });
    fireEvent.click(submitButton[1]);

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith(
      "Somtihing went wrong"
    );
  });

  it("should successfully delete a category", async () => {
    const category = { _id: "123", name: "Gaming" };

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [category] },
    });

    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("category is deleted");
  });

  // Code adapted from https://chatgpt.com/share/67bebe86-7d2c-8013-8f61-36f8cd5f09ef
  it("should close the edit modal when onCancel is triggered", async () => {
    const category = { _id: "123", name: "Gaming" };

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [category] },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    const modal = screen.getByRole("dialog");
    const modalInput = within(modal).getByPlaceholderText("Enter new category");

    expect(modalInput).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close"));

    await waitFor(() => expect(modal).toHaveStyle("display: none"));
  });

  it("should display error message if delete API throws an error", async () => {
    const category = { _id: "1", name: "Gaming" };

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [category] },
    });

    axios.delete.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
  });

  // Code adapted from https://chatgpt.com/share/67bebe86-7d2c-8013-8f61-36f8cd5f09ef
  it("should display error message if update API throws an error", async () => {
    const category = { _id: "1", name: "Gaming" };

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [category] },
    });

    axios.delete.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    const inputs = screen.getAllByPlaceholderText("Enter new category");
    fireEvent.change(inputs[1], { target: { value: "Gaming New" } });

    const submitButtons = screen.getAllByRole("button", { name: "Submit" });
    fireEvent.click(submitButtons[1]);

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
  });

  it("should update categories state when API returns data successfully", async () => {
    const mockCategories = [
      { _id: "1", name: "Gaming" },
      { _id: "2", name: "Electronics" },
    ];

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: mockCategories },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
  });
});