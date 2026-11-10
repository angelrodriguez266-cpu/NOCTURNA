import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LightboxProvider } from './context/LightboxContext';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <LightboxProvider>
            <Routes>
              {/* Vista pública principal (Migrada 1:1 con datos dinámicos) */}
              <Route path="/" element={<Home />} />

              {/* Login de Administrador */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* Dashboard protegido para subir imágenes y gestionar carruseles */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LightboxProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
