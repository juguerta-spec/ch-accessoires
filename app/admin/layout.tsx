'use client'

// ============================================================
// app/admin/layout.tsx — Layout admin avec sidebar de navigation
// Auth guard + icônes SVG + badge commandes nouvelles en temps réel
// ============================================================

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ── Icônes SVG minimalistes ───────────────────────────────────

function IcoDashboard() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5.5" height="5.5" rx="0.8" fill="currentColor"/>
      <rect x="7.5" y="1" width="5.5" height="5.5" rx="0.8" fill="currentColor"/>
      <rect x="1" y="7.5" width="5.5" height="5.5" rx="0.8" fill="currentColor"/>
      <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="0.8" fill="currentColor"/>
    </svg>
  )
}

function IcoCommandes() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 3.5h11M1.5 7h11M1.5 10.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IcoClients() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5.5" cy="4.5" r="2.3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 12.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="10.5" cy="5" r="1.6" stroke="currentColor" strokeWidth="1.2" opacity="0.55"/>
      <path d="M12.8 11c0-1.657-1.343-3-3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
    </svg>
  )
}

function IcoProduits() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="6.5" width="11" height="6" rx="0.8" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4.5 6.5V5.2a2.5 2.5 0 015 0v1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IcoDeconnexion() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4.5 6h6.5M8.5 4L11 6l-2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 2H1.5v8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Types ─────────────────────────────────────────────────────

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

// ── Composant principal ───────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [nbNouvelles, setNbNouvelles] = useState(0)

  // Forcer direction LTR dans tout l'admin (indépendant du toggle storefront)
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'ltr')
    document.documentElement.setAttribute('lang', 'fr')
  }, [])

  // Comptage + temps réel des commandes nouvelles
  useEffect(() => {
    const supabase = createClient()

    async function compterNouvelles() {
      const { count } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'nouvelle')
      setNbNouvelles(count || 0)
    }

    compterNouvelles()

    const canal = supabase
      .channel('commandes-nouvelles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commandes' }, () => compterNouvelles())
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [])

  async function seDeconnecter() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const navItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard',  icon: <IcoDashboard /> },
    { href: '/admin/commandes', label: 'Commandes',  icon: <IcoCommandes />, badge: nbNouvelles || undefined },
    { href: '/admin/clients',   label: 'Clients',    icon: <IcoClients /> },
    { href: '/admin/produits',  label: 'Produits',   icon: <IcoProduits /> },
  ]

  // Masquer la sidebar sur la page login
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ch-beige)' }}>
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        style={{
          width: '220px',
          background: 'var(--ch-noir)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Branding */}
        <div
          style={{
            padding: '28px 20px 22px',
            borderBottom: '0.5px solid rgba(201,168,76,0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 300,
                color: 'var(--ch-or)',
                letterSpacing: '0.08em',
                lineHeight: 1,
              }}
            >
              CH
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '7px',
                fontWeight: 500,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.4)',
              }}
            >
              ACCESSOIRES
            </span>
          </div>

          {/* Badge statut en ligne */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(58,107,54,0.15)',
              border: '0.5px solid rgba(58,107,54,0.3)',
              borderRadius: '3px',
              padding: '3px 8px',
            }}
          >
            <div
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#4CAF50',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '8px',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#6BAD67',
              }}
            >
              EN LIGNE
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {navItems.map((item) => {
            const actif = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 20px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '10.5px',
                  fontWeight: actif ? 500 : 300,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: actif ? 'var(--ch-or)' : 'rgba(200,196,188,0.55)',
                  textDecoration: 'none',
                  background: actif ? 'rgba(201,168,76,0.07)' : 'transparent',
                  borderLeft: actif ? '2px solid var(--ch-or)' : '2px solid transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ opacity: actif ? 1 : 0.5, flexShrink: 0, display: 'flex' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>

                {/* Badge nouvelles commandes */}
                {item.badge ? (
                  <span
                    style={{
                      background: 'var(--ch-or)',
                      color: 'var(--ch-noir)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      minWidth: '18px',
                      textAlign: 'center',
                      letterSpacing: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Bouton déconnexion */}
        <div style={{ padding: '14px 16px 20px', borderTop: '0.5px solid rgba(201,168,76,0.08)' }}>
          <button
            onClick={seDeconnecter}
            style={{
              width: '100%',
              padding: '9px 12px',
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(200,196,188,0.4)',
              background: 'transparent',
              border: '0.5px solid rgba(200,196,188,0.15)',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <IcoDeconnexion />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ─────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--ch-blanc)' }}>
        {children}
      </main>
    </div>
  )
}
