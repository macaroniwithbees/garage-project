import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'


export async function GET(req: Request) {
  const url = new URL(req.url)
  console.log('Full callback URL:', url.toString())
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  console.log('Callback hit:', { code: !!code, error, errorDescription })

  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/login?error=${error}`, url.origin))
  }

  if (!code) {
    console.error('No code in callback URL')
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const supabase = await createClient()
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError) {
    console.error('Session exchange error:', sessionError.message)
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  return NextResponse.redirect(new URL('/dashboard', url.origin))
}