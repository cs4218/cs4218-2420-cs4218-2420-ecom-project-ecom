import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import axios from "axios";
import React from 'react';
import toast from "react-hot-toast";
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../components/Layout';
import CreateProduct from './CreateProduct';

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
  useNavigate: () => mockNavigate
}))

jest.spyOn(console, 'log').mockImplementation(() => {}); // silence log outputs in test

window.URL.createObjectURL = jest.fn();
/**
 * Resistance to refactoring/ lib changes
 */
jest.mock('../../components/AdminMenu', () => () => <div></div>)
jest.mock('../../components/Layout', () => ({ children }) => {
  return <div>{children}</div>
})

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
    <MemoryRouter>
      <Layout>
        <CreateProduct />
      </Layout>
    </MemoryRouter>
  );
}

const mockCategory = {
  _id: "1",
  name: "Mock Category"
}

const validProduct = {
  name: "Valid Name",
  description: "Valid Description",
  price: "100",
  quantity: "100",
  category: mockCategory._id,
  photo: new File(["dummy-content"], "photo.jpg", { type: "image/jpeg" }),
  shipping: "1"
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

describe('Render CreateProduct page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: [mockCategory]
      }
    });
  });

  it('renders CreateProduct page correctly', async () => {
    renderComponent();
  
    await waitFor(() => {
      expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Select a category")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Select Shipping")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload Photo")).toBeInTheDocument();
    expect(screen.getByText("CREATE PRODUCT")).toBeInTheDocument();
  });

  it('renders category values', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
    })
  });

  it('should have empty inputs initially', async () => {
    renderComponent();
  
    await waitFor(() => {
      expect(screen.getByPlaceholderText("write a name").value).toBe("");
    })
    expect(screen.getByPlaceholderText("write a Price").value).toBe("");
    expect(screen.getByPlaceholderText("write a quantity").value).toBe("");
    // if upload photo is in the doc, there is no photo
    expect(screen.getByLabelText("Upload Photo")).toBeInTheDocument(); 
  });

  it('renders image on user upload', async () => {
    const file = new File(["dummy-content"], "photo.jpg", { type: "image/jpeg" })
    renderComponent();

    await waitFor(() => {
      uploadPhoto(file);
    });

    expect(screen.getByAltText("product_photo")).toBeInTheDocument();
  });
});

describe('Product creation', () => {
  const testTable = [
    [
      "invalid name",
      {
        product: {...validProduct, name: "  "},
        expectedErr: "Name is required"
      }
    ],
    [
      "invalid description",
      {
        product: {...validProduct, description: "  "},
        expectedErr: "Description is required"
      }
    ],
    [
      "negative price",
      {
        product: {...validProduct, price: -1},
        expectedErr: "Invalid price"
      }
    ],
    [
      "non-numeric price",
      {
        product: {...validProduct, price: "abc"},
        expectedErr: "Invalid price"
      }
    ],
    [
      "empty price",
      {
        product: {...validProduct, price: "  "},
        expectedErr: "Invalid price"
      }
    ],
    [
      "negative qty",
      {
        product: {...validProduct, quantity: -1},
        expectedErr: "Invalid quantity"
      }
    ],
    [
      "empty qty",
      {
        product: {...validProduct, quantity: " "},
        expectedErr: "Invalid quantity"
      }
    ],
    [
      "empty category",
      {
        product: {...validProduct, category: ""},
        expectedErr: "Category is required"
      }
    ], 
    [
      "no photo",
      {
        product: {...validProduct, photo: ""},
        expectedErr: "Photo is required"
      }
    ],
    [
      "no shipping",
      {
        product: {...validProduct, shipping: ""},
        expectedErr: "Shipping is required"
      }
    ],
  ]

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data : {
        success: true,
        category: [mockCategory]
      }
    });
  });

  beforeAll(() => {
    // reuse in edit product
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
            `Expected FormData to contain ${JSON.stringify(expectedProperties)}, but received ${JSON.stringify(receivedObject)}`,
          pass,
        };
      },
    });
  });
  
  it('should create a valid product', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        message: "Product Created Successfully"
      }
    });
    
    renderComponent();
    await waitFor(() => {
        expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
        setInputValue("write a name", validProduct.name);
        setInputValue("write a description", validProduct.description);
        setInputValue("write a Price", validProduct.price);
        setInputValue("write a quantity", validProduct.quantity);
        uploadPhoto(validProduct.photo);
        selectCategory(validProduct.category);
        selectShipping(validProduct.shipping);
      }
    );
  
    const submitButton = screen.getByText("CREATE PRODUCT");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product/create-product',
        expect.any(FormData)
      );
    });
    const formData = axios.post.mock.calls[0][1];
    expect(formData).toBeFormDataWith({
      ...validProduct,
      photo: "photo.jpg"
    });

    // Wait for toast.success to be called after the async operation
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
    });
  });

  it('redirects user after product creation', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        message: "Product Created Successfully"
      }
    });
    
    renderComponent();
    await waitFor(() => {
        expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
        setInputValue("write a name", validProduct.name);
        setInputValue("write a description", validProduct.description);
        setInputValue("write a Price", validProduct.price);
        setInputValue("write a quantity", validProduct.quantity);
        uploadPhoto(validProduct.photo);
        selectCategory(validProduct.category);
        selectShipping(validProduct.shipping);
      }
    );
  
    const submitButton = screen.getByText("CREATE PRODUCT");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith("/dashboard/admin/products");
    });
  })

  it.each(testTable)(
    "invalidates product with %s",
    async (testcase, { product, expectedErr }) => {
      renderComponent();
      await waitFor(() => {
          expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
          setInputValue("write a name", product.name);
          setInputValue("write a description", product.description);
          setInputValue("write a Price", product.price);
          setInputValue("write a quantity", product.quantity);
          uploadPhoto(product.photo);
          selectCategory(product.category);
          selectShipping(product.shipping);
        }
      );

      const submitButton = screen.getByText("CREATE PRODUCT");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.post).not.toBeCalled();
      });
      expect(toast.error).toHaveBeenCalledWith(expectedErr);
    }
  )

  it('handles GET API errors', async () => {
    axios.get.mockRejectedValue(new Error("GET API error"));

    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory");
    })
  });

  it('handles POST API errors', async () => {
    axios.post.mockRejectedValue(new Error("API error"));

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
      setInputValue("write a name", validProduct.name);
      setInputValue("write a description", validProduct.description);
      setInputValue("write a Price", validProduct.price);
      setInputValue("write a quantity", validProduct.quantity);
      uploadPhoto(validProduct.photo);
      selectCategory(validProduct.category);
      selectShipping(validProduct.shipping);
    }
  );

  const submitButton = screen.getByText("CREATE PRODUCT");
  fireEvent.click(submitButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("something went wrong");
    })
  });

  it('handles API errors', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: false,
        message: "Size limit exceeded"
      }
    });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
      setInputValue("write a name", validProduct.name);
      setInputValue("write a description", validProduct.description);
      setInputValue("write a Price", validProduct.price);
      setInputValue("write a quantity", validProduct.quantity);
      uploadPhoto(validProduct.photo);
      selectCategory(validProduct.category);
      selectShipping(validProduct.shipping);
    }
  );

  const submitButton = screen.getByText("CREATE PRODUCT");
  fireEvent.click(submitButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Size limit exceeded");
    })
  });
});
