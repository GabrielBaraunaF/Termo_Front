import { Component, computed, input } from '@angular/core';
import { TileState } from '../../../models/board';
import { STATUS_LABEL } from '../../../utils/letter-status';

const REVEAL_STEP_MS = 120;

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.scss',
  host: {
    role: 'img',
    '[class]': 'classes()',
    '[attr.aria-label]': 'label()',
    '[style.animation-delay.ms]': 'revealOrder() * revealStep',
  },
})
export class TileComponent {
  readonly letter = input('');
  readonly state = input<TileState>('empty');
  readonly size = input<'md' | 'sm'>('md');
  readonly reveal = input(false);
  readonly revealOrder = input(0);

  protected readonly revealStep = REVEAL_STEP_MS;

  protected readonly classes = computed(() =>
    [this.state(), this.size(), this.reveal() ? 'reveal' : ''].join(' '),
  );

  protected readonly label = computed(() => {
    const state = this.state();
    if (state === 'hidden') {
      return 'letra oculta';
    }
    if (!this.letter()) {
      return 'vazio';
    }
    const status = STATUS_LABEL[state];
    return status ? `${this.letter()}, ${status}` : this.letter();
  });
}
