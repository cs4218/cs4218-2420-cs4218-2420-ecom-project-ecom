import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import Layout from "../components/Layout";
const Categories = () => {
  const categories = useCategory();
  return (
    <Layout title={"All Categories"}>
      <main className="container" aria-label="categories container">
        <ul className="row" aria-label="categories list">
          {categories.map((c) => (
            <li className="col-md-6 mt-5 mb-3 gx-3 gy-3" key={c._id} aria-label="category item">
              <Link to={`/category/${c.slug}`} className="btn btn-primary">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
};

export default Categories;
