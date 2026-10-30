import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Feature {
  readonly icon: 'box' | 'chart' | 'bolt' | 'bell';
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  private readonly router = inject(Router);

  protected readonly year = new Date().getFullYear();
  protected readonly features: readonly Feature[] = [
    {
      icon: 'box',
      title: 'Productos',
      description: 'Organiza tu catálogo, variantes, precios y niveles mínimos de inventario.',
    },
    {
      icon: 'chart',
      title: 'Métricas',
      description: 'Visualiza ventas, rotación y existencias con información accionable.',
    },
    {
      icon: 'bolt',
      title: 'Operación ágil',
      description: 'Registra entradas y salidas sin fricción desde cualquier dispositivo.',
    },
    {
      icon: 'bell',
      title: 'Alertas',
      description: 'Recibe avisos antes de quedarte sin stock de tus productos clave.',
    },
  ];

  protected goToAdmin(): void {
    void this.router.navigate(['/admin']);
  }
}
