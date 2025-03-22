import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile"; 
import { AuthContext } from "../../context/auth"; 
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");
jest.mock("react-hot-toast");

const mockAuth = {
    user: {
        email: "john@example.com", 
        name: "John Doe", 
        phone: "90123456", 
        address: "Test address"
    },
};
const mockSetAuth = jest.fn();

// Profile -> Layout (and some other components too) uses useAuth 
jest.mock("../../context/auth", () => ({
    ...jest.requireActual("../../context/auth"),
    useAuth: jest.fn(() => [mockAuth, mockSetAuth]), // Mock useAuth hook to return null state and a mock function for setAuth
  }));
  
  // Profile -> Layout -> Header use useCart
  jest.mock("../../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
  }));

  // Profile -> Layout -> Header -> SearchInput use useSearch  
  jest.mock("../../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
  }));
  
  // Profile -> Layout -> Header use useCategory
  jest.mock("../../hooks/useCategory", () => jest.fn(() => []));
  
  describe("Profile Component", () => {
    

    beforeEach(() => {
        // return the above mockAuth created
        jest.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify({ user: mockAuth.user }));
        // mock setItem do nothing so as to not actually change stored item
        jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
      });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test 1 for "Frontend Profile Page Unit Test"
    test("Profile page should render with correct initial values", () => {
        render(
            // use the mocked auth and setAuth instead of actual auth, setAuth from auth.js
            <MemoryRouter>
                <AuthContext.Provider value={[mockAuth, mockSetAuth]}>
                <Profile />
                </AuthContext.Provider>
            </MemoryRouter>
          );
          expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue(mockAuth.user.name);
          expect(screen.getByPlaceholderText("Enter Your Email")).toHaveValue(mockAuth.user.email);
          expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveValue(mockAuth.user.phone);
          expect(screen.getByPlaceholderText("Enter Your Address")).toHaveValue(mockAuth.user.address);
    });

    // Test 2 for "Frontend Profile Page Unit Test"
    test("API called and auth state updated on form submit", async () => {
        const updatedUser = {
            email: "jane@example.com", 
            name: "Jane Doe", 
            phone: "98765432", 
            address: "Modified test address"
        }
        axios.put.mockResolvedValueOnce({ data: { updatedUser: updatedUser } });

        render(
            <MemoryRouter>
                <AuthContext.Provider value={[mockAuth, mockSetAuth]}>
                <Profile />
                </AuthContext.Provider>
            </MemoryRouter>
          );

        // email is disabled to be updated
        fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: updatedUser.name } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { target: { value: updatedUser.phone } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { target: { value: updatedUser.address } });
    
        // update with new details
        fireEvent.click(screen.getByText("UPDATE"));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalled();
            expect(mockSetAuth).toHaveBeenCalledWith(expect.objectContaining({ user: updatedUser }));
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
          });
    });

    // Test 3 for "Frontend Profile Page Unit Test"
    test("API failure show error message from toast", async () => {
      jest.spyOn(console, "log").mockImplementation(() => {}); 
      axios.put.mockRejectedValueOnce(new Error("Mock API error"));

      render(
        <MemoryRouter>
            <AuthContext.Provider value={[mockAuth, mockSetAuth]}>
            <Profile />
            </AuthContext.Provider>
        </MemoryRouter>
      );

      fireEvent.click(screen.getByText("UPDATE"));
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(expect.any(Error));
        expect(console.log).toHaveBeenCalledWith(expect.objectContaining({ message : "Mock API error"}));
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      });
    })

    // Test 4 for "Frontend Profile Page Unit Test"
    test("API success has data with error stored", async () => {
      axios.put.mockResolvedValueOnce({ data : { error : "Mock error in data, to be printed by toast"}});
      render(
        <MemoryRouter>
            <AuthContext.Provider value={[mockAuth, mockSetAuth]}>
            <Profile />
            </AuthContext.Provider>
        </MemoryRouter>
      );
      fireEvent.click(screen.getByText("UPDATE"));
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Mock error in data, to be printed by toast");
      });
    })
}
  )