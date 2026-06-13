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
    // Intentamos encontrar el elemento con una espera mayor
    const input = this.searchBar.first();
    await input.waitFor({ state: 'attached', timeout: 30000 });
    
    // Forzamos la interacción humana simulada
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true }); 
    await input.fill(product);
    await this.page.keyboard.press('Enter');
    
    // Esperamos un tiempo prudente a que la navegación ocurra
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { HomePage };