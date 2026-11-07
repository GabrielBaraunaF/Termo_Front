export type ProtocolDirection = 'in' | 'out';

export interface ProtocolEntry {
  id: number;
  direction: ProtocolDirection;
  kind: string;
  details: string;
}
