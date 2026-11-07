import { Component, input, output } from '@angular/core';
import { NoMouseFocusDirective } from '../../../directives/no-mouse-focus.directive';

@Component({
  selector: 'app-quick-reactions',
  imports: [NoMouseFocusDirective],
  templateUrl: './quick-reactions.component.html',
  styleUrl: './quick-reactions.component.scss',
  host: { class: 'card' },
})
export class QuickReactionsComponent {
  readonly disabled = input(false);
  readonly react = output<string>();

  protected readonly reactions = ['GG', 'Boa', 'Ufa', 'Vem'];
}
