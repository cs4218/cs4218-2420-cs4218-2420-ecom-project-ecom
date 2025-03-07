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
import CreateProduct from "./CreateProduct";
import { act } from "react-dom/test-utils";

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

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Code adapted from https://stackoverflow.com/questions/62833456/how-to-test-ant-design-select-and-option-properly-using-jest
jest.mock("antd", () => {
  const antd = jest.requireActual("antd");

  const Select = ({ children, onChange, placeholder }) => {
    return (
      <select
        data-testid={placeholder}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    );
  };

  const Option = ({ children, ...props }) => {
    return <option {...props}>{children}</option>;
  };

  Select.Option = Option;

  return {
    ...antd,
    Select,
  };
});

describe("CreateProduct Component", () => {
  let setCategorySpy;
  let setShippingSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    setCategorySpy = jest.spyOn(React, "useState");
    setShippingSpy = jest.spyOn(React, "useState");
  });

  // Code adapted from https://chatgpt.com/share/67c1abc0-16cc-8013-a538-111a09aae3c4
  test("should create a product successfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
    });

    axios.post.mockResolvedValueOnce({
      data: { success: true, message: "Product Created Successfully" },
    });

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    const dropdowns = await waitFor(() => screen.getAllByRole("combobox"));

    const categoryDropdown = dropdowns[0];
    fireEvent.mouseDown(categoryDropdown);

    fireEvent.change(categoryDropdown, { target: { value: "1" } });

    const categoryOption = await waitFor(() => screen.getByText("Electronics"));
    fireEvent.click(categoryOption);

    await waitFor(() =>
      expect(screen.getByText("Electronics")).toBeInTheDocument()
    );

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a Price"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });

    const shippingDropdown = dropdowns[1];
    fireEvent.mouseDown(shippingDropdown);
    fireEvent.change(shippingDropdown, { target: { value: "Yes" } });

    const shippingOption = await waitFor(() => screen.findByText("Yes"));
    fireEvent.click(shippingOption);

    const createButton = screen.getByRole("button", {
      name: /create product/i,
    });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      );
    });

    expect(axios.post).toHaveBeenCalledTimes(1);

    expect(setCategorySpy).toHaveBeenCalled();
    expect(setShippingSpy).toHaveBeenCalled();
  });

  test("should display error message if fail to fetch categories", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something wwent wrong in getting catgeory"
      )
    );
  });

  test("should handle unexpected API error and show generic error message", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
    });

    axios.put.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    const dropdowns = await waitFor(() => screen.getAllByRole("combobox"));

    const categoryDropdown = dropdowns[0];
    fireEvent.mouseDown(categoryDropdown);
    fireEvent.change(categoryDropdown, { target: { value: "1" } });

    const categoryOption = await waitFor(() => screen.getByText("Electronics"));
    fireEvent.click(categoryOption);

    await waitFor(() =>
      expect(screen.getByText("Electronics")).toBeInTheDocument()
    );

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a Price"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });

    const shippingDropdown = dropdowns[1];
    fireEvent.mouseDown(shippingDropdown);
    fireEvent.change(shippingDropdown, { target: { value: "Yes" } });

    const shippingOption = await waitFor(() => screen.getByText("Yes"));
    fireEvent.click(shippingOption);

    const createButton = screen.getByRole("button", {
      name: /create product/i,
    });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      );
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("something went wrong");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("should show an error if product creation fails with success false", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
    });

    axios.post.mockResolvedValueOnce({
      data: { success: false, message: "Product creation failed" },
    });

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    const dropdowns = await waitFor(() => screen.getAllByRole("combobox"));

    const categoryDropdown = dropdowns[0];
    fireEvent.mouseDown(categoryDropdown);
    fireEvent.change(categoryDropdown, { target: { value: "1" } });

    const categoryOption = await waitFor(() => screen.getByText("Electronics"));
    fireEvent.click(categoryOption);

    await waitFor(() =>
      expect(screen.getByText("Electronics")).toBeInTheDocument()
    );

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a description"), {
      target: { value: "This is a test product" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a Price"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });

    const shippingDropdown = dropdowns[1];
    fireEvent.mouseDown(shippingDropdown);
    fireEvent.change(shippingDropdown, { target: { value: "Yes" } });

    const shippingOption = await waitFor(() => screen.getByText("Yes"));
    fireEvent.click(shippingOption);

    const createButton = screen.getByRole("button", {
      name: /create product/i,
    });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      );
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Product creation failed");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Code adapted from https://chatgpt.com/share/67c1abc0-16cc-8013-a538-111a09aae3c4
  test("should update photo preview on file selection", async () => {
    global.URL.createObjectURL = jest.fn(() => "mocked-image-url");

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    const file = new File(["dummy content"], "test-image.jpg", {
      type: "image/jpeg",
    });

    const fileInput = screen.getByLabelText("Upload Photo");

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText("product_photo")).toBeInTheDocument();
      expect(screen.getByAltText("product_photo")).toHaveAttribute(
        "src",
        "mocked-image-url"
      );
    });
  });
});
