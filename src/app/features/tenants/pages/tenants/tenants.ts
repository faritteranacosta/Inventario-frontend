import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipResponse, PlatformTenantResponse } from '../../../../core/models/api.models';
import { PlatformApi } from '../../platform.api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenants.html',
  styleUrl: './tenants.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantsPage {
  private readonly api = inject(PlatformApi);
  private readonly fb = inject(FormBuilder);
  protected readonly tenants = signal<readonly PlatformTenantResponse[]>([]);
  protected readonly selected = signal<PlatformTenantResponse | null>(null);
  protected readonly members = signal<readonly MembershipResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    adminEmail: ['', [Validators.email]],
    adminPassword: [''],
  });
  protected readonly memberForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['User' as 'Admin' | 'User', Validators.required],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.listTenants().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar los negocios de la plataforma.');
        this.loading.set(false);
      },
    });
  }

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completa el nombre del negocio (mínimo 2 caracteres).');
      return;
    }
    const { name, adminEmail, adminPassword } = this.form.getRawValue();
    if ((adminEmail && !adminPassword) || (!adminEmail && adminPassword)) {
      this.errorMessage.set('El correo y la contraseña del administrador deben enviarse juntos.');
      return;
    }
    if (adminPassword && adminPassword.length < 8) {
      this.errorMessage.set('La contraseña del administrador debe tener al menos 8 caracteres.');
      return;
    }
    this.busy.set(true);
    this.api
      .createTenant({
        name,
        ...(adminEmail ? { adminEmail, adminPassword } : {}),
      })
      .subscribe({
        next: (tenant) => {
          this.form.reset({ name: '', adminEmail: '', adminPassword: '' });
          this.busy.set(false);
          this.successMessage.set(`Negocio "${tenant.name}" creado correctamente.`);
          this.errorMessage.set(null);
          this.load();
        },
        error: (err: unknown) => {
          this.busy.set(false);
          this.successMessage.set(null);
          const msg = (err as { error?: { message?: string } })?.error?.message;
          this.errorMessage.set(
            msg ?? 'No pudimos crear el negocio. Verifica que seas PlatformAdmin.',
          );
        },
      });
  }

  protected view(tenant: PlatformTenantResponse): void {
    this.selected.set(tenant);
    this.api.listMembers(tenant.id).subscribe({
      next: (members) => this.members.set(members),
      error: () => this.errorMessage.set('No pudimos cargar las membresías del negocio.'),
    });
  }

  protected toggleStatus(tenant: PlatformTenantResponse): void {
    const nextStatus = tenant.status === 'Active' ? 'Suspended' : 'Active';
    const action = nextStatus === 'Suspended' ? 'suspender' : 'reactivar';
    void Swal.fire({
      title: `¿${action} ${tenant.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.api.updateTenantStatus(tenant.id, { status: nextStatus }).subscribe({
        next: (updated) => {
          this.tenants.update((items) =>
            items.map((item) => (item.id === updated.id ? updated : item)),
          );
          this.selected.set(updated);
        },
        error: () => this.errorMessage.set('No pudimos actualizar el estado del negocio.'),
      });
    });
    return;
  }

  protected remove(tenant: PlatformTenantResponse): void {
    void Swal.fire({
      title: `¿Eliminar ${tenant.name}?`,
      text: 'Esta acción elimina permanentemente el negocio y todos sus datos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.api.removeTenant(tenant.id).subscribe({
        next: () => {
          this.selected.set(null);
          this.members.set([]);
          this.load();
        },
        error: () => this.errorMessage.set('No pudimos eliminar el negocio.'),
      });
    });
  }

  protected createMember(): void {
    const tenant = this.selected();
    if (!tenant || this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      this.errorMessage.set(
        'Completa los datos del usuario (email y contraseña de al menos 8 caracteres).',
      );
      return;
    }
    this.busy.set(true);
    this.api.createMember(tenant.id, this.memberForm.getRawValue()).subscribe({
      next: (member) => {
        this.members.update((items) => [...items, member]);
        this.memberForm.reset({ email: '', password: '', role: 'User' });
        this.busy.set(false);
        this.successMessage.set('Acceso agregado correctamente.');
        this.errorMessage.set(null);
      },
      error: (err: unknown) => {
        this.busy.set(false);
        const msg = (err as { error?: { message?: string } })?.error?.message;
        this.errorMessage.set(msg ?? 'No pudimos crear la membresía.');
      },
    });
  }

  protected updateMember(member: MembershipResponse): void {
    const status = member.status === 'Active' ? 'Suspended' : 'Active';
    this.api.updateMember(member.tenantId, member.userId, { status }).subscribe({
      next: (updated) =>
        this.members.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        ),
      error: () => this.errorMessage.set('No pudimos actualizar la membresía.'),
    });
  }

  protected revokeMember(member: MembershipResponse): void {
    void Swal.fire({
      title: `¿Revocar acceso de ${member.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Revocar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.api.removeMember(member.tenantId, member.userId).subscribe({
        next: () => this.members.update((items) => items.filter((item) => item.id !== member.id)),
        error: () => this.errorMessage.set('No pudimos revocar la membresía.'),
      });
    });
  }
}
