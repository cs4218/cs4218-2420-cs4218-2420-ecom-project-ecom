import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Policy from "./Policy";

jest.mock("../components/Layout", () => ({ title, children }) => <div data-testid="layout-test" data-title={title}>{children}</div>);

describe("Policy Page", () => {
  it("Should render the Layout component with title", () => {
    render(<Policy />);
    const layout = screen.getByTestId("layout-test");
    expect(layout).toBeInTheDocument();
    expect(layout.getAttribute("data-title")).toMatch(/Policy/gi);
  });
});