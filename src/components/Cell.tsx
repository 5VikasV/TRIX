import type { Cell as CellType } from "../types/game";
import { playClick } from "../utils/sound";

type CellProps = {
  value: CellType;
  onClick: () => void;
};

export default function Cell({
  value,
  onClick,
}: CellProps) {
  function handleClick() {
    playClick();
    onClick();
  }

  return (
    <button
      onClick={handleClick}
      className="
        h-16
        w-16
        rounded-xl
        border
        border-zinc-700
        bg-gradient-to-b
        from-zinc-900
        to-zinc-950
        transition-all
        duration-200
        hover:border-cyan-400
        hover:bg-zinc-800
        hover:scale-105
        active:scale-95
        flex
        items-center
        justify-center
        text-3xl
        font-bold
      "
    >
      <span
        className={
          value === "X"
            ? "text-cyan-400"
            : value === "O"
            ? "text-orange-400"
            : "opacity-0"
        }
      >
        {value ?? "X"}
      </span>
    </button>
  );
}