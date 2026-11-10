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
          // Ordenar por tag (DROP 01, DROP 02, ...)
          const sortedData = [...data].sort((a, b) => (a.tag || '').localeCompare(b.tag || ''));

          const dynamicShirts = sortedData.map((item, index) => {
            const defaultShirt = DEFAULT_SHIRTS.find((s) => s.badge === item.tag) || DEFAULT_SHIRTS[index] || {};

            // Si la URL viene de Supabase Storage con el patrón front_frontal.jpg,
            // derivamos las vistas back_espalda y sleeve_manga que fueron subidas al bucket.
            const isSupabaseStorageUrl = item.image_url?.includes('front_frontal.jpg');

            const frontalUrl = item.image_url || defaultShirt.frontal;
            const espaldaUrl = isSupabaseStorageUrl
              ? item.image_url.replace('front_frontal.jpg', 'back_espalda.jpg')
              : (defaultShirt.espalda || item.image_url);
            const mangaUrl = isSupabaseStorageUrl
              ? item.image_url.replace('front_frontal.jpg', 'sleeve_manga.jpg')
              : (defaultShirt.manga || item.image_url);

            return {
              id: item.id,
              badge: item.tag || `DROP 0${(index % 9) + 1}`,
              name: item.title || defaultShirt.name || `CAMISA NØCTURNA 0${index + 1}`,
              price: item.price ? Number(item.price) : (defaultShirt.price || 150000),
              frontal: frontalUrl,
              espalda: espaldaUrl,
              manga: mangaUrl,
            };
          });

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
              <ProductCard
                key={shirt.id}
                item={shirt}
                images={[shirt.frontal, shirt.espalda, shirt.manga]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
