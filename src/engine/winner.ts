import type { Cell, Player } from "../types/game";

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

export function getWinner(
  board: Cell[]
): Player | null {
  for (const [a, b, c] of WIN_LINES) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      return board[a];
    }
  }

  return null;
}

export function isBoardFull(
  board: Cell[]
): boolean {
  return board.every(cell => cell !== null);
}