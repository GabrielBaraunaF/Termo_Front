import { Component, output } from '@angular/core';

@Component({
  selector: 'app-queue-status',
  templateUrl: './queue-status.component.html',
  styleUrl: './queue-status.component.scss',
  host: { class: 'card', role: 'status' },
})
export class QueueStatusComponent {
  readonly leave = output<void>();
}
