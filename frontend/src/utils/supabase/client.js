import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Browser Supabase client — uses the anon/publishable key.
 * RLS policies on your Supabase tables control what this client can access.
 *
 * Our app still routes most requests through the Express API (which uses the
 * service-role key). This client is available if you ever want to call Supabase
 * directly from the browser (e.g. real-time subscriptions, file storage).
 */
export const supabase = createClient(supabaseUrl, supabaseKey)
