import type { GameState, MiniBoard } from "../types/game";

type FirestoreBoard = {
  cells: MiniBoard;
};

export function toFirestoreGame(game: GameState) {
  return {
    ...game,

    boards: game.boards.map((board) => ({
      cells: board,
    })),
  };
}

export function fromFirestoreGame(data: any): GameState {
  return {
    ...data,

    boards: data.boards.map(
      (board: FirestoreBoard) => board.cells
    ),
  };
}