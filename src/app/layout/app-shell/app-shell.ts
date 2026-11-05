import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { StockAlertsService } from '../../core/stock-alerts.service';
import { resolveImageUrl } from '../../core/utils/image';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly stockAlerts = inject(StockAlertsService);
  private readonly router = inject(Router);
  protected readonly contextLoading = signal(false);
  protected readonly contextError = signal<string | null>(null);
  protected readonly logoFailed = signal(false);
  protected readonly showNotifications = signal(false);

  protected logoSrc(): string | null {
    return resolveImageUrl(this.auth.activeTenantLogoUrl());
  }

  protected onLogoError(_event: Event): void {
    this.logoFailed.set(true);
  }

  constructor() {
    if (this.auth.isAuthenticated() && !this.auth.session()) {
      this.auth.me().subscribe({
        next: () => this.loadAlerts(),
        error: () => this.contextError.set('No pudimos actualizar la sesión multi-negocio.'),
      });
    }
    effect(() => {
      const tenantId = this.auth.activeTenantId();
      if (tenantId) {
        this.loadAlerts();
      }
    });
  }

  protected loadAlerts(): void {
    this.stockAlerts.reload();
  }

  protected toggleNotifications(): void {
    this.showNotifications.set(!this.showNotifications());
    if (this.showNotifications()) {
      this.loadAlerts();
    }
  }

  protected closeNotifications(): void {
    this.showNotifications.set(false);
  }

  protected selectTenant(tenantId: string): void {
    if (!tenantId || tenantId === this.auth.activeTenantId()) return;
    this.contextLoading.set(true);
    this.contextError.set(null);
    this.auth.selectContext({ tenantId }).subscribe({
      next: () => {
        this.contextLoading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.contextLoading.set(false);
        this.contextError.set('No pudimos cambiar el negocio activo.');
      },
    });
  }
}
