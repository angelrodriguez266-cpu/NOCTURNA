import React from 'react';
import { useCart } from '../context/CartContext';

export default function ToastNotice() {
  const { toastMsg } = useCart();

  return (
    <div
      className={`toast-notice ${toastMsg ? 'show' : ''}`}
      id="toastNotice"
      role="status"
      aria-live="polite"
    >
      {toastMsg}
    </div>
  );
}
