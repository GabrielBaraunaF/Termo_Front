import { Component, input } from '@angular/core';
import { FeedItem } from '../../../models/feed-item';

@Component({
  selector: 'app-live-feed',
  templateUrl: './live-feed.component.html',
  styleUrl: './live-feed.component.scss',
  host: { class: 'card' },
})
export class LiveFeedComponent {
  readonly items = input.required<FeedItem[]>();
}
