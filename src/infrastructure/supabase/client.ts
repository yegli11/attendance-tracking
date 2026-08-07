import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.',
  )
}

// Untyped until `npm run gen:types` is run against a linked Supabase project;
// swap to createClient<Database>(...) once supabase/types/database.ts exists.
// Tables live in the `person`/`event` schemas, not `public` — repositories must
// call `.schema('person')` / `.schema('event')` explicitly on each query.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
