import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { AppRoute, Role, routeRoles } from "@/lib/roles";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (key) => req.cookies.get(key)?.value,
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  if (!session && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const matchedRoute = (Object.keys(routeRoles) as AppRoute[]).find((route) =>
    path.startsWith(route)
  );

  if (matchedRoute) {
    const { data: profile } = await supabase
      .from("users")
      .select("rol")
      .eq("id", session?.user.id)
      .single();

    const allowedRoles = routeRoles[matchedRoute];

    if (!profile?.rol || !allowedRoles.includes(profile.rol as Role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}