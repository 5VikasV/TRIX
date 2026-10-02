import { isLegalMove } from "../engine/gameEngine";
import type { GameState } from "../types/game";

type Props = { game: GameState; canPlay: boolean; onPlay: (board: number, cell: number) => void };

export default function Board({ game, canPlay, onPlay }: Props) {
  return <div className="ultimate-board" aria-label="Ultimate tic tac toe board">
    {game.boards.map((cells, boardIndex) => {
      const result = game.boardWinners[boardIndex];
      const active = !result && (game.activeBoard === null || game.activeBoard === boardIndex);
      return <div className={`mini-board ${active && !game.winner ? "active" : ""} ${result ? "claimed" : ""}`} key={boardIndex} aria-label={`Board ${boardIndex + 1}${result ? `, ${result}` : ""}`}>
        {cells.map((value, cellIndex) => <button key={cellIndex} type="button" className={`cell ${value === "X" ? "x" : value === "O" ? "o" : ""}`} disabled={!canPlay || !isLegalMove(game, boardIndex, cellIndex)} onClick={() => onPlay(boardIndex, cellIndex)} aria-label={`Board ${boardIndex + 1}, square ${cellIndex + 1}${value ? `, ${value}` : ", empty"}`}>{value}</button>)}
        {result && <div className={`board-result ${result === "X" ? "x" : result === "O" ? "o" : "draw"}`} aria-hidden="true">{result === "Draw" ? "=" : result}</div>}
      </div>;
    })}
  </div>;
}
