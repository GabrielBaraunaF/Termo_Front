import { Routes } from '@angular/router';
import { matchGuard } from './guards/match.guard';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { MatchComponent } from './pages/match/match.component';

export const routes: Routes = [
  {
    path: '',
    component: LobbyComponent,
  },
  {
    path: 'match',
    component: MatchComponent,
    canActivate: [matchGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
