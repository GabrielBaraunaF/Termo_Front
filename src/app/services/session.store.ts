import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConnectionState, JoinParams, MatchEvent, ServerStats } from '../models/game-contract';
import { errorMessage } from '../utils/text';
import { GameApi } from './game-api';
import { ProtocolLogService } from './protocol-log.service';

export type SessionStatus = 'disconnected' | 'connecting' | 'connected' | 'queued' | 'in-match';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly api = inject(GameApi);
  private readonly protocol = inject(ProtocolLogService);

  readonly status = signal<SessionStatus>('disconnected');
  readonly server = signal<JoinParams | null>(null);
  readonly connection = signal<ConnectionState | null>(null);
  readonly latencyMs = signal<number | null>(null);
  readonly stats = signal<ServerStats | null>(null);
  readonly error = signal<string | null>(null);

  readonly busy = computed(() => this.status() === 'connecting' || this.status() === 'queued');

  constructor() {
    this.api.events$.pipe(takeUntilDestroyed()).subscribe((event) => this.handle(event));
  }

  async enterQueue(params: JoinParams): Promise<void> {
    this.error.set(null);

    if (!this.isConnectedTo(params) && !(await this.connect(params))) {
      return;
    }

    this.status.set('queued');
    this.protocol.record('out', 'ENTRAR_FILA');

    try {
      await this.api.joinQueue();
    } catch (error) {
      this.status.set('connected');
      this.error.set(errorMessage(error));
    }
  }

  async leaveQueue(): Promise<void> {
    this.protocol.record('out', 'SAIR_FILA');

    try {
      await this.api.leaveQueue();
      this.status.set('connected');
    } catch (error) {
      this.error.set(errorMessage(error));
    }
  }

  private async connect(params: JoinParams): Promise<boolean> {
    this.status.set('connecting');
    this.server.set(null);
    this.protocol.record('out', 'CONECTAR', `${params.host}:${params.port} apelido=${params.nickname}`);

    try {
      await this.api.connect(params);
      this.server.set(params);
      this.status.set('connected');
      return true;
    } catch (error) {
      this.status.set('disconnected');
      this.error.set(errorMessage(error));
      return false;
    }
  }

  private isConnectedTo(params: JoinParams): boolean {
    const server = this.server();
    return (
      this.status() === 'connected' &&
      server?.host === params.host &&
      server.port === params.port &&
      server.nickname === params.nickname
    );
  }

  private handle(event: MatchEvent): void {
    switch (event.type) {
      case 'CONNECTION':
        this.connection.set(event.state);
        this.latencyMs.set(event.latencyMs ?? this.latencyMs());
        break;
      case 'SERVER_STATS':
        this.stats.set({ activeMatches: event.activeMatches, playersInQueue: event.playersInQueue });
        break;
      case 'MATCH_FOUND':
        this.status.set('in-match');
        break;
      case 'MATCH_ENDED':
        this.status.set('connected');
        break;
    }
  }
}
