import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import axios from "axios";
import React from 'react';
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UpdateProduct from './UpdateProduct';

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock('../../hooks/useCategory', () => jest.fn(() => []));


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ slug: "mock-product"}),
  useNavigate: () => mockNavigate
}))

jest.spyOn(console, 'log').mockImplementation(() => {}); // silence log outputs in test

window.URL.createObjectURL = jest.fn();
/**
 * Resistance to refactoring/ lib changes
 */
jest.mock('../../components/AdminMenu', () => () => <div></div>)
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>)

jest.mock("antd", () => ({
    Select: Object.assign(({ children, onChange, value, placeholder, ...props }) => (
      <select
        data-testid="mock-select"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
      >
        {children}
      </select>
    ),
    { Option: ({ children, value }) => <option value={value}>{children}</option> },
  ),
}));

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/dashboard/admin/update-product']}>
      <Routes>
        <Route path="/dashboard/admin/update-product" element={<UpdateProduct />} />
      </Routes>
    </MemoryRouter>
  );
}

const mockCategories = [
  {
    _id: "1",
    name: "Mock Category"
  },
  {
    _id: "2",
    name: "Cat 2"
  }
]

const mockProduct = {
  _id: "1",
  name: "Mock product",
  slug: "mock-product",
  description: "Mock Description",
  price: 100.00,
  quantity: 100,
  category: mockCategories[0],
  shipping: false
}

const setInputValue = (placeholder, value) => {
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
};

const selectCategory = (val) => {
  const categoryDropdown = screen.getByPlaceholderText('Select a category');
  fireEvent.change(categoryDropdown, { target: { value: val }});
}

const selectShipping = (val) => {
  const shippingDropdown = screen.getByPlaceholderText('Select Shipping');
  fireEvent.change(shippingDropdown, { target: { value: val }});
}

const uploadPhoto = (photo) => {
  const fileUpload = screen.getByLabelText("Upload Photo");
  user.upload(fileUpload, photo);
}

describe('Render UpdateProduct page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({ data: { success: true, category: mockCategories } });
        }
        if (url === `/api/v1/product/get-product/${mockProduct.slug}`) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        return Promise.reject(new Error("Internal error"));
      });
  });

  it('renders UpdateProduct page correctly', async () => {
    renderComponent();
  
    expect(screen.getByText('Update Product')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByPlaceholderText("write a name")).toHaveValue(mockProduct.name);
    });
    
    expect(screen.getByPlaceholderText("write a description")).toHaveValue(mockProduct.description);
    expect(screen.getByPlaceholderText("write a Price")).toHaveValue(mockProduct.price);
    expect(screen.getByPlaceholderText("write a quantity")).toHaveValue(mockProduct.quantity);
    expect(screen.getByPlaceholderText("Select a category")).toHaveValue(mockProduct.category._id);
    expect(screen.getByPlaceholderText("Select Shipping")).toHaveValue("0");
    expect(screen.getByAltText("product_photo").src).toContain(`/api/v1/product/product-photo/${mockProduct._id}`)
    expect(screen.getByLabelText("Upload Photo")).toBeInTheDocument();
    expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
    expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
  });

  it('renders category values', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(mockCategories[0].name)).toBeInTheDocument();
    })
    expect(screen.getByText(mockCategories[1].name)).toBeInTheDocument();
  });

  it('routes users to 404 on invalid product', async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: { success: true, category: mockCategories } });
      }
      if (url === `/api/v1/product/get-product/${mockProduct.slug}`) {
        return Promise.reject({
          response: { status: 404 }
        });
      }
      return Promise.reject(new Error("Internal error"));
    });

    renderComponent();
  
    await waitFor(() => {
      expect(screen.getByText('Update Product')).toBeInTheDocument();
    });

    expect(mockNavigate).toBeCalledWith("/not-found");
  });

  it('handles API errors', async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.reject(new Error("Category API error"));
      }
      if (url === `/api/v1/product/get-product/${mockProduct.slug}`) {
        return Promise.reject(new Error("Product API error"));
      }
      return Promise.reject(new Error("Internal error"));
    });

    renderComponent();
  
    await waitFor(() => {
      expect(screen.getByText('Update Product')).toBeInTheDocument();
    });
    expect(toast.error).toBeCalledTimes(2);
    expect(toast.error).toBeCalledWith("Something went wrong");
    expect(toast.error).toBeCalledWith("Something wwent wrong in getting catgeory");
  });
});

