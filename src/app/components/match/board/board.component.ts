import { Component, computed, input } from '@angular/core';
import { BoardRow, PlayerTone } from '../../../models/board';
import { MAX_ATTEMPTS, WORD_LENGTH } from '../../../models/game-rules';
import { countLabel } from '../../../utils/text';
import { TileComponent } from '../../shared/tile/tile.component';

@Component({
  selector: 'app-board',
  imports: [TileComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  host: {
    class: 'card',
    '[class.tone-player]': "tone() === 'player'",
    '[class.tone-opponent]': "tone() === 'opponent'",
  },
})
export class BoardComponent {
  readonly heading = input.required<string>();
  readonly tone = input.required<PlayerTone>();
  readonly attempt = input.required<number>();
  readonly hits = input.required<number>();
  readonly rows = input.required<BoardRow[]>();
  readonly message = input<string | null>(null);
  readonly reveal = input(false);

  protected readonly maxAttempts = MAX_ATTEMPTS;
  protected readonly wordLength = WORD_LENGTH;
  protected readonly hitsLabel = computed(() => countLabel(this.hits(), 'posição', 'posições'));
}
