import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlayerTone } from '../models/board';
import { FeedItem } from '../models/feed-item';
import { GuessResult, MatchEnded, MatchEvent, OpponentProgress } from '../models/game-contract';
import { MAX_ATTEMPTS, WORD_LENGTH } from '../models/game-rules';
import { opponentRows, playerRows, progressOf } from '../utils/board';
import { keyStatuses, toPattern } from '../utils/letter-status';
import { countLabel, errorMessage } from '../utils/text';
import { GameApi } from './game-api';
import { ProtocolLogService } from './protocol-log.service';

const FEED_SIZE = 3;

export interface MatchInfo {
  id: string;
  opponent: string;
}

@Injectable({ providedIn: 'root' })
export class MatchStore {
  private readonly api = inject(GameApi);
  private readonly protocol = inject(ProtocolLogService);
  private nextFeedId = 0;

  readonly match = signal<MatchInfo | null>(null);
  readonly started = signal(false);
  readonly remainingSeconds = signal<number | null>(null);
  readonly guesses = signal<GuessResult[]>([]);
  readonly input = signal('');
  readonly submitting = signal(false);
  readonly message = signal<string | null>(null);
  readonly opponentGuesses = signal<OpponentProgress[]>([]);
  readonly opponentTyping = signal(0);
  readonly feed = signal<FeedItem[]>([]);
  readonly result = signal<MatchEnded | null>(null);

  readonly playing = computed(() => this.started() && !this.result());
  readonly canType = computed(
    () => this.playing() && !this.submitting() && this.guesses().length < MAX_ATTEMPTS,
  );

  readonly playerRows = computed(() => playerRows(this.guesses(), this.input()));
  readonly opponentRows = computed(() => opponentRows(this.opponentGuesses()));
  readonly playerHits = computed(() => progressOf(this.guesses().map((guess) => guess.hits)));
  readonly opponentHits = computed(() => progressOf(this.opponentGuesses().map((guess) => guess.hits)));
  readonly playerAttempt = computed(() => Math.min(this.guesses().length + 1, MAX_ATTEMPTS));
  readonly opponentAttempt = computed(() => Math.min(this.opponentGuesses().length + 1, MAX_ATTEMPTS));
  readonly keyStatuses = computed(() => keyStatuses(this.guesses()));

  constructor() {
    this.api.events$.pipe(takeUntilDestroyed()).subscribe((event) => this.handle(event));
  }

  type(letter: string): void {
    if (!this.canType() || this.input().length >= WORD_LENGTH) {
      return;
    }
    this.input.update((input) => input + letter);
    this.onInputChanged();
  }

  erase(): void {
    if (!this.canType() || this.input().length === 0) {
      return;
    }
    this.input.update((input) => input.slice(0, -1));
    this.onInputChanged();
  }

  async submit(): Promise<void> {
    if (!this.canType()) {
      return;
    }

    const word = this.input();
    if (word.length < WORD_LENGTH) {
      this.message.set(`A palavra precisa ter ${WORD_LENGTH} letras`);
      return;
    }

    this.submitting.set(true);
    this.protocol.record('out', 'PALPITE', `seq=${this.guesses().length + 1} "${word}"`);

    try {
      const result = await this.api.sendGuess(word);
      this.protocol.record('in', 'FEEDBACK', `seq=${result.seq} padrao=${toPattern(result.statuses)}`);
      this.guesses.update((guesses) => [...guesses, result]);
      this.input.set('');
      this.addFeed(
        'player',
        `Você enviou o palpite ${result.seq}`,
        `${result.word} · ${countLabel(result.hits, 'posição', 'posições')}`,
      );
    } catch (error) {
      this.message.set(errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }

  react(text: string): void {
    if (!this.playing()) {
      return;
    }
    this.api.sendReaction(text);
    this.protocol.record('out', 'REACAO', `"${text}"`);
    this.addFeed('player', 'Você reagiu', text);
  }

  async forfeit(): Promise<void> {
    this.protocol.record('out', 'DESISTIR');

    try {
      await this.api.forfeit();
    } catch (error) {
      this.message.set(errorMessage(error));
    }
  }

  leave(): void {
    this.reset();
    this.match.set(null);
  }

  private onInputChanged(): void {
    const letters = this.input().length;
    this.message.set(null);
    this.api.sendTyping(letters);
    this.protocol.record('out', 'DIGITANDO', `n=${letters}`);
  }

  private handle(event: MatchEvent): void {
    if (event.type === 'MATCH_FOUND') {
      this.reset();
      this.match.set({ id: event.matchId, opponent: event.opponentNickname });
      return;
    }

    if (!this.match()) {
      return;
    }

    switch (event.type) {
      case 'MATCH_STARTED':
        this.started.set(true);
        this.remainingSeconds.set(event.roundSeconds);
        break;
      case 'TIMER_TICK':
        this.remainingSeconds.set(event.remainingSeconds);
        break;
      case 'OPPONENT_TYPING':
        this.opponentTyping.set(event.letters);
        break;
      case 'OPPONENT_PROGRESS':
        this.opponentGuesses.update((guesses) => [...guesses, { seq: event.seq, hits: event.hits }]);
        this.opponentTyping.set(0);
        this.addFeed(
          'opponent',
          `Oponente enviou o palpite ${event.seq}`,
          countLabel(event.hits, 'posição certa', 'posições certas'),
        );
        break;
      case 'REACTION':
        this.addFeed('opponent', 'Oponente reagiu', event.text);
        break;
      case 'MATCH_ENDED':
        this.result.set(event);
        this.opponentTyping.set(0);
        break;
    }
  }

  private addFeed(tone: PlayerTone, title: string, detail: string): void {
    const item: FeedItem = { id: this.nextFeedId++, tone, title, detail };
    this.feed.update((feed) => [item, ...feed].slice(0, FEED_SIZE));
  }

  private reset(): void {
    this.started.set(false);
    this.remainingSeconds.set(null);
    this.guesses.set([]);
    this.input.set('');
    this.submitting.set(false);
    this.message.set(null);
    this.opponentGuesses.set([]);
    this.opponentTyping.set(0);
    this.feed.set([]);
    this.result.set(null);
  }
}
