import React from "react";
import { render, fireEvent, waitFor} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";

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


describe("CreateProduct Component", () => {
 const mockNavigate = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks(); 
    axios.get.mockResolvedValue({
        data: {
          success: true,
          message: "All Categories List",
          category: [{ _id: "1", name: "pen", slug: "pen", __v: 0 }],
        },
      });
      useNavigate.mockReturnValue(mockNavigate);
      
  });

  it("renders CreateCategory form", async () => {

    const { getByRole, getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/create-product"]}>
        <Routes>
          <Route path="/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );    
    await waitFor(() => {
    expect(getByRole("button", { name: /create product/i })).toBeInTheDocument();
    expect(getByText(/upload photo/i)).toBeInTheDocument();
    expect(getByPlaceholderText('write a name')).toBeInTheDocument();
    expect(getByPlaceholderText('write a description')).toBeInTheDocument();
    expect(getByPlaceholderText('write a Price')).toBeInTheDocument();
    expect(getByPlaceholderText('write a quantity')).toBeInTheDocument();
  });
})

it("Creates product successfully", async () => {
    axios.post.mockResolvedValue({
        data: {
          success: true,
          message: "Product Created Successfully",
        },
      });     
      

    const { getByRole, getByPlaceholderText, getByTestId, getByText} = render(
      <MemoryRouter initialEntries={["/create-product"]}>
        <Routes>
          <Route path="/create-product" element={<CreateProduct />} />
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
          target: { value: "test product" },
    });

    fireEvent.change(getByPlaceholderText("write a description"), {
        target: { value: "test product description" },
  });

    fireEvent.change(getByPlaceholderText("write a Price"), {
        target: { value: "10" },
    });

    fireEvent.change(getByPlaceholderText("write a quantity"), {
        target: { value: "1" },
    });

    const selectShipping = getByTestId(`selectShipping`);
    
    fireEvent.change(selectShipping, { target: { value: "Yes" } });

    const file = createMockFile("test-img.jpg", 350, "image/jpeg");
    const input = getByText(/upload photo/i);
    fireEvent.input(input, { target: { files: [file] } });
    await waitFor(() => expect(input.files.length).toBe(1));
    expect(input.files[0].name).toBe("test-img.jpg");
    fireEvent.click(getByRole("button", { name: /create product/i }));

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/create-product",
          expect.any(FormData)
        );
      });
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Product Created Successfully"
        );
      });
      expect(mockNavigate).toHaveBeenCalledWith(
        "/dashboard/admin/products"
      );

})

it("Error when Create product", async () => {
    axios.post.mockResolvedValue({
        data: {
          success: false,
          message: "Error when creating product",
        },
      });     
      

    const { getByRole} = render(
      <MemoryRouter initialEntries={["/create-product"]}>
        <Routes>
          <Route path="/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );       

   
    fireEvent.click(getByRole("button", { name: /create product/i }));
    

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/create-product",
          expect.any(FormData)
        );
      });
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Error when creating product"
        );
      });
      
      expect(mockNavigate).not.toHaveBeenCalledWith(
        "/dashboard/admin/products"
      );

})

it("Should not allow creation of quantity and price of negative values", async () => {
  axios.post.mockRejectedValue({
      data: {
        success: false,
        message: "Quantity and Price should not be negative",
      },
    });     
    

  const { getByRole, getByPlaceholderText, getByTestId, getByText} = render(
    <MemoryRouter initialEntries={["/create-product"]}>
      <Routes>
        <Route path="/create-product" element={<CreateProduct />} />
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
        target: { value: "test product" },
  });

  fireEvent.change(getByPlaceholderText("write a description"), {
      target: { value: "test product description" },
});

  fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "-1" },
  });

  fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "-1" },
  });

  const selectShipping = getByTestId(`selectShipping`);
  
  fireEvent.change(selectShipping, { target: { value: "Yes" } });

  const file = createMockFile("test-img.jpg", 350, "image/jpeg");
  const input = getByText(/upload photo/i);
  fireEvent.input(input, { target: { files: [file] } });
  await waitFor(() => expect(input.files.length).toBe(1));
  expect(input.files[0].name).toBe("test-img.jpg");
  fireEvent.click(getByRole("button", { name: /create product/i }));

  await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      );
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Quantity and Price should not be negative"
      );
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(
      "/dashboard/admin/products"
    );

})

it("Should allow the creation of quantity and price of 0 value", async () => {
  axios.post.mockResolvedValue({
      data: {
        success: true,
        message: "Product Created Successfully",
      },
    });     
    

  const { getByRole, getByPlaceholderText, getByTestId, getByText} = render(
    <MemoryRouter initialEntries={["/create-product"]}>
      <Routes>
        <Route path="/create-product" element={<CreateProduct />} />
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
        target: { value: "test product" },
  });

  fireEvent.change(getByPlaceholderText("write a description"), {
      target: { value: "test product description" },
});

  fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "0" },
  });

  fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "0" },
  });

  const selectShipping = getByTestId(`selectShipping`);
  
  fireEvent.change(selectShipping, { target: { value: "Yes" } });

  const file = createMockFile("test-img.jpg", 350, "image/jpeg");
  const input = getByText(/upload photo/i);
  fireEvent.input(input, { target: { files: [file] } });
  await waitFor(() => expect(input.files.length).toBe(1));
  expect(input.files[0].name).toBe("test-img.jpg");
  fireEvent.click(getByRole("button", { name: /create product/i }));

  await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      );
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Product Created Successfully"
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/admin/products"
    );

})

});
