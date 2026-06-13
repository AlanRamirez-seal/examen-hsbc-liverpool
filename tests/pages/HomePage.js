class HomePage {
  constructor(page) {
    this.page = page;
    // Buscamos con un selector más amplio
    this.searchBar = page.locator('input[type="text"], input[name="search"], input[placeholder*="Buscar"]');
  }

  async navigate() {
    // Usamos 'networkidle' para asegurar que los scripts de tracking y seguridad carguen primero
    await this.page.goto('https://www.liverpool.com.mx/', { waitUntil: 'networkidle', timeout: 45000 });
  }

async searchFor(product) {
    // 1. Damos un tiempo de espera inicial para que el sitio deje de procesar scripts de seguridad
    await this.page.waitForTimeout(5000);

    // 2. Intentamos buscar un selector mucho más general, incluyendo el botón de búsqueda
    // A veces, el input está oculto y necesitamos dar clic primero en el icono de lupa
    const searchIcon = this.page.locator('.search-icon, .icon-search, [class*="search"]').first();
    if (await searchIcon.isVisible()) {
      await searchIcon.click();
    }

    // 3. Ahora sí, vamos por el input de forma mucho más amplia
    const input = this.page.locator('input').filter({ hasNot: this.page.locator('input[type="hidden"]') }).first();
    
    await input.waitFor({ state: 'visible', timeout: 30000 });
    await input.fill(product);
    await this.page.keyboard.press('Enter');
    
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { HomePage };