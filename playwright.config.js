/// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Shared settings for all the projects below. */
  use: {
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    // ==========================================
    // CONFIGURACIÓN ANTI-BOTS, UBICACIÓN Y REPORTES (PARTE 3)
    // ==========================================
    headless: true, // Corre oculto por defecto como pide el examen[cite: 1]
    viewport: { width: 1280, height: 720 }, // Ventana fija estándar
    
    // Simulamos un navegador Chrome real en Windows para saltar bloqueos de servidores
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    
    // DESACTIVAR POPUPS DE UBICACIÓN (Evita que se congele la pantalla)
    permissions: [], 
    
    // Captura automática de pantalla SOLO si la prueba falla (Requerimiento Parte 3)[cite: 1]
    screenshot: 'only-on-failure', 
    
    contextOptions: {
      bypassCSP: true, // Salta políticas de seguridad estrictas que rompen la intercepción
      ignoreHTTPSErrors: true, // Ignora problemas de certificados SSL del e-commerce
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});