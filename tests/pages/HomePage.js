// ─────────────────────────────────────────────────────────────────────────────
// HomePage.js — Page Object Model para la página de inicio de Liverpool
//
// Estrategia de búsqueda doble:
//   - Local (Chrome real): usa la barra de búsqueda de la UI
//   - CI (Chromium headless): navega directo a la URL de resultados
//     porque Akamai bloquea la home page en servidores de CI
// ─────────────────────────────────────────────────────────────────────────────
class HomePage {
  constructor(page) {
    this.page = page;
  }

  async navigate() {
    // En CI saltamos la home directamente al buscar, así que este método
    // solo se usa en local. De igual forma lo dejamos liviano.
    await this.page.goto('https://www.liverpool.com.mx/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await this.page.waitForTimeout(2000);
  }

  async searchFor(product) {
    const isCI = !!process.env.CI;

    if (isCI) {
      // ── Estrategia CI ───────────────────────────────────────────────────
      // En GitHub Actions, Akamai bloquea la home y la barra de búsqueda
      // nunca llega a ser visible. Navegamos directo a la URL de búsqueda
      // que Liverpool genera internamente cuando escribes en la barra.
      console.log('🤖 Modo CI: navegando directo a URL de búsqueda...');
      const encoded = encodeURIComponent(product);
      await this.page.goto(
        `https://www.liverpool.com.mx/tienda/N-1z141f5?s=${encoded}`,
        { waitUntil: 'domcontentloaded', timeout: 45000 }
      );
      // Esperar a que aparezcan productos en pantalla
      await this.page.waitForSelector(
        '.m-product__card, [class*="product-card"], [class*="ProductCard"]',
        { timeout: 30000 }
      );
    } else {
      // ── Estrategia Local (Chrome real) ──────────────────────────────────
      // En local usamos la barra de búsqueda de la UI para simular
      // el flujo real del usuario y evitar detección de bot
      console.log('💻 Modo local: usando barra de búsqueda UI...');
      const searchInput = this.page.locator(
        'input[placeholder*="Buscar"], input[placeholder*="buscar"], input[name="Ntt"], input[type="search"]'
      ).first();

      await searchInput.waitFor({ state: 'visible', timeout: 20000 });
      await searchInput.click();
      await this.page.waitForTimeout(500);
      await searchInput.type(product, { delay: 80 }); // escribe letra por letra
      await this.page.waitForTimeout(800);
      await this.page.keyboard.press('Enter');

      await this.page.waitForSelector(
        '.m-product__card, [class*="product-card"], [class*="ProductCard"]',
        { timeout: 30000 }
      );
    }

    console.log(`✅ Búsqueda completada para: ${product}`);
  }
}

module.exports = { HomePage };