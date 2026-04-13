'use client'

// ============================================================
// app/admin/dashboard/page.tsx — Tableau de bord bilingue FR/AR
// KPI cards + graphique 7 jours + 10 dernières commandes
// Toggle langue persisté en localStorage
// ============================================================

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Commande } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────

type Langue = 'fr' | 'ar'

type Stats = {
  commandesAujourdhui: number
  revenusAujourdhui:   number
  commandesMois:       number
  tauxLivraison:       number
  tauxConfirmation:    number   // confirmées ÷ (total - annulées) en %
  nbNouvelles:         number   // commandes en attente de confirmation
}

type JourGraphique = {
  date: Date
  nb:   number
}

// ── Hauteur graphique ─────────────────────────────────────────

const CHART_H = 140

// ── Traductions ───────────────────────────────────────────────

const TEXTES = {
  fr: {
    titre:       'Tableau de bord',
    date:        (d: Date) => d.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    actualiser:  'Actualiser',
    kpi:         ["Commandes aujourd'hui", "Revenus aujourd'hui", 'Commandes ce mois', 'Taux de livraison', 'Taux de confirmation'],
    graphTitre:  'Commandes — 7 derniers jours',
    graphTotal:  'Total',
    tableTitre:  'Dernières commandes',
    cols:        ['N°', 'Client', 'Wilaya', 'Coloris', 'Montant', 'Date', 'Statut'],
    vide:        'Aucune commande pour l\'instant',
    badges:      { nouvelle: 'Nouvelle', confirmee: 'Confirmée', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' },
    da:          'DA',
    unite_pct:   '%',
    commandes:   'commandes',
    jourLabel:   (d: Date) => d.toLocaleDateString('fr-DZ', { weekday: 'short', day: 'numeric' }),
  },
  ar: {
    titre:       'لوحة التحكم',
    date:        (d: Date) => d.toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    actualiser:  'تحديث',
    kpi:         ['طلبات اليوم', 'إيرادات اليوم', 'طلبات الشهر', 'معدل التسليم', 'معدل التأكيد'],
    graphTitre:  'الطلبات — آخر 7 أيام',
    graphTotal:  'المجموع',
    tableTitre:  'آخر الطلبات',
    cols:        ['رقم', 'العميل', 'الولاية', 'اللون', 'المبلغ', 'التاريخ', 'الحالة'],
    vide:        'لا توجد طلبات حتى الآن',
    badges:      { nouvelle: 'جديد', confirmee: 'مؤكد', expediee: 'مُرسل', livree: 'مُسلَّم', annulee: 'ملغى' },
    da:          'دج',
    unite_pct:   '%',
    commandes:   'طلبات',
    jourLabel:   (d: Date) => d.toLocaleDateString('ar-DZ', { weekday: 'short', day: 'numeric' }),
  },
}

// ── Badges statuts ────────────────────────────────────────────

const BADGE_CLS: Record<string, string> = {
  nouvelle:  'badge badge-info',
  confirmee: 'badge badge-warning',
  expediee:  'badge badge-warning',
  livree:    'badge badge-succes',
  annulee:   'badge badge-danger',
}

// ── Icônes SVG ────────────────────────────────────────────────

function IcoCalendrier() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="3.5" width="15" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 1.5v4M12.5 1.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="5" y="10" width="2.5" height="2.5" rx="0.4" fill="currentColor" opacity="0.55"/>
      <rect x="10.5" y="10" width="2.5" height="2.5" rx="0.4" fill="currentColor" opacity="0.55"/>
    </svg>
  )
}

function IcoMonnaie() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M9 5v1.5M9 11.5V13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6.5 7.5c0-.8.9-1.5 2.5-1.5s2.5.7 2.5 1.5-1 1.5-2.5 1.5-2.5.7-2.5 1.5.9 1.5 2.5 1.5 2.5-.7 2.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function IcoMois() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="10" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.4"/>
      <rect x="7.5" y="6.5" width="3" height="9.5" rx="0.5" fill="currentColor" opacity="0.65"/>
      <rect x="13" y="2.5" width="3" height="13.5" rx="0.5" fill="currentColor"/>
      <path d="M1.5 17h15" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

