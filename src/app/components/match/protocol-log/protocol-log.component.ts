import { Component, input } from '@angular/core';
import { ProtocolEntry } from '../../../models/protocol-entry';

@Component({
  selector: 'app-protocol-log',
  templateUrl: './protocol-log.component.html',
  styleUrl: './protocol-log.component.scss',
})
export class ProtocolLogComponent {
  readonly entries = input.required<ProtocolEntry[]>();
}
