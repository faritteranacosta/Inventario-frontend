import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserResponse } from '../../../../core/models/api.models';
import { TenantsApi } from '../../../tenants/tenants.api';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage {
  private readonly api = inject(TenantsApi);
  protected readonly auth = inject(AuthService);
  protected readonly lookupId = signal('');
  protected readonly user = signal<UserResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    const current = this.auth.user();
    if (current) this.user.set(current);
  }

  protected lookup(): void {
    const id = this.lookupId().trim();
    if (!id) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getUser(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.user.set(null);
        this.loading.set(false);
        this.errorMessage.set('No encontramos un usuario con ese identificador.');
      },
    });
  }
}
