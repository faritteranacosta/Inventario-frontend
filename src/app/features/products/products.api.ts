import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateProductRequest,
  PagedResponse,
  ProductAlertResponse,
  ProductResponse,
  UpdateProductRequest,
} from '../../core/models/api.models';

export interface ProductSearch {
  readonly categoryId?: string;
  readonly search?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Products`;

  list(filters: ProductSearch = {}): Observable<PagedResponse<ProductResponse>> {
    let params = new HttpParams();
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize);
    return this.http.get<unknown>(this.url, { params }).pipe(map(toProductPage));
  }

  alerts(kind?: 'LOW' | 'OUT'): Observable<readonly ProductAlertResponse[]> {
    let params = new HttpParams();
    if (kind) params = params.set('kind', kind);
    return this.http.get<readonly ProductAlertResponse[]>(`${this.url}/alerts`, { params });
  }

  getByBarcode(barcode: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.url}/by-barcode/${encodeURIComponent(barcode)}`);
  }

  get(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.url}/${id}`);
  }

  create(request: CreateProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.url, request);
  }

  update(id: string, request: UpdateProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.url}/${id}`, request);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  setImage(id: string, imageUrl: string | null): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.url}/${id}/image`, { imageUrl });
  }

  uploadImage(id: string, file: File): Observable<ProductResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ProductResponse>(`${this.url}/${id}/image/upload`, formData);
  }
}

function toProductPage(response: unknown): PagedResponse<ProductResponse> {
  if (Array.isArray(response)) {
    return {
      items: response as ProductResponse[],
      page: 1,
      pageSize: response.length,
      totalItems: response.length,
      totalPages: 1,
    };
  }
  if (isRecord(response) && Array.isArray(response['items'])) {
    return {
      items: response['items'] as ProductResponse[],
      page: Number(response['page'] ?? 1),
      pageSize: Number(response['pageSize'] ?? 25),
      totalItems: Number(response['totalItems'] ?? (response['items'] as unknown[]).length),
      totalPages: Number(response['totalPages'] ?? 1),
    };
  }
  if (isRecord(response) && Array.isArray(response['data'])) {
    return {
      items: response['data'] as ProductResponse[],
      page: 1,
      pageSize: (response['data'] as unknown[]).length,
      totalItems: (response['data'] as unknown[]).length,
      totalPages: 1,
    };
  }
  return { items: [], page: 1, pageSize: 25, totalItems: 0, totalPages: 0 };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
