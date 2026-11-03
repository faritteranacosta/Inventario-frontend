import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

interface Feature {
  readonly icon: 'box' | 'chart' | 'bolt' | 'bell';
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage implements OnDestroy {
  private readonly router = inject(Router);
  private rotationTimer: ReturnType<typeof setInterval> | undefined;

  protected readonly year = new Date().getFullYear();
  protected readonly activeFeatureIndex = signal(0);
  protected readonly isFeatureRotationPaused = signal(false);
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

  protected readonly activeFeature = computed(
    () => this.features[this.activeFeatureIndex()] ?? this.features[0],
  );

  constructor() {
    this.rotationTimer = setInterval(() => {
      if (!this.isFeatureRotationPaused()) {
        this.activeFeatureIndex.update((index) => (index + 1) % this.features.length);
      }
    }, 4200);
  }

  protected selectFeature(index: number): void {
    this.activeFeatureIndex.set(index);
    this.isFeatureRotationPaused.set(true);
  }

  protected toggleFeatureRotation(): void {
    this.isFeatureRotationPaused.update((paused) => !paused);
  }

  protected goToAdmin(): void {
    void this.router.navigate(['/admin']);
  }

  ngOnDestroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
  }
}
