import { Component, computed, input, output } from '@angular/core';
import { MatchEnded } from '../../../models/game-contract';
import { TileComponent } from '../../shared/tile/tile.component';

@Component({
  selector: 'app-match-result',
  imports: [TileComponent],
  templateUrl: './match-result.component.html',
  styleUrl: './match-result.component.scss',
})
export class MatchResultComponent {
  readonly result = input.required<MatchEnded>();
  readonly opponent = input.required<string>();
  readonly back = output<void>();

  protected readonly letters = computed(() => [...(this.result().secretWord ?? '')]);

  protected readonly tone = computed(() => {
    switch (this.result().winner) {
      case 'YOU':
        return 'tone-player';
      case 'OPPONENT':
        return 'tone-opponent';
      default:
        return '';
    }
  });

  protected readonly headline = computed(() => {
    switch (this.result().winner) {
      case 'YOU':
        return 'Você venceu!';
      case 'OPPONENT':
        return `${this.opponent()} venceu`;
      case 'DRAW':
        return 'Empate';
      default:
        return 'Ninguém acertou';
    }
  });

  protected readonly reason = computed(() => {
    const { winner, reason } = this.result();
    switch (reason) {
      case 'GUESSED':
        return winner === 'YOU' ? 'Você descobriu a palavra primeiro' : 'O oponente descobriu a palavra primeiro';
      case 'TIME_UP':
        return 'O tempo da rodada acabou';
      case 'ATTEMPTS_OVER':
        return 'As tentativas acabaram';
      case 'FORFEIT':
        return winner === 'YOU' ? 'O oponente desistiu' : 'Você desistiu da partida';
      case 'DISCONNECT':
        return 'A conexão com o oponente caiu';
    }
  });
}
