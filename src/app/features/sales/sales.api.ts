import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateSaleRequest,
  SaleResponse,
  SalesSummaryResponse,
} from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class SalesApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Sales`;

  list(from?: string, to?: string): Observable<readonly SaleResponse[]> {
    return this.http.get<readonly SaleResponse[]>(this.url, {
      params: dateParams(from, to),
    });
  }

  get(id: string): Observable<SaleResponse> {
    return this.http.get<SaleResponse>(`${this.url}/${id}`);
  }

  create(request: CreateSaleRequest): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.url, request);
  }

  summary(from?: string, to?: string, groupBy = 'day'): Observable<SalesSummaryResponse> {
    return this.http.get<SalesSummaryResponse>(`${this.url}/summary`, {
      params: dateParams(from, to).set('groupBy', groupBy),
    });
  }
}

function dateParams(from?: string, to?: string): HttpParams {
  let params = new HttpParams();
  if (from) params = params.set('from', from);
  if (to) params = params.set('to', to);
  return params;
}
