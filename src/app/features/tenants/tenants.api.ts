import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTenantRequest, TenantResponse, UserResponse } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class TenantsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Tenants`;

  list(): Observable<readonly TenantResponse[]> {
    return this.http.get<readonly TenantResponse[]>(this.url);
  }

  get(id: string): Observable<TenantResponse> {
    return this.http.get<TenantResponse>(`${this.url}/${id}`);
  }

  create(request: CreateTenantRequest): Observable<TenantResponse> {
    return this.http.post<TenantResponse>(this.url, request);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getUser(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${environment.apiUrl}/Users/${id}`);
  }
}
