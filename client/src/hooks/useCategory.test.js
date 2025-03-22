import React from "react";
import useCategory from "./useCategory";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import { renderHook, waitFor } from "@testing-library/react";

jest.mock("axios");

describe("Test useCategory hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("correctly supplies category on succesful API call", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        category: [
          { _id: 1, name: "cat_1" },
          { _id: 2, name: "cat_2" },
        ],
      },
    });
    const { result } = renderHook(() => useCategory());

    expect(axios.get).toHaveBeenCalled();
    await waitFor(() =>
      expect(result.current).toEqual([
        { _id: 1, name: "cat_1" },
        { _id: 2, name: "cat_2" },
      ])
    );
  });
  test("Should have default empty array state when error on API call", async () => {
    const error = new Error("API call error");
    axios.get.mockRejectedValue(error);
    const { result } = renderHook(() => useCategory());
    await waitFor(() => expect(result.current).toEqual([]));
  });
});
