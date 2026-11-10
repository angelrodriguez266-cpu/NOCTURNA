import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 4000);
  };

  const handleNavClick = (e, targetId) => {
    const elem = document.getElementById(targetId);
    if (elem) {
      e.preventDefault();
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer" id="contacto">
      <div className="container">
        <div className="footer-top">
          {/* Marca y Navegación */}
          <div className="footer-brand-col">
            <div className="footer-logo-wrap">
              <img src="/Images/Logo.png" alt="NØCTURNA" className="footer-logo-img" />
              <span className="star-icon">✦</span>
            </div>
            <p className="footer-slogan">CULTURE AFTER DARK.</p>
            <ul className="footer-nav-simple">
              <li>
                <a href="#new-drop" onClick={(e) => handleNavClick(e, 'new-drop')}>
                  Shop
                </a>
              </li>
              <li>
                <a href="#colecciones" onClick={(e) => handleNavClick(e, 'colecciones')}>
                  Colecciones
                </a>
              </li>
              <li>
                <a href="#posters" onClick={(e) => handleNavClick(e, 'posters')}>
                  Posters
                </a>
              </li>
              <li>
                <a href="#nosotros" onClick={(e) => handleNavClick(e, 'nosotros')}>
                  Nosotros
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                  TikTok
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter-col">
            <h4 className="newsletter-title">SUSCRÍBETE</h4>
            <p className="newsletter-desc">NOVEDADES, LANZAMIENTOS Y EDICIONES ESPECIALES.</p>

            <form className="newsletter-form" id="newsletterForm" onSubmit={handleSubmit}>
              <input
                type="email"
                id="newsletterEmail"
                className="newsletter-input"
                placeholder="CORREO ELECTRÓNICO"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-submit" aria-label="Suscribirse">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </form>
            {submitted && (
              <div className="newsletter-msg" style={{ display: 'block', color: 'var(--color-primary-neon)', marginTop: '8px', fontSize: '0.85rem' }}>
                ¡GRACIAS POR SUSCRIBIRTE A NØCTURNA!
              </div>
            )}
          </div>
        </div>

        {/* Barra inferior Copyright y Legal */}
        <div className="footer-bottom">
          <span className="copyright-text">© 2026 NØCTURNA®. ALL RIGHTS RESERVED.</span>
          <ul className="footer-legal-links">
            <li><a href="#privacy" onClick={(e) => e.preventDefault()}>POLÍTICA DE PRIVACIDAD</a></li>
            <li><a href="#terms" onClick={(e) => e.preventDefault()}>TÉRMINOS Y CONDICIONES</a></li>
            <li><a href="#shipping" onClick={(e) => e.preventDefault()}>ENVÍOS Y CAMBIOS</a></li>
            <li>
              <Link to="/admin" style={{ opacity: 0.6, fontSize: '0.75rem', marginLeft: '12px' }}>
                [PANEL ADMIN]
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
