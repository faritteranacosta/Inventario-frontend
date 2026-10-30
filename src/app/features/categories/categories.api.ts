import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryRequest, CategoryResponse } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Categories`;

  list(): Observable<readonly CategoryResponse[]> {
    return this.http.get<unknown>(this.url).pipe(map(toCategoryList));
  }

  create(request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.url, request);
  }

  update(id: string, request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.url}/${id}`, request);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

function toCategoryList(response: unknown): readonly CategoryResponse[] {
  if (Array.isArray(response)) {
    return response as CategoryResponse[];
  }
  if (isRecord(response) && Array.isArray(response['items'])) {
    return response['items'] as CategoryResponse[];
  }
  if (isRecord(response) && Array.isArray(response['data'])) {
    return response['data'] as CategoryResponse[];
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
