import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlatformApi } from '../../../tenants/platform.api';

@Component({
  selector: 'app-bootstrap',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="bootstrap">
      <h1>Configurar administrador de plataforma</h1>
      <p>Solo disponible la primera vez, si no existe ningún administrador.</p>
      @if (success()) {
        <div class="notice notice--success" role="status">{{ success() }}</div>
        <button type="button" (click)="goLogin()">Ir a iniciar sesión</button>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Correo <input type="email" formControlName="email" /></label>
          <label>Contraseña <input type="password" formControlName="password" /></label>
          <button type="submit" [disabled]="pending()">Crear administrador</button>
        </form>
        @if (error()) { <div class="notice notice--error" role="alert">{{ error() }}</div> }
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootstrapPage {
  private readonly api = inject(PlatformApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly pending = signal(false);
  protected readonly success = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.pending.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.api.bootstrap(email, password).subscribe({
      next: () => {
        this.pending.set(false);
        this.success.set('Administrador de plataforma creado. Inicia sesión con esas credenciales.');
      },
      error: (e: unknown) => {
        this.pending.set(false);
        const msg = (e as { error?: { message?: string } })?.error?.message;
        this.error.set(msg ?? 'No se pudo crear el administrador (quizá ya existe).');
      },
    });
  }

  protected goLogin(): void {
    void this.router.navigate(['/login']);
  }
}
