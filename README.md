# Liverpool E2E Automation & API Validation Challenge

Solución al examen técnico de automatización para HSBC / Hitss. Implementa un flujo E2E completo en Liverpool.com.mx con validación de red mediante intercepción de respuestas HTTP.

## 🚀 Tecnologías

- **Framework:** Playwright Test (Node.js / JavaScript)
- **Patrón:** Page Object Model (POM)
- **CI/CD:** GitHub Actions

## 🛠️ Requisitos

- Node.js v18 o superior
- Google Chrome instalado (para ejecución local)
- Git

## 📦 Instalación

```bash
git clone https://github.com/AlanRamirez-seal/examen-hsbc-liverpool.git
cd examen-hsbc-liverpool
npm install
npx playwright install chromium
```

## ▶️ Cómo correr los tests

**Headless** (por defecto, como en CI):
```bash
npm test
```

**Headed** (con navegador visible):
```bash
npm run test:headed
```

**Ver reporte HTML:**
```bash
npm run test:report
```

## 🏗️ Estructura del proyecto

```
├── .github/workflows/test.yml   # Pipeline de GitHub Actions
├── tests/
│   ├── e2e/Search.spec.js       # Test principal E2E
│   └── pages/
│       ├── HomePage.js          # Page Object: página de inicio y búsqueda
│       └── ResultsPage.js       # Page Object: filtros, sort y extracción
├── playwright.config.js         # Config local (usa Chrome real)
├── playwright.config.ci.js      # Config para CI (usa Chromium)
└── TEST_STRATEGY.md             # Estrategia de pruebas
```

## 🔄 CI/CD

El pipeline corre automáticamente en cada push a `main`. Instala dependencias, corre los tests en headless y sube el reporte HTML como artifact.

## 📊 Qué hace el test

1. Navega a liverpool.com.mx
2. Busca "playstation 5"
3. Filtra por color Blanco
4. Ordena de menor a mayor precio
5. Extrae nombre y precio de los primeros 5 resultados
6. Intercepta la respuesta de red y valida consistencia con la UI
