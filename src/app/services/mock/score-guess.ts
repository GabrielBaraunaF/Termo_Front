import { LetterStatus } from '../../models/game-contract';

export function scoreGuess(guess: string, secret: string): LetterStatus[] {
  const statuses: LetterStatus[] = [...guess].map(() => 'ABSENT');
  const remaining = new Map<string, number>();

  [...secret].forEach((letter, index) => {
    if (guess[index] === letter) {
      statuses[index] = 'CORRECT';
    } else {
      remaining.set(letter, (remaining.get(letter) ?? 0) + 1);
    }
  });

  [...guess].forEach((letter, index) => {
    const left = remaining.get(letter) ?? 0;
    if (statuses[index] !== 'CORRECT' && left > 0) {
      statuses[index] = 'EXISTS';
      remaining.set(letter, left - 1);
    }
  });

  return statuses;
}

export function countHits(statuses: LetterStatus[]): number {
  return statuses.filter((status) => status === 'CORRECT').length;
}
