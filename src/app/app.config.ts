import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { GameApi } from './services/game-api';
import { MatchStore } from './services/match.store';
import { MockGameApi } from './services/mock/mock-game-api.service';
import { ProtocolLogService } from './services/protocol-log.service';
import { SessionStore } from './services/session.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    MockGameApi,
    { provide: GameApi, useExisting: MockGameApi },
    provideAppInitializer(() => {
      inject(ProtocolLogService);
      inject(SessionStore);
      inject(MatchStore);
    }),
  ],
};
