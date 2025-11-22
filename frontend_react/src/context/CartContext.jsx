import { createContext, useContext, useState, useMemo } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]); // [{ product, quantity }]

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.product.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.product.id === product.id
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((p) => p.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const getQuantity = (productId) => {
    const found = items.find((i) => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    total,
    getQuantity,   // NEW
  };


  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
};