describe('Update valid product', () => {
  const testTable = [
    [
      "invalid name",
      {
        product: {...mockProduct, name: " "},
        expectedErr: "Name is required"
      }
    ],
    [
      "invalid description",
      {
        product: {...mockProduct, description: "  "},
        expectedErr: "Description is required"
      }
    ],
    [
      "negative price",
      {
        product: {...mockProduct, price: -1},
        expectedErr: "Invalid price"
      }
    ],
    [
      "non-numeric price",
      {
        product: {...mockProduct, price: "abc"},
        expectedErr: "Invalid price"
      }
    ],
    [
      "empty price",
      {
        product: {...mockProduct, price: "  "},
        expectedErr: "Invalid price"
      }
    ],
    [
      "negative qty",
      {
        product: {...mockProduct, quantity: -1},
        expectedErr: "Invalid quantity"
      }
    ],
    [
      "empty qty",
      {
        product: {...mockProduct, quantity: " "},
        expectedErr: "Invalid quantity"
      }
    ],
    [
      "empty category",
      {
        product: {...mockProduct, category: { _id: "" }},
        expectedErr: "Category is required"
      }
    ], 
    [
      "no shipping",
      {
        product: {...mockProduct, shipping: ""},
        expectedErr: "Shipping is required"
      }
    ],
  ]

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: { success: true, category: mockCategories } });
      }
      if (url === `/api/v1/product/get-product/${mockProduct.slug}`) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      return Promise.reject(new Error("Internal error"));
    });
  });

  beforeAll(() => {
    expect.extend({
      toBeFormDataWith(received, expectedProperties) {
        if (!(received instanceof FormData)) {
          return {
            message: () => `Expected received value to be instance of FormData`,
            pass: false,
          };
        }
        const receivedObject = {};
        received.forEach((value, key) => {
          receivedObject[key] = value instanceof File ? value.name : value;
        });
        const pass = expect.objectContaining(expectedProperties).asymmetricMatch(receivedObject);
  
        return {
          message: () =>
            `want: ${JSON.stringify(expectedProperties)}, have: ${JSON.stringify(receivedObject)}`,
          pass,
        };
      },
    });
  });
  
  it('should update a valid product', async () => {
    axios.put.mockResolvedValue({
      data: {
        success: true,
        message: "Product Updated Successfully"
      }
    });
    
    renderComponent();
    await waitFor(() => {
        expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
        setInputValue("write a name", "New product");
        setInputValue("write a description", "New description");
        setInputValue("write a Price", "200");
        setInputValue("write a quantity", "50");
        uploadPhoto(new File(["dummy-content"], "new-photo.jpg", { type: "image/jpeg" }));
        selectCategory("2");
        selectShipping("1");
      }
    );
  
    const submitButton = screen.getByText("UPDATE PRODUCT");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `/api/v1/product/update-product/${mockProduct._id}`,
        expect.any(FormData)
      );
    });
    const formData = axios.put.mock.calls[0][1];
    expect(formData).toBeFormDataWith({
      name: "New product",
      description: "New description",
      price: "200",
      quantity: "50",
      category: mockCategories[1]._id,
      shipping: "1",
      photo: "new-photo.jpg"
    });

    // Wait for toast.success to be called after the async operation
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
    });
  });

  it('redirects user after product update', async () => {
    axios.put.mockResolvedValue({
      data: {
        success: true,
        message: "Product Updated Successfully"
      }
    });
    
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
      setInputValue("write a name", "New product");
      setInputValue("write a description", "New description");
      setInputValue("write a Price", "200");
      setInputValue("write a quantity", "50");
      uploadPhoto(new File(["dummy-content"], "new-photo.jpg", { type: "image/jpeg" }));
      selectCategory("2");
      selectShipping("1");
      }
    );
  
    const submitButton = screen.getByText("UPDATE PRODUCT");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith("/dashboard/admin/products");
    });
    expect(toast.success).toBeCalledWith("Product Updated Successfully")
  })

  it.each(testTable)(
    "invalidates product with %s",
    async (testcase, { product, expectedErr }) => {
      renderComponent();
      await waitFor(() => {
          expect(screen.getByText(mockCategories[0].name)).toBeInTheDocument();
          setInputValue("write a name", product.name);
          setInputValue("write a description", product.description);
          setInputValue("write a Price", product.price);
          setInputValue("write a quantity", product.quantity);
          uploadPhoto(product.photo);
          selectCategory(product.category?._id);
          selectShipping(product.shipping);
        }
      );

      const submitButton = screen.getByText("UPDATE PRODUCT");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.put).not.toBeCalled();
      });
      expect(toast.error).toHaveBeenCalledWith(expectedErr);
    }
  )

  it('handles backend validation errors', async () => {
    axios.put.mockResolvedValue({
      data: {
        success: false,
        message: "Size limit exceeded"
      }
    });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
      setInputValue("write a name", "New product");
      setInputValue("write a description", "New description");
      setInputValue("write a Price", "200");
      setInputValue("write a quantity", "50");
      uploadPhoto(new File(["dummy-content"], "new-photo.jpg", { type: "image/jpeg" }));
      selectCategory("2");
      selectShipping("1");
      }
    );
    const submitButton = screen.getByText("UPDATE PRODUCT");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Size limit exceeded");
    })
  });

  it('handles API errors', async () => {
    axios.put.mockRejectedValue(new Error("Internal server error"));

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    })

    const submitButton = screen.getByText("UPDATE PRODUCT");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("something went wrong");
    })
  });
});

