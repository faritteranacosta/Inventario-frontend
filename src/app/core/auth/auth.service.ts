import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ContextResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SelectContextRequest,
  SessionResponse,
  UserResponse,
} from '../models/api.models';

const TOKEN_KEY = 'inventario.auth.token';
const USER_KEY = 'inventario.auth.user';
const SESSION_KEY = 'inventario.auth.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userState = signal<UserResponse | null>(this.readUser());
  private readonly sessionState = signal<SessionResponse | null>(this.readSession());
  private readonly url = `${environment.apiUrl}/Auth`;

  readonly user = this.userState.asReadonly();
  readonly session = this.sessionState.asReadonly();
  readonly memberships = computed(() => this.session()?.memberships ?? []);
  readonly activeTenantId = computed(
    () => this.session()?.activeTenantId ?? this.user()?.tenantId ?? null,
  );
  readonly isAuthenticated = computed(() => Boolean(this.token));
  readonly platformRole = computed(() => this.session()?.platformRole ?? this.user()?.platformRole);
  readonly isPlatformAdmin = computed(() => this.platformRole()?.toLowerCase() === 'platformadmin');
  readonly activeMembership = computed(() =>
    this.memberships().find(
      (membership) =>
        membership.tenantId === this.activeTenantId() && membership.status === 'Active',
    ),
  );
  readonly isAdmin = computed(
    () => this.activeMembership()?.role === 'Admin' || this.user()?.role?.toLowerCase() === 'admin',
  );
  readonly canManageCatalog = computed(() => this.isPlatformAdmin() || this.isAdmin());

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.userState.set(response.user);
        if (response.memberships) {
          this.setSession({
            id: response.user.id,
            email: response.user.email,
            platformRole: response.user.platformRole ?? null,
            activeTenantId: response.activeTenantId ?? response.user.tenantId ?? null,
            memberships: response.memberships,
          });
        }
      }),
    );
  }

  me(): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`${this.url}/me`).pipe(
      tap((session) => {
        this.setSession(session);
        this.userState.update((user) =>
          user
            ? {
                ...user,
                tenantId: session.activeTenantId,
                platformRole: session.platformRole,
              }
            : user,
        );
      }),
    );
  }

  selectContext(request: SelectContextRequest): Observable<ContextResponse> {
    return this.http.post<ContextResponse>(`${this.url}/context`, request).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        this.sessionState.update((session) =>
          session ? { ...session, activeTenantId: response.activeTenantId } : session,
        );
        this.userState.update((user) =>
          user ? { ...user, tenantId: response.activeTenantId } : user,
        );
      }),
    );
  }

  register(request: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.url}/register`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.userState.set(null);
    this.sessionState.set(null);
    void this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.userState.set(null);
    this.sessionState.set(null);
    if (!this.router.url.startsWith('/login')) {
      void this.router.navigate(['/login'], { queryParams: { reason: 'expired' } });
    }
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

  private setSession(session: SessionResponse): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionState.set(session);
  }

  private readSession(): SessionResponse | null {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as SessionResponse;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
