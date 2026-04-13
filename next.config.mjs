/** @type {import('next').NextConfig} */
// ============================================================
// next.config.mjs — Configuration Next.js
// ============================================================

const nextConfig = {
  // Désactiver le linting ESLint pendant le build (géré séparément)
  eslint: { ignoreDuringBuilds: true },
  // Désactiver les vérifications TypeScript pendant le build (tsc --noEmit séparé)
  typescript: { ignoreBuildErrors: true },
  images: {
    // Format WebP par défaut pour les performances
    formats: ['image/webp'],
  },
}

export default nextConfig
