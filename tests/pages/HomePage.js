class HomePage {
  constructor(page) {
    this.page = page;
    // Localizador flexible y tolerante para la barra de búsqueda
    this.searchBar = page.locator('input#mainSearchbar, input[placeholder*="Buscar"]').first();
  }

  async navigate() {
    // Navegación limpia configurando un User-Agent normal para mitigar bloqueos
    await this.page.goto('https://www.liverpool.com.mx/', { waitUntil: 'load', timeout: 30000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchFor(product) {
    // Esperamos explícitamente a que esté visible antes de interactuar
    await this.searchBar.waitFor({ state: 'visible', timeout: 20000 });
    
    // Simulamos interacciones humanas básicas para inicializar los scripts de la página
    await this.searchBar.click();
    await this.searchBar.focus();
    
    // Escribimos el producto de forma fluida
    await this.searchBar.fill(product);
    
    // Ejecutamos la búsqueda con el Enter del teclado
    await this.searchBar.press('Enter');
    
    // Le damos un respiro a la plataforma para que pinte los primeros resultados
    await this.page.waitForTimeout(4000);
  }
}

module.exports = { HomePage };