import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCOP } from '../context/CartContext';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Estados del formulario
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [carouselId, setCarouselId] = useState('camisas');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [price, setPrice] = useState('150000');
  const [viewType, setViewType] = useState('front');

  // Estados de control y feedback
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Lista de imágenes existentes en la BD
  const [imagesList, setImagesList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filterCarousel, setFilterCarousel] = useState('all');

  const fetchImages = async () => {
    if (!isSupabaseConfigured()) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImagesList(data || []);
    } catch (err) {
      console.error('Error al obtener imágenes:', err);
      setStatusMsg({ type: 'error', text: 'No se pudo cargar la lista de imágenes.' });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMsg({ type: 'error', text: 'Por favor selecciona un archivo de imagen.' });
      return;
    }

    setUploading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      // 1. Sanitizar nombre de archivo y preparar path
      const fileExt = selectedFile.name.split('.').pop();
      const sanitizedName = selectedFile.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;
      const filePath = `${carouselId}/${fileName}`;

      // 2. Subir imagen al Bucket 'portfolio_bucket' en Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio_bucket')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Error en Storage: ${uploadError.message}`);
      }

      // 3. Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('portfolio_bucket')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // 4. Insertar registro en la tabla 'portfolio_images'
      const { data: insertData, error: insertError } = await supabase
        .from('portfolio_images')
        .insert([
          {
            image_url: imageUrl,
            carousel_id: carouselId,
            title: title.trim() || (carouselId === 'camisas' ? 'NUEVA CAMISA' : 'NUEVO POSTER'),
            tag: tag.trim() || (carouselId === 'camisas' ? 'NEW DROP' : 'LIMITED EDITION'),
            view_type: viewType,
            price: carouselId === 'camisas' ? Number(price) || 150000 : 0,
          },
        ])
        .select();

      if (insertError) {
        throw new Error(`Error en Base de Datos: ${insertError.message}`);
      }

      // Éxito: limpiar formulario y refrescar lista
      setStatusMsg({ type: 'success', text: '¡Imagen subida y registrada con éxito en Supabase!' });
      setSelectedFile(null);
      setPreviewUrl('');
      setTitle('');
      setTag('');
      fetchImages();
    } catch (err) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Ocurrió un error al subir la imagen.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${item.title || 'esta imagen'}"?`)) {
      return;
    }

    try {
      // 1. Intentar extraer el path en storage
      try {
        const urlParts = item.image_url.split('/portfolio_bucket/');
        if (urlParts.length > 1) {
          const storagePath = decodeURIComponent(urlParts[1]);
          await supabase.storage.from('portfolio_bucket').remove([storagePath]);
        }
      } catch (stErr) {
        console.warn('No se pudo borrar del bucket:', stErr);
      }

      // 2. Eliminar registro de la tabla
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      setStatusMsg({ type: 'success', text: 'Registro eliminado correctamente.' });
      setImagesList((prev) => prev.filter((img) => img.id !== item.id));
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Error al eliminar el registro.' });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  const filteredImages = imagesList.filter((item) => {
    if (filterCarousel === 'all') return true;
    return item.carousel_id === filterCarousel;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      color: '#fff',
      fontFamily: "'Space Grotesk', sans-serif",
      padding: '24px 20px 80px'
    }}>
      {/* Barra superior de administración */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/Images/Logo.png" alt="NØCTURNA Logo" style={{ height: '32px' }} />
          <div>
            <h1 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: '1.6rem',
              margin: 0,
              letterSpacing: '1px'
            }}>
              PANEL DE CONTROL // NØCTURNA®
            </h1>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.75rem',
              color: '#888'
            }}>
              ADMIN: {user?.email || 'MODO LOCAL'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/"
            target="_blank"
            className="btn-street"
            style={{
              padding: '10px 18px',
              fontSize: '0.78rem',
              textDecoration: 'none'
            }}
          >
            VER TIENDA ↗
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #ff3366',
              color: '#ff3366',
              padding: '10px 18px',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.78rem',
              letterSpacing: '1px'
            }}
          >
            CERRAR SESIÓN
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {statusMsg.text && (
          <div style={{
            padding: '14px 18px',
            marginBottom: '28px',
            border: statusMsg.type === 'error' ? '1px solid #ff3366' : '1px solid #00ff88',
            background: statusMsg.type === 'error' ? 'rgba(255,51,102,0.1)' : 'rgba(0,255,136,0.1)',
            color: statusMsg.type === 'error' ? '#ff6699' : '#00ff88',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.85rem'
          }}>
            {statusMsg.text}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '32px'
        }}>
          {/* COLUMNA 1: FORMULARIO DE SUBIDA */}
          <section style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px',
          }}>
            <h2 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: '1.4rem',
              color: '#fff',
              marginTop: 0,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              SUBIR NUEVA IMAGEN <span style={{ color: '#ff3366' }}>✦</span>
            </h2>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Selector de Carrusel */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.75rem',
                  color: '#aaa',
                  marginBottom: '6px'
                }}>
                  DESTINO / CARRUSEL *
                </label>
                <select
                  value={carouselId}
                  onChange={(e) => setCarouselId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1c1c1c',
                    border: '1px solid #333',
                    color: '#fff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="camisas">Carrusel 1: NEW DROP (Camisas)</option>
                  <option value="posters">Carrusel 2: POSTERS (Coleccionables)</option>
                </select>
              </div>

              {/* Título de la imagen */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.75rem',
                  color: '#aaa',
                  marginBottom: '6px'
                }}>
                  TÍTULO / NOMBRE DE LA PIEZA *
                </label>
                <input
                  type="text"
                  placeholder={carouselId === 'camisas' ? 'Ej. CAMISA DARKNESS 08' : 'Ej. POSTER MEDELLIN NIGHTS'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1c1c1c',
                    border: '1px solid #333',
                    color: '#fff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Tag / Badge */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.75rem',
                  color: '#aaa',
                  marginBottom: '6px'
                }}>
                  BADGE / ETIQUETA
                </label>
                <input
                  type="text"
                  placeholder={carouselId === 'camisas' ? 'Ej. DROP 08' : 'Ej. LIMITED EDITION'}
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1c1c1c',
                    border: '1px solid #333',
                    color: '#fff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Opciones condicionales para Camisas */}
              {carouselId === 'camisas' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '0.75rem',
                      color: '#aaa',
                      marginBottom: '6px'
                    }}>
                      PRECIO (COP)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1c1c1c',
                        border: '1px solid #333',
                        color: '#fff',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '0.9rem',
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
                      marginBottom: '6px'
                    }}>
                      TIPO DE VISTA
                    </label>
                    <select
                      value={viewType}
                      onChange={(e) => setViewType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1c1c1c',
                        border: '1px solid #333',
                        color: '#fff',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="front">Frontal</option>
                      <option value="back">Espalda</option>
                      <option value="sleeve">Manga</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Selector de Archivo / Dropzone */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.75rem',
                  color: '#aaa',
                  marginBottom: '6px'
                }}>
                  ARCHIVO DE IMAGEN (JPG, PNG, WEBP) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    background: '#1c1c1c',
                    border: '1px dashed #444',
                    color: '#888',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.8rem',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <span style={{
                    display: 'block',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.75rem',
                    color: '#888',
                    marginBottom: '8px'
                  }}>
                    VISTA PREVIA
                  </span>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxHeight: '180px',
                      maxWidth: '100%',
                      objectFit: 'cover',
                      border: '1px solid #333'
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="btn-street"
                style={{
                  marginTop: '12px',
                  padding: '14px',
                  cursor: uploading ? 'wait' : 'pointer',
                  opacity: uploading ? 0.7 : 1,
                  textAlign: 'center'
                }}
              >
                {uploading ? 'SUBIENDO A SUPABASE...' : 'SUBIR A STORAGE Y REGISTRAR'}
              </button>
            </form>
          </section>

          {/* COLUMNA 2: LISTADO DE IMÁGENES EN BD */}
          <section style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <h2 style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: '1.4rem',
                color: '#fff',
                margin: 0
              }}>
                IMÁGENES EN SUPABASE ({filteredImages.length})
              </h2>

              {/* Filtro por carrusel */}
              <select
                value={filterCarousel}
                onChange={(e) => setFilterCarousel(e.target.value)}
                style={{
                  padding: '6px 12px',
                  background: '#1c1c1c',
                  border: '1px solid #333',
                  color: '#fff',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.75rem'
                }}
              >
                <option value="all">TODAS</option>
                <option value="camisas">SOLO CAMISAS</option>
                <option value="posters">SOLO POSTERS</option>
              </select>
            </div>

            {loadingList ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                color: '#888',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.85rem'
              }}>
                CARGANDO REGISTROS DE SUPABASE...
              </div>
            ) : filteredImages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#777',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.85rem',
                border: '1px dashed #262626'
              }}>
                No hay imágenes subidas en Supabase para este filtro todavía.
                <br /><br />
                <span style={{ color: '#aaa' }}>
                  (Los carruseles de la tienda muestran las piezas originales por defecto).
                </span>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '560px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      background: '#1b1b1b',
                      border: '1px solid #282828',
                      padding: '10px',
                    }}
                  >
                    <img
                      src={img.image_url}
                      alt={img.title}
                      style={{
                        width: '56px',
                        height: '56px',
                        objectFit: 'cover',
                        background: '#0a0a0a'
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {img.title}
                      </div>
                      <div style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '0.72rem',
                        color: '#888',
                        marginTop: '3px'
                      }}>
                        <span style={{ color: '#ff3366', fontWeight: 600 }}>
                          [{img.carousel_id?.toUpperCase()}]
                        </span>{' '}
                        {img.tag && `// ${img.tag}`}{' '}
                        {img.carousel_id === 'camisas' && img.price && `// ${formatCOP(img.price)}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(img)}
                      title="Eliminar de Supabase"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ff4444',
                        cursor: 'pointer',
                        padding: '6px',
                        fontSize: '1rem',
                        opacity: 0.8
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
