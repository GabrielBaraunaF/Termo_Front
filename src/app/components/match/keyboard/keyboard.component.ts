import { Component, input, output } from '@angular/core';
import { NoMouseFocusDirective } from '../../../directives/no-mouse-focus.directive';
import { LetterStatus } from '../../../models/game-contract';
import { STATUS_LABEL, toTileState } from '../../../utils/letter-status';

const LAYOUT = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

@Component({
  selector: 'app-keyboard',
  imports: [NoMouseFocusDirective],
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.scss',
  host: { class: 'card' },
})
export class KeyboardComponent {
  readonly statuses = input<Record<string, LetterStatus>>({});
  readonly disabled = input(false);
  readonly letter = output<string>();
  readonly enter = output<void>();
  readonly erase = output<void>();

  protected readonly rows = LAYOUT.map((row) => [...row]);

  protected keyClass(key: string): string {
    const status = this.statuses()[key];
    return status ? toTileState(status) : '';
  }

  protected keyLabel(key: string): string {
    const status = this.statuses()[key];
    return status ? `${key}, ${STATUS_LABEL[toTileState(status)]}` : key;
  }
}
