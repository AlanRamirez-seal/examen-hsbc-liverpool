// ─────────────────────────────────────────────────────────────────────────────
// HomePage.js — Page Object Model para la página de inicio de Liverpool
//
// El patrón Page Object Model (POM) separa la lógica de interacción con el DOM
// del código del test. Ventaja: si Liverpool cambia un selector, solo editas
// este archivo, no todos los tests que lo usen.
// ─────────────────────────────────────────────────────────────────────────────
class HomePage {
  constructor(page) {
    // 'page' es el objeto de Playwright que representa la pestaña del navegador
    this.page = page;
  }

  async navigate() {
    // Navega a la página de inicio de Liverpool
    // Usamos 'domcontentloaded' en lugar de 'networkidle' porque Liverpool
    // nunca termina de cargar (tiene trackers y scripts eternos), y 'networkidle'
    // esperaría para siempre causando un timeout
    await this.page.goto('https://www.liverpool.com.mx/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Pausa breve para que el JS de la página termine de renderizar
    // y para simular comportamiento humano (evitar detección de bot)
    await this.page.waitForTimeout(2000);
  }

  async searchFor(product) {
    // Busca el campo de búsqueda con múltiples selectores alternativos
    // por si Liverpool cambia el placeholder o el atributo name
    const searchInput = this.page.locator(
      'input[placeholder*="Buscar"], input[placeholder*="buscar"], input[name="Ntt"], input[type="search"]'
    ).first();

    // Espera a que el campo sea visible antes de interactuar
    await searchInput.waitFor({ state: 'visible', timeout: 20000 });

    // Simula escritura humana: click → pausa → escribir letra por letra
    // Liverpool usa Akamai como sistema anti-bot; escribir con delay
    // hace que el patrón se parezca más al de un usuario real
    await searchInput.click();
    await this.page.waitForTimeout(500);
    await searchInput.type(product, { delay: 80 }); // 80ms entre cada letra
    await this.page.waitForTimeout(800);
    await this.page.keyboard.press('Enter');

    // Espera a que aparezcan tarjetas de producto en pantalla
    // antes de que el siguiente paso intente interactuar con los filtros
    await this.page.waitForSelector(
      '.m-product__card, [class*="product-card"], [class*="ProductCard"]',
      { timeout: 30000 }
    );

    console.log(`✅ Búsqueda completada para: ${product}`);
  }
}

// Exportamos la clase para que Search.spec.js pueda importarla con require()
module.exports = { HomePage };
