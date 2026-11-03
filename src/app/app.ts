import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationAlertComponent } from './shared/notification-alert/notification-alert';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationAlertComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.document.getElementById('app-loading')?.remove();
  }
}
