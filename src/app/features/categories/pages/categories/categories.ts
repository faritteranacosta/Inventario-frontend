import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesApi } from '../../categories.api';
import { CategoryResponse } from '../../../../core/models/api.models';
import { NotificationService } from '../../../../core/notifications/notification.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  private readonly api = inject(CategoriesApi);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  protected readonly categories = signal<readonly CategoryResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar las categorías.');
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '' });
    this.showForm.set(true);
  }

  protected edit(category: CategoryResponse): void {
    this.editingId.set(category.id);
    this.form.reset({ name: category.name, description: category.description ?? '' });
    this.showForm.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const request = {
      ...this.form.getRawValue(),
      description: this.form.controls.description.value || null,
    };
    const operation = this.editingId()
      ? this.api.update(this.editingId()!, request)
      : this.api.create(request);
    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.notifications.success(
          this.editingId() ? 'Categoría actualizada.' : 'Categoría creada.',
        );
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No pudimos guardar la categoría.');
      },
    });
  }

  protected remove(category: CategoryResponse): void {
    if (
      !confirm(`¿Eliminar la categoría ${category.name}? Los productos asociados pueden impedirlo.`)
    )
      return;
    this.api.remove(category.id).subscribe({
      next: () => {
        this.notifications.success('Categoría eliminada.');
        this.load();
      },
      error: () =>
        this.errorMessage.set(
          'La categoría no se puede eliminar. Revisa si tiene productos asociados.',
        ),
    });
  }
}
