// ============================================================
// middleware.ts — Auth admin + A/B test landing page
// - Routes /admin : vérifie session Supabase, redirige si non connecté
// - Routes /produits : assigne variante A/B via cookie (30 jours)
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Variantes A/B ─────────────────────────────────────────────
// A : formulaire en haut (après le prix)
// B : formulaire en bas (après description + comment ça marche)
type AbVariant = 'A' | 'B'
const AB_COOKIE = 'ch_ab'
const AB_MAX_AGE = 60 * 60 * 24 * 30 // 30 jours

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── A/B TEST — pages produit ──────────────────────────────
  // Assignation aléatoire 50/50 si pas encore de cookie
  if (pathname.startsWith('/produits/')) {
    const existant = request.cookies.get(AB_COOKIE)

    if (!existant) {
      const variant: AbVariant = Math.random() < 0.5 ? 'A' : 'B'
      // Injecter dans la requête pour que page.tsx le lise immédiatement
      request.cookies.set(AB_COOKIE, variant)
      const response = NextResponse.next({ request })
      response.cookies.set(AB_COOKIE, variant, {
        maxAge: AB_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
      })
      return response
    }

    // Cookie déjà présent — s'assurer que la valeur est valide
    const valeur = existant.value
    if (valeur !== 'A' && valeur !== 'B') {
      const variant: AbVariant = 'A'
      request.cookies.set(AB_COOKIE, variant)
      const response = NextResponse.next({ request })
      response.cookies.set(AB_COOKIE, variant, { maxAge: AB_MAX_AGE, path: '/', sameSite: 'lax', httpOnly: false })
      return response
    }

    return NextResponse.next({ request })
  }

  // ── AUTH ADMIN — routes protégées ────────────────────────
  let supabaseResponse = NextResponse.next({ request })

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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protection des routes admin (sauf la page de login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) {
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

// Appliquer sur les routes admin ET les pages produit
export const config = {
  matcher: ['/admin/:path*', '/produits/:path*'],
}
