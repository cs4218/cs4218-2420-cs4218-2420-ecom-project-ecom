import React from 'react';
import { render, waitFor } from "@testing-library/react";
import Private from "./Private.js";
import { useAuth } from "../../context/auth";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";


// Mock necessary modules
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("axios");
jest.mock("../Spinner", () => () => <div>Spinner</div>);

describe("PrivateRoute", () => {
  let setAuthMock;

  beforeEach(() => {
    setAuthMock = jest.fn();
    useAuth.mockReturnValue([{ token: "fakeToken" }, setAuthMock]);
  });

  test("renders Outlet when the user is authenticated", async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true } });
    const {queryByText} = render(
        <MemoryRouter initialEntries={["/private"]}>
          <Routes>
            <Route path="/private" element={<Private />} />
          </Routes>
        </MemoryRouter>
      );    

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth"));
    await waitFor(() => expect(queryByText(/Spinner/i)).not.toBeInTheDocument());
    
  });

  test("renders Spinner when authentication check is in progress", async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: false } });

    const {getByText} = render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route path="/private" element={<Private />} />
        </Routes>
      </MemoryRouter>
    );  
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth"));
    await waitFor(() => expect(getByText(/Spinner/i)).toBeInTheDocument());
  });

  test("renders Spinner when the user is not authenticated", async () => {
    useAuth.mockReturnValue([{}, setAuthMock]);

    const {getByText} = render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route path="/private" element={<Private />} />
        </Routes>
      </MemoryRouter>
    );  

    await waitFor(() => axios.get.mockResolvedValueOnce({ data: { ok: false } }));

    await waitFor(() => expect(getByText(/Spinner/i)).toBeInTheDocument());
  });

  test("Exit gracefully if error", async () => {
    axios.get.mockRejectedValueOnce(new Error("Error Authenticating"));
    const {queryByText} = render(
        <MemoryRouter initialEntries={["/private"]}>
          <Routes>
            <Route path="/private" element={<Private />} />
          </Routes>
        </MemoryRouter>
      );    

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth"));
    await waitFor(() => expect(queryByText(/Spinner/i)).toBeInTheDocument());
    
  });
  
});
