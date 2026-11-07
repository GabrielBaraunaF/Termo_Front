import { Component, computed, input } from '@angular/core';
import { ServerStats } from '../../../models/game-contract';
import { pluralize } from '../../../utils/text';

const UNKNOWN = '—';

@Component({
  selector: 'app-server-stats',
  templateUrl: './server-stats.component.html',
  styleUrl: './server-stats.component.scss',
})
export class ServerStatsComponent {
  readonly stats = input<ServerStats | null>(null);
  readonly latencyMs = input<number | null>(null);

  protected readonly items = computed(() => {
    const stats = this.stats();
    const latency = this.latencyMs();

    return [
      {
        value: stats?.activeMatches ?? UNKNOWN,
        label: pluralize(stats?.activeMatches ?? 0, 'partida em andamento', 'partidas em andamento'),
      },
      {
        value: stats?.playersInQueue ?? UNKNOWN,
        label: pluralize(stats?.playersInQueue ?? 0, 'jogador na fila', 'jogadores na fila'),
      },
      {
        value: latency === null ? UNKNOWN : `${latency} ms`,
        label: 'latência até o servidor',
      },
    ];
  });
}
