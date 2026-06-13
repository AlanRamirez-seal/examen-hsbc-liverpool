// @ts-check
// ─────────────────────────────────────────────────────────────────────────────
// playwright.config.ci.js — Configuración de Playwright para GitHub Actions (CI)
// GitHub Actions no tiene Chrome instalado, así que usamos el Chromium
// que instala Playwright con: npx playwright install --with-deps chromium
// El workflow en .github/workflows/test.yml apunta a este archivo
// ─────────────────────────────────────────────────────────────────────────────
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,

  // En CI siempre falla si hay test.only() para evitar que se suban tests aislados
  forbidOnly: true,

  // 1 reintento en CI para manejar flakiness de red (Liverpool a veces tarda)
  retries: 1,

  workers: 1,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',

    // En CI siempre headless — no hay pantalla disponible en el servidor de GitHub
    headless: true,

    screenshot: 'only-on-failure',
    viewport: { width: 1366, height: 768 },

    // Mismo User-Agent que en local para evadir el bloqueo de Akamai
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',

    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',

    // Headers anti-bot — igual que en local
    extraHTTPHeaders: {
      'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },

    contextOptions: {
      bypassCSP: true,
      ignoreHTTPSErrors: true,
    },
  },

  projects: [
    {
      name: 'chromium',
      // En CI usamos devices['Desktop Chrome'] en lugar de channel:'chrome'
      // porque no hay Chrome real, solo el Chromium descargado por Playwright
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
