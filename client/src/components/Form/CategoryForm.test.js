import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CategoryForm from "./CategoryForm";

describe("Test CategoryForm Component", () => {
  test("calls submit handler when submit button clicked", () => {
    const mockSubmit = jest.fn();
    const mockSetValue = jest.fn();
    const mockValue = "Mock Value";
    render(
      <CategoryForm
        handleSubmit={mockSubmit}
        value={mockValue}
        setValue={mockSetValue}
      />
    );
    const input = screen.getByPlaceholderText("Enter new category");
    const submitButton = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "New Category" } });
    fireEvent.submit(submitButton);
    waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith("New Category");
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
