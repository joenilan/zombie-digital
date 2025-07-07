import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const BUCKET = 'emote-uploads'
const MAX_AGE_MINUTES = 30

serve(async (req) => {
  // List all files in the bucket (root only; for folders, add recursion)
  const { data: files, error } = await supabase.storage.from(BUCKET).list('', { limit: 1000, offset: 0 })
  if (error) return new Response('Failed to list files', { status: 500 })

  const now = Date.now()
  const toDelete: string[] = []

  for (const file of files ?? []) {
    // file.created_at is ISO string
    const createdAt = new Date(file.created_at).getTime()
    const ageMinutes = (now - createdAt) / (1000 * 60)
    if (ageMinutes > MAX_AGE_MINUTES) {
      toDelete.push(file.name)
    }
  }

  if (toDelete.length > 0) {
    const { error: delError } = await supabase.storage.from(BUCKET).remove(toDelete)
    if (delError) return new Response('Failed to delete files', { status: 500 })
  }

  return new Response(`Deleted ${toDelete.length} old files.`, { status: 200 })
}) 