import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

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
  protected readonly contextLoading = signal(false);
  protected readonly contextError = signal<string | null>(null);

  constructor() {
    if (this.auth.isAuthenticated() && !this.auth.session()) {
      this.auth.me().subscribe({ error: () => undefined });
    }
  }

  protected selectTenant(tenantId: string): void {
    if (!tenantId || tenantId === this.auth.activeTenantId()) return;
    this.contextLoading.set(true);
    this.contextError.set(null);
    this.auth.selectContext({ tenantId }).subscribe({
      next: () => this.contextLoading.set(false),
      error: () => {
        this.contextLoading.set(false);
        this.contextError.set('No pudimos cambiar el negocio activo.');
      },
    });
  }
}
