import { Component, computed, inject } from '@angular/core';
import { NoMouseFocusDirective } from '../../../directives/no-mouse-focus.directive';
import { MAX_ATTEMPTS } from '../../../models/game-rules';
import { MatchStore } from '../../../services/match.store';
import { MockGameApi } from '../../../services/mock/mock-game-api.service';

@Component({
  selector: 'app-mock-controls',
  imports: [NoMouseFocusDirective],
  templateUrl: './mock-controls.component.html',
  styleUrl: './mock-controls.component.scss',
})
export class MockControlsComponent {
  protected readonly mock = inject(MockGameApi, { optional: true });
  private readonly store = inject(MatchStore);

  protected readonly nextGuess = computed(() => this.store.opponentGuesses().length + 1);
  protected readonly disabled = computed(() => !this.store.playing() || this.nextGuess() > MAX_ATTEMPTS);
}
