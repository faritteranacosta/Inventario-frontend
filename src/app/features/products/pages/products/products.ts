import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesApi } from '../../../categories/categories.api';
import { CategoryResponse, ProductResponse } from '../../../../core/models/api.models';
import { ProductsApi } from '../../products.api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { resolveImageUrl } from '../../../../core/utils/image';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  private readonly productsApi = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  protected readonly auth = inject(AuthService);

  protected readonly products = signal<readonly ProductResponse[]>([]);
  protected readonly categories = signal<readonly CategoryResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly imageProduct = signal<ProductResponse | null>(null);
  protected readonly imageFile = signal<File | null>(null);
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly productImageFile = signal<File | null>(null);
  protected readonly productImagePreview = signal<string | null>(null);
  protected readonly imageError = signal<string | null>(null);
  protected readonly uploading = signal(false);
  protected readonly search = signal('');
  protected readonly categoryFilter = signal('');
  protected readonly viewMode = signal<'list' | 'grid'>('list');
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
  });

  constructor() {
    this.load();
    this.categoriesApi.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {
        this.errorMessage.set('No pudimos cargar las categorías.');
        this.notifications.error(
          'No se pudieron cargar las categorías. Revisa la conexión con la API.',
        );
      },
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.productsApi
      .list({
        search: this.search() || undefined,
        categoryId: this.categoryFilter() || undefined,
      })
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('No pudimos cargar los productos.');
          this.notifications.error(
            'No se pudieron cargar los productos. Revisa la conexión con la API.',
          );
          this.loading.set(false);
        },
      });
  }

  protected updateSearch(value: string): void {
    this.search.set(value);
    this.load();
  }

  protected updateCategory(value: string): void {
    this.categoryFilter.set(value);
    this.load();
  }

  protected setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    const isEditing = Boolean(this.editingId());
    const request = {
      ...value,
      description: value.description || null,
    };
    const operation = this.editingId()
      ? this.productsApi.update(this.editingId()!, {
          name: request.name,
          description: request.description,
          price: request.price,
          stock: request.stock,
          categoryId: request.categoryId,
        })
      : this.productsApi.create({
          ...request,
          imageUrl: null,
        });
    operation.subscribe({
      next: (product) => {
        const imageFile = this.productImageFile();
        if (!this.editingId() && imageFile) {
          this.uploadCreatedProductImage(product, imageFile);
          return;
        }
        this.finishSave(isEditing);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No pudimos guardar el producto.');
        this.notifications.error(
          'No se pudo guardar el producto. Revisa los datos e inténtalo nuevamente.',
        );
      },
    });
  }

  private finishSave(isEditing: boolean): void {
    this.resetProductForm();
    this.showForm.set(false);
    this.editingId.set(null);
    this.saving.set(false);
    this.notifications.success(
      isEditing ? 'Producto actualizado correctamente.' : 'Producto guardado correctamente.',
    );
    this.load();
  }

  private resetProductForm(): void {
    this.form.reset({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
    });
    this.clearProductImage();
  }

  private uploadCreatedProductImage(product: ProductResponse, file: File): void {
    this.productsApi.uploadImage(product.id, file).subscribe({
      next: () => this.finishSave(false),
      error: () => {
        this.saving.set(false);
        this.resetProductForm();
        this.showForm.set(false);
        this.editingId.set(null);
        this.errorMessage.set(
          'El producto se creó, pero no pudimos cargar su imagen. Puedes intentarlo desde Imagen.',
        );
        this.notifications.error('El producto se creó, pero la imagen no pudo cargarse.');
        this.load();
      },
    });
  }

  protected categoryName(id: string): string {
    return this.categories().find((category) => category.id === id)?.name ?? 'Sin categoría';
  }

  protected imageUrlSrc(url: string | null | undefined): string | null {
    return resolveImageUrl(url);
  }

  protected remove(product: ProductResponse): void {
    if (!confirm(`¿Eliminar permanentemente ${product.name}?`)) return;
    this.productsApi.remove(product.id).subscribe({
      next: () => {
        this.notifications.success('Producto eliminado correctamente.');
        this.load();
      },
      error: () => {
        this.errorMessage.set('No pudimos eliminar el producto.');
        this.notifications.error('No se pudo eliminar el producto.');
      },
    });
  }

  protected edit(product: ProductResponse): void {
    this.productsApi.get(product.id).subscribe({
      next: (detail) => {
        this.editingId.set(detail.id);
        this.form.reset({
          name: detail.name,
          description: detail.description ?? '',
          price: detail.price,
          stock: detail.stock,
          categoryId: detail.categoryId,
        });
        this.clearProductImage();
        this.showForm.set(true);
      },
      error: () => {
        this.errorMessage.set('El producto ya no está disponible. Actualiza el catálogo.');
      },
    });
  }

  protected openImage(product: ProductResponse): void {
    this.imageProduct.set(product);
    this.imageFile.set(null);
    this.imagePreview.set(product.imageUrl);
    this.imageError.set(null);
  }

  protected closeImage(): void {
    this.imageProduct.set(null);
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.imageError.set(null);
  }

  protected selectImage(file: File | undefined): void {
    this.imageError.set(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.imageError.set('Selecciona un archivo de imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageError.set('La imagen no puede superar 5 MB.');
      return;
    }
    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
  }

  protected selectProductImage(file: File | undefined): void {
    this.imageError.set(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.imageError.set('Selecciona un archivo de imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageError.set('La imagen no puede superar 5 MB.');
      return;
    }
    this.productImageFile.set(file);
    this.productImagePreview.set(URL.createObjectURL(file));
  }

  private clearProductImage(): void {
    this.productImageFile.set(null);
    this.productImagePreview.set(null);
  }

  protected uploadFile(): void {
    const product = this.imageProduct();
    const file = this.imageFile();
    if (!product || !file) {
      this.imageError.set('Selecciona una imagen antes de cargarla.');
      return;
    }
    this.uploading.set(true);
    this.productsApi.uploadImage(product.id, file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.closeImage();
        this.notifications.success('Imagen actualizada correctamente.');
        this.load();
      },
      error: () => {
        this.uploading.set(false);
        this.imageError.set('No pudimos cargar la imagen. Inténtalo nuevamente.');
      },
    });
  }
}
