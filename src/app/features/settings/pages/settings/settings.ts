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
  protected readonly uploading = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly logoPreview = signal<string | null>(this.auth.activeTenantLogoUrl());
  protected readonly form = this.fb.nonNullable.group({
    displayName: [this.auth.activeTenantName() ?? ''],
  });

  protected save(): void {
    this.saving.set(true);
    this.message.set(null);
    const { displayName } = this.form.getRawValue();
    this.tenantsApi.updateBranding(displayName, null).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('Nombre guardado. Recarga para ver los cambios.');
      },
      error: () => {
        this.saving.set(false);
        this.message.set('No se pudo guardar el nombre.');
      },
    });
  }

  protected selectLogo(file: File | undefined): void {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.message.set('Selecciona un archivo de imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.message.set('La imagen no puede superar 5 MB.');
      return;
    }
    this.logoPreview.set(URL.createObjectURL(file));
    this.uploading.set(true);
    this.message.set(null);
    this.tenantsApi.uploadLogo(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.message.set('Logo actualizado. Recarga para ver los cambios.');
      },
      error: () => {
        this.uploading.set(false);
        this.message.set('No se pudo cargar el logo.');
      },
    });
  }
}