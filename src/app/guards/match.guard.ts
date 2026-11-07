import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatchStore } from '../services/match.store';

export const matchGuard: CanActivateFn = () =>
  inject(MatchStore).match() ? true : inject(Router).createUrlTree(['/']);
