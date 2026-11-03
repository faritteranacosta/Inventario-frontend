import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { platformGuard } from './core/auth/platform.guard';

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
    title: 'Stokio',
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
    title: 'Iniciar sesión · Stokio',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'bootstrap',
    title: 'Configurar plataforma · Stokio',
    loadComponent: () =>
      import('./features/platform/pages/bootstrap/bootstrap').then((m) => m.BootstrapPage),
  },
  {
    path: 'register',
    title: 'Crear usuario · Stokio',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.RegisterPage),
  },
  {
    path: 'onboarding',
    canActivate: [platformGuard],
    title: 'Crear negocio · Stokio',
    loadComponent: () =>
      import('./features/tenants/pages/onboarding/onboarding').then((m) => m.OnboardingPage),
  },
  {
    path: 'forbidden',
    title: 'Acceso denegado · Stokio',
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
        title: 'Resumen · Stokio',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'settings',
        title: 'Configuración · Stokio',
        loadComponent: () =>
          import('./features/settings/pages/settings/settings').then((m) => m.SettingsPage),
      },
      {
        path: 'categories',
        canActivate: [adminGuard],
        title: 'Categorías · Stokio',
        loadComponent: () =>
          import('./features/categories/pages/categories/categories').then((m) => m.CategoriesPage),
      },
      {
        path: 'products',
        title: 'Productos · Stokio',
        loadComponent: () =>
          import('./features/products/pages/products/products').then((m) => m.ProductsPage),
      },
      {
        path: 'sales',
        title: 'Ventas · Stokio',
        loadComponent: () => import('./features/sales/pages/sales/sales').then((m) => m.SalesPage),
      },
      {
        path: 'users',
        canActivate: [platformGuard],
        title: 'Usuarios · Stokio',
        loadComponent: () => import('./features/users/pages/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'tenants',
        canActivate: [platformGuard],
        title: 'Negocios · Stokio',
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
