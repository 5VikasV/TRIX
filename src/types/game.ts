export type Player = "X" | "O";
export type Cell = Player | null;
export type BoardResult = Player | "Draw" | null;

export interface GameState {
  boards: Cell[][];
  currentPlayer: Player;
  activeBoard: number | null;
  boardWinners: BoardResult[];
  winner: BoardResult;
  moveCount: number;
}

export interface RoomPlayer {
  uid: string;
  name: string;
  lastSeenAt: number;
}

export interface Room {
  version: 1;
  code: string;
  hostUid: string;
  status: "waiting" | "playing" | "finished";
  players: { X: RoomPlayer; O: RoomPlayer | null };
  game: GameState;
  round: number;
  rematchVotes: Record<Player, boolean>;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}
