import React from 'react';

export default function Hero() {
  const scrollToDrop = (e) => {
    e.preventDefault();
    const elem = document.getElementById('new-drop');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg-container">
        <video
          className="hero-bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/Images/Banner.jpg"
          aria-hidden="true"
        >
          <source src="/videos/nocturna-banner-animado.mp4" type="video/mp4" />
        </video>
        <img
          src="/Images/Banner.jpg"
          alt="NØCTURNA - La Noche Siempre Nos Pertenece"
          className="hero-bg-img hero-bg-fallback"
        />
        <div className="hero-overlay"></div>
        <div className="hero-overlay-bottom"></div>
      </div>

      <div className="container">
        <div className="hero-content">
          <span className="hero-tag">STREETWEAR // CULTURE AFTER DARK</span>

          <h1 className="hero-title">
            LA NOCHE<br />
            <span className="highlight-always">SIEMPRE</span> NOS
          </h1>

          {/* Imagen tipográfica original "PERTENECE" */}
          <div className="script-pertenece-wrap">
            <img
              src="/Images/TEXTO-PERTENECE.png"
              alt="PERTENECE"
              className="script-pertenece-img"
            />
          </div>

          <div className="hero-actions">
            <a href="#new-drop" className="btn-street" onClick={scrollToDrop}>
              EXPLORAR COLECCIÓN
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
