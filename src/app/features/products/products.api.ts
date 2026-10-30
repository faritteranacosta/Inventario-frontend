import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateProductRequest,
  ProductResponse,
  UpdateProductRequest,
} from '../../core/models/api.models';

export interface ProductSearch {
  readonly categoryId?: string;
  readonly search?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Products`;

  list(filters: ProductSearch = {}): Observable<readonly ProductResponse[]> {
    let params = new HttpParams();
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<unknown>(this.url, { params }).pipe(map(toProductList));
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

function toProductList(response: unknown): readonly ProductResponse[] {
  if (Array.isArray(response)) {
    return response as ProductResponse[];
  }
  if (isRecord(response) && Array.isArray(response['items'])) {
    return response['items'] as ProductResponse[];
  }
  if (isRecord(response) && Array.isArray(response['data'])) {
    return response['data'] as ProductResponse[];
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
