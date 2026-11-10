import React, { useRef, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_SHIRTS } from '../data/defaultData';
import ProductCard from './ProductCard';

export default function DropCarousel() {
  const viewportRef = useRef(null);
  const [shirts, setShirts] = useState(DEFAULT_SHIRTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShirts() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('portfolio_images')
          .select('*')
          .eq('carousel_id', 'camisas')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Error al cargar camisas desde Supabase, usando predeterminadas:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Si hay imágenes en Supabase para el carrusel de camisas
          // Mapeamos los datos dinámicos a la estructura de la tarjeta
          const dynamicShirts = data.map((item, index) => ({
            id: item.id,
            badge: item.tag || `DROP 0${(index % 9) + 1}`,
            name: item.title || `CAMISA NØCTURNA 0${index + 1}`,
            price: item.price ? Number(item.price) : 150000,
            front: item.image_url,
            back: item.image_url,
            sleeve: item.image_url,
          }));
          setShirts(dynamicShirts);
        }
      } catch (err) {
        console.warn('Excepción al consultar Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchShirts();
  }, []);

  const handlePrev = () => {
    if (!viewportRef.current) return;
    const step = viewportRef.current.clientWidth * 0.75;
    viewportRef.current.scrollBy({ left: -step, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!viewportRef.current) return;
    const step = viewportRef.current.clientWidth * 0.75;
    viewportRef.current.scrollBy({ left: step, behavior: 'smooth' });
  };

  return (
    <section className="new-drop-section" id="new-drop">
      <div className="container">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              NEW DROP<span className="star-icon">✦</span>
            </h2>
            <p className="section-subtitle">
              7 PIEZAS EXCLUSIVAS // VISTAS FRONTAL, ESPALDA Y MANGA // 100% HEAVY COTTON OVERSIZED
            </p>
          </div>

          {/* Controles de navegación del carrusel */}
          <div className="carousel-nav-controls">
            <button
              className="carousel-arrow-btn"
              id="camisasPrevBtn"
              aria-label="Anterior camisa"
              onClick={handlePrev}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="carousel-arrow-btn"
              id="camisasNextBtn"
              aria-label="Siguiente camisa"
              onClick={handleNext}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Viewport del carrusel de camisas */}
        <div className="carousel-viewport" id="camisasViewport" ref={viewportRef}>
          <div className="carousel-track">
            {shirts.map((shirt) => (
              <ProductCard key={shirt.id} item={shirt} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
