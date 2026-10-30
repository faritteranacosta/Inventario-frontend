import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly pending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    tenantId: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    role: ['User', Validators.required],
  });

  constructor() {
    const tenantId = this.route.snapshot.queryParamMap.get('tenantId');
    if (tenantId) this.form.controls.tenantId.setValue(tenantId);
  }

  protected submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    if (this.form.controls.password.value !== this.form.controls.confirmPassword.value) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }
    this.pending.set(true);
    this.errorMessage.set(null);
    const { tenantId, email, password, role } = this.form.getRawValue();
    this.auth.register({ tenantId, email, password, role }).subscribe({
      next: () => {
        this.pending.set(false);
        this.successMessage.set('Usuario creado. Ya puedes iniciar sesión.');
        setTimeout(() => void this.router.navigate(['/login']), 800);
      },
      error: (error: unknown) => {
        this.pending.set(false);
        this.errorMessage.set(apiMessage(error, 'No pudimos registrar el usuario.'));
      },
    });
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
  }
  return fallback;
}
