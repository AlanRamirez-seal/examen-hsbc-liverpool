class ResultsPage {
  constructor(page) {
    this.page = page;
    // Selector por texto exacto para el color Blanco
    this.whiteColorFilter = page.locator('text="Blanco"').first();
    // Selector del botón o contenedor de ordenamiento
    this.sortButton = page.locator('#sortby, .sortBy, [class*="sort"]').first();
    // Opción menor precio
    this.lowestPriceOption = page.locator('text="Menor precio", [data-value="price|0"]').first();
  }

  async filterByWhiteColor() {
    await this.whiteColorFilter.waitFor({ state: 'visible', timeout: 15000 });
    await this.whiteColorFilter.click({ force: true });
    // Espera para que el catálogo aplique el filtro asíncronamente
    await this.page.waitForTimeout(4000);
  }

  async sortByPriceLowestToHighest() {
    await this.sortButton.waitFor({ state: 'attached', timeout: 15000 });
    
    try {
      // Intentamos la interacción limpia por UI primero
      await this.sortButton.click({ force: true, timeout: 4000 });
      await this.page.waitForTimeout(1500);
      await this.lowestPriceOption.click({ force: true, timeout: 4000 });
    } catch (uiError) {
      console.log("⚠️ Botón visual bloqueado por responsividad. Aplicando bypass por URL nativa...");
      const currentUrl = this.page.url();
      
      if (!currentUrl.includes('sortBy')) {
        const separator = currentUrl.includes('?') ? '&' : '?';
        await this.page.goto(`${currentUrl}${separator}sortBy=price|0`, { waitUntil: 'domcontentloaded' });
      } else {
        await this.page.evaluate(() => {
          const sortElement = document.getElementById('sortby-selector') || document.getElementById('sortby');
          if (sortElement) {
            if (sortElement.tagName === 'SELECT') {
              sortElement.value = 'price|0';
              sortElement.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              sortElement.click();
            }
          }
        });
      }
    }
    // Tiempo de asentamiento del DOM tras ordenar
    await this.page.waitForTimeout(5000);
  }

  async getFirstFiveProducts() {
    const products = [];
    
    await this.page.waitForSelector('.m-product__card, [class*="product-card"], .o-card__prod', { state: 'attached', timeout: 15000 });
    
    const cards = this.page.locator('.m-product__card, [class*="product-card"], .o-card__prod');
    const totalFound = await cards.count();
    const limit = Math.min(totalFound, 5);

    console.log(`📊 Extrayendo los primeros ${limit} productos del catálogo...`);

    for (let i = 0; i < limit; i++) {
      const card = cards.nth(i);
      
      // 1. Obtener Nombre
      let nameText = "Producto sin nombre";
      const titleLocator = card.locator('.card-title, h5, [class*="card-title"], .a-card__description').first();
      if (await titleLocator.count() > 0) {
        nameText = await titleLocator.innerText();
      }
      
      // 2. Obtener Precio de manera blindada
      let priceText = "0";
      const discountPrice = card.locator('.a-card-discountPrice, .a-card__price').first();
      const normalPrice = card.locator('.a-card-price, [class*="price"]').first();
      
      if (await discountPrice.count() > 0) {
        priceText = await discountPrice.innerText();
      } else if (await normalPrice.count() > 0) {
        priceText = await normalPrice.innerText();
      }
      
      // Sanitización matemática: Extrae el formato numérico base ignorando centavos duplicados del DOM
      let match = priceText.replace(/,/g, '').match(/\d+/);
      const price = match ? parseFloat(match[0]) : 0;

      products.push({
        name: nameText.trim(),
        price: price
      });
    }
    
    console.log("✅ Productos extraídos con éxito.");
    return products;
  }
}

module.exports = { ResultsPage };