export type LetterStatus = 'CORRECT' | 'EXISTS' | 'ABSENT';

export type Winner = 'YOU' | 'OPPONENT' | 'DRAW' | 'NONE';

export type EndReason = 'GUESSED' | 'TIME_UP' | 'ATTEMPTS_OVER' | 'FORFEIT' | 'DISCONNECT';

export type ConnectionState = 'ONLINE' | 'RECONNECTING' | 'LOST';

export interface JoinParams {
  host: string;
  port: number;
  nickname: string;
}

export interface GuessResult {
  seq: number;
  word: string;
  statuses: LetterStatus[];
  hits: number;
  won: boolean;
}

export interface OpponentProgress {
  seq: number;
  hits: number;
}

export interface ServerStats {
  activeMatches: number;
  playersInQueue: number;
}

export interface MatchEnded {
  type: 'MATCH_ENDED';
  winner: Winner;
  reason: EndReason;
  secretWord?: string;
}

export type MatchEvent =
  | { type: 'MATCH_FOUND'; matchId: string; opponentNickname: string }
  | { type: 'MATCH_STARTED'; matchId: string; roundSeconds: number }
  | ({ type: 'OPPONENT_PROGRESS' } & OpponentProgress)
  | { type: 'OPPONENT_TYPING'; letters: number }
  | { type: 'TIMER_TICK'; remainingSeconds: number }
  | { type: 'REACTION'; text: string }
  | MatchEnded
  | { type: 'CONNECTION'; state: ConnectionState; latencyMs?: number }
  | ({ type: 'SERVER_STATS' } & ServerStats);

export class GameApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
