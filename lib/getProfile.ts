import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from './supabase/server'

export async function getUserRole() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role ?? null
}