import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { AppRoute, Role, routeRoles } from '@/lib/roles'

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(req.url)
  const path = url.pathname

  if (path.startsWith('/auth')) {
    return NextResponse.next()
  }

  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  if (user) {
    const matchedRoute = (Object.keys(routeRoles) as AppRoute[]).find((route) =>
      path.startsWith(route)
    )
    if (matchedRoute) {
      const { data: profile } = await supabase
        .from('users')
        .select('rol')
        .eq('id', user.id)
        .single()

      const allowedRoles = routeRoles[matchedRoute]
      if (!profile?.rol || !allowedRoles.includes(profile.rol as Role)) {
        return NextResponse.redirect(new URL('/dashboard', url.origin))
      }
    }
  }

  return supabaseResponse 
}

export const config = {
  matcher: ['/dashboard/:path*'],
}