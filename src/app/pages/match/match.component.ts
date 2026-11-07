import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BoardComponent } from '../../components/match/board/board.component';
import { KeyboardComponent } from '../../components/match/keyboard/keyboard.component';
import { LiveFeedComponent } from '../../components/match/live-feed/live-feed.component';
import { MatchResultComponent } from '../../components/match/match-result/match-result.component';
import { MockControlsComponent } from '../../components/match/mock-controls/mock-controls.component';
import { OpponentTypingComponent } from '../../components/match/opponent-typing/opponent-typing.component';
import { ProtocolLogComponent } from '../../components/match/protocol-log/protocol-log.component';
import { QuickReactionsComponent } from '../../components/match/quick-reactions/quick-reactions.component';
import { RaceComponent } from '../../components/match/race/race.component';
import { TopBarComponent } from '../../components/match/top-bar/top-bar.component';
import { MatchStore } from '../../services/match.store';
import { ProtocolLogService } from '../../services/protocol-log.service';
import { SessionStore } from '../../services/session.store';

const LETTER = /^[a-z]$/i;

@Component({
  selector: 'app-match',
  imports: [
    TopBarComponent,
    RaceComponent,
    BoardComponent,
    OpponentTypingComponent,
    LiveFeedComponent,
    KeyboardComponent,
    QuickReactionsComponent,
    MockControlsComponent,
    ProtocolLogComponent,
    MatchResultComponent,
  ],
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class MatchComponent {
  protected readonly store = inject(MatchStore);
  protected readonly session = inject(SessionStore);
  protected readonly protocol = inject(ProtocolLogService);
  private readonly router = inject(Router);

  protected onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === 'Enter') {
      if (event.target instanceof HTMLButtonElement) {
        return;
      }
      event.preventDefault();
      this.store.submit();
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      this.store.erase();
    } else if (LETTER.test(event.key)) {
      this.store.type(event.key.toUpperCase());
    }
  }

  protected forfeit(): void {
    if (confirm('Desistir da partida? O oponente vence.')) {
      this.store.forfeit();
    }
  }

  protected backToLobby(): void {
    this.store.leave();
    this.router.navigate(['/']);
  }
}
