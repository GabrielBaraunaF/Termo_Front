import { TileState } from '../models/board';
import { GuessResult, LetterStatus } from '../models/game-contract';

const RANK: Record<LetterStatus, number> = { ABSENT: 0, EXISTS: 1, CORRECT: 2 };

const PATTERN: Record<LetterStatus, string> = { CORRECT: 'G', EXISTS: 'Y', ABSENT: 'A' };

export const STATUS_LABEL: Partial<Record<TileState, string>> = {
  correct: 'correta',
  exists: 'existe em outra posição',
  absent: 'não existe na palavra',
};

export function toTileState(status: LetterStatus): TileState {
  return status.toLowerCase() as TileState;
}

export function toPattern(statuses: LetterStatus[]): string {
  return statuses.map((status) => PATTERN[status]).join('');
}

export function keyStatuses(guesses: GuessResult[]): Record<string, LetterStatus> {
  const statuses: Record<string, LetterStatus> = {};

  for (const guess of guesses) {
    [...guess.word].forEach((letter, index) => {
      const status = guess.statuses[index];
      const current = statuses[letter];
      if (!current || RANK[status] > RANK[current]) {
        statuses[letter] = status;
      }
    });
  }

  return statuses;
}
