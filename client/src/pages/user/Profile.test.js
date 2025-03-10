import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Profile from "./Profile";
import { useAuth } from "../../context/auth";


// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

const mockAuthUser = {
  user: {
    email: "Test@test.com",
    name: "Tester Test",
    phone: "+65test",
    address: "Blk Testing"
  }
}

const mockUpdatedUser = {
  name: "newName",
  email: "newEmail",
  password: "newPassword",
  phone: "newPhone",
  address: "newAddress"
}

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [mockAuthUser, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

const profileFields = ["Name", "Email", "Phone", "Address", "Password"];

const mockChangedFields = ["newName", "newEmail", "newPhone", "newAddress", "newPassword"];

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(() => JSON.stringify({ token: "test-token", user: mockAuthUser.user })),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe("Profile Page", () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  })

  it("renders profile form", () => {
    const { getByText, getByPlaceholderText, getByRole } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    expect(getByText("USER PROFILE")).toBeInTheDocument();
    profileFields.forEach((field) => {
      expect(getByPlaceholderText(`Enter Your ${field}`)).toBeInTheDocument();
    })
    expect(getByRole("button", { name: "UPDATE" })).toBeInTheDocument();
  });

  it("inputs should be filled with auth info", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("USER PROFILE")).toBeInTheDocument();
    profileFields.forEach((field) => {
      if (field == 'Password') {
        expect(getByPlaceholderText("Enter Your Password").value).toBe("");
      } else {
        expect(getByPlaceholderText(`Enter Your ${field}`).value)
          .toBe(`${mockAuthUser.user[field.toLowerCase()]}`);
      }
    })
  });

  it("should allow change of inputs", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    profileFields.forEach((field, index) => {
      fireEvent.change(getByPlaceholderText(`Enter Your ${field}`), {
        target: { value: `${mockChangedFields[index]}` }
      });
    });
    profileFields.forEach((field, index) => {
      expect(getByPlaceholderText(`Enter Your ${field}`).value)
        .toBe(`${mockChangedFields[index]}`);
    })
  });

  it("should allow update successfully", async () => {
    const mockAuth = mockAuthUser;
    const mockSetAuth = jest.fn();
    useAuth.mockReturnValue([mockAuth, mockSetAuth]);
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        updatedUser: mockUpdatedUser,
      },
    });
    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    profileFields.forEach((field, index) => {
      fireEvent.change(getByPlaceholderText(`Enter Your ${field}`), {
        target: { value: `${mockChangedFields[index]}` }
      });
    });
    fireEvent.click(getByRole("button", { name: "UPDATE" }));
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", mockUpdatedUser
      );
    });
    expect(mockSetAuth).toHaveBeenCalledWith({ ...mockAuth, user: mockUpdatedUser });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "auth",
      JSON.stringify({ token: "test-token", user: mockUpdatedUser })
    );
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  it("should display error toast if error response received", async () => {
    const mockAuth = mockAuthUser;
    const mockSetAuth = jest.fn();
    useAuth.mockReturnValue([mockAuth, mockSetAuth]);
    axios.put.mockResolvedValue({ data: { error: "Update failed" } });
    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    profileFields.forEach((field, index) => {
      fireEvent.change(getByPlaceholderText(`Enter Your ${field}`), {
        target: { value: `${mockChangedFields[index]}` }
      });
    });
    fireEvent.click(getByRole("button", { name: "UPDATE" }));
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", mockUpdatedUser
      );
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Update failed");
    });
  });

  it("should log error if error gets thrown", async () => {
    axios.put.mockRejectedValue(new Error("Testing Error"));
    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(getByRole("button", { name: "UPDATE" }));
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(Error("Testing Error"))
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

});