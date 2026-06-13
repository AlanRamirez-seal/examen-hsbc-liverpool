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
    // Saltamos la interacción de la barra de búsqueda y vamos directo a la URL de búsqueda de Liverpool
    // Esto es mucho más estable en entornos de CI/CD como GitHub Actions
    const searchUrl = `https://www.liverpool.com.mx/tienda?s=${encodeURIComponent(product)}`;
    
    await this.page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Solo esperamos a que los resultados carguen
    await this.page.waitForSelector('.o-listing__products', { timeout: 30000 });
    
    // Opcional: imprimir en consola para verificar que llegamos
    console.log(`✅ Navegación directa a resultados para: ${product}`);
  }
}

module.exports = { HomePage };