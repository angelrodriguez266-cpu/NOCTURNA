import React, { useRef, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_POSTERS } from '../data/defaultData';
import { useLightbox } from '../context/LightboxContext';

export default function PostersCarousel() {
  const viewportRef = useRef(null);
  const [posters, setPosters] = useState(DEFAULT_POSTERS);
  const [loading, setLoading] = useState(true);
  const { openLightbox } = useLightbox();

  useEffect(() => {
    async function fetchPosters() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('portfolio_images')
          .select('*')
          .eq('carousel_id', 'posters')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Error al cargar posters desde Supabase, usando predeterminados:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const mondayPosterPath = '/Images/Posters/optimized/Poster-Monday.webp';
          const dynamicPosters = data.map((item, index) => {
            const isMonday = `${item.title || ''} ${item.tag || ''}`.toLowerCase().includes('monday');
            return {
              id: item.id,
              thumb: isMonday ? mondayPosterPath : item.image_url,
              full: isMonday ? mondayPosterPath : item.image_url,
              alt: item.title || `Poster Nøcturna ${index + 1}`,
              tag: item.tag || 'LIMITED EDITION',
              title: item.title || `POSTER NØCTURNA 0${index + 1}`,
            };
          });

          if (!dynamicPosters.some((poster) => poster.thumb === mondayPosterPath)) {
            dynamicPosters.push({
              id: 'poster-monday-local',
              thumb: mondayPosterPath,
              full: mondayPosterPath,
              alt: 'Poster Monday W Sound',
              tag: 'MUSIC DROP',
              title: 'MONDAY W SOUND',
            });
          }

          setPosters(dynamicPosters);
        }
      } catch (err) {
        console.warn('Excepción al consultar posters en Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosters();
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
    <section className="posters-section" id="posters">
      <div className="container">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              POSTERS<span className="star-icon">✦</span>
            </h2>
            <p className="section-subtitle">
              13 PIEZAS GRÁFICAS COLECCIONABLES // EDICIÓN LIMITADA STREETWEAR & MÚSICA
            </p>
          </div>

          {/* Controles de navegación del carrusel de posters */}
          <div className="carousel-nav-controls">
            <button
              className="carousel-arrow-btn"
              id="postersPrevBtn"
              aria-label="Anterior poster"
              onClick={handlePrev}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="carousel-arrow-btn"
              id="postersNextBtn"
              aria-label="Siguiente poster"
              onClick={handleNext}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Viewport del carrusel de posters */}
        <div className="carousel-viewport" id="postersViewport" ref={viewportRef}>
          <div className="carousel-track">
            {posters.map((poster, idx) => (
              <div
                key={poster.id || idx}
                className="poster-slide-card"
                title="Click para ampliar"
                onClick={() => openLightbox(poster.full || poster.thumb, poster.title)}
              >
                <img
                  src={poster.thumb}
                  alt={poster.alt || poster.title}
                  className="poster-img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="poster-overlay">
                  <span className="poster-tag">{poster.tag}</span>
                  <span className="poster-title">{poster.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
