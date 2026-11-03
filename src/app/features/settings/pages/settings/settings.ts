import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { TenantsApi } from '../../../tenants/tenants.api';
import { resolveImageUrl } from '../../../../core/utils/image';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  protected readonly auth = inject(AuthService);
  private readonly tenantsApi = inject(TenantsApi);
  private readonly fb = inject(FormBuilder);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly editing = signal(false);
  protected readonly logoPreview = signal<string | null>(this.auth.activeTenantLogoUrl());

  protected readonly logoSrc = computed(() => resolveImageUrl(this.logoPreview()));

  protected logoPreviewSrc(): string | null {
    return resolveImageUrl(this.logoPreview());
  }

  protected toggleEdit(): void {
    this.editing.set(!this.editing());
    this.message.set(null);
  }

  protected readonly initials = computed(() => {
    const name = this.auth.activeTenantName() || this.auth.user()?.email || '?';
    return name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });
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
        this.auth.me().subscribe({ error: () => {} });
        this.message.set('Nombre guardado.');
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
        this.auth.me().subscribe({ error: () => {} });
        this.message.set('Logo actualizado.');
      },
      error: () => {
        this.uploading.set(false);
        this.message.set('No se pudo cargar el logo.');
      },
    });
  }
}