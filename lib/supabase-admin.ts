// ============================================================
// lib/supabase-admin.ts — Client Supabase avec Service Role
// UNIQUEMENT utilisé dans les API Routes (server-side)
// Bypasse le Row Level Security — ne jamais exposer côté client
// ============================================================

import { createClient } from '@supabase/supabase-js'

// Créé une fois, réutilisé dans toutes les API routes
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL manquant dans .env.local')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
