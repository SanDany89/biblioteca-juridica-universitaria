/**
 * supabase-config.js - Configuración y Cliente Oficial de Supabase
 * Conecta la aplicación con el proyecto de Supabase para Storage, Database y Auth.
 */

export const SUPABASE_URL = 'https://tymuqirjalbhlpvtbjkt.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bXVxaXJqYWxiaGxwdnRiamt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzg5NjAsImV4cCI6MjEwMjY1NDk2MH0.EwTOpFrG40ztaxcavPZX95aNihaz6XQk5ZZ3atjJBZQ';

export const STORAGE_BUCKET = 'documentos-pdf';
export const TABLE_DOCUMENTS = 'documentos';
export const TABLE_SUBJECTS = 'materias';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseClient;
  }

  console.warn('Supabase JS CDN no se encuentra cargado en window.supabase');
  return null;
}

export const supabase = getSupabase();
