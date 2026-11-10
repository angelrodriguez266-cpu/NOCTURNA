import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});

export const formatCOP = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nocturna_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('nocturna_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('No se pudo guardar carrito en localStorage', e);
    }
  }, [cart]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 2800);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === product.name);
      if (existing) {
        return prev.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`+1 ${product.name} AGREGADO`);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        isOpen,
        setIsOpen,
        totalItems,
        subtotal,
        toastMsg,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
