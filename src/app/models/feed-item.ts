import { PlayerTone } from './board';

export interface FeedItem {
  id: number;
  tone: PlayerTone;
  title: string;
  detail: string;
}
