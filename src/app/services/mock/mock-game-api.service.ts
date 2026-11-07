import { Injectable } from '@angular/core';
import { interval, Subject, Subscription, take, timer } from 'rxjs';
import {
  EndReason,
  GameApiError,
  GuessResult,
  JoinParams,
  MatchEvent,
  Winner,
} from '../../models/game-contract';
import { MAX_ATTEMPTS, WORD_LENGTH } from '../../models/game-rules';
import { GameApi } from '../game-api';
import { MOCK_WORDS } from './mock-words';
import { countHits, scoreGuess } from './score-guess';

const MOCK_PORT = 5050;
const ROUND_SECONDS = 180;
const OPPONENT_NAMES = ['Lia', 'Caio', 'Bia', 'Rafa', 'Duda'];
const OPPONENT_REACTIONS = ['GG', 'Boa', 'Ufa', 'Vem'];
const OPPONENT_SECRET_CHANCE = [0, 0.05, 0.15, 0.3, 0.5, 0.7];
const TYPING_INTERVAL_MS = 350;

@Injectable()
export class MockGameApi extends GameApi {
  private readonly events = new Subject<MatchEvent>();
  readonly events$ = this.events.asObservable();

  private session = new Subscription();
  private match = new Subscription();
  private queue?: Subscription;
  private opponentTurn?: Subscription;

  private activeMatches = 0;
  private inMatch = false;
  private secret = '';
  private playerSeq = 0;
  private opponentSeq = 0;
  private remainingSeconds = 0;

  async connect(params: JoinParams): Promise<void> {
    await wait(randomBetween(300, 700));

    if (params.port !== MOCK_PORT) {
      throw new GameApiError(
        'UNAVAILABLE',
        `Nenhum servidor respondeu em ${params.host}:${params.port}`,
      );
    }

    this.session.unsubscribe();
    this.session = new Subscription();
    this.activeMatches = randomBetween(1, 4);

    this.emitConnection();
    this.emitStats(0);
    this.session.add(interval(5000).subscribe(() => this.emitConnection()));
  }

  async joinQueue(): Promise<void> {
    await wait(randomBetween(80, 160));
    this.emitStats(1);
    this.queue = timer(randomBetween(1500, 3000)).subscribe(() => this.startMatch());
  }

  async leaveQueue(): Promise<void> {
    await wait(randomBetween(80, 160));
    this.queue?.unsubscribe();
    this.emitStats(0);
  }

  async sendGuess(word: string): Promise<GuessResult> {
    await wait(randomBetween(80, 180));

    if (!this.inMatch) {
      throw new GameApiError('NOT_IN_MATCH', 'Nenhuma partida em andamento');
    }
    if (!/^[A-Z]{5}$/.test(word)) {
      throw new GameApiError('INVALID_WORD', 'Use exatamente 5 letras de A a Z');
    }
    if (this.playerSeq >= MAX_ATTEMPTS) {
      throw new GameApiError('NO_ATTEMPTS', 'Suas tentativas acabaram');
    }

    this.playerSeq++;
    const statuses = scoreGuess(word, this.secret);
    const hits = countHits(statuses);
    const won = hits === WORD_LENGTH;

    if (won) {
      this.endMatch('YOU', 'GUESSED', 600);
    } else {
      this.endIfAttemptsOver();
    }

    return { seq: this.playerSeq, word, statuses, hits, won };
  }

  sendTyping(): void {}

  sendReaction(): void {
    if (this.inMatch && Math.random() < 0.4) {
      this.match.add(
        timer(1200).subscribe(() =>
          this.emit({ type: 'REACTION', text: pick(OPPONENT_REACTIONS) }),
        ),
      );
    }
  }

  async forfeit(): Promise<void> {
    await wait(randomBetween(80, 160));
    if (this.inMatch) {
      this.endMatch('OPPONENT', 'FORFEIT');
    }
  }

  simulateOpponentGuess(): void {
    if (this.inMatch && this.opponentSeq < MAX_ATTEMPTS) {
      this.opponentTurn?.unsubscribe();
      this.playOpponentGuess();
    }
  }

  private startMatch(): void {
    const matchId = Math.random().toString(16).slice(2, 6).toUpperCase();

    this.match.unsubscribe();
    this.match = new Subscription();
    this.inMatch = true;
    this.secret = pick(MOCK_WORDS);
    this.playerSeq = 0;
    this.opponentSeq = 0;
    this.remainingSeconds = ROUND_SECONDS;
    this.activeMatches++;

    this.emit({ type: 'MATCH_FOUND', matchId, opponentNickname: pick(OPPONENT_NAMES) });
    this.emit({ type: 'MATCH_STARTED', matchId, roundSeconds: ROUND_SECONDS });
    this.emitStats(0);

    this.match.add(interval(1000).subscribe(() => this.tick()));
    this.scheduleOpponentTurn();
  }

  private tick(): void {
    this.remainingSeconds--;
    this.emit({ type: 'TIMER_TICK', remainingSeconds: this.remainingSeconds });

    if (this.remainingSeconds <= 0) {
      this.endMatch('NONE', 'TIME_UP');
    }
  }

  private scheduleOpponentTurn(): void {
    this.opponentTurn = timer(randomBetween(9000, 15000), TYPING_INTERVAL_MS)
      .pipe(take(WORD_LENGTH + 1))
      .subscribe((step) => {
        if (step < WORD_LENGTH) {
          this.emit({ type: 'OPPONENT_TYPING', letters: step + 1 });
        } else {
          this.playOpponentGuess();
        }
      });
    this.match.add(this.opponentTurn);
  }

  private playOpponentGuess(): void {
    this.opponentSeq++;

    const guessesSecret = Math.random() < OPPONENT_SECRET_CHANCE[this.opponentSeq - 1];
    const otherWords = MOCK_WORDS.filter((candidate) => candidate !== this.secret);
    const word = guessesSecret ? this.secret : pick(otherWords);
    const hits = countHits(scoreGuess(word, this.secret));

    this.emit({ type: 'OPPONENT_TYPING', letters: 0 });
    this.emit({ type: 'OPPONENT_PROGRESS', seq: this.opponentSeq, hits });

    if (hits === WORD_LENGTH) {
      this.endMatch('OPPONENT', 'GUESSED');
    } else if (!this.endIfAttemptsOver() && this.opponentSeq < MAX_ATTEMPTS) {
      this.scheduleOpponentTurn();
    }
  }

  private endIfAttemptsOver(): boolean {
    const over = this.playerSeq >= MAX_ATTEMPTS && this.opponentSeq >= MAX_ATTEMPTS;
    if (over) {
      this.endMatch('NONE', 'ATTEMPTS_OVER');
    }
    return over;
  }

  private endMatch(winner: Winner, reason: EndReason, delayMs = 0): void {
    const secretWord = this.secret;

    this.inMatch = false;
    this.activeMatches--;
    this.match.unsubscribe();

    timer(delayMs).subscribe(() => {
      this.emit({ type: 'MATCH_ENDED', winner, reason, secretWord });
      this.emitStats(0);
    });
  }

  private emitConnection(): void {
    this.emit({ type: 'CONNECTION', state: 'ONLINE', latencyMs: randomBetween(28, 48) });
  }

  private emitStats(playersInQueue: number): void {
    this.emit({ type: 'SERVER_STATS', activeMatches: this.activeMatches, playersInQueue });
  }

  private emit(event: MatchEvent): void {
    this.events.next(event);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
