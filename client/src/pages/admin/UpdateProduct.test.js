import React from "react";
import { render, fireEvent, waitFor, getByDisplayValue} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";

jest.mock("antd", () => {
    const actualAntd = jest.requireActual("antd");
    const MockSelect = ({
      children,
      onChange,
      "data-testid": testId,
      defaultValue,
    }) => (
      <select
        data-testid={testId}
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    );
  
    MockSelect.Option = ({ children, value }) => (
      <option value={value}>{children}</option>
    );
  
    return {
      ...actualAntd,
      Select: MockSelect,
    };
  });

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"), // retain all original properties
    useNavigate: jest.fn(), // mock useNavigate only
  }));
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


describe("UpdateProduct Component", () => {
 const mockNavigate = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks(); 
    axios.get.mockResolvedValue({
        data: {
          success: true,
          message: "All Categories List",
          category: [{ _id: "1", name: "pen", slug: "pen", __v: 0 },
            { _id: "2", name: "history", slug: "history", __v: 0 }
          ],
        },
      });

    axios.get.mockResolvedValue({
        data: {
          success: true,
          message: "Single Product Fetched",
          product: {
                "_id": "1",
                "name": "product1",
                "slug": "product1",
                "description": "product description test",
                "price": 1,
                "category": "history",
                "quantity": 2,
                "shipping": true,
                "createdAt": "2024-09-06T17:57:19.992Z",
                "updatedAt": "2024-09-06T17:57:19.992Z",
                "__v": 0
    }
        },
      });
      useNavigate.mockReturnValue(mockNavigate);
      
  });

  it("renders UpdateProduct form", async () => {

    const { getByRole, getByDisplayValue, getByText} = render(
      <MemoryRouter initialEntries={["/product/product1"]}>
        <Routes>
          <Route path="/product/product1" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
    expect(getByRole("button", { name: /update product/i })).toBeInTheDocument();
    expect(getByText(/upload photo/i)).toBeInTheDocument();
    expect(getByDisplayValue('product1')).toBeInTheDocument();
    expect(getByText('product description test')).toBeInTheDocument();
    expect(getByDisplayValue('1')).toBeInTheDocument();
    expect(getByDisplayValue('2')).toBeInTheDocument();
    expect(getByRole("button", { name: /delete product/i })).toBeInTheDocument();
  });
})

it("Updates product successfully", async () => {
    axios.put.mockResolvedValue({
        data: {
          success: true,
          message: "Product Updated Successfully",
        },
      });     
      

    const { getByRole, getByPlaceholderText, getByTestId, getByText} = render(
        <MemoryRouter initialEntries={["/product/product1"]}>
        <Routes>
          <Route path="/product/product1" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );    

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/category/get-category"
        );
      });    

    const createMockFile = (name, size, type) => {
        const padding = new Blob([new Array(size).fill("-").join("")], { type });
        return new File([padding], name, { type });
    };

    const selectCategory = getByTestId(`selectCategory`);
    
    fireEvent.change(selectCategory, { target: { value: "pen" } });

    fireEvent.change(getByPlaceholderText("write a name"), {
          target: { value: "product1" },
    });

    fireEvent.change(getByPlaceholderText("write a description"), {
        target: { value: "product 1 description updated" },
  });

    fireEvent.change(getByPlaceholderText("write a Price"), {
        target: { value: "10" },
    });

    fireEvent.change(getByPlaceholderText("write a quantity"), {
        target: { value: "15" },
    });

    const selectShipping = getByTestId(`selectShipping`);
    
    fireEvent.change(selectShipping, { target: { value: "No" } });

    const file = createMockFile("test-img.jpg", 350, "image/jpeg");
    const input = getByText(/upload photo/i);
    fireEvent.input(input, { target: { files: [file] } });
    await waitFor(() => expect(input.files.length).toBe(1));
    expect(input.files[0].name).toBe("test-img.jpg");
    fireEvent.click(getByRole("button", { name: /update product/i }));

    await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          "/api/v1/product/update-product/1",
          expect.any(FormData)
        );
      });
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Product Updated Successfully"
        );
      });
      expect(mockNavigate).toHaveBeenCalledWith(
        "/dashboard/admin/products"
      );

})

