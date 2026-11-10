import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signIn, user, isConfigured } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al autenticar. Verifica tu correo y contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#0d0d0d',
      backgroundImage: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.95)), url('/Images/Texturadefondo-opt.jpg')",
      backgroundSize: 'cover',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(18, 18, 18, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        padding: '36px 30px',
        position: 'relative'
      }}>
        {/* Glow corner line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #ff3366, #ff0055, #ff3366)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
            <img src="/Images/Logo.png" alt="NØCTURNA" style={{ height: '38px', objectFit: 'contain' }} />
          </Link>
          <h2 style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: '1.8rem',
            letterSpacing: '1px',
            color: '#ffffff',
            margin: '0 0 6px 0'
          }}>
            PANEL DE ADMINISTRACIÓN
          </h2>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.78rem',
            color: '#888',
            letterSpacing: '1.5px',
            display: 'block'
          }}>
            EXCLUSIVO // NØCTURNA® ADMIN
          </span>
        </div>

        {!isConfigured && (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(255, 170, 0, 0.12)',
            border: '1px solid #ffaa00',
            color: '#ffdd88',
            fontSize: '0.82rem',
            fontFamily: "'IBM Plex Mono', monospace",
            marginBottom: '20px',
            lineHeight: 1.4
          }}>
            ⚠️ <strong>Configuración pendiente:</strong> Recuerda configurar tus variables <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en el archivo <code>.env</code> para conectar con Supabase.
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(255, 51, 102, 0.15)',
            border: '1px solid #ff3366',
            color: '#ff6699',
            fontSize: '0.85rem',
            fontFamily: "'IBM Plex Mono', monospace",
            marginBottom: '20px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.75rem',
              color: '#aaa',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              EMAIL ADMIN
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nocturna.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#141414',
                border: '1px solid #2a2a2a',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: "'Space Grotesk', sans-serif",
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.75rem',
              color: '#aaa',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              CONTRASEÑA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#141414',
                border: '1px solid #2a2a2a',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: "'Space Grotesk', sans-serif",
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-street"
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '14px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              textAlign: 'center'
            }}
          >
            {submitting ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.8rem',
              color: '#777',
              textDecoration: 'none',
              letterSpacing: '1px'
            }}
          >
            ← REGRESAR A LA TIENDA PÚBLICA
          </Link>
        </div>
      </div>
    </div>
  );
}
