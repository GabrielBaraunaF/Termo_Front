import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HowToPlayComponent } from '../../components/lobby/how-to-play/how-to-play.component';
import { JoinFormComponent } from '../../components/lobby/join-form/join-form.component';
import { QueueStatusComponent } from '../../components/lobby/queue-status/queue-status.component';
import { ServerStatsComponent } from '../../components/lobby/server-stats/server-stats.component';
import { LogoComponent } from '../../components/shared/logo/logo.component';
import { MatchStore } from '../../services/match.store';
import { SessionStore } from '../../services/session.store';

@Component({
  selector: 'app-lobby',
  imports: [
    LogoComponent,
    HowToPlayComponent,
    ServerStatsComponent,
    JoinFormComponent,
    QueueStatusComponent,
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent {
  protected readonly session = inject(SessionStore);
  private readonly match = inject(MatchStore);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.match.match()) {
        this.router.navigate(['/match']);
      }
    });
  }
}
