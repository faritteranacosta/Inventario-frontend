import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-notification-alert',
  standalone: true,
  templateUrl: './notification-alert.html',
  styleUrl: './notification-alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationAlertComponent {
  protected readonly notifications = inject(NotificationService);
}