function IcoCamion() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="5.5" width="10" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M11 8.5h3l2 3v2h-5V8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="4.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="14" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

function IcoConfirmation() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IcoRefresh() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M11.5 2A6 6 0 1 0 13 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M10 0l1.5 2L9 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Utilitaires ───────────────────────────────────────────────

function formatDate(dateStr: string, langue: Langue): string {
  return new Date(dateStr).toLocaleDateString(langue === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Composant principal ───────────────────────────────────────

export default function DashboardPage() {
  const [langue, setLangue]     = useState<Langue>('fr')
  const [stats, setStats]       = useState<Stats>({ commandesAujourdhui: 0, revenusAujourdhui: 0, commandesMois: 0, tauxLivraison: 0, tauxConfirmation: 0, nbNouvelles: 0 })
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [graphique, setGraphique] = useState<JourGraphique[]>([])
  const [chargement, setChargement] = useState(true)
  const [actualisation, setActualisation] = useState(false)

  const T = TEXTES[langue]
  const isAr = langue === 'ar'
  const fontCorps = isAr ? 'var(--font-arabic)' : 'var(--font-body)'
  const fontTitre = isAr ? 'var(--font-arabic)' : 'var(--font-display)'

  // Persistance de la langue dans localStorage + contrôle de <html dir>
  useEffect(() => {
    const saved = localStorage.getItem('admin-langue') as Langue | null
    const langueInitiale: Langue = (saved === 'ar' || saved === 'fr') ? saved : 'fr'
    setLangue(langueInitiale)
    // Forcer la direction HTML indépendamment du storefront
    document.documentElement.setAttribute('dir', langueInitiale === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', langueInitiale === 'ar' ? 'ar' : 'fr')
    // Réinitialiser en LTR à la destruction (retour au storefront)
    return () => {
      document.documentElement.setAttribute('dir', 'ltr')
      document.documentElement.setAttribute('lang', 'fr')
    }
  }, [])

  function basculerLangue() {
    const next: Langue = langue === 'fr' ? 'ar' : 'fr'
    setLangue(next)
    localStorage.setItem('admin-langue', next)
    // Mettre à jour la direction HTML immédiatement
    document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', next === 'ar' ? 'ar' : 'fr')
  }

  // ── Chargement des données ────────────────────────────────────

  async function charger(silencieux = false) {
    if (!silencieux) setChargement(true)
    else setActualisation(true)

    const supabase   = createClient()
    const maintenant = new Date()
    const debutJour  = new Date(maintenant); debutJour.setHours(0, 0, 0, 0)
    const debutMois  = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
    const debutSem   = new Date(maintenant); debutSem.setDate(debutSem.getDate() - 6); debutSem.setHours(0, 0, 0, 0)

    const [
      { count: nbJour },
      { data: revenus },
      { count: nbMois },
      { data: tauxData },
      { data: confirmationData },
      { data: dernieres },
      { data: semaineData },
    ] = await Promise.all([
      supabase.from('commandes').select('*', { count: 'exact', head: true }).gte('created_at', debutJour.toISOString()),
      supabase.from('commandes').select('montant').eq('statut', 'livree').gte('created_at', debutJour.toISOString()),
      supabase.from('commandes').select('*', { count: 'exact', head: true }).gte('created_at', debutMois.toISOString()),
      supabase.from('commandes').select('statut').in('statut', ['livree', 'annulee']),
      // Taux de confirmation = toutes les commandes du mois (hors annulées)
      supabase.from('commandes').select('statut').gte('created_at', debutMois.toISOString()),
      supabase.from('commandes').select('*, clients(nom, prenom, telephone), variantes(couleur_fr, couleur_ar)').order('created_at', { ascending: false }).limit(10),
      supabase.from('commandes').select('created_at').gte('created_at', debutSem.toISOString()),
    ])

    const livrees  = tauxData?.filter((c) => c.statut === 'livree').length || 0
    const annulees = tauxData?.filter((c) => c.statut === 'annulee').length || 0
    const taux     = livrees + annulees > 0 ? Math.round((livrees / (livrees + annulees)) * 100) : 0
    const revenuJour = revenus?.reduce((s, c) => s + (c.montant || 0), 0) || 0

    // Taux de confirmation ce mois : (confirmées + expédiées + livrées) ÷ total non-annulées
    const totalMois      = confirmationData?.filter((c) => c.statut !== 'annulee').length || 0
    const confirmeeMois  = confirmationData?.filter((c) => ['confirmee', 'expediee', 'livree'].includes(c.statut)).length || 0
    const nouvellesMois  = confirmationData?.filter((c) => c.statut === 'nouvelle').length || 0
    const tauxConfirmation = totalMois > 0 ? Math.round((confirmeeMois / totalMois) * 100) : 0

    // Construction du graphique 7 jours — on stocke les objets Date
    const jours: JourGraphique[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(maintenant)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      jours.push({ date: d, nb: 0 })
    }
    semaineData?.forEach((c) => {
      const dateCmd = new Date(c.created_at)
      const jour = jours.find((j) =>
        dateCmd >= j.date && dateCmd < new Date(j.date.getTime() + 86400000)
      )
      if (jour) jour.nb++
    })

    setStats({ commandesAujourdhui: nbJour || 0, revenusAujourdhui: revenuJour, commandesMois: nbMois || 0, tauxLivraison: taux, tauxConfirmation, nbNouvelles: nouvellesMois })
    setCommandes((dernieres as Commande[]) || [])
    setGraphique(jours)
    setChargement(false)
    setActualisation(false)
  }

  useEffect(() => { charger() }, [])

  // ── Skeleton ──────────────────────────────────────────────────

  if (chargement) {
    return (
      <div style={{ padding: '36px 40px' }}>
        <div style={{ height: '32px', width: '180px', background: 'var(--ch-beige)', borderRadius: '4px', marginBottom: '32px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[1,2,3,4].map((i) => <div key={i} style={{ height: '110px', background: 'var(--ch-beige)', borderRadius: '4px', border: 'var(--ch-border)' }} />)}
        </div>
        <div style={{ height: '230px', background: 'var(--ch-beige)', borderRadius: '4px', border: 'var(--ch-border)', marginBottom: '24px' }} />
        <div style={{ height: '320px', background: 'var(--ch-beige)', borderRadius: '4px', border: 'var(--ch-border)' }} />
      </div>
    )
  }

  const maxVal   = Math.max(...graphique.map((d) => d.nb), 1)
  const barsData = graphique.map((d) => ({
    ...d,
    barPx: d.nb > 0 ? Math.max(Math.round((d.nb / maxVal) * CHART_H), 8) : 3,
    label: T.jourLabel(d.date),
  }))

  const totalSemaine = graphique.reduce((s, d) => s + d.nb, 0)

  // Couleur du taux de confirmation : vert > 60%, orange 30-60%, rouge < 30%
  const couleurConfirmation = stats.tauxConfirmation >= 60
    ? 'var(--ch-succes)' : stats.tauxConfirmation >= 30
    ? 'var(--ch-warning)' : 'var(--ch-danger)'
  const bgConfirmation = stats.tauxConfirmation >= 60
    ? 'var(--ch-succes-bg)' : stats.tauxConfirmation >= 30
    ? 'var(--ch-warning-bg)' : 'var(--ch-danger-bg)'

  const kpis = [
    { label: T.kpi[0], valeur: stats.commandesAujourdhui, unite: '', icon: <IcoCalendrier />, accent: 'var(--ch-info)', accentBg: 'var(--ch-info-bg)', sous: null },
    { label: T.kpi[1], valeur: stats.revenusAujourdhui.toLocaleString('fr-DZ'), unite: ` ${T.da}`, icon: <IcoMonnaie />, accent: 'var(--ch-or)', accentBg: '#F9F3E3', sous: null },
    { label: T.kpi[2], valeur: stats.commandesMois, unite: '', icon: <IcoMois />, accent: 'var(--ch-warning)', accentBg: 'var(--ch-warning-bg)', sous: null },
    { label: T.kpi[3], valeur: stats.tauxLivraison, unite: T.unite_pct, icon: <IcoCamion />, accent: 'var(--ch-succes)', accentBg: 'var(--ch-succes-bg)', sous: null },
    {
      label: T.kpi[4],
      valeur: stats.tauxConfirmation,
      unite: T.unite_pct,
      icon: <IcoConfirmation />,
      accent: couleurConfirmation,
      accentBg: bgConfirmation,
      sous: stats.nbNouvelles > 0
        ? (isAr ? `${stats.nbNouvelles} في الانتظار` : `${stats.nbNouvelles} en attente`)
        : null,
    },
  ]

  return (
    <div
      style={{ padding: '36px 40px', maxWidth: '1200px', direction: isAr ? 'rtl' : 'ltr' }}
    >

      {/* ── En-tête ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: fontCorps,
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: isAr ? 0 : '0.08em',
              color: 'var(--ch-gris-texte)',
              marginBottom: '6px',
              textTransform: isAr ? 'none' : 'capitalize',
            }}
          >
            {T.date(new Date())}
          </p>
          <h1
            style={{
              fontFamily: fontTitre,
              fontSize: isAr ? '28px' : '32px',
              fontWeight: isAr ? 500 : 300,
              color: 'var(--ch-noir)',
              letterSpacing: isAr ? 0 : '0.02em',
              margin: 0,
            }}
          >
            {T.titre}
          </h1>
        </div>

        {/* Actions : toggle langue + actualiser */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => charger(true)}
            disabled={actualisation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: actualisation ? 'var(--ch-gris-clair)' : 'var(--ch-gris-texte)',
              border: 'var(--ch-border)',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: actualisation ? 'wait' : 'pointer',
              transition: 'color 0.15s',
            }}
          >
            <span style={{ display: 'inline-flex', animation: actualisation ? 'spin 0.7s linear infinite' : 'none' }}>
              <IcoRefresh />
            </span>
            {T.actualiser}
          </button>

          {/* Toggle FR / AR */}
          <button
            onClick={basculerLangue}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              background: 'var(--ch-noir)',
              color: 'var(--ch-or)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {isAr ? 'FR' : 'AR'}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--ch-blanc)',
              border: 'var(--ch-border)',
              borderRadius: '4px',
              padding: '22px 20px 18px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = kpi.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ch-gris-clair)')}
          >
            {/* Barre d'accent gauche (ou droite en RTL) */}
            <div
              style={{
                position: 'absolute',
                top: 0, bottom: 0,
                [isAr ? 'right' : 'left']: 0,
                width: '3px',
                background: kpi.accent,
              }}
            />

            {/* Fond teinté discret en haut */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '40%',
                background: kpi.accentBg,
                opacity: 0.35,
                pointerEvents: 'none',
              }}
            />

            {/* Icône */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                [isAr ? 'left' : 'right']: '16px',
                color: kpi.accent,
                opacity: 0.7,
              }}
            >
              {kpi.icon}
            </div>

            {/* Label */}
            <p
              style={{
                fontFamily: fontCorps,
                fontSize: isAr ? '11px' : '9.5px',
                fontWeight: 500,
                letterSpacing: isAr ? 0 : '0.1em',
                textTransform: isAr ? 'none' : 'uppercase',
                color: 'var(--ch-gris-texte)',
                marginBottom: '14px',
                paddingRight: isAr ? 0 : '28px',
                paddingLeft: isAr ? '28px' : 0,
              }}
            >
              {kpi.label}
            </p>

            {/* Valeur */}
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--ch-noir)',
                lineHeight: 1,
                direction: 'ltr',
                textAlign: isAr ? 'right' : 'left',
              }}
            >
              {kpi.valeur}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--ch-gris-texte)',
                  marginLeft: '4px',
                }}
              >
                {kpi.unite}
              </span>
            </p>

            {/* Sous-texte optionnel (ex: "3 en attente") */}
            {kpi.sous && (
              <p
                style={{
                  fontFamily: fontCorps,
                  fontSize: '10px',
                  fontWeight: 500,
                  color: kpi.accent,
                  marginTop: '6px',
                  letterSpacing: isAr ? 0 : '0.06em',
                }}
              >
                {kpi.sous}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Graphique 7 jours ─────────────────────────────────── */}
      <div
        style={{
          background: 'var(--ch-blanc)',
          border: 'var(--ch-border)',
          borderRadius: '4px',
          padding: '22px 24px',
          marginBottom: '24px',
        }}
      >
        {/* En-tête graphique */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              fontFamily: fontCorps,
              fontSize: isAr ? '13px' : '10px',
              fontWeight: 500,
              letterSpacing: isAr ? 0 : '0.1em',
              textTransform: isAr ? 'none' : 'uppercase',
              color: 'var(--ch-gris-texte)',
              margin: 0,
            }}
          >
            {T.graphTitre}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--ch-gris-texte)',
              margin: 0,
              direction: 'ltr',
            }}
          >
            {T.graphTotal} :{' '}
            <span style={{ fontWeight: 600, color: 'var(--ch-noir)' }}>
              {totalSemaine}
            </span>
          </p>
        </div>

        {/* Zone graphique */}
        <div style={{ position: 'relative', height: `${CHART_H + 40}px` }}>
          {/* Lignes de grille */}
          {[0.25, 0.5, 0.75, 1.0].map((frac, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0, right: 0,
                bottom: `${40 + frac * CHART_H}px`,
                height: '0.5px',
                background: 'var(--ch-beige)',
              }}
            />
          ))}

          {/* Barres */}
          <div
            style={{
              position: 'absolute',
              left: 0, right: 0,
              bottom: '40px',
              height: `${CHART_H}px`,
              display: 'flex',
              alignItems: 'flex-end',
              gap: '10px',
              direction: 'ltr',
            }}
          >
            {barsData.map((d, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  gap: '5px',
                }}
              >
                {d.nb > 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'var(--ch-or)',
                    }}
                  >
                    {d.nb}
                  </span>
                )}
                <div
                  style={{
                    width: '100%',
                    height: `${d.barPx}px`,
                    background: d.nb > 0
                      ? `linear-gradient(to top, var(--ch-or), var(--ch-or-clair))`
                      : 'var(--ch-beige)',
                    borderRadius: '2px 2px 0 0',
                    border: d.nb === 0 ? 'var(--ch-border)' : 'none',
                    transition: 'height 0.4s ease',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Labels jours */}
          <div
            style={{
              position: 'absolute',
              left: 0, right: 0, bottom: 0,
              height: '36px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              borderTop: 'var(--ch-border)',
              direction: 'ltr',
            }}
          >
            {barsData.map((d, idx) => (
              <span
                key={idx}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: fontCorps,
                  fontSize: isAr ? '11px' : '9px',
                  color: 'var(--ch-gris-texte)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tableau dernières commandes ───────────────────────── */}
      <div
        style={{
          background: 'var(--ch-blanc)',
          border: 'var(--ch-border)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* En-tête tableau */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: 'var(--ch-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--ch-blanc)',
          }}
        >
          <p
            style={{
              fontFamily: fontCorps,
              fontSize: isAr ? '13px' : '10px',
              fontWeight: 500,
              letterSpacing: isAr ? 0 : '0.12em',
              textTransform: isAr ? 'none' : 'uppercase',
              color: 'var(--ch-gris-texte)',
              margin: 0,
            }}
          >
            {T.tableTitre}
          </p>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--ch-gris-clair)',
            }}
          >
            {commandes.length} {T.commandes}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ch-beige)', borderBottom: 'var(--ch-border)' }}>
                {T.cols.map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 20px',
                      fontFamily: fontCorps,
                      fontSize: isAr ? '12px' : '9.5px',
                      fontWeight: 500,
                      letterSpacing: isAr ? 0 : '0.1em',
                      textTransform: isAr ? 'none' : 'uppercase',
                      color: 'var(--ch-gris-texte)',
                      textAlign: isAr ? 'right' : 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commandes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      fontFamily: fontCorps,
                      fontSize: isAr ? '15px' : '13px',
                      color: 'var(--ch-gris-texte)',
                    }}
                  >
                    {T.vide}
                  </td>
                </tr>
              )}
              {commandes.map((c, idx) => {
                const client   = (c as Commande & { clients?: { nom: string; prenom: string } }).clients
                const variante = (c as Commande & { variantes?: { couleur_fr: string; couleur_ar: string } }).variantes
                const badge    = BADGE_CLS[c.statut] || 'badge'
                const labelBadge = T.badges[c.statut as keyof typeof T.badges] || c.statut
                const couleur = isAr ? (variante?.couleur_ar || variante?.couleur_fr || '—') : (variante?.couleur_fr || '—')

                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: idx < commandes.length - 1 ? 'var(--ch-border)' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* N° */}
                    <td
                      style={{
                        padding: '13px 20px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--ch-or)',
                        whiteSpace: 'nowrap',
                        direction: 'ltr',
                        textAlign: isAr ? 'right' : 'left',
                      }}
                    >
                      {c.numero}
                    </td>

                    {/* Client */}
                    <td
                      style={{
                        padding: '13px 20px',
                        fontFamily: fontCorps,
                        fontSize: isAr ? '14px' : '13px',
                        color: 'var(--ch-noir)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {client ? `${client.prenom} ${client.nom}` : '—'}
                    </td>

                    {/* Wilaya */}
                    <td
                      style={{
                        padding: '13px 20px',
                        fontFamily: fontCorps,
                        fontSize: isAr ? '14px' : '12px',
                        color: 'var(--ch-gris-texte)',
                      }}
                    >
                      {c.wilaya_livraison}
                    </td>

                    {/* Coloris */}
                    <td
                      style={{
                        padding: '13px 20px',
                        fontFamily: fontCorps,
                        fontSize: isAr ? '14px' : '12px',
                        color: 'var(--ch-gris-texte)',
                      }}
                    >
                      {couleur}
                    </td>

                    {/* Montant */}
                    <td
                      style={{
                        padding: '13px 20px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--ch-noir)',
                        whiteSpace: 'nowrap',
                        direction: 'ltr',
                        textAlign: isAr ? 'right' : 'left',
                      }}
                    >
                      {c.montant.toLocaleString('fr-DZ')}{' '}
                      <span style={{ fontWeight: 300, color: 'var(--ch-gris-texte)', fontSize: '11px' }}>
                        {T.da}
                      </span>
                    </td>

                    {/* Date */}
                    <td
                      style={{
                        padding: '13px 20px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        color: 'var(--ch-gris-texte)',
                        whiteSpace: 'nowrap',
                        direction: 'ltr',
                        textAlign: isAr ? 'right' : 'left',
                      }}
                    >
                      {formatDate(c.created_at, langue)}
                    </td>

                    {/* Statut */}
                    <td style={{ padding: '13px 20px' }}>
                      <span className={badge}>{labelBadge}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyframe spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
