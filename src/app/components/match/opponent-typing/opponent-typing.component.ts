import { Component, computed, input } from '@angular/core';
import { WORD_LENGTH } from '../../../models/game-rules';

@Component({
  selector: 'app-opponent-typing',
  templateUrl: './opponent-typing.component.html',
  styleUrl: './opponent-typing.component.scss',
  host: { class: 'card' },
})
export class OpponentTypingComponent {
  readonly letters = input.required<number>();

  protected readonly max = WORD_LENGTH;
  protected readonly dots = computed(() =>
    Array.from({ length: WORD_LENGTH }, (_, index) => index < this.letters()),
  );
}
