import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SalesApi } from '../../../sales/sales.api';
import { SalesSummaryResponse } from '../../../../core/models/api.models';

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
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly summary = signal<SalesSummaryResponse | null>(null);
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly groupBy = signal<'day' | 'month'>('day');

  constructor() {
    this.load();
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
