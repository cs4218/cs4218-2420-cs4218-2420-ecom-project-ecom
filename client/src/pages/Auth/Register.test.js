import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Register from "./Register";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

const mockNavigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigateFunction,
}));

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

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// prevent jest from crashing
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

//Render Register component
const renderRegisterComp = () => {
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </MemoryRouter>
  );
} 

// Registration Input
const registerSampleInput = {
  name: "John Doe",
  email: "test@example.com",
  password: "password123",
  phone: "1234567890",
  address: "123 Street",
  DOB: "2000-01-01",
  answer: "Football",
}

const registerEmptyInput = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  DOB: "",
  answer: "",
}

const registerBadEmailInput = {
  name: "John Doe",
  email: "bademail",
  password: "password123",
  phone: "1234567890",
  address: "123 Street",
  DOB: "2000-01-01",
  answer: "Football",
}

//Fill in registration fields and submit register form
const fillInRegisterForm = (registerInput) => {
  fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
    target: { value: registerInput.name },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
    target: { value: registerInput.email },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
    target: { value: registerInput.password },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
    target: { value: registerInput.phone },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
    target: { value: registerInput.address },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter Your DOB"), {
    target: { value: registerInput.DOB },
  });
  fireEvent.change(screen.getByPlaceholderText("What is Your Favorite sports"), {
    target: { value: registerInput.answer },
  });
}


describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the Register component", () => {
    renderRegisterComp();

    expect(screen.getByRole("heading", { name: "REGISTER FORM" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Phone")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your DOB")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What is Your Favorite sports")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REGISTER" })).toBeInTheDocument();
  });

  it("should update the state when user types in the input fields", () => {
    renderRegisterComp();
    fillInRegisterForm(registerSampleInput);

    expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue(registerSampleInput.name);
    expect(screen.getByPlaceholderText("Enter Your Email")).toHaveValue(registerSampleInput.email);
    expect(screen.getByPlaceholderText("Enter Your Password")).toHaveValue(registerSampleInput.password);
    expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveValue(registerSampleInput.phone);
    expect(screen.getByPlaceholderText("Enter Your Address")).toHaveValue(registerSampleInput.address);
    expect(screen.getByPlaceholderText("Enter Your DOB")).toHaveValue(registerSampleInput.DOB);
    expect(screen.getByPlaceholderText("What is Your Favorite sports")).toHaveValue(registerSampleInput.answer);
  });

  it("should register the user successfully and redirect to login page", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: 'Successful registration' },
    });

    renderRegisterComp();
    fillInRegisterForm(registerSampleInput);
    fireEvent.click(screen.getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", registerSampleInput);
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Register Successfully, please login");
    expect(mockNavigateFunction).toHaveBeenCalledTimes(1);
    expect(mockNavigateFunction).toHaveBeenCalledWith('/login');
  });

  it("should display error message on failed registration", async () => {
    axios.post.mockRejectedValueOnce({
      data: { success: false, message: "Something went wrong" }, 
    });

    renderRegisterComp();
    fillInRegisterForm(registerSampleInput);
    fireEvent.click(screen.getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", registerSampleInput);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("should not submit form when all required fields are empty", async () => {
    renderRegisterComp();
    fillInRegisterForm(registerEmptyInput);
    fireEvent.click(screen.getByText("REGISTER"));

    const nameInput = screen.getByPlaceholderText("Enter Your Name");
    const emailInput = screen.getByPlaceholderText("Enter Your Email");
    const passwordInput = screen.getByPlaceholderText("Enter Your Password");
    const phoneInput = screen.getByPlaceholderText("Enter Your Phone");
    const addressInput = screen.getByPlaceholderText("Enter Your Address");
    const dobInput = screen.getByPlaceholderText("Enter Your DOB");
    const answerInput = screen.getByPlaceholderText("What is Your Favorite sports");

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(phoneInput).toBeRequired();
    expect(addressInput).toBeRequired();
    expect(dobInput).toBeRequired();
    expect(answerInput).toBeRequired();
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(0));
    expect(nameInput.validationMessage).toBe("Constraints not satisfied");
    expect(emailInput.validationMessage).toBe("Constraints not satisfied");
    expect(passwordInput.validationMessage).toBe("Constraints not satisfied");
    expect(phoneInput.validationMessage).toBe("Constraints not satisfied");
    expect(addressInput.validationMessage).toBe("Constraints not satisfied");
    expect(dobInput.validationMessage).toBe("Constraints not satisfied");
    expect(answerInput.validationMessage).toBe("Constraints not satisfied");
  });

  it("should flag out invalid email", async () => {
    renderRegisterComp();
    fillInRegisterForm(registerBadEmailInput);
    fireEvent.click(screen.getByText("REGISTER"));

    const emailInput = screen.getByPlaceholderText("Enter Your Email");

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(0));
    expect(emailInput.validationMessage).toBe("Constraints not satisfied");
  });
});
