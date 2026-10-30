import { Injectable, signal } from '@angular/core';

export type NotificationTone = 'success' | 'error' | 'info';

export interface Notification {
  readonly message: string;
  readonly tone: NotificationTone;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationState = signal<Notification | null>(null);
  readonly notification = this.notificationState.asReadonly();

  success(message: string): void {
    this.show({ message, tone: 'success' });
  }

  error(message: string): void {
    this.show({ message, tone: 'error' });
  }

  info(message: string): void {
    this.show({ message, tone: 'info' });
  }

  clear(): void {
    this.notificationState.set(null);
  }

  private show(notification: Notification): void {
    this.notificationState.set(notification);
  }
}
