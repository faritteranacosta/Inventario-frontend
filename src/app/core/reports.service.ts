import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Reports`;

  downloadSalesCsv(from?: string, to?: string): void {
    let params = '';
    if (from) params += `?from=${encodeURIComponent(from)}`;
    if (to) params += `${params ? '&' : '?'}to=${encodeURIComponent(to)}`;
    this.download(`${this.url}/sales.csv${params}`, 'sales.csv');
  }

  downloadInventoryCsv(): void {
    this.download(`${this.url}/inventory.csv`, 'inventory.csv');
  }

  private download(url: string, filename: string): void {
    this.http.get(url, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const disposition = response.headers.get('Content-Disposition');
        const match = disposition?.match(/filename="?([^"]+)"?/);
        link.download = match?.[1] ?? filename;
        link.click();
        URL.revokeObjectURL(link.href);
      },
      error: () => {
        /* noop: el interceptor/notificación maneja el error */
      },
    });
  }
}
