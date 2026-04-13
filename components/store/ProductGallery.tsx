'use client'

// ============================================================
// components/store/ProductGallery.tsx — Galerie luxe
// Desktop : thumbnails verticaux + image pleine hauteur
// Mobile  : image 3:4 + dots + thumbnails horizontaux
// Fond blanc — aucun container visible autour des images
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react'
import type { Variante } from '@/lib/supabase'

type Props = { variante: Variante; nomProduit: string }

const PH = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800'%3E%3Crect width='600' height='800' fill='%23F5F2EE'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' fill='%23C8C4BC' text-anchor='middle' dy='.3em'%3ECH%3C/text%3E%3C/svg%3E"

const THUMB_STYLE = (active: boolean): React.CSSProperties => ({
  width: '100%',
  aspectRatio: '1/1',
  border: active ? '1.5px solid #0A0A0A' : '0.5px solid #E0DDD8',
  padding: 0,
  background: '#FAFAF7',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'border-color 0.15s',
  display: 'block',
})

export default function ProductGallery({ variante, nomProduit }: Props) {
  const images = variante.images?.length > 0 ? variante.images : [PH]
  const [idx, setIdx] = useState(0)
  useEffect(() => setIdx(0), [variante.id])

  const startX = useRef(0)
  const startY = useRef(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = Math.abs(e.changedTouches[0].clientY - startY.current)
    if (Math.abs(dx) < 40 || dy > 60) return
    if (dx < 0 && idx < images.length - 1) setIdx(i => i + 1)
    else if (dx > 0 && idx > 0) setIdx(i => i - 1)
  }, [idx, images.length])

  const ThumbImg = ({ src, i }: { src: string; i: number }) => (
    <button
      key={i}
      onClick={() => setIdx(i)}
      aria-label={`Photo ${i + 1}`}
      aria-pressed={i === idx}
      style={THUMB_STYLE(i === idx)}
    >
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </button>
  )

  return (
    <div className="gallery-inner">

      {/* ── Thumbnails verticaux — desktop seulement ── */}
      <div className="gallery-thumbs-col">
        {images.map((src, i) => <ThumbImg key={i} src={src} i={i} />)}
      </div>

      {/* ── Image principale ── */}
      <div
        className="gallery-image-wrap"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ position: 'relative' }}
      >
        <img
          src={images[idx]}
          alt={`${nomProduit} — ${variante.couleur_fr} — photo ${idx + 1}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />

        {/* Flèche gauche */}
        {idx > 0 && (
          <button
            onClick={() => setIdx(i => i - 1)}
            aria-label="Image précédente"
            style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.92)',
              border: '0.5px solid #E0DDD8',
              width: 40, height: 40,
              cursor: 'pointer', fontSize: 22, color: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            ‹
          </button>
        )}

        {/* Flèche droite */}
        {idx < images.length - 1 && (
          <button
            onClick={() => setIdx(i => i + 1)}
            aria-label="Image suivante"
            style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.92)',
              border: '0.5px solid #E0DDD8',
              width: 40, height: 40,
              cursor: 'pointer', fontSize: 22, color: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            ›
          </button>
        )}

        {/* Dots — mobile */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 14, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 5,
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Photo ${i + 1}`}
                style={{
                  width: i === idx ? 22 : 6, height: 6,
                  borderRadius: 3,
                  background: i === idx ? '#C9A84C' : 'rgba(0,0,0,0.2)',
                  border: 'none', padding: 0, cursor: 'pointer',
                  transition: 'width 0.2s ease, background 0.2s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnails horizontaux — mobile seulement ── */}
      {images.length > 1 && (
        <div className="gallery-thumbs-row">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Photo ${i + 1}`}
              style={{
                flexShrink: 0,
                width: 68, height: 68,
                border: i === idx ? '1.5px solid #C9A84C' : '0.5px solid #E0DDD8',
                padding: 0, background: '#FAFAF7',
                cursor: 'pointer', overflow: 'hidden',
              }}
            >
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
