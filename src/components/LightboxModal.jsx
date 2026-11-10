import React, { useEffect } from 'react';
import { useLightbox } from '../context/LightboxContext';

export default function LightboxModal() {
  const { isOpen, imageSrc, caption, closeLightbox } = useLightbox();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox]);

  if (!isOpen) return null;

  return (
    <div
      className="lightbox-modal active"
      id="lightboxModal"
      role="dialog"
      onClick={(e) => {
        if (e.target.id === 'lightboxModal') closeLightbox();
      }}
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
        <img
          src={imageSrc}
          alt={caption || 'Poster NØCTURNA Ampliado'}
          className="lightbox-img"
          id="lightboxImg"
        />
        <div className="lightbox-caption" id="lightboxCaption">
          {caption}
        </div>
      </div>
    </div>
  );
}
