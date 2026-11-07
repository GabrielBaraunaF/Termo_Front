import { Component, computed, input, output } from '@angular/core';
import { ConnectionState } from '../../../models/game-contract';
import { LogoComponent } from '../../shared/logo/logo.component';

const LOW_TIME_SECONDS = 30;

@Component({
  selector: 'app-top-bar',
  imports: [LogoComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  readonly matchId = input.required<string>();
  readonly remainingSeconds = input<number | null>(null);
  readonly connection = input<ConnectionState | null>(null);
  readonly latencyMs = input<number | null>(null);
  readonly canForfeit = input(false);
  readonly forfeit = output<void>();

  protected readonly online = computed(() => this.connection() !== 'RECONNECTING' && this.connection() !== 'LOST');

  protected readonly clock = computed(() => {
    const total = Math.max(this.remainingSeconds() ?? 0, 0);
    const minutes = String(Math.floor(total / 60)).padStart(2, '0');
    const seconds = String(total % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  protected readonly lowTime = computed(() => {
    const remaining = this.remainingSeconds();
    return remaining !== null && remaining <= LOW_TIME_SECONDS;
  });

  protected readonly connectionLabel = computed(() => {
    switch (this.connection()) {
      case 'RECONNECTING':
        return 'Reconectando…';
      case 'LOST':
        return 'Sem conexão';
      default:
        return this.latencyMs() === null ? 'Conectado' : `Conectado · ${this.latencyMs()} ms`;
    }
  });
}
