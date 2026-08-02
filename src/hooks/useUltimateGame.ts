import { useState } from "react";

import {
  createGame,
  makeMove,
  resetGame,
} from "../engine/gameEngine";

export default function useUltimateGame() {
  const [game, setGame] = useState(createGame());

  function play(board: number, cell: number) {
    setGame(old => makeMove(old, board, cell));
  }

  function reset() {
    setGame(resetGame());
  }

  return {
    game,
    play,
    reset,
  };
}