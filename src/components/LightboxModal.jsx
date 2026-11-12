import React, { useEffect, useRef, useState } from 'react';
import { useLightbox } from '../context/LightboxContext';

const LENS_SIZE = 190;

export default function LightboxModal() {
  const { isOpen, imageSrc, caption, closeLightbox } = useLightbox();
  const imageRef = useRef(null);
  const viewportRef = useRef(null);
  const [lens, setLens] = useState({ x: 0, y: 0, visible: false, bgX: 0, bgY: 0, bgWidth: 0, bgHeight: 0 });
  const [magnification, setMagnification] = useState(2.5);

  useEffect(() => {
    setLens((current) => ({ ...current, visible: false }));
    setMagnification(2.5);
  }, [imageSrc, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === '+' || e.key === '=') setMagnification((value) => Math.min(5, Number((value + 0.25).toFixed(2))));
      if (e.key === '-') setMagnification((value) => Math.max(1.5, Number((value - 0.25).toFixed(2))));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox]);

  const updateLens = (event) => {
    const image = imageRef.current;
    const viewport = viewportRef.current;
    if (!image || !viewport) return;
    const imageRect = image.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    if (pointerX < imageRect.left || pointerX > imageRect.right || pointerY < imageRect.top || pointerY > imageRect.bottom) {
      setLens((current) => ({ ...current, visible: false }));
      return;
    }

    const localX = pointerX - imageRect.left;
    const localY = pointerY - imageRect.top;
    setLens({
      x: pointerX - viewportRect.left,
      y: pointerY - viewportRect.top,
      bgX: -(localX * magnification) + LENS_SIZE / 2,
      bgY: -(localY * magnification) + LENS_SIZE / 2,
      bgWidth: imageRect.width * magnification,
      bgHeight: imageRect.height * magnification,
      visible: true,
    });
  };

  const handleWheel = (event) => {
    event.preventDefault();
    setMagnification((value) => {
      const next = event.deltaY < 0 ? value + 0.25 : value - 0.25;
      return Math.min(5, Math.max(1.5, Number(next.toFixed(2))));
    });
    requestAnimationFrame(() => updateLens(event));
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
    >
      <div className="lightbox-content">
        <button className="lightbox-close" id="lightboxClose" aria-label="Cerrar modal" onClick={closeLightbox}>
          &times;
        </button>

        <div className="lightbox-zoom-controls" aria-label="Aumento de la lupa">
          <span>LUPA</span>
          <button type="button" onClick={() => setMagnification((value) => Math.max(1.5, Number((value - 0.25).toFixed(2))))} disabled={magnification <= 1.5} aria-label="Reducir aumento">−</button>
          <strong>{magnification.toFixed(2)}×</strong>
          <button type="button" onClick={() => setMagnification((value) => Math.min(5, Number((value + 0.25).toFixed(2))))} disabled={magnification >= 5} aria-label="Aumentar lupa">+</button>
          <button type="button" onClick={() => setMagnification(2.5)}>RESET</button>
        </div>

        <div
          className="lightbox-image-viewport"
          ref={viewportRef}
          onPointerMove={updateLens}
          onPointerLeave={() => setLens((current) => ({ ...current, visible: false }))}
          onPointerDown={updateLens}
          onWheel={handleWheel}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt={caption || 'Poster NØCTURNA Ampliado'}
            className="lightbox-img"
            id="lightboxImg"
            draggable="false"
          />
          <div
            className={`lightbox-magnifier${lens.visible ? ' is-visible' : ''}`}
            aria-hidden="true"
            style={{
              left: lens.x,
              top: lens.y,
              width: LENS_SIZE,
              height: LENS_SIZE,
              backgroundImage: `url("${imageSrc}")`,
              backgroundSize: `${lens.bgWidth}px ${lens.bgHeight}px`,
              backgroundPosition: `${lens.bgX}px ${lens.bgY}px`,
            }}
          >
            <span className="lightbox-magnifier-crosshair" />
          </div>
        </div>

        <div className="lightbox-caption" id="lightboxCaption">{caption}</div>
        <div className="lightbox-hint">MUEVE EL CURSOR O EL DEDO SOBRE EL POSTER PARA EXPLORAR LOS DETALLES</div>
      </div>
    </div>
  );
}
