import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductsApi } from '../../../products/products.api';
import { ProductResponse, SaleResponse } from '../../../../core/models/api.models';
import { SalesApi } from '../../sales.api';
import { NotificationService } from '../../../../core/notifications/notification.service';

interface SaleLine {
  readonly product: ProductResponse;
  quantity: number;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPage {
  private readonly salesApi = inject(SalesApi);
  private readonly productsApi = inject(ProductsApi);
  private readonly notifications = inject(NotificationService);
  protected readonly sales = signal<readonly SaleResponse[]>([]);
  protected readonly products = signal<readonly ProductResponse[]>([]);
  protected readonly lines = signal<readonly SaleLine[]>([]);
  protected readonly selectedSale = signal<SaleResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly productSearch = signal('');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly activeView = signal<'history' | 'new'>('history');

  constructor() {
    this.loadProducts();
    this.load();
  }

  protected loadProducts(): void {
    this.productsApi.list().subscribe({
      next: (products) => this.products.set(products),
      error: () => this.errorMessage.set('No pudimos cargar el catálogo para registrar ventas.'),
    });
  }

  protected load(): void {
    if (this.from() && this.to() && this.from() > this.to()) {
      this.errorMessage.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.salesApi
      .list(this.from() || undefined, this.to() ? `${this.to()}T23:59:59Z` : undefined)
      .subscribe({
        next: (sales) => {
          this.sales.set([...sales].sort((a, b) => b.saleDateUtc.localeCompare(a.saleDateUtc)));
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiMessage(error, 'No pudimos cargar las ventas.'));
          this.loading.set(false);
        },
      });
  }

  protected filteredProducts(): readonly ProductResponse[] {
    const query = this.productSearch().trim().toLowerCase();
    return this.products().filter(
      (product) => product.name.toLowerCase().includes(query) && product.stock > 0,
    );
  }

  protected hasLine(productId: string): boolean {
    return this.lines().some((line) => line.product.id === productId);
  }

  protected add(product: ProductResponse): void {
    const current = this.lines();
    const existing = current.find((line) => line.product.id === product.id);
    if (existing) {
      this.lines.set(
        current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) }
            : line,
        ),
      );
      return;
    }
    this.lines.set([...current, { product, quantity: 1 }]);
  }

  protected updateQuantity(productId: string, value: number): void {
    const line = this.lines().find((item) => item.product.id === productId);
    if (!line) return;
    const quantity = Math.min(Math.max(Math.floor(Number(value) || 0), 1), line.product.stock);
    this.lines.set(
      this.lines().map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    );
  }

  protected removeLine(productId: string): void {
    this.lines.set(this.lines().filter((line) => line.product.id !== productId));
  }

  protected lineTotal(line: SaleLine): number {
    return line.product.price * line.quantity;
  }

  protected total(): number {
    return this.lines().reduce((total, line) => total + this.lineTotal(line), 0);
  }

  protected submit(): void {
    if (!this.lines().length) {
      this.errorMessage.set('Agrega al menos un producto para registrar la venta.');
      return;
    }
    if (!confirm(`¿Confirmar venta por ${this.total().toFixed(2)}?`)) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.salesApi
      .create({
        items: this.lines().map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      })
      .subscribe({
        next: (sale) => {
          this.saving.set(false);
          this.lines.set([]);
          this.selectedSale.set(sale);
          this.activeView.set('history');
          this.notifications.success('Venta registrada correctamente.');
          this.loadProducts();
          this.load();
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.errorMessage.set(
            apiMessage(
              error,
              'No pudimos registrar la venta. Ajusta las cantidades si el stock cambió.',
            ),
          );
        },
      });
  }

  protected detail(id: string): void {
    this.salesApi.get(id).subscribe({
      next: (sale) => this.selectedSale.set(sale),
      error: (error: unknown) =>
        this.errorMessage.set(apiMessage(error, 'La venta ya no está disponible.')),
    });
  }

  protected cancel(): void {
    this.lines.set([]);
    this.errorMessage.set(null);
    this.activeView.set('history');
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