describe('Delete product', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    axios.get.mockImplementation((url) => {
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({ data: { success: true, category: mockCategories } });
        }
        if (url === `/api/v1/product/get-product/${mockProduct.slug}`) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        return Promise.reject(new Error("Internal error"));
      });
  });
  
  it('should allow users to delete', async () => {
    axios.delete.mockResolvedValue({
      data: {
        success: true,
      }
    });
    window.prompt = jest.fn(() => 'yes');
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });
    
    const deleteProduct = screen.getByText("DELETE PRODUCT");
    fireEvent.click(deleteProduct); 

    expect(axios.delete).toHaveBeenCalledWith(`/api/v1/product/delete-product/${mockProduct._id}`);
    await waitFor(() => {
      expect(toast.success).toBeCalledWith("Product Deleted Successfully");
    })
  });

  it('navigates on delete', async () => {
    axios.delete.mockResolvedValue({
      data: {
        success: true,
      }
    });
    window.prompt = jest.fn(() => 'yes');
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });
    
    const deleteProduct = screen.getByText("DELETE PRODUCT");
    fireEvent.click(deleteProduct); 

    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith("/dashboard/admin/products");
    })
  });

  it('handles API errors', async () => {
    axios.delete.mockRejectedValue(new Error("Internal Server Error"));
    window.prompt = jest.fn(() => 'yes');
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });
        
    const deleteProduct = screen.getByText("DELETE PRODUCT");
    fireEvent.click(deleteProduct); 
    
    await waitFor(() => {
      expect(toast.error).toBeCalledWith("Something went wrong");
    })
  });

  it('handles backend errors', async () => {
    axios.delete.mockResolvedValue({
      data: {
        success: false,
      }
    });
    window.prompt = jest.fn(() => 'yes');
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });
    
    const deleteProduct = screen.getByText("DELETE PRODUCT");
    fireEvent.click(deleteProduct); 

    await waitFor(() => {
      expect(toast.error).toBeCalledWith("Something went wrong");
    })
  });
})
