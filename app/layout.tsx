// ============================================================
// app/layout.tsx — Layout global CH Accessoires
// Charge les fonts via Google Fonts CDN, initialise Meta Pixel,
// wrappe avec LangueProvider
// ============================================================

import type { Metadata } from 'next'
import Script from 'next/script'
import { LangueProvider } from '@/hooks/useLanguage'
import WhatsAppFloat from '@/components/store/WhatsAppFloat'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'CH Accessoires — Sacs premium pour femme | Algérie',
  description:
    "CH Accessoires propose des sacs haut de gamme accessibles. Livraison dans toute l'Algérie. Paiement à la livraison.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://ch-accessoires.com'
  ),
  openGraph: {
    siteName: 'CH Accessoires',
    locale: 'fr_DZ',
    type: 'website',
    title: 'CH Accessoires — Sacs premium pour femme | Algérie',
    description: "Sac haut de gamme à 3 500 DA. Livraison offerte dans toute l'Algérie. Paiement à la livraison.",
    images: [
      {
        url: '/og-image.jpg',  // Placer une image 1200×630px dans /public/og-image.jpg
        width: 1200,
        height: 630,
        alt: 'CH Accessoires — Sac premium Algérie',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  return (
    // dir et lang sont gérés dynamiquement par useLanguage côté client
    <html lang="fr" dir="ltr">
      <head>
        {/* Préconnexion Google Fonts pour réduire la latence */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Cormorant Garamond (display/émotionnel), DM Sans (body/fonctionnel), Tajawal (arabe) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500&family=Tajawal:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangueProvider>
          {children}
          <WhatsAppFloat />
        </LangueProvider>

        {/* Meta Pixel — chargé après l'interactivité pour ne pas bloquer le rendu */}
        {pixelId && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        {/* Noscript fallback Meta Pixel */}
        {pixelId && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
      </body>
    </html>
  )
}
