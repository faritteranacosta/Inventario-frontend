import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (isUnauthorized(error)) {
        auth.clearSession();
      } else if (isForbidden(error)) {
        void inject(Router).navigate(['/forbidden']);
      }
      return throwError(() => error);
    }),
  );
};

function isUnauthorized(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 401;
}

function isForbidden(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 403;
}
