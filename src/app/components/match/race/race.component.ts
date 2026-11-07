import { Component, computed, input } from '@angular/core';
import { PlayerTone } from '../../../models/board';
import { WORD_LENGTH } from '../../../models/game-rules';

interface Lane {
  label: string;
  initial: string;
  tone: PlayerTone;
  hits: number;
  percent: number;
}

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrl: './race.component.scss',
  host: { class: 'card' },
})
export class RaceComponent {
  readonly playerHits = input.required<number>();
  readonly opponentHits = input.required<number>();

  protected readonly max = WORD_LENGTH;
  protected readonly columns = Array.from({ length: WORD_LENGTH }, (_, index) => index + 1);

  protected readonly lanes = computed<Lane[]>(() => [
    this.lane('Você', 'V', 'player', this.playerHits()),
    this.lane('Oponente', 'O', 'opponent', this.opponentHits()),
  ]);

  private lane(label: string, initial: string, tone: PlayerTone, hits: number): Lane {
    return { label, initial, tone, hits, percent: (hits / WORD_LENGTH) * 100 };
  }
}
