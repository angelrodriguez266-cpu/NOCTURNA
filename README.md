# NØCTURNA® | Culture After Dark - React & Supabase Migration

Galería y e-commerce streetwear migrado de HTML/CSS/JS estático a **React 18 + Vite + Supabase**, conservando con exactitud el 100% del diseño, tipografías, animaciones y estilos originales.

---

## 🚀 Inicio Rápido en Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Crea o edita el archivo `.env` en la raíz con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=TU_ANON_KEY_PUBLICA
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗄️ Configuración de Supabase

1. Abre el panel de tu proyecto en [Supabase](https://app.supabase.com).
2. Ve al **SQL Editor** y ejecuta el script completo que se encuentra en [supabase_schema.sql](supabase_schema.sql).
3. **Crear usuario Administrador:**
   - Ve a **Authentication > Users** en Supabase.
   - Haz clic en **Add User > Create User**.
   - Ingresa un email y una contraseña (ej. `admin@nocturna.com`).
   - Usa estas credenciales para iniciar sesión en la ruta `/admin`.

---

## 🔐 Rutas de la Aplicación

- `/` : Landing page oficial de **NØCTURNA®** con:
  - Carrusel 1 dinámico: **NEW DROP** (Rotación automática de 3 vistas, pausa en hover, agregar al carrito).
  - Carrusel 2 dinámico: **POSTERS** (Galería con apertura en Lightbox Modal).
  - Carrito lateral deslizante interactivo con cálculo en COP.
- `/admin` : Formulario de inicio de sesión de Administrador con Supabase Auth.
- `/dashboard` : Panel protegido de administración:
  - Formulario para subir imágenes a `portfolio_bucket` en Supabase Storage.
  - Asignación de carrusel (`camisas` o `posters`), títulos, tags y precios.
  - Listado en vivo de imágenes registradas con botón para eliminar de la BD y de Storage.

---

## 🌐 Despliegue en Vercel

El proyecto está configurado **Vercel-Ready**:
- Incluye `vercel.json` para manejo de rutas SPA (evita errores 404 al recargar `/admin` o `/dashboard`).
- En el panel de Vercel (**Project Settings > Environment Variables**), agrega:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Comando de compilación: `npm run build`
- Directorio de salida: `dist`

## Motion Graphics / Motion Design

La landing incorpora un sistema de movimiento editorial inspirado en la dirección visual de NØCTURNA:
- Entrada cinematográfica del hero con revelado escalonado de titulares e imagen.
- Cinta tipográfica continua con mensajes de marca.
- Aparición progresiva de secciones, tarjetas de producto y posters al entrar en pantalla.
- Microinteracciones en productos, navegación, botones y controles.
- Indicador superior del progreso de lectura.
- Respeto por `prefers-reduced-motion` para visitantes que reducen las animaciones desde su sistema.

Las animaciones se implementan con CSS, `IntersectionObserver` y APIs nativas del navegador, sin añadir dependencias de animación. El carrito, las rutas y las consultas existentes a Supabase se mantienen.


## Banner animado integrado

El hero principal reproduce automáticamente el video `public/videos/nocturna-banner-animado.mp4` en bucle, sin audio y con reproducción inline. La imagen `public/Images/Banner.jpg` se utiliza como poster y como alternativa para usuarios con `prefers-reduced-motion`. Para reemplazarlo, conserva el nombre y la ruta del archivo MP4 o actualiza el `<source>` en `src/components/Hero.jsx`.
