import { useState, useEffect } from "react";
import axios from "axios";

export default function useCategory() {
  const [categories, setCategories] = useState([]);

  //get cat
  const getCategories = async () => {
    try {
      const response = await axios.get("/api/v1/category/get-category");
      if (response && response.data) {
        setCategories(response.data);
      } else {
        console.error('No data found in response');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  useEffect(() => {
    getCategories();
  }, []);

  return categories;
}