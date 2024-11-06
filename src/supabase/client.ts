import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log(supabaseUrl, supabaseAnonKey)

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })