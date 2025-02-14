import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory";

jest.mock('axios');

describe('useCategory hook', () => {
  it('should return a list of categories', async () => {
    const expectedCategories = {
      category: ["Category1", "Category2", "Category3"],  
    }
    axios.get.mockResolvedValue({data: expectedCategories});
    
    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual(expectedCategories.category);
    });
  });

  it('should return an empty list for no categories', async () => {
    const expectedCategories = {
      category: [],
    }
    axios.get.mockResolvedValue({data: expectedCategories});

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('should handle API errors', async () => {
    const apiError = new Error("Mock API Error");
    axios.get.mockRejectedValue(apiError);
    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {}); // silence log outputs in test

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
    expect(logSpy).toHaveBeenCalledWith(apiError);

    logSpy.mockRestore();
  });
});