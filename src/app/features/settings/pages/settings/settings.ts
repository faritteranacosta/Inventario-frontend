import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { TenantsApi } from '../../../tenants/tenants.api';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly auth = inject(AuthService);
  private readonly tenantsApi = inject(TenantsApi);
  private readonly fb = inject(FormBuilder);
  protected readonly saving = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    displayName: [this.auth.activeTenantName() ?? ''],
    logoUrl: [this.auth.activeTenantLogoUrl() ?? ''],
  });

  protected save(): void {
    this.saving.set(true);
    this.message.set(null);
    const { displayName, logoUrl } = this.form.getRawValue();
    this.tenantsApi.updateBranding(displayName, logoUrl || null).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('Configuración guardada. Recarga para ver los cambios.');
      },
      error: () => {
        this.saving.set(false);
        this.message.set('No se pudo guardar la configuración.');
      },
    });
  }
}
