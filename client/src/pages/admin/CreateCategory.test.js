import React from "react";
import { render, fireEvent, waitFor} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateCategory from "./CreateCategory";


// Mocking axios.post
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

jest.mock("../../hooks/useCategory", () => jest.fn(() => [{ _id: "1", name: "pen", slug: "pen", __v: 0 }]));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };


describe("CreateCategory Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
    axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "pen", slug: "pen", __v: 0 }],
        },
      });
      
  });

  it("renders CreateCategory form", async () => {

    const { getByRole, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/create-category"]}>
        <Routes>
          <Route path="/create-category" element={<CreateCategory />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
    expect(getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(getByPlaceholderText('Enter new category')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter new category').value).toBe("");
  });
})

  it("should create the category successfully", async () => {
    axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          name: "Stationery",
        },
      });

    const { getByText, getByPlaceholderText, findByText} = render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    await waitFor(async () => {
        expect(await findByText('pen')).not.toBeNull();
      });
    fireEvent.change(getByPlaceholderText("Enter new category"), {
      target: { value: "Stationery" },
    });
    fireEvent.click(getByText("Submit"))

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Stationery is created");
  });

  it("should display error if fail to create the category", async () => {
    axios.post.mockResolvedValueOnce({
        data: {
          success: false,
          message: "Wrong failure"
        },
      });

    const { getByText, getByPlaceholderText, findByText } = render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );

    await waitFor(async () => {
        expect(await findByText('pen')).not.toBeNull();
      });
    fireEvent.change(getByPlaceholderText("Enter new category"), {
      target: { value: "Stationery" },
    });
    fireEvent.click(getByText("Submit"))

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Wrong failure");
  });

  it("When delete button is clicked", async () => {
    axios.delete.mockResolvedValueOnce({
        data: {
          success: true,
          message: "category is deleted"
        },
      });

    const { getByText, findAllByText} = render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );

    await waitFor(() => {
        findAllByText("Delete");
        fireEvent.click(getByText("Delete"))
  });

    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("category is deleted");
  });
 
  it("When delete button is clicked and returns error", async () => {
    axios.delete.mockResolvedValueOnce({
        data: {
          success: false,
          message: "deletion error"
        },
      });

    const { getByText, findAllByText} = render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );

        await waitFor(() => {
        findAllByText("Delete");
        fireEvent.click(getByText("Delete"))
  });

    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("deletion error");
  });

  it("When edit button is clicked", async () => {
    axios.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Computer is updated"
        },
      });

    const { getAllByText, getByText, findAllByText, getAllByPlaceholderText, findByText} = render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(async () => {
        expect(await findByText('pen')).not.toBeNull();
      });

    await findAllByText("Edit");
    fireEvent.click(getByText("Edit"))
    fireEvent.change(getAllByPlaceholderText("Enter new category")[1], {
        target: { value: "Computer" },
    });
    fireEvent.click(getAllByText("Submit")[1]);

    await waitFor(() =>
        expect(axios.put).toHaveBeenCalledWith(
          "/api/v1/category/update-category/1",
          { name: "Computer" }
        )
      );

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Computer is updated");
  });

  it("Error while get category", async () => {
    axios.get.mockRejectedValue(new Error("Error getting category"));

    toast.error = jest.fn();

    render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      });
    
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
  });

  it("Error when edit", async () => {
    axios.put.mockRejectedValue(new Error("Error updating category"));

      toast.error = jest.fn();

    const { getAllByText, getByText, findAllByText, getAllByPlaceholderText, findByText} = render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(async () => {
        expect(await findByText('pen')).not.toBeNull();
      });

    await findAllByText("Edit");
    fireEvent.click(getByText("Edit"))
    fireEvent.change(getAllByPlaceholderText("Enter new category")[1], {
        target: { value: "Computer" },
    });
    fireEvent.click(getAllByText("Submit")[1]);

    await waitFor(() =>
        expect(axios.put).toHaveBeenCalledWith(
          "/api/v1/category/update-category/1",
          { name: "Computer" }
        )
      );

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
  });

});
