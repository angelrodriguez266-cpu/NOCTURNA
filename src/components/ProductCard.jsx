import React, { useState, useEffect } from 'react';
import { useCart, formatCOP } from '../context/CartContext';

export default function ProductCard({
  item = {},
  images = [
    item.frontal || item.front,
    item.espalda || item.back,
    item.manga || item.sleeve,
  ],
}) {
  const { addToCart } = useCart();

  // 1. Manejo de Estado (0 = Frontal, 1 = Espalda, 2 = Manga)
  const [viewIndex, setViewIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const viewNames = ['FRONTAL', 'ESPALDA', 'MANGA'];

  // Asegurar que siempre tengamos un array válido de 3 vistas
  const resolvedImages = images && images.length > 0
    ? images
    : [
        item.frontal || item.front,
        item.espalda || item.back,
        item.manga || item.sleeve,
      ];

  // 2. Ciclo Automático (Autoplay) cada 2.5 segundos si no está en hover
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setViewIndex((prev) => (prev + 1) % 3);
    }, 2500);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart({
      name: item.name || item.title || 'CAMISA NØCTURNA',
      price: item.price ? Number(item.price) : 150000,
      image: resolvedImages[viewIndex] || resolvedImages[0],
    });
  };

  return (
    // 3. Pausa al Hover: eventos onMouseEnter y onMouseLeave en el contenedor
    <article
      className="product-slide-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="product-badge">{item.badge || item.tag || 'DROP'}</span>
      <span className="product-view-tag">{viewNames[viewIndex]}</span>

      <div className="product-media-container">
        {/* 4. La imagen principal muestra images[viewIndex] */}
        <img
          key={`${item.id || item.name}-${viewIndex}`}
          src={resolvedImages[viewIndex] || resolvedImages[0]}
          alt={`${item.name || item.title || 'Camiseta Nøcturna'} - ${viewNames[viewIndex]}`}
          className="product-img-display"
          loading="lazy"
        />

        {/* 5. Cambio Manual: onMouseEnter en cada botón fuerza el cambio inmediato */}
        <div className="product-views-nav">
          {viewNames.map((name, idx) => (
            <button
              key={name}
              type="button"
              className={`view-dot-btn ${viewIndex === idx ? 'active' : ''}`}
              onMouseEnter={() => setViewIndex(idx)}
              onClick={(e) => {
                e.stopPropagation();
                setViewIndex(idx);
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
