import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from '../notifications/notification.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);
  const router = inject(Router);
  const token = auth.token;
  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      const status = (error as { status?: number })?.status;
      const backendMessage =
        (error as { error?: { error?: { message?: string }; message?: string } })?.error?.error
          ?.message ?? (error as { error?: { message?: string } })?.error?.message;

      if (status === 401) {
        auth.clearSession();
      } else if (status === 403) {
        void router.navigate(['/forbidden']);
      } else if (status === 404) {
        notifications.error(backendMessage ?? 'El recurso solicitado no existe.');
      } else if (status === 409) {
        notifications.error(backendMessage ?? 'Conflicto: la operación no pudo completarse.');
      } else if (status === 400 || status === 422) {
        notifications.error(backendMessage ?? 'Los datos enviados no son válidos.');
      } else if (status && status >= 500) {
        notifications.error('Ocurrió un error en el servidor. Inténtalo más tarde.');
      }
      return throwError(() => error);
    }),
  );
};
