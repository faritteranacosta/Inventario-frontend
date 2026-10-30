import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface SelectOption {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-form-demo',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-demo.html',
  styleUrl: './form-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDemoPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly categories: readonly SelectOption[] = [
    { label: 'Electrónica', value: 'electronica' },
    { label: 'Hogar', value: 'hogar' },
    { label: 'Oficina', value: 'oficina' },
    { label: 'Accesorios', value: 'accesorios' },
  ];

  protected readonly warehouses: readonly SelectOption[] = [
    { label: 'Bodega principal', value: 'principal' },
    { label: 'Tienda norte', value: 'norte' },
    { label: 'Centro de distribución', value: 'distribucion' },
  ];

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    sku: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
    category: ['', Validators.required],
    warehouse: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    minimumStock: [5, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  protected readonly submitted = signal(false);

  protected error(controlName: string): string | undefined {
    const control = this.form.get(controlName);
    if (!control || control.valid || !control.touched) {
      return undefined;
    }
    if (control.errors?.['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors?.['minlength']) {
      return 'Usa al menos 3 caracteres.';
    }
    if (control.errors?.['pattern']) {
      return 'Usa mayúsculas, números y guiones.';
    }
    if (control.errors?.['min']) {
      return 'El valor no puede ser negativo.';
    }
    return 'Valor no válido.';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitted.set(false);
      return;
    }
    this.submitted.set(true);
  }

  protected reset(): void {
    this.form.reset({ quantity: 0, minimumStock: 5 });
    this.submitted.set(false);
  }

  protected goHome(): void {
    void this.router.navigate(['/']);
  }
}
