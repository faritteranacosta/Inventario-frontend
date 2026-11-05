import { Injectable, inject, signal } from '@angular/core';
import { ProductsApi } from '../features/products/products.api';
import { ProductAlertResponse } from './models/api.models';

@Injectable({ providedIn: 'root' })
export class StockAlertsService {
  private readonly productsApi = inject(ProductsApi);
  private readonly alertsState = signal<readonly ProductAlertResponse[]>([]);

  readonly alerts = this.alertsState.asReadonly();

  reload(): void {
    this.productsApi.alerts().subscribe({
      next: (alerts) => this.alertsState.set(alerts),
      error: () => {
        /* noop */
      },
    });
  }
}
