import MiniBoard from "./MiniBoard";
import type { GameState } from "../types/game";

type BoardProps = {
  game: GameState;
  onPlay: (board: number, cell: number) => void;
};

export default function Board({
  game,
  onPlay,
}: BoardProps) {
  return (
    <section className="mt-8 flex w-full justify-center">
      <div className="grid grid-cols-3 gap-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
        {game.boards.map((board, index) => (
          <MiniBoard
            key={index}
            board={board}
            winner={game.boardWinners[index]}
            boardIndex={index}
            active={
              game.activeBoard === null ||
              game.activeBoard === index
            }
            onPlay={onPlay}
          />
        ))}
      </div>
    </section>
  );
}