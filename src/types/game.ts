export type Player = "X" | "O";

export type Cell = Player | null;

export type MiniBoard = Cell[];

export interface GameState {
  boards: MiniBoard[];

  currentPlayer: Player;

  activeBoard: number | null;

  boardWinners: (Player | "Draw" | null)[];

  winner: Player | "Draw" | null;
}