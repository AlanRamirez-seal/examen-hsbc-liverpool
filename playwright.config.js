// @ts-check
// ─────────────────────────────────────────────────────────────────────────────
// playwright.config.js — Configuración principal de Playwright para ejecución LOCAL
// Se usa cuando corres: npm test  o  npm run test:headed
// Para GitHub Actions se usa playwright.config.ci.js (sin Chrome real)
// ─────────────────────────────────────────────────────────────────────────────
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Carpeta donde Playwright busca los archivos de test
  testDir: './tests',

  // Correr tests en paralelo (false porque Liverpool puede bloquear IPs con mucho tráfico)
  fullyParallel: false,

  // En CI, falla si alguien dejó un test.only() por accidente
  forbidOnly: !!process.env.CI,

  // Reintentos automáticos: 1 en CI, 0 en local (falla rápido para desarrollo)
  retries: process.env.CI ? 1 : 0,

  // Un solo worker para no saturar Liverpool con peticiones paralelas
  workers: 1,

  // Genera un reporte HTML después de cada ejecución (se abre con: npm run test:report)
  reporter: 'html',

  use: {
    // Guarda el trace solo en el primer reintento (útil para depurar fallos en CI)
    trace: 'on-first-retry',

    // Headless por defecto; si la variable HEADED=true se abre el navegador visible
    headless: !process.env.HEADED,

    // Captura screenshot automáticamente solo cuando falla un test
    screenshot: 'only-on-failure',

    // Resolución estándar de laptop — evita que elementos queden ocultos por responsive
    viewport: { width: 1366, height: 768 },

    // User-Agent de Chrome real para que Liverpool no detecte Playwright como bot
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',

    // Idioma y zona horaria mexicana para que Liverpool muestre precios en MXN
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',

    // Headers HTTP adicionales que un navegador real enviaría
    // Esto ayuda a pasar los filtros anti-bot de Akamai que usa Liverpool
    extraHTTPHeaders: {
      'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },

    contextOptions: {
      // Ignorar errores de certificados SSL (algunos CDNs de Liverpool los tienen)
      bypassCSP: true,
      ignoreHTTPSErrors: true,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        // 'channel: chrome' le dice a Playwright que use tu Chrome REAL instalado en Windows
        // Esto es clave: Chrome real tiene fingerprints que Akamai no bloquea
        // En CI (GitHub Actions) no existe Chrome real, por eso usamos playwright.config.ci.js
        channel: 'chrome',
      },
    },
  ],
});