it("Error when Update product (null quantity)", async () => {
    axios.put.mockResolvedValue({
        data: {
          success: false,
          message: "Quantity is Required",
        },
      });     
      

    const { getByRole, getByTestId, getByPlaceholderText, getByText} = render(
        <MemoryRouter initialEntries={["/product/product1"]}>
        <Routes>
          <Route path="/product/product1" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );       

   
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/category/get-category"
        );
      });    

    const createMockFile = (name, size, type) => {
        const padding = new Blob([new Array(size).fill("-").join("")], { type });
        return new File([padding], name, { type });
    };

    const selectCategory = getByTestId(`selectCategory`);
    
    fireEvent.change(selectCategory, { target: { value: "pen" } });

    fireEvent.change(getByPlaceholderText("write a name"), {
          target: { value: "product1" },
    });

    fireEvent.change(getByPlaceholderText("write a description"), {
        target: { value: "product 1 description updated" },
  });

    fireEvent.change(getByPlaceholderText("write a Price"), {
        target: { value: "10" },
    });

    fireEvent.change(getByPlaceholderText("write a quantity"), {
        target: { value: null },
    });

    const selectShipping = getByTestId(`selectShipping`);
    
    fireEvent.change(selectShipping, { target: { value: "No" } });

    const file = createMockFile("test-img.jpg", 350, "image/jpeg");
    const input = getByText(/upload photo/i);
    fireEvent.input(input, { target: { files: [file] } });
    await waitFor(() => expect(input.files.length).toBe(1));
    expect(input.files[0].name).toBe("test-img.jpg");
    fireEvent.click(getByRole("button", { name: /update product/i }));


      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Quantity is Required"
        );
      });
      
      expect(mockNavigate).not.toHaveBeenCalledWith(
        "/dashboard/admin/products"
      );

})

it("Delete the product successfully", async () => {
    window.prompt = jest.fn().mockReturnValue(true);
    axios.delete.mockResolvedValue({
        data: {
          success: true,
          message: "Product Deleted successfully",
        },
      });     
      

    const { getByRole, getByText} = render(
        <MemoryRouter initialEntries={["/product/product1"]}>
        <Routes>
          <Route path="/product/product1" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );       

   
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/category/get-category"
        );
      });    
      
      await waitFor(() => {
        expect(getByText('product description test')).toBeInTheDocument();
      });
    fireEvent.click(getByRole("button", { name: /delete product/i }));

    await waitFor(() => {
        expect(window.prompt).toHaveBeenCalledWith(
          "Are You Sure want to delete this product ? "
        );
      });
    await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(
          "/api/v1/product/delete-product/1",
        );
      });
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Product Deleted Successfully"
        );
      });
      
      expect(mockNavigate).toHaveBeenCalledWith(
        "/dashboard/admin/products"
      );

})

it("Error when get category)", async () => {
  axios.get.mockRejectedValue(new Error("Error getting category"));     
    
  toast.error = jest.fn();

  render(
      <MemoryRouter initialEntries={["/product/product1"]}>
      <Routes>
        <Route path="/product/product1" element={<UpdateProduct />} />
      </Routes>
    </MemoryRouter>
  );       

 
  await waitFor(() => {
    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
  });

  expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");

})

it("Error when put product", async () => {
  axios.put.mockRejectedValue(new Error("Error put product"));   
  
  toast.error = jest.fn();
    

  const { getByRole, getByPlaceholderText, getByTestId, getByText} = render(
      <MemoryRouter initialEntries={["/product/product1"]}>
      <Routes>
        <Route path="/product/product1" element={<UpdateProduct />} />
      </Routes>
    </MemoryRouter>
  );    

  await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/category/get-category"
      );
    });    

  const createMockFile = (name, size, type) => {
      const padding = new Blob([new Array(size).fill("-").join("")], { type });
      return new File([padding], name, { type });
  };

  const selectCategory = getByTestId(`selectCategory`);
  
  fireEvent.change(selectCategory, { target: { value: "pen" } });

  fireEvent.change(getByPlaceholderText("write a name"), {
        target: { value: "product1" },
  });

  fireEvent.change(getByPlaceholderText("write a description"), {
      target: { value: "product 1 description updated" },
});

  fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "10" },
  });

  fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "15" },
  });

  const selectShipping = getByTestId(`selectShipping`);
  
  fireEvent.change(selectShipping, { target: { value: "No" } });

  const file = createMockFile("test-img.jpg", 350, "image/jpeg");
  const input = getByText(/upload photo/i);
  fireEvent.input(input, { target: { files: [file] } });
  await waitFor(() => expect(input.files.length).toBe(1));
  expect(input.files[0].name).toBe("test-img.jpg");
  fireEvent.click(getByRole("button", { name: /update product/i }));

  await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/product/update-product/1",
        expect.any(FormData)
      );
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong"
      );
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(
      "/dashboard/admin/products"
    );

})
      

});
