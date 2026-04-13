'use client'

// ============================================================
// app/admin/login/page.tsx — Authentification admin
// Supabase Auth signInWithPassword
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function connexion(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setChargement(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErreur('Email ou mot de passe incorrect.')
      setChargement(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ch-blanc)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              fontWeight: 300,
              color: 'var(--ch-noir)',
              letterSpacing: '0.1em',
            }}
          >
            CH
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--ch-gris-texte)',
              marginTop: '2px',
            }}
          >
            ACCESSOIRES — ADMIN
          </div>
        </div>

        <form onSubmit={connexion}>
          <div style={{ marginBottom: '24px' }}>
            <label className="input-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-underline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label className="input-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="input-underline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {erreur && (
            <div
              style={{
                background: 'var(--ch-danger-bg)',
                color: 'var(--ch-danger)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              {erreur}
            </div>
          )}

          <button type="submit" className="btn-noir" disabled={chargement}>
            {chargement ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" /> Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
