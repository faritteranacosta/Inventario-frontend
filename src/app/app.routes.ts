import { Routes } from '@angular/router';

/**
 * Rutas de la aplicación. Las páginas se cargan de forma diferida
 * (`loadComponent`) para optimizar el tamaño inicial del bundle.
 *
 * - `''`      → Landing pública de presentación.
 * - `admin`   → Área de administración de ejemplo.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Inventario SaaS',
    loadComponent: () =>
      import('./features/landing/pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'admin',
    title: 'Panel administrativo',
    loadComponent: () =>
      import('./features/admin/pages/form-demo/form-demo').then((m) => m.FormDemoPage),
  },
  { path: '**', redirectTo: '' },
];
