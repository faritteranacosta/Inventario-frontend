import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="state-page">
      <p class="state-page__code">403</p>
      <h1>Acceso denegado</h1>
      <p>Tu rol no tiene permisos para consultar esta sección.</p>
      <a routerLink="/dashboard">Volver al resumen</a>
    </main>
  `,
  styles: `
    .state-page {
      display: grid;
      place-content: center;
      min-height: 100vh;
      padding: 2rem;
      text-align: center;
    }
    .state-page__code {
      color: var(--app-primary);
      font-size: 4rem;
      font-weight: 800;
      margin: 0;
    }
    .state-page h1 {
      margin: 0.25rem 0;
    }
    .state-page p:not(.state-page__code) {
      color: var(--app-text-color-secondary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPage {}
