import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateMembershipRequest,
  CreatePlatformTenantRequest,
  MembershipResponse,
  PlatformTenantResponse,
  UpdateMembershipRequest,
  UpdateTenantStatusRequest,
} from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class PlatformApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/platform`;

  listTenants(): Observable<readonly PlatformTenantResponse[]> {
    return this.http.get<readonly PlatformTenantResponse[]>(`${this.url}/tenants`);
  }

  getTenant(id: string): Observable<PlatformTenantResponse> {
    return this.http.get<PlatformTenantResponse>(`${this.url}/tenants/${id}`);
  }

  createTenant(request: CreatePlatformTenantRequest): Observable<PlatformTenantResponse> {
    return this.http.post<PlatformTenantResponse>(`${this.url}/tenants`, request);
  }

  updateTenantStatus(
    id: string,
    request: UpdateTenantStatusRequest,
  ): Observable<PlatformTenantResponse> {
    return this.http.patch<PlatformTenantResponse>(`${this.url}/tenants/${id}/status`, request);
  }

  removeTenant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/tenants/${id}`);
  }

  listMembers(tenantId: string): Observable<readonly MembershipResponse[]> {
    return this.http.get<readonly MembershipResponse[]>(`${this.url}/tenants/${tenantId}/members`);
  }

  createMember(tenantId: string, request: CreateMembershipRequest): Observable<MembershipResponse> {
    return this.http.post<MembershipResponse>(`${this.url}/tenants/${tenantId}/members`, request);
  }

  updateMember(
    tenantId: string,
    userId: string,
    request: UpdateMembershipRequest,
  ): Observable<MembershipResponse> {
    return this.http.patch<MembershipResponse>(
      `${this.url}/tenants/${tenantId}/members/${userId}`,
      request,
    );
  }

  removeMember(tenantId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/tenants/${tenantId}/members/${userId}`);
  }
}
