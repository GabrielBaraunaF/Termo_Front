import { Component } from '@angular/core';
import { TileState } from '../../../models/board';
import { TileComponent } from '../../shared/tile/tile.component';

interface Example {
  letter: string;
  state: TileState;
  text: string;
}

@Component({
  selector: 'app-how-to-play',
  imports: [TileComponent],
  templateUrl: './how-to-play.component.html',
  styleUrl: './how-to-play.component.scss',
})
export class HowToPlayComponent {
  protected readonly examples: Example[] = [
    { letter: 'T', state: 'correct', text: 'Letra certa, no lugar certo' },
    { letter: 'E', state: 'exists', text: 'A letra existe, mas em outra posição' },
    { letter: 'R', state: 'absent', text: 'A letra não existe na palavra' },
  ];
}
