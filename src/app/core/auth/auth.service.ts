import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '../models/api.models';

const TOKEN_KEY = 'inventario.auth.token';
const USER_KEY = 'inventario.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userState = signal<UserResponse | null>(this.readUser());
  private readonly url = `${environment.apiUrl}/Auth`;

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.token));

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.userState.set(response.user);
      }),
    );
  }

  register(request: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.url}/register`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userState.set(null);
    void this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userState.set(null);
  }

  private readUser(): UserResponse | null {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as UserResponse;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
