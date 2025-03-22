import React, { useState, useContext, createContext, useEffect } from "react";

const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    let existingCartItem = localStorage.getItem("cart");
    if (existingCartItem) {
      try {
        const parsedCartItem = JSON.parse(existingCartItem);
        if (!Array.isArray(parsedCartItem)) throw new Error("Cart is not an array");
        setCart(parsedCartItem);
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  return (
    <CartContext.Provider value={[cart, setCart]}>
      {children}
    </CartContext.Provider>
  );
};

// custom hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider };