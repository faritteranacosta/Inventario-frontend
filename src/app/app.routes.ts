import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

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
    path: 'register',
    title: 'Crear usuario · Inventario SaaS',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.RegisterPage),
  },
  {
    path: 'onboarding',
    title: 'Crear negocio · Inventario SaaS',
    loadComponent: () =>
      import('./features/tenants/pages/onboarding/onboarding').then((m) => m.OnboardingPage),
  },
  {
    path: 'forbidden',
    title: 'Acceso denegado · Inventario SaaS',
    loadComponent: () =>
      import('./features/auth/pages/forbidden/forbidden').then((m) => m.ForbiddenPage),
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
        canActivate: [adminGuard],
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
        path: 'users',
        canActivate: [adminGuard],
        title: 'Usuarios · Inventario SaaS',
        loadComponent: () => import('./features/users/pages/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'tenants',
        canActivate: [adminGuard],
        title: 'Negocios · Inventario SaaS',
        loadComponent: () =>
          import('./features/tenants/pages/tenants/tenants').then((m) => m.TenantsPage),
      },
      {
        path: 'admin/form-demo',
        canActivate: [adminGuard],
        title: 'Panel administrativo',
        loadComponent: () =>
          import('./features/admin/pages/form-demo/form-demo').then((m) => m.FormDemoPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
