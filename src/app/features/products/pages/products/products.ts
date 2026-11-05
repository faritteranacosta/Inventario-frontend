/* eslint-disable max-lines */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesApi } from '../../../categories/categories.api';
import {
  CategoryResponse,
  ProductAlertResponse,
  ProductResponse,
} from '../../../../core/models/api.models';
import { ProductsApi } from '../../products.api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { resolveImageUrl } from '../../../../core/utils/image';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/auth/auth.service';
import { ReportsService } from '../../../../core/reports.service';

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
  private readonly reports = inject(ReportsService);

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
  protected readonly page = signal(1);
  protected readonly pageSize = signal(25);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly alerts = signal<readonly ProductAlertResponse[]>([]);
  protected readonly barcodeQuery = signal('');
  protected readonly barcodeResult = signal<ProductResponse | null>(null);
  protected readonly barcodeError = signal<string | null>(null);
  protected readonly scanning = signal(false);
  protected readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    description: this.fb.nonNullable.control(''),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    stock: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    categoryId: this.fb.nonNullable.control('', Validators.required),
    minimumStock: this.fb.control<number | null>(null),
    barcode: this.fb.nonNullable.control(''),
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

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.productsApi
      .list({
        search: this.search() || undefined,
        categoryId: this.categoryFilter() || undefined,
        page: this.page(),
        pageSize: this.pageSize(),
      })
      .subscribe({
        next: (response) => {
          this.products.set(response.items);
          this.totalItems.set(response.totalItems);
          this.totalPages.set(response.totalPages);
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
    this.loadAlerts();
  }

  protected loadAlerts(): void {
    this.productsApi.alerts().subscribe({
      next: (alerts) => this.alerts.set(alerts),
      error: () => {
        /* noop: las alertas son secundarias */
      },
    });
  }

  protected exportInventory(): void {
    this.reports.downloadInventoryCsv();
  }

  protected updateBarcodeQuery(value: string): void {
    this.barcodeQuery.set(value);
    this.barcodeError.set(null);
  }

  protected searchByBarcode(): void {
    const code = this.barcodeQuery().trim();
    if (!code) {
      this.barcodeError.set('Ingresa un código de barras.');
      return;
    }
    this.barcodeError.set(null);
    this.productsApi.getByBarcode(code).subscribe({
      next: (product) => this.barcodeResult.set(product),
      error: () => {
        this.barcodeResult.set(null);
        this.barcodeError.set('No encontramos un producto con ese código.');
      },
    });
  }

  protected startScan(): void {
    const barcodeDetectorCtor = (window as unknown as Record<string, unknown>)[
      'BarcodeDetector'
    ] as
      | (new (options?: { formats?: string[] }) => {
          detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
        })
      | undefined;
    if (!barcodeDetectorCtor) {
      this.barcodeError.set('Tu navegador no soporta escaneo por cámara.');
      return;
    }
    this.scanning.set(true);
    this.barcodeError.set(null);
    void navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        void video.play();
        const detector = new barcodeDetectorCtor({ formats: ['ean_13', 'code_128', 'qr_code'] });
        const scan = (): void => {
          if (!this.scanning()) return;
          detector
            .detect(video)
            .then((barcodes) => {
              if (barcodes.length) {
                this.barcodeQuery.set(barcodes[0].rawValue);
                this.scanning.set(false);
                stream.getTracks().forEach((track) => track.stop());
                this.searchByBarcode();
                return;
              }
              requestAnimationFrame(scan);
            })
            .catch(() => {
              requestAnimationFrame(scan);
            });
        };
        requestAnimationFrame(scan);
      })
      .catch(() => {
        this.scanning.set(false);
        this.barcodeError.set('No pudimos acceder a la cámara.');
      });
  }

  protected stopScan(): void {
    this.scanning.set(false);
  }

  protected updateSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 300);
  }

  protected updateCategory(value: string): void {
    this.categoryFilter.set(value);
    this.page.set(1);
    this.load();
  }

  protected goToPage(next: number): void {
    if (next < 1 || next > this.totalPages()) return;
    this.page.set(next);
    this.load();
  }

  protected setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.resetProductForm();
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
          price: request.price ?? 0,
          stock: request.stock,
          categoryId: request.categoryId,
          minimumStock: request.minimumStock ?? null,
          barcode: request.barcode || null,
        })
      : this.productsApi.create({
          ...request,
          price: request.price ?? 0,
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
      price: null,
      stock: 0,
      categoryId: '',
      minimumStock: null,
      barcode: '',
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

  protected stockStatus(product: ProductResponse): 'out' | 'low' | 'ok' {
    if (product.stock <= 0) return 'out';
    if (product.minimumStock !== null && product.stock <= product.minimumStock) return 'low';
    return 'ok';
  }

  protected editById(id: string): void {
    this.productsApi.get(id).subscribe({
      next: (product) => this.edit(product),
      error: () => this.errorMessage.set('No pudimos cargar el producto.'),
    });
  }

  protected categoryName(id: string): string {
    return this.categories().find((category) => category.id === id)?.name ?? 'Sin categoría';
  }

  protected imageUrlSrc(url: string | null | undefined): string | null {
    return resolveImageUrl(url);
  }

  protected remove(product: ProductResponse): void {
    void Swal.fire({
      title: '¿Eliminar producto?',
      text: `Se eliminará permanentemente ${product.name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--app-danger)',
    }).then((result) => {
      if (!result.isConfirmed) return;
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
          minimumStock: detail.minimumStock ?? null,
          barcode: detail.barcode ?? '',
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
