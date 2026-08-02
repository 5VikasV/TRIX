import MiniBoard from "./MiniBoard";
import type { CellValue } from "../types/game";

type BoardProps = {
  board: CellValue[];
  onPlay: (index: number) => void;
};

export default function Board({
  board,
  onPlay,
}: BoardProps) {
  return (
    <section className="mt-8 w-full flex justify-center">
      <div
        className="
          grid
          grid-cols-3
          gap-5
          rounded-3xl
          border
          border-zinc-800
          bg-zinc-900/40
          backdrop-blur-xl
          p-6
          shadow-2xl
        "
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <MiniBoard
            key={index}
            board={board}
            onPlay={onPlay}
            active={index === 4}
          />
        ))}
      </div>
    </section>
  );
}