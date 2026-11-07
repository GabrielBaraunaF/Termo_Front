import { BoardRow, BoardTile } from '../models/board';
import { GuessResult, OpponentProgress } from '../models/game-contract';
import { MAX_ATTEMPTS, PROGRESS_MODE, WORD_LENGTH } from '../models/game-rules';
import { toTileState } from './letter-status';

const EMPTY_TILE: BoardTile = { letter: '', state: 'empty' };

const HIDDEN_TILE: BoardTile = { letter: '', state: 'hidden' };

export function playerRows(guesses: GuessResult[], input: string): BoardRow[] {
  const rows: BoardRow[] = guesses.map((guess) => ({
    tiles: [...guess.word].map((letter, index) => ({
      letter,
      state: toTileState(guess.statuses[index]),
    })),
  }));

  if (rows.length < MAX_ATTEMPTS) {
    rows.push({ tiles: typingTiles(input) });
  }

  return fillRows(rows);
}

export function opponentRows(progress: OpponentProgress[]): BoardRow[] {
  const rows: BoardRow[] = progress.map(({ hits }) => ({
    tiles: repeatTile(HIDDEN_TILE),
    hits,
  }));

  return fillRows(rows);
}

export function progressOf(hits: number[]): number {
  if (hits.length === 0) {
    return 0;
  }
  return PROGRESS_MODE === 'best' ? Math.max(...hits) : hits[hits.length - 1];
}

function typingTiles(input: string): BoardTile[] {
  return Array.from({ length: WORD_LENGTH }, (_, index) =>
    input[index] ? { letter: input[index], state: 'typing' } : EMPTY_TILE,
  );
}

function repeatTile(tile: BoardTile): BoardTile[] {
  return Array.from({ length: WORD_LENGTH }, () => tile);
}

function fillRows(rows: BoardRow[]): BoardRow[] {
  while (rows.length < MAX_ATTEMPTS) {
    rows.push({ tiles: repeatTile(EMPTY_TILE) });
  }
  return rows;
}
