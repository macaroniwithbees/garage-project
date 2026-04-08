import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const supabase = await createClient() // ✅ Reuse helper

  await supabase.auth.exchangeCodeForSession(url.toString())

  return NextResponse.redirect(new URL('/dashboard', url.origin))
}