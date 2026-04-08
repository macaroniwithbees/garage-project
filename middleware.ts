import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppRoute, Role, routeRoles } from '@/lib/roles'

export async function middleware(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname

  if (path.startsWith('/auth')) return NextResponse.next()

  const supabase = await createClient() 

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const matchedRoute = (Object.keys(routeRoles) as AppRoute[]).find((route) =>
    path.startsWith(route)
  )

  if (matchedRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('rol')
      .eq('id', session?.user.id)
      .single()

    const allowedRoles = routeRoles[matchedRoute]

    if (!profile?.rol || !allowedRoles.includes(profile.rol as Role)) {
      return NextResponse.redirect(new URL('/dashboard', url.origin))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}