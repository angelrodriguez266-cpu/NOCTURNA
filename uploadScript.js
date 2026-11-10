/**
 * ==============================================================================
 * NØCTURNA® - Script de Subida y Sincronización Automática con Supabase
 * ==============================================================================
 * Este script:
 * 1. Lee las imágenes de Posters y Camisas desde public/Images/ basándose en defaultData.js.
 * 2. Las sube a tu Supabase Storage en el bucket 'portfolio_bucket'.
 * 3. Obtiene la URL pública de cada archivo subido.
 * 4. Inserta (o actualiza) los registros en la tabla 'portfolio_images' con su
 *    respectivo carousel_id ('posters' o 'camisas'), título, tag, precio y vista.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_POSTERS, DEFAULT_SHIRTS } from './src/data/defaultData.js';

// Carga manual de variables desde .env (funciona con o sin paquete dotenv)
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}
loadEnvFile();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Se recomienda SUPABASE_SERVICE_ROLE_KEY para ignorar RLS en scripts de backend,
// pero también funciona con VITE_SUPABASE_ANON_KEY si las políticas lo permiten o si se inicia sesión.
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const ADMIN_EMAIL = process.env.SUPABASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SUPABASE_ADMIN_PASSWORD;

const BUCKET_NAME = 'portfolio_bucket';

// Helper para detectar MIME type correcto
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

// Sanitizar nombres para Storage
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function main() {
  console.log('\n======================================================');
  console.log('⚡ NØCTURNA® - SUBIDA AUTOMÁTICA A SUPABASE STORAGE & BD');
  console.log('======================================================\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ ERROR: No se encontraron las credenciales de Supabase.');
    console.error('Verifica que tu archivo .env contenga:');
    console.error('  VITE_SUPABASE_URL=https://tu-proyecto-real.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key (Recomendado)');
    console.error('  o VITE_SUPABASE_ANON_KEY=tu-anon-key\n');
    process.exit(1);
  }

  if (SUPABASE_URL.includes('tu-proyecto') || SUPABASE_URL.includes('placeholder')) {
    console.error('❌ ERROR: La URL de Supabase aún tiene el texto de ejemplo:');
    console.error(`  VITE_SUPABASE_URL=${SUPABASE_URL}`);
    console.error('\n👉 Debes ir a tu Supabase Dashboard > Project Settings > API');
    console.error('   y copiar la "Project URL" real (tiene la forma https://xxxxxxxxxxxxxxxx.supabase.co)');
    console.error('   luego pégala en tu archivo .env.\n');
    process.exit(1);
  }

  const isServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log(`🔗 Conectando a Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Llave utilizada: ${isServiceRole ? 'Service Role (Bypass RLS)' : 'Anon Key'}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  // Si se usa anon key y se proveyeron credenciales de admin, iniciar sesión
  if (!isServiceRole && ADMIN_EMAIL && ADMIN_PASSWORD) {
    console.log(`🔐 Autenticando usuario administrador (${ADMIN_EMAIL})...`);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (authError) {
      console.warn(`⚠️ Advertencia de autenticación: ${authError.message}`);
    } else {
      console.log('✅ Autenticado como Administrador exitosamente.');
    }
  }

  // 1. Verificar existencia del Bucket
  console.log(`\n📦 Verificando bucket "${BUCKET_NAME}"...`);
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.warn(`⚠️ No se pudo listar buckets (${bucketError.message}). Intentando continuar...`);
  } else {
    const bucketExists = buckets?.some((b) => b.id === BUCKET_NAME || b.name === BUCKET_NAME);
    if (!bucketExists) {
      console.log(`Bucket "${BUCKET_NAME}" no encontrado. Creando bucket público...`);
      const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (createErr) {
        console.warn(`⚠️ Nota: ${createErr.message}. Asegúrate de crear el bucket '${BUCKET_NAME}' en el Dashboard.`);
      } else {
        console.log(`✅ Bucket "${BUCKET_NAME}" creado como público.`);
      }
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" verificado.`);
    }
  }

  // Helper para subir archivo individual a Storage
  async function uploadFile(localRelativePath, storagePath) {
    const absolutePath = path.resolve(process.cwd(), 'public', localRelativePath.replace(/^\//, ''));

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Archivo local no encontrado: ${absolutePath}`);
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const contentType = getMimeType(absolutePath);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Error en Storage al subir ${storagePath}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return publicUrlData.publicUrl;
  }

  // Helper para registrar o actualizar en la tabla portfolio_images
  async function upsertPortfolioImage({ imageUrl, carouselId, title, tag, viewType = 'front', price = 0 }) {
    // Verificar si ya existe registro con este título y carrusel
    const { data: existing, error: selectError } = await supabase
      .from('portfolio_images')
      .select('id')
      .eq('carousel_id', carouselId)
      .eq('title', title)
      .limit(1);

    if (selectError) {
      throw new Error(`Error al consultar portfolio_images: ${selectError.message}`);
    }

    if (existing && existing.length > 0) {
      const recordId = existing[0].id;
      const { error: updateError } = await supabase
        .from('portfolio_images')
        .update({
          image_url: imageUrl,
          tag,
          view_type: viewType,
          price,
        })
        .eq('id', recordId);

      if (updateError) {
        throw new Error(`Error al actualizar portfolio_images (${title}): ${updateError.message}`);
      }
      return { action: 'updated', id: recordId };
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from('portfolio_images')
        .insert([
          {
            image_url: imageUrl,
            carousel_id: carouselId,
            title,
            tag,
            view_type: viewType,
            price,
          },
        ])
        .select();

      if (insertError) {
        throw new Error(`Error al insertar en portfolio_images (${title}): ${insertError.message}`);
      }
      return { action: 'inserted', id: insertData[0]?.id };
    }
  }

  // ==============================================================================
  // FASE 1: SUBIR Y REGISTRAR POSTERS (carousel_id: 'posters')
  // ==============================================================================
  console.log(`\n======================================================`);
  console.log(`🖼️  FASE 1: Subiendo ${DEFAULT_POSTERS.length} Posters a '${BUCKET_NAME}'`);
  console.log(`======================================================`);

  let postersProcessed = 0;
  for (const poster of DEFAULT_POSTERS) {
    try {
      // Usamos el path de thumb decodificado (que apunta a public/Images/Posters/optimized/...)
      const decodedLocalThumb = decodeURIComponent(poster.thumb);
      const filename = path.basename(decodedLocalThumb);
      const storagePath = `posters/${sanitizeFilename(filename)}`;

      process.stdout.write(`⏳ Subiendo poster: "${poster.title}"... `);
      const publicUrl = await uploadFile(decodedLocalThumb, storagePath);

      const dbResult = await upsertPortfolioImage({
        imageUrl: publicUrl,
        carouselId: 'posters',
        title: poster.title,
        tag: poster.tag || 'LIMITED EDITION',
        viewType: 'front',
        price: 0,
      });

      console.log(`✅ [${dbResult.action.toUpperCase()}] URL: ${publicUrl}`);
      postersProcessed++;
    } catch (err) {
      console.error(`❌ Falló poster "${poster.title}":`, err.message);
    }
  }

  // ==============================================================================
  // FASE 2: SUBIR Y REGISTRAR CAMISAS (carousel_id: 'camisas')
  // ==============================================================================
  console.log(`\n======================================================`);
  console.log(`👕 FASE 2: Subiendo ${DEFAULT_SHIRTS.length} Camisas a '${BUCKET_NAME}'`);
  console.log(`======================================================`);

  let shirtsProcessed = 0;
  for (const shirt of DEFAULT_SHIRTS) {
    try {
      // Subir las 3 vistas a Storage para que estén disponibles en Supabase
      const viewMap = [
        { key: 'front', localPath: shirt.frontal || shirt.front },
        { key: 'back', localPath: shirt.espalda || shirt.back },
        { key: 'sleeve', localPath: shirt.manga || shirt.sleeve },
      ];
      const uploadedUrls = {};

      for (const view of viewMap) {
        if (view.localPath) {
          const decodedPath = decodeURIComponent(view.localPath);
          const filename = path.basename(decodedPath);
          const storagePath = `camisas/${shirt.id}/${view.key}_${sanitizeFilename(filename)}`;
          const publicUrl = await uploadFile(decodedPath, storagePath);
          uploadedUrls[view.key] = publicUrl;
        }
      }

      // En portfolio_images insertamos el registro principal con la imagen frontal
      const frontUrl = uploadedUrls.front || Object.values(uploadedUrls)[0];

      process.stdout.write(`⏳ Registrando camisa: "${shirt.name}"... `);
      const dbResult = await upsertPortfolioImage({
        imageUrl: frontUrl,
        carouselId: 'camisas',
        title: shirt.name,
        tag: shirt.badge || 'NEW DROP',
        viewType: 'front',
        price: shirt.price || 150000,
      });

      console.log(`✅ [${dbResult.action.toUpperCase()}] URL: ${frontUrl}`);
      shirtsProcessed++;
    } catch (err) {
      console.error(`❌ Falló camisa "${shirt.name}":`, err.message);
    }
  }

  // ==============================================================================
  // RESUMEN FINAL
  // ==============================================================================
  console.log(`\n======================================================`);
  console.log(`🎉 ¡PROCESO DE MIGRACIÓN COMPLETADO!`);
  console.log(`======================================================`);
  console.log(`✅ Posters sincronizados: ${postersProcessed} de ${DEFAULT_POSTERS.length}`);
  console.log(`✅ Camisas sincronizadas: ${shirtsProcessed} de ${DEFAULT_SHIRTS.length}`);
  console.log(`\nTu frontend ahora cargará las imágenes directamente desde Supabase Storage`);
  console.log(`y el lightbox de posters en producción funcionará sin problemas.`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('\n❌ Error inesperado durante la ejecución:', err);
  process.exit(1);
});
