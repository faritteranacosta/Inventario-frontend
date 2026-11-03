import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { TenantsApi } from '../../../tenants/tenants.api';
import { resolveImageUrl } from '../../../../core/utils/image';
import { validateLogoFile } from './logo-validation';

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
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly editing = signal(false);
  protected readonly logoPreview = signal<string | null>(this.auth.activeTenantLogoUrl());

  protected readonly logoSrc = computed(() => resolveImageUrl(this.logoPreview()));

  protected logoPreviewSrc(): string | null {
    return resolveImageUrl(this.logoPreview());
  }

  protected toggleEdit(): void {
    this.editing.set(!this.editing());
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
    const { displayName } = this.form.getRawValue();
    this.tenantsApi.updateBranding(displayName, null).subscribe({
      next: () => {
        this.saving.set(false);
        this.auth.me().subscribe({
          error: () => {
            /* noop */
          },
        });
        this.notifications.success('Nombre del negocio actualizado.');
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('No se pudo guardar el nombre del negocio.');
      },
    });
  }

  protected selectLogo(file: File | undefined): void {
    if (!file) return;
    const validationMessage = validateLogoFile(file);
    if (validationMessage) {
      this.notifications.error(validationMessage);
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = img;
      if (width < 64 || height < 64) {
        this.notifications.error('La imagen es muy pequeña. Usa al menos 64×64 px.');
        return;
      }
      if (width > 1024 || height > 1024) {
        this.notifications.error('La imagen es muy grande. El máximo es 1024×1024 px.');
        return;
      }
      if (Math.abs(width - height) > Math.max(width, height) * 0.15) {
        this.notifications.error('El logo debe ser cuadrado o casi cuadrado (relación 1:1).');
        return;
      }
      this.logoPreview.set(URL.createObjectURL(file));
      this.uploading.set(true);
      this.tenantsApi.uploadLogo(file).subscribe({
        next: () => {
          this.uploading.set(false);
          this.auth.me().subscribe({
            error: () => {
              /* noop */
            },
          });
          this.notifications.success('Logo del negocio actualizado.');
        },
        error: (error: unknown) => {
          this.uploading.set(false);
          this.notifications.error(
            apiMessage(
              error,
              'No se pudo cargar el logo. El servidor rechazó el formato o el archivo.',
            ),
          );
        },
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      this.notifications.error(
        'No se pudo leer la imagen. Verifica que el archivo no esté dañado y usa un formato compatible.',
      );
    };
    img.src = objectUrl;
  }
}

function apiMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const body = error.error;
    if (
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
    ) {
      return body.message;
    }
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
  }
  return fallback;
}
