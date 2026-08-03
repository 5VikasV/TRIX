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
    <section className="flex w-full justify-center py-4">
      <div
        className="
          grid
          grid-cols-3

          gap-[clamp(0.8rem,1vw,1.5rem)]

          rounded-[2rem]

          border
          border-zinc-700

          bg-[#1B1F24]

          p-[clamp(1rem,1.5vw,2rem)]

          shadow-2xl
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