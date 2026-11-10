import React, { useState, useEffect, useRef } from 'react';
import { useCart, formatCOP } from '../context/CartContext';

export default function ProductCard({ item }) {
  const { addToCart } = useCart();
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const views = [
    item.front || item.image_url,
    item.back || item.front || item.image_url,
    item.sleeve || item.front || item.image_url,
  ];
  const viewNames = ['FRONTAL', 'ESPALDA', 'MANGA'];

  // Auto ciclo cada 3.2s mientras no esté en hover
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentViewIndex((prev) => (prev + 1) % 3);
    }, 3200);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart({
      name: item.name || item.title || 'CAMISA NØCTURNA',
      price: item.price ? Number(item.price) : 150000,
      image: views[currentViewIndex] || views[0],
    });
  };

  return (
    <article
      className="product-slide-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="product-badge">{item.badge || item.tag || 'DROP'}</span>
      <span className="product-view-tag">{viewNames[currentViewIndex]}</span>

      <div className="product-media-container">
        <img
          src={views[currentViewIndex]}
          alt={item.name || item.title || 'Camiseta Nøcturna'}
          className="product-img-display"
          loading="lazy"
        />

        {/* Selectores de vista manual */}
        <div className="product-views-nav">
          {viewNames.map((name, idx) => (
            <button
              key={name}
              type="button"
              className={`view-dot-btn ${currentViewIndex === idx ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentViewIndex(idx);
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <button
          className="quick-add-btn"
          onClick={handleQuickAdd}
          aria-label={`Agregar ${item.name || item.title} al carrito`}
        >
          + AGREGAR AL CARRITO
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-name">{item.name || item.title}</h3>
        <span className="product-price">{formatCOP(item.price || 150000)}</span>
      </div>
    </article>
  );
}
