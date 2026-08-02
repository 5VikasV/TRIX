import { getWinner, isBoardFull } from "./winner";

import type {
  GameState,
  MiniBoard,
  Player,
  Cell,
} from "../types/game";

function createMiniBoard(): MiniBoard {
  return Array(9).fill(null);
}

export function createGame(): GameState {
  return {
    boards: Array.from({ length: 9 }, createMiniBoard),
    currentPlayer: "X",
    activeBoard: null,
    boardWinners: Array(9).fill(null),
    winner: null,
  };
}

export function resetGame(): GameState {
  return createGame();
}

export function makeMove(
  state: GameState,
  boardIndex: number,
  cellIndex: number
): GameState {
  if (state.winner) return state;

  if (
    state.activeBoard !== null &&
    state.activeBoard !== boardIndex
  ) {
    return state;
  }

  if (state.boardWinners[boardIndex]) {
    return state;
  }

  const boards = state.boards.map(board => [...board]);

  if (boards[boardIndex][cellIndex]) {
    return state;
  }

  boards[boardIndex][cellIndex] =
    state.currentPlayer;

  const boardWinners = [...state.boardWinners];

  const miniWinner = getWinner(
    boards[boardIndex]
  );

  if (miniWinner) {
    boardWinners[boardIndex] = miniWinner;
  }

  let activeBoard: number | null =
    cellIndex;

  if (
    boardWinners[cellIndex] ||
    isBoardFull(boards[cellIndex])
  ) {
    activeBoard = null;
  }

  const overallBoard: Cell[] =
    boardWinners.map(value =>
      value === "Draw" ? null : value
    );

  const winner =
    getWinner(overallBoard);

  const nextPlayer: Player =
    state.currentPlayer === "X"
      ? "O"
      : "X";

  return {
    boards,
    currentPlayer: nextPlayer,
    activeBoard,
    boardWinners,
    winner,
  };
}