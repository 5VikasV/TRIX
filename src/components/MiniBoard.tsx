import Cell from "./Cell";
import type { CellValue } from "../types/game";

type MiniBoardProps = {
  board: CellValue[];
  onPlay: (index: number) => void;
  active?: boolean;
};

export default function MiniBoard({
  board,
  onPlay,
  active = false,
}: MiniBoardProps) {
  return (
    <div
      className={`
        grid
        grid-cols-3
        gap-3
        rounded-2xl
        border-2
        p-3
        transition-all
        duration-300

        ${
          active
            ? "border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,.35)]"
            : "border-zinc-700"
        }
      `}
    >
      {board.map((cell, index) => (
        <Cell
          key={index}
          value={cell}
          onClick={() => onPlay(index)}
        />
      ))}
    </div>
  );
}