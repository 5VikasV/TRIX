import { describe, expect, it } from "vitest";
import { createGame, isLegalMove, makeMove } from "./gameEngine";
import type { Cell, GameState } from "../types/game";

describe("Ultimate Tic Tac Toe engine", () => {
  it("routes the next turn to the played square", () => {
    const first = makeMove(createGame(), 4, 2);
    expect(first.currentPlayer).toBe("O");
    expect(first.activeBoard).toBe(2);
    expect(isLegalMove(first, 0, 0)).toBe(false);
    expect(isLegalMove(first, 2, 0)).toBe(true);
    expect(makeMove(first, 0, 0)).toBe(first);
  });

  it("allows any open board when the target is claimed", () => {
    const game = createGame();
    game.boardWinners[2] = "X";
    const next = makeMove(game, 4, 2);
    expect(next.activeBoard).toBeNull();
    expect(isLegalMove(next, 0, 0)).toBe(true);
    expect(isLegalMove(next, 2, 0)).toBe(false);
  });

  it("claims a mini board and wins the match", () => {
    const game = createGame();
    game.boardWinners[0] = "X";
    game.boardWinners[1] = "X";
    game.boards[2] = ["X", "X", null, null, null, null, null, null, null];
    const next = makeMove(game, 2, 2);
    expect(next.boardWinners[2]).toBe("X");
    expect(next.winner).toBe("X");
    expect(isLegalMove(next, 3, 0)).toBe(false);
  });

  it("records a filled mini board as a draw", () => {
    const game = createGame();
    game.boards[4] = ["X", "O", "X", "X", "O", "O", "O", "X", null];
    const next = makeMove(game, 4, 8);
    expect(next.boardWinners[4]).toBe("Draw");
    expect(next.activeBoard).toBe(8);
  });

  it("detects an overall draw once all boards finish", () => {
    const game: GameState = createGame();
    game.boardWinners = ["X", "O", "X", "O", "Draw", "O", "Draw", "X", null];
    game.boards[8] = ["X", "O", "X", "X", "O", "O", "O", "X", null] satisfies Cell[];
    const next = makeMove(game, 8, 8);
    expect(next.winner).toBe("Draw");
  });

  it("rejects invalid coordinates and occupied squares", () => {
    const game = createGame();
    expect(isLegalMove(game, -1, 0)).toBe(false);
    expect(isLegalMove(game, 9, 0)).toBe(false);
    expect(isLegalMove(game, 0, 9)).toBe(false);
    expect(isLegalMove(game, 0.5, 1)).toBe(false);
    const next = makeMove(game, 0, 0);
    expect(isLegalMove(next, 0, 0)).toBe(false);
  });
});
