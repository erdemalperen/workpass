/**
 * Supabase Database Types
 *
 * Bu dosya Supabase CLI ile otomatik generate edilecek.
 * Şu anda boş bir placeholder.
 *
 * Generate komutu (Supabase projesi oluşturduktan sonra):
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
 *
 * Veya package.json'a script ekleyerek:
 * npm run generate-types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Placeholder - will be replaced with actual types
export interface Database {
  public: {
    Tables: {}
    Views: {}
    Functions: {}
    Enums: {}
  }
}
