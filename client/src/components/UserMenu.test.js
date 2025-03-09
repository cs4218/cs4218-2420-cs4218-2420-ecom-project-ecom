import React from "react";
import { render} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import UserMenu from "./UserMenu.js";


describe("UserMenu Component", () => {

  it("renders UserMenu form", async () => {

    const {getByText } = render(
      <MemoryRouter initialEntries={["/user"]}>
        <Routes>
          <Route path="/user" element={<UserMenu />} />
        </Routes>
      </MemoryRouter>
    );    
  
    expect(getByText(/Dashboard/i)).toBeInTheDocument();
    const profileLink = getByText(/Profile/i);
    expect(profileLink).toBeInTheDocument();
    expect(profileLink.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/user/profile"
    );

    const ordersLink = getByText(/Orders/i);
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/user/orders"
    );

})

});
