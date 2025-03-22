import React from "react";
import Categories from "./Categories";
import Layout from "../components/Layout";
import useCategory from "../hooks/useCategory";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../hooks/useCategory", () => jest.fn());
jest.mock("../components/Layout", () => ({ children }) => (
  <div>
    <div>Mock Layout</div> {children}
  </div>
));
jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));
describe("Categories page test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should render retrieved categories correctly", () => {
    useCategory.mockReturnValue([
      { _id: 1, name: "cat_1", slug: "cat_1_slug" },
      { _id: 2, name: "cat_2", slug: "cat_2_slug" },
    ]);
    render(<Categories />);
    expect(screen.getByText("cat_1")).toBeInTheDocument();
    expect(screen.getByText("cat_2")).toBeInTheDocument();
    expect(screen.getByText("Mock Layout")).toBeInTheDocument();
  });
});
