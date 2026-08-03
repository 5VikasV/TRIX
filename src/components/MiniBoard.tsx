import Cell from "./Cell";
import type {
  MiniBoard as MiniBoardType,
  Player,
} from "../types/game";

type MiniBoardProps = {
  board: MiniBoardType;
  winner: Player | "Draw" | null;
  boardIndex: number;
  active: boolean;
  onPlay: (board: number, cell: number) => void;
};

export default function MiniBoard({
  board,
  winner,
  boardIndex,
  active,
  onPlay,
}: MiniBoardProps) {
  return (
    <div
      className={`
        relative

        grid
        grid-cols-3

        gap-[clamp(0.45rem,0.6vw,0.75rem)]

        rounded-3xl

        border

        bg-[#15181C]

        p-[clamp(0.7rem,1vw,1.2rem)]

        ${
          active
            ? "border-cyan-400"
            : "border-zinc-700"
        }
      `}
    >
      {board.map((cell, index) => (
        <Cell
          key={index}
          value={cell}
          onClick={() => onPlay(boardIndex, index)}
        />
      ))}

      {winner && (
        <div
          className="
            absolute
            inset-0

            rounded-[1.6rem]

            bg-black/70

            backdrop-blur-sm

            flex
            items-center
            justify-center
          "
        >
          <span
            className={`text-8xl font-black ${
              winner === "X"
                ? "text-cyan-400"
                : winner === "O"
                ? "text-orange-400"
                : "text-zinc-400"
            }`}
          >
            {winner === "Draw" ? "=" : winner}
          </span>
        </div>
      )}
    </div>
  );
}