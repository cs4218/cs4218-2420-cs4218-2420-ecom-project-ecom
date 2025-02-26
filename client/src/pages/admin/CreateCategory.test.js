import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from "axios";
import React from 'react';
import toast from 'react-hot-toast';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CreateCategory from './CreateCategory';

const mockCategory = {_id: "67a21772a6d9e00ef2ac022a", name: "Electronics" };

const mockAPIReturn = {
  data: {
    success: true,
    category: [mockCategory]
  }
}

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
jest.spyOn(console, 'log').mockImplementation(() => {}); // silence log outputs in test

jest.mock('../../components/Layout', () => ({ children }) => {
  return <div>{children}</div>
});

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/dashboard/admin/create-category']}>
      <Routes>
        <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Render CreateCategory page', () => {
  beforeEach(() => {
      jest.clearAllMocks();
      axios.get.mockResolvedValue(mockAPIReturn);
  });

  it('renders empty CreateCategory page correctly', async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: []
      }
    });

    renderComponent();
  
    await waitFor(() => {
      expect(screen.getByText("Manage Category")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Enter new category')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should have empty inputs initially', async () => {
    renderComponent();
  
    await waitFor(() => {
      expect(screen.getByText("Manage Category")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Enter new category').value).toBe("");
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders categories on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Edit")).toHaveLength(1);
    expect(screen.getAllByText("Delete")).toHaveLength(1);
  });

  it('should render empty list of categories for internal err', async () => {
    axios.get.mockRejectedValueOnce(new Error("Internal Server Error"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.queryAllByRole("td")).toHaveLength(0);
    expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory");
  })
});

describe('CreateCategory Component -- Create Category', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue(mockAPIReturn); 
  });

  it('should allow users to enter new category', async () => {
    renderComponent();
  
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
    fireEvent.change(screen.getByPlaceholderText('Enter new category'), { target: { value: 'New Category' } });
    expect(screen.getByPlaceholderText('Enter new category').value).toBe('New Category');
  });
  
  it('should allow users to create new category', async () => {
    axios.post.mockResolvedValueOnce(
      { data:
        { success: true, message: "" }
      });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter new category'), { target: { value: 'New Category' } });
    fireEvent.click(screen.getByText("Submit"));
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("New Category is created");
    });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/category/create-category"),         // api endpoint
      { name: "New Category" }    // request body
    );
  });

  it('should prevent users from creating empty category', async () => {
    axios.post.mockRejectedValueOnce(new Error("Name is required error"));

    renderComponent();

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("somthing went wrong in input form");
    });
  });

  it('should prevent users from creating duplicate category', async () => {
    const msg = "Category already exists";
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: msg
      }
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter new category'), { target: { value: 'Electronics' } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(msg);
    });
  });
});

describe('CreateCategory Component -- Edit Category', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue(mockAPIReturn);
  });

  it('should present modal on click Edit', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    expect(screen.getByText("Edit")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Edit"));

    const editCategoryModal = screen.getByRole('dialog');
    expect(within(editCategoryModal).getByRole('textbox')).toBeInTheDocument();
    expect(within(editCategoryModal).getByText('Submit')).toBeInTheDocument();
  });

  it('should have close modal button', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    expect(screen.getByText("Edit")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Edit"));

    const editCategoryModal = screen.getByRole('dialog');
    const closeButton = within(editCategoryModal).getByLabelText("Close");

    expect(closeButton).toBeInTheDocument();
  })

  it('should close modal', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));
    const editCategoryModal = screen.getByRole('dialog');
    const closeButton = within(editCategoryModal).getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(editCategoryModal).not.toBeVisible();
  })

  it('should present form with selected category', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Edit"));

    const editCategoryModal = screen.getByRole('dialog');
    expect(within(editCategoryModal).getByRole('textbox').value).toBe('Electronics');
  });

  it('should allow user to enter new category', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Edit"));

    const editCategoryTextBox = within(screen.getByRole('dialog')).getByRole('textbox');
    fireEvent.change(editCategoryTextBox, { target: { value: "Furniture" }});

    expect(editCategoryTextBox.value).toBe("Furniture");
  });

  it('should allow user to submit new category', async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Category Updated Successfully",
        category: {
          ...mockCategory,
          name: "Furniture" 
        },
      }
    })
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));
    const editCategoryTextBox = within(screen.getByRole('dialog')).getByRole('textbox');
    const editCategorySubmit = within(screen.getByRole('dialog')).getByText('Submit');
    fireEvent.change(editCategoryTextBox, { target: { value: "Furniture" }});
    fireEvent.click(editCategorySubmit);

    await waitFor(() => {
      expect(toast.success).toBeCalled();
    });
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining("67a21772a6d9e00ef2ac022a"),
      { name: "Furniture" }
    );
  })

  it('should show error toast on invalid inputs', async () => {
    axios.put.mockRejectedValueOnce(new Error("Name is required error"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Edit"));
    const editCategoryTextBox = within(screen.getByRole('dialog')).getByRole('textbox');
    const editCategorySubmit = within(screen.getByRole('dialog')).getByText('Submit');
    
    fireEvent.change(editCategoryTextBox, { target: { value: "" }}); 
    fireEvent.click(editCategorySubmit);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
    });
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v1/category/update-category/${mockCategory._id}`),
      { name: "" }
    );
  });
});

describe('CreateCategory component -- delete category', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue(mockAPIReturn);
  });

  it("should delete selected category", async () => {
    axios.delete.mockResolvedValue({
      data: {
        success: true,
        message: "Categry Deleted Successfully",
      }
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(`category is deleted`);
    });
    expect(axios.delete)
      .toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/category/delete-category/${mockCategory._id}`)
      );
  });

  it('shows error message for backend errors', async () => {
    axios.delete.mockRejectedValueOnce(new Error("Internal Server Error"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
    });
    expect(axios.delete)
      .toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/category/delete-category/${mockCategory._id}`)
      );
  })
})