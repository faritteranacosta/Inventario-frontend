import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

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
    pathMatch: 'full',
    title: 'Inventario SaaS',
    loadComponent: () =>
      import('./features/landing/pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'admin',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    title: 'Iniciar sesión · Inventario SaaS',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell').then((m) => m.AppShellComponent),
    children: [
      {
        path: 'dashboard',
        title: 'Resumen · Inventario SaaS',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'categories',
        title: 'Categorías · Inventario SaaS',
        loadComponent: () =>
          import('./features/categories/pages/categories/categories').then((m) => m.CategoriesPage),
      },
      {
        path: 'products',
        title: 'Productos · Inventario SaaS',
        loadComponent: () =>
          import('./features/products/pages/products/products').then((m) => m.ProductsPage),
      },
      {
        path: 'sales',
        title: 'Ventas · Inventario SaaS',
        loadComponent: () => import('./features/sales/pages/sales/sales').then((m) => m.SalesPage),
      },
      {
        path: 'admin/form-demo',
        title: 'Panel administrativo',
        loadComponent: () =>
          import('./features/admin/pages/form-demo/form-demo').then((m) => m.FormDemoPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
