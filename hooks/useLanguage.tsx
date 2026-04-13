'use client'

// ============================================================
// hooks/useLanguage.tsx — Contexte React pour le bilinguisme FR/AR
// Gère la langue active, le stockage localStorage et la direction RTL
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

type Langue = 'fr' | 'ar'

type LangueContextType = {
  langue: Langue
  basculerLangue: () => void
  estArabe: boolean
}

const LangueContext = createContext<LangueContextType>({
  langue: 'fr',
  basculerLangue: () => {},
  estArabe: false,
})

// Clé localStorage pour persister la préférence utilisateur
const CLE_LOCALE = 'ch_langue'

export function LangueProvider({ children }: { children: ReactNode }) {
  const [langue, setLangue] = useState<Langue>('fr')

  // Lecture de la langue sauvegardée au montage
  useEffect(() => {
    const sauvegardee = localStorage.getItem(CLE_LOCALE) as Langue | null
    if (sauvegardee === 'fr' || sauvegardee === 'ar') {
      setLangue(sauvegardee)
    }
  }, [])

  // Mise à jour de dir et lang sur <html> à chaque changement de langue
  useEffect(() => {
    const html = document.documentElement
    if (langue === 'ar') {
      html.setAttribute('dir', 'rtl')
      html.setAttribute('lang', 'ar')
    } else {
      html.setAttribute('dir', 'ltr')
      html.setAttribute('lang', 'fr')
    }
  }, [langue])

  // Bascule entre FR et AR avec sauvegarde localStorage
  const basculerLangue = useCallback(() => {
    setLangue((precedente) => {
      const nouvelle: Langue = precedente === 'fr' ? 'ar' : 'fr'
      localStorage.setItem(CLE_LOCALE, nouvelle)
      return nouvelle
    })
  }, [])

  return (
    <LangueContext.Provider
      value={{
        langue,
        basculerLangue,
        estArabe: langue === 'ar',
      }}
    >
      {children}
    </LangueContext.Provider>
  )
}

// Hook d'accès au contexte langue
export function useLanguage(): LangueContextType {
  const contexte = useContext(LangueContext)
  if (!contexte) {
    throw new Error('useLanguage doit être utilisé dans un LangueProvider')
  }
  return contexte
}

// Utilitaire : retourne le texte dans la bonne langue
export function t(fr: string, ar: string, langue: Langue): string {
  return langue === 'ar' ? ar : fr
}
