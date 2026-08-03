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
    <section className="mt-6 flex w-full justify-center px-2 sm:px-4">
      <div
        className="
          grid
          w-full
          max-w-[920px]
          grid-cols-3
          gap-2
          sm:gap-3
          lg:gap-5
          rounded-2xl
          sm:rounded-3xl
          border
          border-zinc-800
          bg-zinc-900/40
          p-2
          sm:p-4
          lg:p-6
        "
      >
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