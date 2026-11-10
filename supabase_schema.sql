-- ==============================================================================
-- NØCTURNA® - Supabase SQL Setup (portfolio_images & portfolio_bucket)
-- ==============================================================================

-- 1. CREACIÓN DE LA TABLA: portfolio_images
create table if not exists public.portfolio_images (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  image_url text not null,
  carousel_id text not null,       -- 'camisas' o 'posters'
  title text,                      -- Nombre del producto / título del poster
  tag text,                        -- Badge/categoría (ej. "DROP 01", "LIMITED EDITION")
  view_type text default 'front',  -- Para camisas: 'front', 'back', 'sleeve'
  price numeric default 0          -- Precio para sincronizar con el carrito
);

-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
alter table public.portfolio_images enable row level security;

-- Limpieza de políticas previas
drop policy if exists "Lectura publica de portfolio_images" on public.portfolio_images;
drop policy if exists "Insercion solo para usuarios autenticados" on public.portfolio_images;
drop policy if exists "Actualizacion solo para usuarios autenticados" on public.portfolio_images;
drop policy if exists "Eliminacion solo para usuarios autenticados" on public.portfolio_images;

-- POLÍTICAS RLS:
-- Lectura pública para cualquier visitante
create policy "Lectura publica de portfolio_images"
  on public.portfolio_images
  for select
  to public
  using (true);

-- Inserción exclusiva para administradores autenticados
create policy "Insercion solo para usuarios autenticados"
  on public.portfolio_images
  for insert
  to authenticated
  with check (true);

-- Actualización exclusiva para administradores autenticados
create policy "Actualizacion solo para usuarios autenticados"
  on public.portfolio_images
  for update
  to authenticated
  using (true)
  with check (true);

-- Eliminación exclusiva para administradores autenticados
create policy "Eliminacion solo para usuarios autenticados"
  on public.portfolio_images
  for delete
  to authenticated
  using (true);

-- 3. CREACIÓN Y CONFIGURACIÓN DEL BUCKET: portfolio_bucket
insert into storage.buckets (id, name, public)
values ('portfolio_bucket', 'portfolio_bucket', true)
on conflict (id) do update set public = true;

-- Limpieza de políticas en storage
drop policy if exists "Lectura publica de portfolio_bucket" on storage.objects;
drop policy if exists "Subida exclusiva para autenticados en portfolio_bucket" on storage.objects;
drop policy if exists "Actualizacion exclusiva para autenticados en portfolio_bucket" on storage.objects;
drop policy if exists "Borrado exclusivo para autenticados en portfolio_bucket" on storage.objects;

-- POLÍTICAS STORAGE:
-- Lectura pública de imágenes
create policy "Lectura publica de portfolio_bucket"
  on storage.objects
  for select
  to public
  using (bucket_id = 'portfolio_bucket');

-- Subida exclusiva para administradores autenticados
create policy "Subida exclusiva para autenticados en portfolio_bucket"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'portfolio_bucket');

-- Actualización exclusiva para administradores autenticados
create policy "Actualizacion exclusiva para autenticados en portfolio_bucket"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'portfolio_bucket');

-- Borrado exclusivo para administradores autenticados
create policy "Borrado exclusivo para autenticados en portfolio_bucket"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'portfolio_bucket');
