import React from 'react';

export default function CollectionBanner() {
  const scrollToDrop = (e) => {
    e.preventDefault();
    const elem = document.getElementById('new-drop');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="collection-section" id="colecciones">
      <div className="container">
        <div className="collection-banner">
          <div className="collection-media">
            <img
              src="/Images/collection-model-back.jpg"
              alt="Modelo Nøcturna espalda streetwear"
              className="collection-img"
              loading="lazy"
            />
            <div className="collection-media-overlay"></div>
          </div>

          <div className="collection-content">
            <h2 className="collection-headline">
              ENCUENTRA TU<br />
              PROPIA<span className="star-icon">✦</span>
            </h2>

            {/* Imagen tipográfica original "FRECUENCIA" */}
            <img
              src="/Images/TEXTO-FRECUENCIA.png"
              alt="FRECUENCIA"
              className="collection-frecuencia-img"
            />

            <p className="collection-desc">
              PRENDAS INSPIRADAS EN LA CULTURA URBANA, LA MÚSICA Y LA EXPRESIÓN INDIVIDUAL.
            </p>

            <div>
              <a href="#new-drop" className="btn-street" onClick={scrollToDrop}>
                EXPLORAR COLECCIÓN
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
