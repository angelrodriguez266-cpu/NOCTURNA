import React from 'react';

export default function About() {
  const scrollToContact = (e) => {
    e.preventDefault();
    const elem = document.getElementById('contacto');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="about-section" id="nosotros">
      <div className="container">
        <div className="about-grid">
          <div className="about-media-col">
            <div className="about-media">
              <img
                src="/Images/nocturna-brand-story.jpg"
                alt="Identidad Nøcturna Cultura Urbana"
                className="about-img"
                loading="lazy"
              />
            </div>
            <div className="about-script-overlay">
              <h3 className="about-title-block">MAS QUE ROPA</h3>
              {/* Imagen tipográfica original "ES CULTURA" */}
              <img
                src="/Images/TEXTO-ES-CULTURA-.png"
                alt="ES CULTURA"
                className="about-script-img"
              />
            </div>
          </div>

          <div className="about-content">
            <div className="about-text">
              <p>
                UNA MARCA INDEPENDIENTE QUE NACE DE LA NOCHE, EL ARTE Y LA CALLE.
                DISEÑAMOS PRENDAS PARA QUIENES VEN LA MODA COMO UNA FORMA DE EXPRESIÓN.
              </p>
              <p>
                NØCTURNA nace de la conexión entre la moda, la música y la cultura urbana.
                Un espacio donde el arte y la expresión individual se convierten en identidad.
                No seguimos tendencias, construimos nuestra propia frecuencia.
              </p>
            </div>
            <div>
              <a href="#contacto" className="btn-street" onClick={scrollToContact}>
                CONOCER MÁS
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
