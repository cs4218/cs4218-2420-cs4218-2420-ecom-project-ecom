import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import CategoryForm from "./CategoryForm";
describe('CategoryForm Component', () => {
    let handleSubmit;
    let value;
    let setValue;   

    beforeEach(() => {
        handleSubmit = jest.fn();
        value = "";
        setValue = jest.fn();        
    });

    it('renders component form', () => {
        const { getByRole, getByPlaceholderText } = render(
          <CategoryForm handleSubmit={handleSubmit} value={value} setValue={setValue}></CategoryForm>
        );
    
        expect(getByRole("button", { name: /submit/i })).toBeInTheDocument();
        expect(getByPlaceholderText('Enter new category')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter new category').value).toBe("");
      });

      it('Update input value on change', async () => {
        const setValue = jest.fn((newValue) => value = newValue);
        const {getByPlaceholderText } = render(
          <CategoryForm handleSubmit={handleSubmit} value={value} setValue={setValue}></CategoryForm>
        );
        fireEvent.change(getByPlaceholderText('Enter new category'), { target: { value: 'Stationery' } });

        await waitFor(() => {
            expect(value).toBe("Stationery");
        });
      });

      it('HandleSubmit function is called when submit is pressed', async () => {
        const handleSubmit = jest.fn(e => e.preventDefault());
        const {getByText, getByPlaceholderText } = render(
          <CategoryForm handleSubmit={handleSubmit} value={value} setValue={setValue}></CategoryForm>
        );
        fireEvent.change(getByPlaceholderText("Enter new category"), { target: { value: "Stationery" } });
        await waitFor(() => fireEvent.click(getByText("Submit")));
        expect(handleSubmit).toHaveBeenCalled();
      });
});