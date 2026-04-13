// ============================================================
// middleware.ts — Protection des routes /admin
// Vérifie la session Supabase et redirige vers /admin/login si non authentifié
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Création du client Supabase côté serveur avec gestion des cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Récupération de la session courante
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Protection des routes admin (sauf la page de login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) {
      // Redirige vers le login en conservant l'URL de destination
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirection /admin/login → /admin/dashboard si déjà connecté
  if (pathname === '/admin/login' && session) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return supabaseResponse
}

// Appliquer le middleware uniquement sur les routes admin
export const config = {
  matcher: ['/admin/:path*'],
}
