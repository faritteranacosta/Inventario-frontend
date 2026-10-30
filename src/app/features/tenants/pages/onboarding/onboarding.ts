import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TenantsApi } from '../../tenants.api';
import { TenantResponse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage {
  private readonly api = inject(TenantsApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly pending = signal(false);
  protected readonly created = signal<TenantResponse | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  protected submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.pending.set(true);
    this.api.create(this.form.getRawValue()).subscribe({
      next: (tenant) => {
        this.created.set(tenant);
        this.pending.set(false);
      },
      error: (error: unknown) => {
        this.pending.set(false);
        this.errorMessage.set(apiMessage(error, 'No pudimos crear el negocio.'));
      },
    });
  }

  protected register(): void {
    const tenantId = this.created()?.id;
    if (tenantId) void this.router.navigate(['/register'], { queryParams: { tenantId } });
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
    )
      return body.message;
  }
  return fallback;
}
