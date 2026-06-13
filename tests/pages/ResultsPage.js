// ─────────────────────────────────────────────────────────────────────────────
// ResultsPage.js — Page Object Model para la página de resultados de Liverpool
//
// Maneja tres responsabilidades:
//   1. Aplicar el filtro de color "Blanco"
//   2. Ordenar resultados de menor a mayor precio
//   3. Extraer nombre y precio de los primeros 5 productos
// ─────────────────────────────────────────────────────────────────────────────
class ResultsPage {
  constructor(page) {
    this.page = page;
  }

  // ── FILTRO DE COLOR ────────────────────────────────────────────────────────
  async filterByWhiteColor() {
    // Liverpool muestra sugerencias de filtro como chips horizontales.
    // Inspeccionando el DOM encontramos que la clase real es "newPlpChip"
    // Ejemplo HTML: <div class="newPlpChip">Blanco</div>
    const chipLocator = this.page
      .locator('div.newPlpChip, .newPlpChip')
      .filter({ hasText: /^Blanco$/ }) // texto exacto "Blanco", sin otras palabras
      .first();

    try {
      // Espera a que el chip sea visible (puede tardar si la página carga lento)
      await chipLocator.waitFor({ state: 'visible', timeout: 10000 });

      // scrollIntoViewIfNeeded: desplaza la página hasta el chip si está
      // fuera de la pantalla (Liverpool tiene scroll horizontal en los chips)
      await chipLocator.scrollIntoViewIfNeeded();

      // force:true hace click aunque el elemento esté parcialmente cubierto
      await chipLocator.click({ force: true });
      console.log('✅ Filtro Blanco aplicado (div.newPlpChip)');

      // Pausa para que la página recargue los resultados filtrados
      await this.page.waitForTimeout(3000);
    } catch (e) {
      console.log('⚠️ No se encontró el chip Blanco:', e.message);
    }
  }

  // ── ORDENAR POR PRECIO ────────────────────────────────────────────────────
  async sortByPriceLowestToHighest() {
    try {
      // Liverpool acepta el parámetro sortBy en la URL.
      // Es más confiable que hacer click en el dropdown de la UI,
      // ya que el <select> a veces no es visible en modo headless
      const currentUrl = this.page.url();

      // Eliminar cualquier sortBy previo para no duplicar el parámetro
      const cleanUrl = currentUrl.replace(/[&?]sortBy=[^&]*/g, '');

      // Agregar el nuevo parámetro: price|0 = menor a mayor precio
      const separator = cleanUrl.includes('?') ? '&' : '?';
      const sortedUrl = `${cleanUrl}${separator}sortBy=price%7C0`;

      // Navegar a la URL con el sort aplicado
      await this.page.goto(sortedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForTimeout(2000);
      console.log('✅ Ordenado por precio menor a mayor (URL)');
    } catch (e) {
      console.log('⚠️ Sort no aplicado:', e.message);
    }
  }

  // ── EXTRACCIÓN DE PRODUCTOS ───────────────────────────────────────────────
  async getFirstFiveProducts() {
    // Lista de selectores posibles para las tarjetas de producto.
    // Probamos en orden hasta encontrar el que funcione en la versión actual del sitio
    const productSelectors = [
      '.m-product__card',
      '[class*="product-card"]',
      '[class*="ProductCard"]',
      '.o-card__prod',
    ];

    // Encontrar cuál selector funciona en esta carga de página
    let workingSelector = null;
    for (const sel of productSelectors) {
      try {
        await this.page.waitForSelector(sel, { state: 'attached', timeout: 8000 });
        workingSelector = sel;
        break;
      } catch (e) {}
    }

    if (!workingSelector) {
      console.log('⚠️ No se encontraron tarjetas de producto');
      return [];
    }

    const cards = this.page.locator(workingSelector);
    const total = await cards.count();
    const limit = Math.min(total, 5); // Máximo 5 productos según el challenge
    console.log(`📊 Extrayendo los primeros ${limit} productos...`);

    const products = [];

    for (let i = 0; i < limit; i++) {
      const card = cards.nth(i); // Tarjeta número i

      // ── Extraer nombre ──────────────────────────────────────────────────
      let name = 'Sin nombre';
      const nameSelectors = [
        '.card-title', 'h5', '[class*="card-title"]',
        '.a-card__description', '[class*="description"]', '[class*="name"]',
      ];
      for (const sel of nameSelectors) {
        try {
          const el = card.locator(sel).first();
          if (await el.count() > 0) {
            const text = (await el.innerText()).trim();
            if (text) { name = text; break; }
          }
        } catch (e) {}
      }

      // ── Extraer precio ──────────────────────────────────────────────────
      // Liverpool almacena algunos precios en centavos × 100 en el DOM
      // Ej: el valor raw 2202600 = $22,026.00 MXN (hay que dividir entre 100)
      // Otros productos no muestran precio en la tarjeta → devuelven $0
      let price = 0;
      const priceSelectors = [
        '.a-card-discountPrice', '.a-card__price',
        '.a-card-price', '[class*="price"]', '[class*="Price"]',
      ];
      for (const sel of priceSelectors) {
        try {
          const el = card.locator(sel).first();
          if (await el.count() > 0) {
            const text = await el.innerText();
            const cleaned = text.replace(/[$,\s]/g, '');
            const match = cleaned.match(/(\d+)\.?(\d{0,2})/);
            if (match) {
              const raw = parseFloat(cleaned.replace(/[^\d.]/g, ''));
              // Si tiene más de 6 dígitos, está en centavos → dividir entre 100
              price = raw > 100000 ? raw / 100 : raw;
              if (price > 0) break;
            }
          }
        } catch (e) {}
      }

      // Guardamos el precio formateado como string legible en pesos mexicanos
      products.push({ name, price: `$${price.toLocaleString('es-MX')}` });
    }

    return products;
  }
}

module.exports = { ResultsPage };
