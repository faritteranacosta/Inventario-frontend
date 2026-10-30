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

  constructor() {
    this.salesApi.summary().subscribe({
      next: (value) => {
        this.summary.set(value);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No fue posible cargar el resumen de ventas.');
        this.loading.set(false);
      },
    });
  }
}
