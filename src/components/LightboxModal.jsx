import React, { useEffect, useState } from 'react';
import { useLightbox } from '../context/LightboxContext';

export default function LightboxModal() {
  const { isOpen, imageSrc, caption, closeLightbox } = useLightbox();
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [imageSrc, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === '+' || e.key === '=') setZoom((current) => Math.min(4, current + 0.25));
      if (e.key === '-') setZoom((current) => Math.max(1, current - 0.25));
      if (e.key === '0') setZoom(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox]);

  const zoomIn = () => setZoom((current) => Math.min(4, Number((current + 0.25).toFixed(2))));
  const zoomOut = () => setZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))));

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  if (!isOpen) return null;

  return (
    <div
      className="lightbox-modal active"
      id="lightboxModal"
      role="dialog"
      aria-modal="true"
      aria-label={caption || 'Poster ampliado'}
      onClick={(e) => {
        if (e.target.id === 'lightboxModal') closeLightbox();
      }}
      onWheel={handleWheel}
    >
      <div className="lightbox-content">
        <button
          className="lightbox-close"
          id="lightboxClose"
          aria-label="Cerrar modal"
          onClick={closeLightbox}
        >
          &times;
        </button>

        <div className="lightbox-zoom-controls" aria-label="Controles de zoom">
          <button type="button" onClick={zoomOut} disabled={zoom <= 1} aria-label="Alejar">−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={zoomIn} disabled={zoom >= 4} aria-label="Acercar">+</button>
          <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} aria-label="Restablecer zoom">RESET</button>
        </div>

        <div className="lightbox-image-viewport">
          <img
            src={imageSrc}
            alt={caption || 'Poster NØCTURNA Ampliado'}
            className="lightbox-img"
            id="lightboxImg"
            style={{ transform: `scale(${zoom})` }}
            draggable="false"
          />
        </div>
        <div className="lightbox-caption" id="lightboxCaption">
          {caption}
        </div>
        <div className="lightbox-hint">USA + / − O LA RUEDA DEL RATÓN PARA HACER ZOOM · 0 PARA RESTABLECER</div>
      </div>
    </div>
  );
}
