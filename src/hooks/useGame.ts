import { useState } from "react";
import type { CellValue, Player } from "../types/game";

export default function useGame() {
  const [board, setBoard] = useState<CellValue[]>(
    Array(9).fill(null)
  );

  const [currentPlayer, setCurrentPlayer] =
    useState<Player>("X");

  function play(index: number) {
    if (board[index]) return;

    const next = [...board];
    next[index] = currentPlayer;

    setBoard(next);

    setCurrentPlayer((p) =>
      p === "X" ? "O" : "X"
    );
  }

  return {
    board,
    play,
    currentPlayer,
  };
}