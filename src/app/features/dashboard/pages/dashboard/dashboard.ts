import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { SalesApi } from '../../../sales/sales.api';
import { ProductsApi } from '../../../products/products.api';
import { ReportsService } from '../../../../core/reports.service';
import { SalesSummaryResponse, ProductAlertResponse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly salesApi = inject(SalesApi);
  private readonly productsApi = inject(ProductsApi);
  private readonly reports = inject(ReportsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly loading = signal(true);
  protected readonly alerts = signal<readonly ProductAlertResponse[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly summary = signal<SalesSummaryResponse | null>(null);
  protected readonly from = signal(this.defaultFrom());
  protected readonly to = signal(this.defaultTo());
  protected readonly groupBy = signal<'day' | 'month'>('day');

  private defaultFrom(): string {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }

  private defaultTo(): string {
    return new Date().toISOString().slice(0, 10);
  }
  protected readonly isPlatformAdmin = this.auth.isPlatformAdmin;

  constructor() {
    if (this.auth.isPlatformAdmin()) {
      void this.router.navigate(['/tenants']);
      return;
    }
    this.load();
    this.loadAlerts();
  }

  protected loadAlerts(): void {
    this.productsApi.alerts().subscribe({
      next: (alerts) => this.alerts.set(alerts),
      error: () => {
        /* noop */
      },
    });
  }

  protected exportSales(): void {
    this.reports.downloadSalesCsv(
      this.from() || undefined,
      this.to() ? `${this.to()}T23:59:59Z` : undefined,
    );
  }

  protected exportInventory(): void {
    this.reports.downloadInventoryCsv();
  }

  protected load(): void {
    if (this.from() && this.to() && this.from() > this.to()) {
      this.errorMessage.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.salesApi
      .summary(
        this.from() || undefined,
        this.to() ? `${this.to()}T23:59:59Z` : undefined,
        this.groupBy(),
      )
      .subscribe({
        next: (value) => {
          this.summary.set(value);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiMessage(error, 'No fue posible cargar el resumen de ventas.'));
          this.loading.set(false);
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
