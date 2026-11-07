export type TileState = 'correct' | 'exists' | 'absent' | 'typing' | 'empty' | 'hidden';

export type PlayerTone = 'player' | 'opponent';

export interface BoardTile {
  letter: string;
  state: TileState;
}

export interface BoardRow {
  tiles: BoardTile[];
  hits?: number;
}
