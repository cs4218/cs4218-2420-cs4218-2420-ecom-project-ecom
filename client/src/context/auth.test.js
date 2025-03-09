import React from "react";
import { render, act } from "@testing-library/react";
import axios from "axios";
import { AuthProvider, useAuth } from "./auth";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock axios
jest.mock("axios", () => ({
  defaults: {
    headers: {
      common: {},
    },
  },
}));

// Test component to use the hook
const TestComponent = () => {
  const [auth] = useAuth();
  return <div data-testid="user">{auth.user ? auth.user.name : "No User"}</div>;
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    axios.defaults.headers.common["Authorization"] = "";
  });

  test("initializes with default auth state", () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("user").textContent).toBe("No User");
  });

  test("loads auth data from localStorage on mount", () => {
    const testUser = { name: "John Doe" };
    const testToken = "sample-token-456";

    // Preset localStorage with auth data
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: testUser,
        token: testToken,
      })
    );

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("user").textContent).toBe("John Doe");
  });

  test("updates auth context correctly", () => {
    const TestUpdateComponent = () => {
      const [auth, setAuth] = useAuth();

      const updateAuth = () => {
        setAuth({
          user: { name: "Updated User" },
          token: "new-token",
        });
      };

      return (
        <div>
          <div data-testid="user">{auth.user ? auth.user.name : "No User"}</div>
          <button onClick={updateAuth} data-testid="update-btn">
            Update
          </button>
        </div>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestUpdateComponent />
      </AuthProvider>
    );

    // Initial state
    expect(getByTestId("user").textContent).toBe("No User");

    // Trigger auth update
    act(() => {
      getByTestId("update-btn").click();
    });

    // Check updated state
    expect(getByTestId("user").textContent).toBe("Updated User");
  });
});
