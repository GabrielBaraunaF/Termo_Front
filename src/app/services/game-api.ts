import { Observable } from 'rxjs';
import { GuessResult, JoinParams, MatchEvent } from '../models/game-contract';

export abstract class GameApi {
  abstract readonly events$: Observable<MatchEvent>;

  abstract connect(params: JoinParams): Promise<void>;

  abstract joinQueue(): Promise<void>;

  abstract leaveQueue(): Promise<void>;

  abstract sendGuess(word: string): Promise<GuessResult>;

  abstract sendTyping(letters: number): void;

  abstract sendReaction(text: string): void;

  abstract forfeit(): Promise<void>;
}
