
export type GameState = 'setup' | 'playing' | 'round_over' | 'champion' | 'gameover';

export interface Player {
  id: number;
  name: string;
  isAlive: boolean;
}

export interface GuessEntry {
  playerId: number;
  value: number;
  timestamp: number;
}

export interface Range {
  min: number;
  max: number;
}

export enum GameMode {
  EASY = 100,
  HARD = 1000
}
