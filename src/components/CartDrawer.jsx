import React from 'react';
import { useCart, formatCOP } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeFromCart, subtotal } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    alert('Redirigiendo a pasarela de pagos segura NØCTURNA...');
  };

  return (
    <div
      className={`cart-drawer-overlay ${isOpen ? 'active' : ''}`}
      id="cartOverlay"
      onClick={(e) => {
        if (e.target.id === 'cartOverlay') setIsOpen(false);
      }}
    >
      <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Carrito de compras">
        <div className="cart-header">
          <h3 className="cart-title">CARRITO DE COMPRAS</h3>
          <button
            className="cart-close-btn"
            id="cartCloseBtn"
            aria-label="Cerrar Carrito"
            onClick={() => setIsOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="cart-body" id="cartItemsList">
          {cart.length === 0 ? (
            <div className="cart-empty-msg">Tu carrito está vacío</div>
          ) : (
            cart.map((item, index) => (
              <div className="cart-item" key={`${item.name}-${index}`}>
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    {formatCOP(item.price)} × {item.quantity}
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(index)}
                  aria-label="Eliminar producto"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-subtotal-row">
            <span className="cart-subtotal-label">SUBTOTAL</span>
            <span className="cart-subtotal-val" id="cartSubtotal">
              {formatCOP(subtotal)}
            </span>
          </div>
          <button
            className="cart-checkout-btn"
            id="cartCheckoutBtn"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            PROCEDER AL PAGO
          </button>
        </div>
      </div>
    </div>
  );
}
