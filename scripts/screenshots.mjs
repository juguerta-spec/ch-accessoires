// Script de captures d'écran — desktop + mobile
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:3000'
const OUT  = './screenshots'
mkdirSync(OUT, { recursive: true })

const PAGES = [
  { name: 'homepage',    url: '/' },
  { name: 'landing',     url: '/produits/sac-ch-signature' },
  { name: 'landing-bas', url: '/produits/sac-ch-signature', scrollY: 2000 },
  { name: 'confirmation',url: '/commande/confirmation?numero=CH123456&id=test&event_id=test' },
  { name: 'admin-login', url: '/admin/login' },
]

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844, isMobile: true },
]

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
})

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile || false,
    deviceScaleFactor: vp.isMobile ? 2 : 1,
  })
  const page = await ctx.newPage()

  for (const p of PAGES) {
    await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {})
    if (p.scrollY) await page.evaluate((y) => window.scrollTo(0, y), p.scrollY).catch(() => {})
    await page.waitForTimeout(1000)
    const path = `${OUT}/${vp.name}-${p.name}.png`
    await page.screenshot({ path, fullPage: !p.scrollY }).catch(() => {})
    console.log('✓', path)
  }

  await ctx.close()
}

await browser.close()
console.log('\nToutes les captures terminées → ./screenshots/')
