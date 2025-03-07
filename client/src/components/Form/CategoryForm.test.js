import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryForm from "./CategoryForm.js";
import "@testing-library/jest-dom/extend-expect";

// Code adapted from https://chatgpt.com/share/67c85e2a-9880-8013-86a4-5dcad6bd2ab6
describe("CategoryForm Component", () => {
  let handleSubmit, setValue, value;

  beforeEach(() => {
    handleSubmit = jest.fn();
    setValue = jest.fn();
    value = "Electronics";
  });

  test("renders input field and submit button", () => {
    render(
      <CategoryForm
        handleSubmit={handleSubmit}
        value={value}
        setValue={setValue}
      />
    );

    const inputElement = screen.getByPlaceholderText("Enter new category");
    expect(inputElement).toBeInTheDocument();
    expect(inputElement.value).toBe("Electronics");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  test("updates input value on change", () => {
    render(
      <CategoryForm
        handleSubmit={handleSubmit}
        value={value}
        setValue={setValue}
      />
    );

    const inputElement = screen.getByPlaceholderText("Enter new category");

    fireEvent.change(inputElement, { target: { value: "Books" } });

    expect(setValue).toHaveBeenCalledWith("Books");
  });

  test("calls handleSubmit when form is submitted", () => {
    render(
      <CategoryForm
        handleSubmit={handleSubmit}
        value={value}
        setValue={setValue}
      />
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
