import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import CategoryForm from "./CategoryForm";

const mockSubmit = jest.fn();
const mockSetValue = jest.fn();

describe("CategoryForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input field and submit button", () => {
    render(<CategoryForm handleSubmit={mockSubmit} value="" setValue={mockSetValue} />);
    
    const inputElement = screen.getByPlaceholderText("Enter new category");
    const buttonElement = screen.getByRole("button", { name: /submit/i });
    
    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  it("updates input value on change", () => {
    render(<CategoryForm handleSubmit={mockSubmit} value="" setValue={mockSetValue} />);
    
    const inputElement = screen.getByPlaceholderText("Enter new category");
    fireEvent.change(inputElement, { target: { value: "New Category" } });
    
    expect(mockSetValue).toHaveBeenCalledWith("New Category");
  });

  test("calls handleSubmit on form submission", () => {
    render(<CategoryForm handleSubmit={mockSubmit} value="Test" setValue={() => {}} />);
  
    const formElement = screen.getByRole("button", { name: /submit/i });
    fireEvent.submit(formElement);
  
    expect(mockSubmit).toHaveBeenCalled();
  });
  
});
