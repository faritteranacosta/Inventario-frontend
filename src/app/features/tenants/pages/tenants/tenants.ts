import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantResponse } from '../../../../core/models/api.models';
import { TenantsApi } from '../../tenants.api';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenants.html',
  styleUrl: './tenants.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantsPage {
  private readonly api = inject(TenantsApi);
  private readonly fb = inject(FormBuilder);
  protected readonly tenants = signal<readonly TenantResponse[]>([]);
  protected readonly selected = signal<TenantResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar los negocios.');
        this.loading.set(false);
      },
    });
  }

  protected create(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.api.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '' });
        this.load();
      },
      error: () => this.errorMessage.set('No pudimos crear el negocio.'),
    });
  }

  protected view(tenant: TenantResponse): void {
    this.api.get(tenant.id).subscribe({
      next: (value) => this.selected.set(value),
      error: () => this.errorMessage.set('No pudimos cargar el detalle del negocio.'),
    });
  }

  protected remove(tenant: TenantResponse): void {
    if (!confirm(`¿Eliminar permanentemente ${tenant.name}?`)) return;
    this.api.remove(tenant.id).subscribe({
      next: () => {
        this.selected.set(null);
        this.load();
      },
      error: () => this.errorMessage.set('No pudimos eliminar el negocio.'),
    });
  }
}
