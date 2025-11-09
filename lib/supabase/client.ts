import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

/**
 * Client-side Supabase client
 * Used in Client Components (with 'use client' directive)
 *
 * This client automatically handles:
 * - Session management via cookies
 * - Token refresh
 * - Browser-based auth flows
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
