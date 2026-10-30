import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SalesApi } from '../../sales.api';
import { SaleResponse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPage {
  private readonly salesApi = inject(SalesApi);
  protected readonly sales = signal<readonly SaleResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.salesApi.list().subscribe({
      next: (sales) => {
        this.sales.set(sales);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar las ventas. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }
}
