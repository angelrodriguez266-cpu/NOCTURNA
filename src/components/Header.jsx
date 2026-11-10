import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUserClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/admin');
    }
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logotipo NØCTURNA® */}
        <a href="/" className="header-brand" aria-label="NØCTURNA Inicio">
          <img src="/Images/Logo.png" alt="NØCTURNA Logo" className="brand-logo-img" />
        </a>

        {/* Navegación Principal */}
        <nav className="site-nav">
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} id="mainNav">
            <li>
              <a href="#new-drop" className="nav-link" onClick={(e) => handleNavClick(e, 'new-drop')}>
                SHOP
              </a>
            </li>
            <li>
              <a href="#colecciones" className="nav-link" onClick={(e) => handleNavClick(e, 'colecciones')}>
                COLECCIONES
              </a>
            </li>
            <li>
              <a href="#posters" className="nav-link" onClick={(e) => handleNavClick(e, 'posters')}>
                POSTERS
              </a>
            </li>
            <li>
              <a href="#nosotros" className="nav-link" onClick={(e) => handleNavClick(e, 'nosotros')}>
                NOSOTROS
              </a>
            </li>
            <li>
              <a href="#contacto" className="nav-link" onClick={(e) => handleNavClick(e, 'contacto')}>
                CONTACTO
              </a>
            </li>
          </ul>
        </nav>

        {/* Acciones de Cabecera */}
        <div className="header-actions">
          {/* Búsqueda */}
          <button
            className="action-btn"
            aria-label="Buscar"
            onClick={(e) => handleNavClick(e, 'new-drop')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* Usuario / Admin */}
          <button
            className="action-btn"
            aria-label="Cuenta de usuario / Admin"
            onClick={handleUserClick}
            title={user ? 'Ir al Dashboard de Administración' : 'Iniciar Sesión Admin'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          {/* Carrito */}
          <button
            className="action-btn cart-btn"
            id="cartToggleBtn"
            aria-label="Abrir Carrito"
            onClick={() => setIsOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-7z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="cart-badge" id="cartBadge">
              {totalItems}
            </span>
          </button>

          {/* Menú Móvil Hamburger */}
          <button
            className="mobile-menu-btn"
            id="mobileMenuToggle"
            aria-label="Abrir Menú"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
