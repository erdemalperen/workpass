/**
 * Run SQL Migration Script
 *
 * Executes SQL migration files against Supabase database
 * Uses service role key to bypass RLS
 *
 * Usage:
 *   tsx scripts/run-migration.ts <migration-file>
 *   tsx scripts/run-migration.ts supabase/migrations/001_create_admin_profiles.sql
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

async function runMigration(migrationFile: string) {
  console.log(`\n🔄 Running migration: ${migrationFile}\n`)

  // Create Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials in .env.local')
    console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Read SQL file
    const sqlPath = join(process.cwd(), migrationFile)
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log('📄 SQL Content:')
    console.log('─'.repeat(60))
    console.log(sql.substring(0, 200) + '...\n')

    // Execute SQL using Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If exec_sql doesn't exist, use direct REST API call
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      })

      if (!response.ok) {
        // If exec_sql RPC doesn't exist, we need to use psql or Supabase Management API
        console.log('⚠️  Direct SQL execution not available via RPC')
        console.log('📋 Please run this SQL manually in Supabase Dashboard > SQL Editor:\n')
        console.log('─'.repeat(60))
        console.log(sql)
        console.log('─'.repeat(60))
        console.log('\n✅ After running the SQL, press Enter to continue...')

        return { manualExecution: true }
      }

      return await response.json()
    })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    if (data && (data as any).manualExecution) {
      // Wait for user input
      await new Promise(resolve => {
        process.stdin.once('data', resolve)
      })
      console.log('✅ Assuming migration was run successfully manually')
    } else {
      console.log('✅ Migration completed successfully!')
    }

  } catch (error) {
    console.error('❌ Error running migration:', error)
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard > SQL Editor')
    console.log('   URL: https://supabase.com/dashboard/project/dpnlyvgqdbagbrjxuvgw/sql/new')
    process.exit(1)
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ Error: Please provide migration file path')
  console.error('   Usage: tsx scripts/run-migration.ts <migration-file>')
  console.error('   Example: tsx scripts/run-migration.ts supabase/migrations/001_create_admin_profiles.sql')
  process.exit(1)
}

runMigration(migrationFile)
