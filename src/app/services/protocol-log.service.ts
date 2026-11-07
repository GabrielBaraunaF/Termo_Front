import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchEvent } from '../models/game-contract';
import { WORD_LENGTH } from '../models/game-rules';
import { ProtocolDirection, ProtocolEntry } from '../models/protocol-entry';
import { GameApi } from './game-api';

const MAX_ENTRIES = 6;

@Injectable({ providedIn: 'root' })
export class ProtocolLogService {
  private readonly api = inject(GameApi);
  private nextId = 0;

  readonly entries = signal<ProtocolEntry[]>([]);

  constructor() {
    this.api.events$.pipe(takeUntilDestroyed()).subscribe((event) => {
      const [kind, details] = describe(event);
      this.record('in', kind, details);
    });
  }

  record(direction: ProtocolDirection, kind: string, details = ''): void {
    const entry: ProtocolEntry = { id: this.nextId++, direction, kind, details };

    this.entries.update((entries) => {
      const latest = entries[0];
      const repeated = latest?.kind === kind && latest.direction === direction;
      const previous = repeated ? entries.slice(1) : entries;
      return [entry, ...previous].slice(0, MAX_ENTRIES);
    });
  }
}

function describe(event: MatchEvent): [string, string] {
  switch (event.type) {
    case 'MATCH_FOUND':
      return ['PARTIDA_ENCONTRADA', `partida=${event.matchId} oponente=${event.opponentNickname}`];
    case 'MATCH_STARTED':
      return ['INICIO', `partida=${event.matchId} tempo=${event.roundSeconds}s`];
    case 'OPPONENT_PROGRESS':
      return ['PROGRESSO_OPONENTE', `seq=${event.seq} acertos=${event.hits}/${WORD_LENGTH}`];
    case 'OPPONENT_TYPING':
      return ['DIGITANDO', `n=${event.letters}`];
    case 'TIMER_TICK':
      return ['TICK_TIMER', `restante=${event.remainingSeconds}s`];
    case 'REACTION':
      return ['REACAO', `"${event.text}"`];
    case 'MATCH_ENDED':
      return ['FIM', `vencedor=${event.winner} motivo=${event.reason}`];
    case 'CONNECTION':
      return ['CONEXAO', `estado=${event.state} latencia=${event.latencyMs ?? '-'}ms`];
    case 'SERVER_STATS':
      return ['STATUS', `partidas=${event.activeMatches} fila=${event.playersInQueue}`];
  }
}
