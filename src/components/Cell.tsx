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
        aspect-square

        w-[clamp(3.6rem,4vw,4.6rem)]

        rounded-xl

        border
        border-zinc-700

        bg-[#101215]

        flex
        items-center
        justify-center

        text-[clamp(1.8rem,2.4vw,3rem)]
        font-black

        transition-colors
        duration-150

        hover:bg-[#171B20]
        hover:border-cyan-400
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