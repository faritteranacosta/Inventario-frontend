import { Injectable, signal } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationState = signal<null>(null);
  readonly notification = this.notificationState.asReadonly();

  clear(): void {
    /* noop: ahora se usan toasts de SweetAlert2 */
  }
  success(message: string): void {
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  error(message: string): void {
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
    });
  }

  info(message: string): void {
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }
}
