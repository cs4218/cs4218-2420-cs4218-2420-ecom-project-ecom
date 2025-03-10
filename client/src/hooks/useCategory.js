import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function useCategory() {
  const [categories, setCategories] = useState([]);

  //get cat
  const getCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      setCategories(data?.category);
    } catch (error) {
      toast.error("Something went wrong while getting categories");
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return categories;
}