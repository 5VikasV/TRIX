import { getWinner, isBoardFull } from "./winner";
import type { BoardResult, Cell, GameState, Player } from "../types/game";

export function createGame(firstPlayer: Player = "X"): GameState {
  return {
    boards: Array.from({ length: 9 }, () => Array<Cell>(9).fill(null)),
    currentPlayer: firstPlayer,
    activeBoard: null,
    boardWinners: Array<BoardResult>(9).fill(null),
    winner: null,
    moveCount: 0,
  };
}

export function isLegalMove(game: GameState, board: number, cell: number): boolean {
  return !game.winner && Number.isInteger(board) && Number.isInteger(cell) &&
    board >= 0 && board < 9 && cell >= 0 && cell < 9 &&
    (game.activeBoard === null || game.activeBoard === board) &&
    game.boardWinners[board] === null && game.boards[board][cell] === null;
}

export function makeMove(game: GameState, board: number, cell: number): GameState {
  if (!isLegalMove(game, board, cell)) return game;

  const boards = game.boards.map((row) => [...row]);
  boards[board][cell] = game.currentPlayer;
  const boardWinners = [...game.boardWinners];
  boardWinners[board] = getWinner(boards[board]) ??
    (isBoardFull(boards[board]) ? "Draw" : null);

  const claimed = boardWinners.map((result) => result === "Draw" ? null : result);
  const winner = getWinner(claimed) ??
    (boardWinners.every((result) => result !== null) ? "Draw" : null);
  const activeBoard = boardWinners[cell] === null ? cell : null;

  return {
    boards,
    boardWinners,
    currentPlayer: game.currentPlayer === "X" ? "O" : "X",
    activeBoard,
    winner,
    moveCount: game.moveCount + 1,
  };
}
