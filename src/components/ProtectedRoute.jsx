import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#ff3366',
        fontFamily: "'IBM Plex Mono', monospace"
      }}>
        VERIFICANDO CREDENCIALES NØCTURNA...
      </div>
    );
  }

  // Si Supabase no está configurado, dejamos que el admin pueda ver una advertencia clara
  if (!isConfigured) {
    return <Navigate to="/admin" replace />;
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
